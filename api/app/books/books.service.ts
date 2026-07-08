import {prisma} from "@client/prisma"
import { type Book } from "@generated/client.ts"
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
 