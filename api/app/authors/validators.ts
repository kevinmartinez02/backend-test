import {z, ZodError} from 'zod'
import { type Express, type Request, type Response,type NextFunction } from 'express';
export const authorSchema = z.object({
    nameBook:z.string().min(1,{error: "author name is required"}),
    country: z.string().optional(),
})
export const validateDataAuthorInputCreate = (schema: z.ZodObject) =>{
    return async (req: Request,res:Response, next: NextFunction) =>{
        try {
            req.body = schema.parse(req.body)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map((issue) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }))
                res.status(400).json({ error: 'Invalid data', details: errorMessages })
            } else {
                res.status(500).json({ error: 'Internal Server Error' })
            }
        }
    }
}