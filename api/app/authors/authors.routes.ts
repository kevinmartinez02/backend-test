import { AuthorController } from "@/authors/authors.controller.ts";
import express, { type Router } from 'express';
import { authorSchema , authorDetailsSchema} from "@/authors/validators.ts";
import { validateDataShema,} from "@/lib/validateSchema.ts";
const routerAuthors: Router = express.Router();

routerAuthors.get('/authors',AuthorController.findAllAuthors)
routerAuthors.post('/authors',validateDataShema(authorSchema), AuthorController.createAuthor)
routerAuthors.get('/authors/:id',AuthorController.findAuthorDetails)
export default routerAuthors;