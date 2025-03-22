// database/src/config/database.config.ts
import 'reflect-metadata';
import { DataSourceOptions } from 'typeorm';
import { Blog, User } from '../entities';
import * as dotenv from 'dotenv';
dotenv.config();

export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'app-postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'app_user',
  password: process.env.DB_PASSWORD || 'app_password',
  database: process.env.DB_NAME || 'app_db',
  synchronize: true,
  logging: true,
  // entities: ['src/entity/**/*.ts'],
  entities: [Blog, User],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  ssl: process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,
};