import { AuthorController } from "@/authors/authors.controller.ts";
import express, { type Router } from 'express';
import { authorSchema , authorDetailsSchema} from "@/authors/validators.ts";
import { validateDataSchema } from "@/lib/validateSchema.ts";
const routerAuthors: Router = express.Router();

/**
 * @openapi
 * /authors:
 *   get:
 *     summary: List authors
 *     description: Returns a paginated list of authors, optionally filtered by name.
 *     tags: [Authors]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Case-insensitive partial match on author name
 *     responses:
 *       200:
 *         description: A page of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Author' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     totalRecords: { type: integer }
 *                     totalPages: { type: integer }
 *       422:
 *         description: Invalid query params
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routerAuthors.get('/',AuthorController.findAllAuthors)

/**
 * @openapi
 * /authors:
 *   post:
 *     summary: Create an author
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AuthorInput' }
 *     responses:
 *       201:
 *         description: Author created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Author' }
 *       409:
 *         description: An author with this name already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routerAuthors.post('/',validateDataSchema(authorSchema), AuthorController.createAuthor)

/**
 * @openapi
 * /authors/{id}:
 *   get:
 *     summary: Get author details
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The author
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Author' }
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       422:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
routerAuthors.get('/:id',AuthorController.findAuthorDetails)
export default routerAuthors;