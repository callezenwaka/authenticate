// client/src/redis/redisStore.ts
import session from 'express-session';
import { redisClient } from './client.redis';
import { logger } from '../utils';

export class RedisStore extends session.Store {
  constructor() {
    super();
  }

  async get(sid: string, callback: (err: any, session?: session.SessionData | null) => void) {
    try {
      const data = await redisClient.get(`sess:${sid}`);
      if (!data) {
        return callback(null, null);
      }
      const parsedData = JSON.parse(data);
      return callback(null, parsedData);
    } catch (err) {
      logger.warn('Session store get operation failed, returning null session:', err);
      // Return null session instead of error to prevent app from crashing
      return callback(null, null);
    }
  }

  async set(sid: string, sessionData: session.SessionData, callback: (err?: any) => void) {
    try {
      await redisClient.set(`sess:${sid}`, JSON.stringify(sessionData), {
        EX: 24 * 60 * 60, // 1 day in seconds
      });
      return callback(null);
    } catch (err) {
      logger.warn('Session store set operation failed, continuing without persisting session:', err);
      // Return success even though we couldn't persist
      // This allows the app to function without Redis
      return callback(null);
    }
  }

  async destroy(sid: string, callback: (err?: any) => void) {
    try {
      await redisClient.del(`sess:${sid}`);
      return callback(null);
    } catch (err) {
      logger.warn('Session store destroy operation failed:', err);
      // Return success even if delete fails
      return callback(null);
    }
  }

  // Add a touch method to handle session expiration reset
  async touch(sid: string, session: session.SessionData, callback: (err?: any) => void) {
    try {
      const ttl = 24 * 60 * 60; // 1 day in seconds
      await redisClient.set(`sess:${sid}`, JSON.stringify(session), { EX: ttl });
      return callback(null);
    } catch (err) {
      logger.warn('Session store touch operation failed:', err);
      // Return success even if touch fails
      return callback(null);
    }
  }
}

export default RedisStore;