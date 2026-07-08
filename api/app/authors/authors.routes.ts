import { AuthorController } from "@/authors/authors.controller.ts";
import express, { type Router } from 'express';
import { validateDataAuthorInputCreate, authorSchema } from "./validators.ts";
const routerAuthors: Router = express.Router();

routerAuthors.get('/authors',AuthorController.findAllAuthors)
routerAuthors.post('/authors',validateDataAuthorInputCreate(authorSchema), AuthorController.createAuthor)
export default routerAuthors;