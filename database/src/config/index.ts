// database/src/config/index.ts
export { getPoolConfig } from './pool.config';
export { loggerConfig, logger } from './logger.config';
import { dbConfig } from './database.config';

import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    port: process.env.PORT || 8000,
    env: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_URL || 'http://localhost:8000',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  database: dbConfig
};