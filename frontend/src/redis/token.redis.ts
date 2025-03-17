// frontend/src/redis/token.redis.ts
import redisClient from './client.redis';
import { logger } from '../utils';

/**
 * Custom Token Type
 */
interface CustomToken {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
}

/**
 * Token Manager using Redis for enhanced token management
 */
export class RedisToken {
  private readonly prefix = 'token:';
  private readonly expiryBuffer = 300; // 5 minutes buffer

  /**
   * Store a token in Redis
   */
  async storeToken(userId: string, tokens: CustomToken): Promise<void> {
    try {
      const key = `${this.prefix}${userId}`;
      const expiresIn = tokens.expires_in || 3600; // Default to 1 hour if unknown

      // Store the token data
      await redisClient.set(key, JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        id_token: tokens.id_token,
        token_type: tokens.token_type,
        scope: tokens.scope
      }));

      // Set expiry with buffer
      await redisClient.expire(key, expiresIn + this.expiryBuffer);

      logger.debug(`Stored tokens for user ${userId} in Redis`);
    } catch (error) {
      logger.error('Failed to store token in Redis:', error);
      throw error;
    }
  }

  /**
   * Retrieve a token from Redis
   */
  async getToken(userId: string): Promise<CustomToken | null> {
    try {
      const key = `${this.prefix}${userId}`;
      const tokenData = await redisClient.get(key);

      if (!tokenData) {
        logger.debug(`No token found for user ${userId} in Redis`);
        return null;
      }

      return JSON.parse(tokenData);
    } catch (error) {
      logger.error('Failed to get token from Redis:', error);
      throw error;
    }
  }

  /**
   * Invalidate a token in Redis
   */
  async invalidateToken(userId: string): Promise<void> {
    try {
      const key = `${this.prefix}${userId}`;
      await redisClient.del(key);
      logger.debug(`Invalidated token for user ${userId} in Redis`);
    } catch (error) {
      logger.error('Failed to invalidate token in Redis:', error);
      throw error;
    }
  }

  /**
   * Add a token to the blacklist (for logout/revocation)
   */
  async blacklistToken(token: string, expiresIn: number = 3600): Promise<void> {
    try {
      const key = `${this.prefix}blacklist:${token}`;
      await redisClient.set(key, '1');
      await redisClient.expire(key, expiresIn);
      logger.debug('Token added to blacklist');
    } catch (error) {
      logger.error('Failed to blacklist token in Redis:', error);
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const key = `${this.prefix}blacklist:${token}`;
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Failed to check token blacklist in Redis:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const redisToken = new RedisToken();