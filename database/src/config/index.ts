// database/src/config/index.ts
// import * as fs from 'fs';
// import * as path from 'path';
// import { databaseConfig, DatabaseConfig } from './database.config';
export { getPoolConfig } from './pool.config';
export { loggerConfig, logger } from './logger.config';

import { dbConfig } from './database.config';
// import { loggerConfig, logger } from './logger';

// export {
//     loggerConfig,
//     logger
// };

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

// export const loadConfig = (): DatabaseConfig => {
//   const env = process.env.NODE_ENV || 'development';

//   // Type assertion to tell TypeScript that env is a valid key
//   const environmentKey = env as keyof typeof databaseConfig;

//   // Now TypeScript knows this is a valid access
//   const config = { ...databaseConfig[environmentKey] };

//   // const config = { ...databaseConfig[env] };
//   // const configPath = path.resolve(__dirname, './database.config.json');
//   // const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))[env];

//   // Process environment variables in config
//   // Object.keys(config).forEach(key => {
//   //   if (typeof config[key] === 'string' && config[key].startsWith('${') && config[key].endsWith('}')) {
//   //     const envVar = config[key].slice(2, -1);
//   //     config[key] = process.env[envVar] || '';
//   //   }
//   // });

//   // Process environment variables in config
//   Object.entries(config).forEach(([key, value]) => {
//     if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
//       const envVar = value.slice(2, -1);
//       // Use type assertion to tell TypeScript this is a valid key
//       (config as any)[key] = process.env[envVar] || '';
//     }
//   });

//   return config;
// };