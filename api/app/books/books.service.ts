import {prisma} from "@client/prisma"
import { Prisma } from "@generated/client.ts"
import type { Optional } from "@prisma/client/runtime/client"
import { Book_Genre } from "@generated/client.ts"
import { Book_Status } from "@generated/client.ts"
import { CustomError, StatusCode } from "@/lib/validationError.ts"
import type { UpdateBookSchema } from "./validators.ts"
interface BookDataInput {
    authorId: string,
    title: string,
    genre: Book_Genre
    tags: Array<string>
}

export async function createBook(bookData:BookDataInput){
    const {tags,authorId,title,genre} = bookData;
    const normalizeTags = [...new Set(tags.map(t=> t.trim().toLowerCase()))]

    const bookCreated = await prisma.$transaction(async (tx)=>{
        const result = await tx.book.create({
            data:{
                authorId: authorId,
                title: title,
                genre: genre,
                status: Book_Status.to_read,
                tags:{
                    connectOrCreate:normalizeTags.map(name=>({
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
    if(!result) throw new CustomError("Book not Found", StatusCode.BAD_REQUEST)
    return result

}

export async function updateBook(inputData: UpdateBookSchema){
    const {bookId,status,genre,rating,title} = inputData;
    const result = await prisma.$transaction(async (tx)=>{
        const bookFound = await tx.book.findFirst({
            where: {
                id: bookId
            }
        })
        if(!bookFound) throw new CustomError('Book not found', StatusCode.BAD_REQUEST)
        if(rating !== undefined && bookFound.status !== Book_Status.read) throw new CustomError("cannot set a rating unless the book has been read", StatusCode.CONFLICT)

        const updatedBook = await tx.book.update({
            where: {
                id: bookId
            },
            data:{
                ...(title !== undefined ? { title } : {}),
                ...(genre !== undefined ? { genre } : {}),
                ...(status !== undefined ? { status } : {}),
                ...(rating !== undefined ? { rating } : {}),
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

        return updatedBook
    })
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
            prisma.book.groupBy({
                by:["status"],
                _count:{_all:true},
                where: notDelete,
                orderBy:{status:'asc'}
            }),
            prisma.book.groupBy(
                {
                    by:["genre"],
                    _count:{_all:true},
                    where: notDelete,
                    orderBy:{genre:'asc'}
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
            prisma.book.groupBy({
                by:['authorId'],
                where: {...notDelete,status: Book_Status.read},
                _count:{_all:true},
                orderBy:{ _count: {authorId: 'desc'}},
                take: 1
            }),
            prisma.tag.findMany({
                select:{
                    name:true,
                    _count: {
                        select:{
                            books: {
                                where: notDelete
                            }
                        }
                    }
                }
            })


        ])
    const byStatus: Record<string, number> = Object.fromEntries(Object.values(Book_Status).map(s => [s, 0]))
    byStatusRaw.forEach(r => { byStatus[r.status] = r._count._all })

    const byGenre: Record<string, number> = Object.fromEntries(Object.values(Book_Genre).map(g => [g, 0]))
    byGenreRaw.forEach(r => { byGenre[r.genre] = r._count._all })

    let mostReadAuthor = null
    const topReader = topReaderRaw[0]
    if(topReader){
        const author = await prisma.author.findUnique({
            where:{
                id: topReader.authorId
            },
            select:{
                id: true,
                name: true
            }
        })
        if(author) mostReadAuthor = {...author, readCount: topReader._count._all}
    }

    const topTags = tagsRaw
        .map(t => ({name: t.name, count: t._count.books}))
        .filter(t => t.count > 0)
        .sort((a,b) => b.count - a.count)
        .slice(0,5)

    return {
        totalBooks,
        byStatus,
        byGenre,
        averageRating: ratingAgg._avg.rating === null ? null : Math.round(ratingAgg._avg.rating * 10) / 10,
        topRatedBook,
        mostReadAuthor,
        topTags,
    }
}
