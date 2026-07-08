import { type Request, type Response,type NextFunction } from "express";
import { createBook, listAllBooks } from "./books.service.ts";
import { listBooksQuerySchema } from "./validators.ts";
import { CustomError, StatusCode } from "@/lib/validationError.ts";
export class BookController{
    static async createBook(_req:Request,_res:Response, _next: NextFunction){
        try {
            const result = await createBook(_req.body);
            _res.status(StatusCode.CREATED).json({
                data: result
            })

        } catch (error) {
            _next(error)
        }
    }

    static async listBooks(req:Request,res:Response,next:NextFunction){
        const parsed = listBooksQuerySchema.safeParse(req.query)
        if(!parsed.success){
            throw new CustomError("Invalited query params", StatusCode.UNPROCESSABLE_ENTITY)
        }
        try {
            const result = await listAllBooks(parsed.data)
            res.status(StatusCode.OK).json({
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                }
            })
        } catch (error) {
            next(error)
        }
    }
}