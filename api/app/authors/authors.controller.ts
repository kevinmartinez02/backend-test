
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import { getAllAuthors, createAuthor,getDetailsAuthor } from "@/authors/authors.service.ts"
import { authorSchemaPaginated, authorDetailsSchema } from "@/authors/validators.ts"
import { CustomError, StatusCode } from '@/lib/validationError.ts';

export class AuthorController{
    static async findAllAuthors(req:Request,res:Response,next: NextFunction){
        const parsed = authorSchemaPaginated.safeParse(req.query)
        if(!parsed.success){
            throw new CustomError("Invalited query params", StatusCode.UNPROCESSABLE_ENTITY)

        }
        try {
            const { page, pageSize, name } = parsed.data
        const result = await getAllAuthors(page,pageSize,name)
        res.status(StatusCode.OK).json(
            {
                data: result.data,
                meta: {
                    page: result.page,
                    totalRecords: result.totalRecords,
                    totalPages: result.totalPages
                }
            }
        )
        } catch (error) {
            next(error)
        }
        
    }

    static async createAuthor(req:Request, res: Response, next: NextFunction){
        const {name, country} = req.body;
        try {
            const createdAuthor = await createAuthor(name,country);
           
            res.status(StatusCode.CREATED).json({
                message: 'Author created',
                data: createdAuthor
            })
        } catch (error: unknown) {
            next(error)
        }
    }
    static async findAuthorDetails(req:Request, res: Response, next: NextFunction){
        const parsed = authorDetailsSchema.safeParse(req.params)
        if(!parsed.success){
            throw new CustomError("Invalited query params", StatusCode.UNPROCESSABLE_ENTITY)

        }
        try {
            const result = await getDetailsAuthor(parsed.data.id)
            res.status(StatusCode.OK).json({
                data: result
            })
        } catch (error) {
            next(error)
        }
    }
}