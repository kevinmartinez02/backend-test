
import express, { type Express, type Request, type Response } from 'express';
import { getAllAuthors, createAuthor } from "@/authors/authors.service.ts"

export class AuthorController{
    static async findAllAuthors(req:Request,res:Response){
        const result = await getAllAuthors()
        if(!result) res.status(200).json({
            data:[]
        })
        res.status(200).json(
            {
                data: result
            }
        )
    }

    static async createAuthor(req:Request, res: Response){
        const {nameBook, country} = req.body;
        try {
            const createdAuthor = await createAuthor(nameBook,country);
            res.status(201).json({
                message: "author created successfully",
                data: createdAuthor
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