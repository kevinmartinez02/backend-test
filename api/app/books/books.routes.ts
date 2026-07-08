import express, { Router } from "express"
import { createBookSchema } from "./validators.ts"
import { validateDataSchema } from "@/lib/validateSchema.ts"
import { BookController } from "./books.controller.ts"
const booksRouter: Router = express.Router()

/**
 * @openapi
 * /books:
 *   post:
 *     summary: Create a book
 *     description: Creates a book for an existing author. Tags are matched by name (deduplicated, case-insensitive) or created if they don't exist yet. New books start with status `to_read`.
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/BookInput' }
 *     responses:
 *       201:
 *         description: Book created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Book' }
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
booksRouter.post('/',validateDataSchema(createBookSchema),BookController.createBook)
export default booksRouter