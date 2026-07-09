import express, { Router } from "express"
import { createBookSchema, updateBookBodySchema } from "./validators.ts"
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

/**
 * @openapi
 * /books/{id}:
 *   get:
 *     summary: Get book details
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Book' }
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       422:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
booksRouter.get('/:id',BookController.getBookDetails)

/**
 * @openapi
 * /books/{id}:
 *   patch:
 *     summary: Update a book
 *     description: Partially updates a book. If `status` changes, a status-history entry is recorded automatically. Setting `rating` is only allowed once the book's status is `read`.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/BookUpdateInput' }
 *     responses:
 *       200:
 *         description: Book updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Book' }
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Rating set before the book has been marked as read
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
booksRouter.patch('/:id',validateDataSchema(updateBookBodySchema),BookController.updateBook)

/**
 * @openapi
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Book deleted
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       422:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
booksRouter.delete('/:id',BookController.deleteBook)

/**
 * @openapi
 * /books/{id}/history:
 *   get:
 *     summary: Get a book's status history
 *     description: Returns the chronological status transitions for a book, oldest first.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Status history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/StatusHistory' }
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       422:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
booksRouter.get('/:id/history',BookController.getBookHistory)

const statsRouter: Router = express.Router()

/**
 * @openapi
 * /stats:
 *   get:
 *     summary: Reading statistics
 *     description: Aggregated stats over non-deleted books, computed in the database.
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Library statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBooks: { type: integer }
 *                 byStatus:
 *                   type: object
 *                   additionalProperties: { type: integer }
 *                 byGenre:
 *                   type: object
 *                   additionalProperties: { type: integer }
 *                 averageRating: { type: number, nullable: true }
 *                 topRatedBook:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     title: { type: string }
 *                     rating: { type: integer }
 *                 mostReadAuthor:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     name: { type: string }
 *                     readCount: { type: integer }
 *                 topTags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       count: { type: integer }
 */
statsRouter.get('/',BookController.getStats)

export { statsRouter }
export default booksRouter