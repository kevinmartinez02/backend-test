import express, { type Express, type Request, type Response } from 'express';
import { config } from 'dotenv';
import {prisma} from '../prisma/prisma.client.ts';
const app: Express = express();
config({path:'.env'})
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

async function testConection(){
  try {
    // Attempt a lightweight query to test the connection
    console.log('conection is  up ' + await prisma.$queryRaw`SELECT 1`);
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

app.listen(process.env.PORT ?? '8000');
testConection()
console.log('server is running')