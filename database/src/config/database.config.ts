// database/src/config/database.config.ts
import 'reflect-metadata';
import { DataSourceOptions } from 'typeorm';
import { Blog, User } from '../entities';
import * as dotenv from 'dotenv';
dotenv.config();

export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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