import { AuthorController } from "@/authors/authors.controller.ts";
import express, { type Router } from 'express';
import { authorSchema , authorDetailsSchema} from "@/authors/validators.ts";
import { validateDataSchema } from "@/lib/validateSchema.ts";
const routerAuthors: Router = express.Router();

routerAuthors.get('/',AuthorController.findAllAuthors)
routerAuthors.post('/',validateDataSchema(authorSchema), AuthorController.createAuthor)
routerAuthors.get('/:id',AuthorController.findAuthorDetails)
export default routerAuthors;