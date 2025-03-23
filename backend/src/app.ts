// backend/src/app.ts
import express, { Request, Response} from 'express';
import cors from 'cors';
import { logger } from '@/utils';
import { routes } from '@/routes';
import { errorMiddleware } from '@/middleware';
import * as dotenv from 'dotenv';
dotenv.config();

// Initialize Express app
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Register routes
app.use(routes);

// Error handling middleware
app.use(errorMiddleware);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;