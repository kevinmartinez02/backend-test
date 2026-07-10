import {prisma} from "@client/prisma"
import { Prisma } from "@generated/client.ts"
import type { Optional } from "@prisma/client/runtime/client"
import { Book_Genre } from "@generated/client.ts"
import { Book_Status } from "@generated/client.ts"
import { CustomError, StatusCode } from "@/lib/validationError.ts"
import { logger } from "@/utils/logger.ts"
import type { UpdateBookSchema } from "./validators.ts"
interface BookDataInput {
    authorId: string,
    title: string,
    genre: Book_Genre
    tags: Array<string>
}

function normalizeTags(tags: Array<string>){
    return [...new Set(tags.map(t=> t.trim().toLowerCase()))].filter(t => t.length > 0)
}

export async function createBook(bookData:BookDataInput){
    const {tags,authorId,title,genre} = bookData;
    const normalizedTags = normalizeTags(tags)

    const bookCreated = await prisma.$transaction(async (tx)=>{
        const result = await tx.book.create({
            data:{
                authorId: authorId,
                title: title,
                genre: genre,
                status: Book_Status.to_read,
                tags:{
                    connectOrCreate:normalizedTags.map(name=>({
                        where:{name},
                        create: {name}
                    }))
                }
            },
            include: {
                tags: true
            }
        })

        await tx.statusHistory.create(
            {
                data:{
                    bookId:result.id,
                    toStatus:Book_Status.to_read,
                    changedAt: new Date()
                }
            }
        )

        return result
    })
    logger.info(`book created: ${bookCreated.id} "${title}"`)
    return bookCreated
}
 
interface ParamsListBooks {
    status?: Book_Status | undefined
    genre?: Book_Genre | undefined
    authorId?: string | undefined
    authorName?: string | undefined
    tag?: Array<string> | undefined
    minRating?: number | undefined
    page?: number | undefined
    limit?: number | undefined
    sortBy?: "createdAt"|"rating"|"title" | undefined
    order?:"asc"|"desc" | undefined
}
export async function listAllBooks(params: ParamsListBooks){
    const {
        status,
        genre,
        authorId,
        authorName,
        tag,
        minRating,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
    } = params

    const where: Prisma.BookWhereInput = {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(genre ? { genre } : {}),
        ...(authorId ? { authorId } : {}),
        ...(minRating ? { rating: { gte: minRating } } : {}),
        ...(authorName ? { author: { name: { contains: authorName, mode: "insensitive" } } } : {}),
        ...(tag && tag.length > 0 ? { tags: { some: { name: { in: tag, mode: "insensitive" } } } } : {}),
    }

    const [data, total] = await Promise.all([
        prisma.book.findMany({
            where,
            include: { tags: true },
            orderBy: { [sortBy]: order },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.book.count({ where }),
    ])

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    }
}

export async function listBookDetails(bookId: string){
    const result = await  prisma.book.findFirst({
        where: {
            id: bookId,
            deletedAt: null
        },
        include:{
            tags:true,
            statusHistory:true
        }
    })
    if(!result) throw new CustomError("Book not Found", StatusCode.NOT_FOUND)
    return result

}

export async function updateBook(inputData: UpdateBookSchema){
    const {bookId,status,genre,rating,title,tags} = inputData;
    const result = await prisma.$transaction(async (tx)=>{
        const bookFound = await tx.book.findFirst({
            where: {
                id: bookId,
                deletedAt: null
            }
        })
        if(!bookFound) throw new CustomError('Book not found', StatusCode.NOT_FOUND)
        const finalStatus = status ?? bookFound.status
        if(rating !== undefined && finalStatus !== Book_Status.read) throw new CustomError("cannot set a rating unless the book has been read", StatusCode.CONFLICT)

        const updatedBook = await tx.book.update({
            where: {
                id: bookId
            },
            data:{
                ...(title !== undefined ? { title } : {}),
                ...(genre !== undefined ? { genre } : {}),
                ...(status !== undefined ? { status } : {}),
                ...(rating !== undefined ? { rating } : {}),
                ...(tags !== undefined ? {
                    tags:{
                        set: [],
                        connectOrCreate: normalizeTags(tags).map(name=>({
                            where:{name},
                            create: {name}
                        }))
                    }
                } : {}),
                ...(status !== undefined && status !== bookFound.status ? {
                    statusHistory:{
                        create:{
                            fromStatus: bookFound.status,
                            toStatus: status,
                            changedAt: new Date(),
                        }
                    }
                } : {}),
            },
            include: {
                tags: true
            }
        })

        if(status !== undefined && status !== bookFound.status){
            logger.info(`book ${bookId} status changed: ${bookFound.status} -> ${status}`)
        }
        return updatedBook
    })
    logger.info(`book updated: ${bookId}`)
    return result
}

export async function deleteBook(bookId:string){
    const bookFound = await prisma.book.findFirst({
        where:{
            id: bookId,
            deletedAt: null
        }
    })
    if(!bookFound) throw new CustomError("Book not Found", StatusCode.NOT_FOUND)

    await prisma.book.update({
        where:{
            id: bookId
        },
        data:{
            deletedAt: new Date()
        }
    })
    logger.info(`book soft-deleted: ${bookId}`)
    return "deleted succesfully"
}

export async function getBookHistory(bookId:string){
    const bookFound = await prisma.book.findFirst({
        where:{
            id: bookId,
            deletedAt: null
        }
    })
    if(!bookFound) throw new CustomError("Book not Found", StatusCode.NOT_FOUND)

    const result = await prisma.statusHistory.findMany({
        where:{
            bookId: bookId
        },
        orderBy:{
            changedAt: "asc"
        }
    })
    return result
}
export async function getStats(){
  const notDelete = {deletedAt: null};
  const [totalBooks,byStatusRaw,byGenreRaw,ratingAgg,topRatedBook,topReaderRaw,tagsRaw] =
        await prisma.$transaction([
            prisma.book.count({where:notDelete}),
            prisma.$queryRaw<Array<{status: Book_Status, count: number}>>`
            SELECT status, COUNT(*)::int AS count
            FROM books
            WHERE deleted_at IS NULL
            GROUP BY status`,
            prisma.book.groupBy(
                {
                    by:["genre"],
                    orderBy:{
                        _count:{
                            genre: 'asc'
                        }
                    },
                    where: {...notDelete},
                    _count:{
                        _all:true
                    }
                }
            ),
            prisma.book.aggregate({
                _avg:{rating:true},
                where: notDelete
            }),
            prisma.book.findFirst({
                where: {...notDelete,rating: {not:null}},
                orderBy: {rating: 'desc'},
                select: {id:true, title: true,rating:true}
            }),
            prisma.$queryRaw<Array<{id:string,name:string,readCount:number}>>`
            SELECT a.id AS id, a.name AS name, COUNT(*)::int AS "readCount"
            FROM books AS b
            INNER JOIN authors AS a
            ON a.id = b."authorId"
            WHERE b.deleted_at IS NULL AND b.status = 'read'
            GROUP BY a.id, a.name
            ORDER BY COUNT(*) DESC
            LIMIT 1
            `,
            prisma.$queryRaw<Array<{name:string,count:number}>>`
            SELECT t.name, COUNT(b.id)::int AS count
            FROM books AS b
            JOIN "_BookToTag" AS btt
            ON btt."A" = b.id
            JOIN public.tags AS t on t.id = btt."B"
            WHERE b.deleted_at IS NULL
            GROUP BY t.name
            ORDER BY count desc
            LIMIT 5
            `
       ])
    const byStatus: Record<string, number> = Object.fromEntries(Object.values(Book_Status).map(s => [s, 0]))
    byStatusRaw.forEach(r => { byStatus[r.status] = r.count })

    const byGenre: Record<string, number> = Object.fromEntries(Object.values(Book_Genre).map(g => [g, 0]))
    byGenreRaw.forEach(r => { byGenre[r.genre] = r._count._all })
    const topReader = topReaderRaw[0]
    const mostReader = topReader ? { id: topReader.id, name: topReader.name, readCount: topReader.readCount } : null
    const topTags = tagsRaw
    return {
        totalBooks,
        byStatus,
        byGenre,
        averageRating: ratingAgg._avg.rating === null ? null : Math.round(ratingAgg._avg.rating * 10) / 10,
        topRatedBook,
        mostReader,
        topTags,
    }
}
