import { AuthorController } from "@/authors/authors.controller.ts";
import express, { type Router } from 'express';

const routerAuthors: Router = express.Router();

routerAuthors.get('/authors',AuthorController.findAllAuthors)

export default routerAuthors;