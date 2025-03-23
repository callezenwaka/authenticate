// backend/src/types/express.d.ts
// import { Express } from 'express';
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    dbAvailable?: boolean;
    redisAvailable?: boolean;
  }

  interface Application {
    locals: {
      databaseAvailable?: boolean;
      reconnectAttempts?: number;
      dbReconnectionExhausted?: boolean;
      redisAvailable?: boolean;
    };
  }
}
