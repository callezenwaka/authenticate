import { Request, Response, NextFunction } from 'express';
import { redisClient } from '@authenticate/database';
import { logger } from '@/utils';

/**
 * Middleware to check if Redis is available
 * Sets req.redisAvailable flag that can be used by controllers
 */
export const redisMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if Redis is connected by performing a simple ping
    const pingResult = await redisClient.ping();
    req.redisAvailable = pingResult === 'PONG';
    
    if (!req.redisAvailable) {
      logger.warn('Redis ping failed, cache unavailable');
    }
  } catch (error) {
    logger.warn('Redis check failed:', error instanceof Error ? error.message : String(error));
    req.redisAvailable = false;
  }
  
  next();
};