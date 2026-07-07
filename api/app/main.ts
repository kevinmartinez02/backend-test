import express, { type Express, type Request, type Response } from 'express';
import { config } from 'dotenv';
const app: Express = express();
config({path:'.env'})
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});
app.listen(process.env.PORT ?? '8000');
