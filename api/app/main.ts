import express, { type Express, type Request, type Response } from 'express';
import { config } from 'dotenv';
import router from "@/authors/authors.routes.ts"
const app: Express = express();
config({path:'.env'})
app.use(express.json())
app.use(router)
app.listen(process.env.PORT ?? '8000');
console.log('server is running')