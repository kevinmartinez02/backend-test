import {prisma} from "@client/prisma"
import { Prisma } from "@generated/client.ts"
import type { Optional } from "@prisma/client/runtime/client"
import { Book_Genre } from "@generated/client.ts"
import { Book_Status } from "@generated/client.ts"
import { CustomError, StatusCode } from "@/lib/validationError.ts"
interface BookDataInput {
    authorId: string,
    title: string,
    genre: Book_Genre
    tags: Array<string>
}

export async function createBook(bookData:BookDataInput){
    const {tags,authorId,title,genre} = bookData;
    const normalizeTags = [...new Set(tags.map(t=> t.trim().toLowerCase()))]

    const bookCreated = await prisma.book.create({
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