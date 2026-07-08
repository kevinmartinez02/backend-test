import express, { Router } from "express"
import { createBookSchema } from "./validators.ts"
import { validateDataSchema } from "@/lib/validateSchema.ts"
import { BookController } from "./books.controller.ts"
const booksRouter: Router = express.Router()

booksRouter.post('/',validateDataSchema(createBookSchema),BookController.createBook)
export default booksRouter