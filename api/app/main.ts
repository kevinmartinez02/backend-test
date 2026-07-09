import express, { type Express, type Request, type Response } from 'express';
import { config } from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import router from "@/authors/authors.routes.ts"
import booksRouter, { statsRouter } from './books/books.routes.ts';
import { globalMiddlewareError } from '@/lib/validationError.ts';
import { morganMiddleware, logger } from './utils/logger.ts';
import { swaggerSpec } from '@/lib/swagger.ts';
import { generalLimiter } from './utils/rateLimit.ts';
const app: Express = express();
config({path:'.env'})
app.use(express.json())
app.use(morganMiddleware)
app.use(generalLimiter)

//routes
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/docs.json', (_req: Request, res: Response) => res.json(swaggerSpec))
app.use('/authors',router)
app.use('/books',booksRouter)
app.use('/stats',statsRouter)

//middleware
app.use(globalMiddlewareError)

const port = process.env.PORT ?? '8000';
app.listen(port);
logger.info(`server is running on port ${port}`)