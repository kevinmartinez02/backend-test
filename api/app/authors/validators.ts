import {z, ZodError} from 'zod'
import { type Express, type Request, type Response,type NextFunction } from 'express';
export const authorSchema = z.object({
    nameBook:z.string().min(1,{error: "author name is required"}),
    country: z.string().optional(),
})
