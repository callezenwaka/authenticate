// database/src/config/database.config.ts
import 'reflect-metadata';
import { DataSourceOptions } from 'typeorm';
import { Blog, User } from '../entities';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('=============== ', process.env.DB_HOST);

export const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'blog-postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'blog_user',
  password: process.env.DB_PASSWORD || 'blog_password',
  database: process.env.DB_NAME || 'blog_db',
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