
import express, { type Express, type Request, type Response } from 'express';
import { getAllAuthors, createAuthor } from "@/authors/authors.service.ts"
import { authorSchemaPaginated } from "@/authors/validators.ts"

export class AuthorController{
    static async findAllAuthors(req:Request,res:Response){
        const parsed = authorSchemaPaginated.safeParse(req.query)
        if(!parsed.success){
            res.status(400).json({ error: 'Invalid query params' })
            return
        }
        const { page, pageSize, name } = parsed.data
        const result = await getAllAuthors(page,pageSize,name)
        res.status(200).json(
            {
                data: result.data,
                meta: {
                    page: result.page,
                    totalRecords: result.totalRecords,
                    totalPages: result.totalPages
                }
            }
        )
    }

    static async createAuthor(req:Request, res: Response){
        const {nameBook, country} = req.body;
        try {
            const createdAuthor = await createAuthor(nameBook,country);
            if(!createdAuthor.succesfully) {
                res.status(400).json({
                    message: createdAuthor.message
                })
                return
            }
            res.status(201).json({
                message: createdAuthor.message,
                data: createdAuthor.data
            })
        } catch (error: unknown) {
            if(error instanceof Error){
                res.status(500).json({
                    message: error.message
                })
            } else {
                res.status(500).json({
                    message: 'Internal Server Error'
                })
            }
        }
    }
    
}