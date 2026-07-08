import {z, ZodError} from 'zod'
import { Book_Genre } from '@generated/enums.ts'
import { Book_Status } from '@generated/enums.ts'
const createBookSchema = z.object({
    authorId: z.uuid({error: "id must be a valid uuid"}),
    title: z.string().min(1,{message:"title is requerid "}),
    tags: z.array(z.string()).optional(),
    genre: z.enum(Book_Genre),
    status: z.enum(Book_Status),
    rating: z.int().min(1).max(5).optional()
})
