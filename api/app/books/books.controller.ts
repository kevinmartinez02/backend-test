import { type Request, type Response,type NextFunction } from "express";
import { createBook, listAllBooks , listBookDetails, updateBook, deleteBook, getBookHistory, getStats} from "./books.service.ts";
import { listBooksQuerySchema, listBookDetailsChema } from "./validators.ts";
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

    static async getBookDetails(req:Request,res:Response, next:NextFunction){
        const parsed = listBookDetailsChema.safeParse(req.params)
        if(!parsed.success){
            throw new CustomError("Invalited query params", StatusCode.UNPROCESSABLE_ENTITY)
        }
        try {
            const result = await listBookDetails(parsed.data.id)
            res.status(StatusCode.OK).json({
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    static async updateBook(req:Request,res:Response, next:NextFunction){
        const parsedParams = listBookDetailsChema.safeParse(req.params)
        if(!parsedParams.success){
            throw new CustomError("Invalited id", StatusCode.UNPROCESSABLE_ENTITY)
        }
        try {
            const result = await updateBook({ bookId: parsedParams.data.id, ...req.body })
            res.status(StatusCode.OK).json({
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    static async deleteBook(req:Request,res:Response, next:NextFunction){
        const parsedParams = listBookDetailsChema.safeParse(req.params)
        if(!parsedParams.success){
            throw new CustomError("Invalited id", StatusCode.UNPROCESSABLE_ENTITY)
        }
        try {
            await deleteBook(parsedParams.data.id)
            res.status(StatusCode.NO_CONTENT).send()
        } catch (error) {
            next(error)
        }
    }

    static async getBookHistory(req:Request,res:Response, next:NextFunction){
        const parsedParams = listBookDetailsChema.safeParse(req.params)
        if(!parsedParams.success){
            throw new CustomError("Invalited id", StatusCode.UNPROCESSABLE_ENTITY)
        }
        try {
            const result = await getBookHistory(parsedParams.data.id)
            res.status(StatusCode.OK).json({
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    static async getStats(_req:Request,res:Response, next:NextFunction){
        try {
            const result = await getStats()
            res.status(StatusCode.OK).json(result)
        } catch (error) {
            next(error)
        }
    }
}