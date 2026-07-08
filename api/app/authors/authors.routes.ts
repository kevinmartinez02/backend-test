import { AuthorController } from "@/authors/authors.controller.ts";
import express, { type Router } from 'express';
import { authorSchema } from "@/authors/validators.ts";
import { validateDataShema,} from "@/lib/validateSchema.ts";
const routerAuthors: Router = express.Router();

routerAuthors.get('/authors',AuthorController.findAllAuthors)
routerAuthors.post('/authors',validateDataShema(authorSchema), AuthorController.createAuthor)
export default routerAuthors;