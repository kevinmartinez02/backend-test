import express, { type Express, type Request, type Response } from 'express';
import { config } from 'dotenv';
import router from "@/authors/authors.routes.ts"
import booksRouter from './books/books.routes.ts';
import { globalMiddlewareError } from '@/lib/validationError.ts';
const app: Express = express();
config({path:'.env'})
app.use(express.json())
app.use('/authors',router)
app.use('/books',booksRouter)
app.use(globalMiddlewareError)
app.listen(process.env.PORT ?? '8000');
console.log('server is running')