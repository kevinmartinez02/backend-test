import {z, ZodError} from 'zod'
import { type Express, type Request, type Response,type NextFunction } from 'express';
export const authorSchema = z.object({
    nameBook:z.string().min(1,{error: "author name is required"}),
    country: z.string().optional(),
})

export const authorSchemaPaginated = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    name: z.string().optional()
})

export const authorDetailsSchema = z.object({
    id: z.uuid({error: 'id must be a valid uuid'})
})