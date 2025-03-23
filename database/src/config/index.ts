// database/src/config/index.ts
export { getPoolConfig } from './pool.config';
import { dbConfig } from './database.config';

import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    port: process.env.PORT,
    env: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_URL,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  },
  database: dbConfig
};