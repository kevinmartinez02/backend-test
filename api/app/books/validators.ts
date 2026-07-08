import {z, ZodError} from 'zod'
import { Book_Genre } from '@generated/enums.ts'
import { Book_Status } from '@generated/enums.ts'
export const createBookSchema = z.object({
    authorId: z.uuid({error: "id must be a valid uuid"}),
    title: z.string().min(1,{message:"title is requerid "}),
    tags: z.array(z.string()).optional(),
    genre: z.enum(Book_Genre),
})
