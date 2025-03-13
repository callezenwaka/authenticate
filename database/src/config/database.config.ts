// database/src/config/database.config.ts
// export interface DatabaseConfig {
//   host: string;
//   port: number;
//   username: string;
//   password: string;
//   database: string;
//   ssl: boolean;
// }

// export interface DatabaseEnvironments {
//   development: DatabaseConfig;
//   production: DatabaseConfig;
// }

// export const databaseConfig: DatabaseEnvironments = {
//   "development": {
//     "host": "blog-postgres",
//     "port": 5432,
//     "database": "blog_db",
//     "username": "blog_user",
//     "password": "blog_password",
//     "ssl": false
//   },
//   "production": {
//     "host": "postgres",
//     "port": 5432,
//     "database": "blog_db",
//     "username": "postgres",
//     "password": "${DB_PASSWORD}",
//     "ssl": true
//   }
// };

import { DataSourceOptions } from 'typeorm';
import 'reflect-metadata';
import { Blog, User } from '../entities';

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