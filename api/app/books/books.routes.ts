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

/**
 * @openapi
 * /books:
 *   get:
 *     summary: List books
 *     description: Returns a paginated, filterable, sortable list of books.
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { $ref: '#/components/schemas/BookStatus' }
 *       - in: query
 *         name: genre
 *         schema: { $ref: '#/components/schemas/BookGenre' }
 *       - in: query
 *         name: authorId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: authorName
 *         schema: { type: string }
 *         description: Case-insensitive partial match on author name
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: Filter by tag name. Repeat the param (?tag=a&tag=b) to filter by multiple tags.
 *       - in: query
 *         name: minRating
 *         schema: { type: integer, minimum: 1, maximum: 5 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, rating, title], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: A page of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Book' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     totalPages: { type: integer }
 *       422:
 *         description: Invalid query params
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
booksRouter.get('/',BookController.listBooks)

export default booksRouter