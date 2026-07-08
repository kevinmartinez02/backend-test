
import express, { type Express, type Request, type Response } from 'express';
import { getAllAuthors } from "@/authors/authors.service.ts"

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
}