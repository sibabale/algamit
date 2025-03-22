import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import router from './router';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3300;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('/api', router);

// Basic route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to the User Microservice' });
});

// Start server
app.listen(port, () => {
  console.log(`Users service is running on port ${port}`);
});

// Handle shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
