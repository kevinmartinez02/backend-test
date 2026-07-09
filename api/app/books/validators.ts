import {z, ZodError} from 'zod'
import { Book_Genre } from '@generated/enums.ts'
import { Book_Status } from '@generated/enums.ts'
export const createBookSchema = z.object({
    authorId: z.uuid({error: "id must be a valid uuid"}),
    title: z.string().min(1,{message:"title is requerid "}),
    tags: z.array(z.string()).optional(),
    genre: z.enum(Book_Genre),
})
export const UpdateBookSchema = z.object({
    bookId: z.uuid({error: "id must be a valid uuid"}),
    title: z.string().min(1,{message:"title is requerid "}).optional(),
    status: z.enum(Book_Status).optional(),
    genre: z.enum(Book_Genre).optional(),
    rating : z.number().int().min(1).max(5).optional(),
    tags: z.array(z.string()).optional()

})
export const listBooksQuerySchema = z.object({
    status: z.enum(Book_Status).optional(),
    genre: z.enum(Book_Genre).optional(),
    authorId: z.uuid({error: "authorId must be a valid uuid"}).optional(),
    authorName: z.string().optional(),
    tag: z.union([z.string(), z.array(z.string())]).optional().transform(v => v === undefined ? undefined : (Array.isArray(v) ? v : [v])),
    minRating: z.coerce.number().int().min(1).max(5).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(["createdAt", "rating", "title"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
})
export const listBookDetailsChema = z.object({
    id: z.uuid({error: "id must be a valid uuid"})
})
export const updateBookBodySchema = UpdateBookSchema.omit({ bookId: true })
export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>
export type UpdateBookSchema = z.infer<typeof UpdateBookSchema>