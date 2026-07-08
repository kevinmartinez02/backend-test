import { type Request, type Response,type NextFunction } from "express";
import { createBook } from "./books.service.ts";
import { StatusCode } from "@/lib/validationError.ts";
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
}