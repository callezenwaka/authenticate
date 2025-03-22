// src/redis/token.redis.ts
import { redisClient } from './client.redis';
import { logger } from '../utils';
import { CustomToken } from '../types';

/**
 * Token management service using Redis
 */
class RedisTokenService {
  private tokenPrefix = 'token:';
  private blacklistPrefix = 'blacklist:';

  /**
   * Store token in Redis
   */
  async storeToken(userId: string, tokens: CustomToken): Promise<void> {
    try {
      const key = `${this.tokenPrefix}${userId}`;
      const expiresIn = tokens.expires_in || 3600; // Default to 1 hour
      
      await redisClient.set(key, JSON.stringify(tokens), { EX: expiresIn });
      logger.debug(`Stored tokens for user ${userId} with expiry ${expiresIn}s`);
    } catch (error) {
      logger.error('Failed to store token in Redis:', error);
      // Don't throw the error - gracefully degrade
    }
  }

  /**
   * Retrieve token from Redis
   */
  async getToken(userId: string): Promise<CustomToken | null> {
    try {
      const key = `${this.tokenPrefix}${userId}`;
      const tokenData = await redisClient.get(key);
      
      if (!tokenData) {
        logger.debug(`No token found for user ${userId}`);
        return null;
      }
      
      return JSON.parse(tokenData);
    } catch (error) {
      logger.error('Failed to retrieve token from Redis:', error);
      return null;
    }
  }

  /**
   * Invalidate token in Redis
   */
  async invalidateToken(userId: string): Promise<void> {
    try {
      const key = `${this.tokenPrefix}${userId}`;
      await redisClient.del(key);
      logger.debug(`Invalidated token for user ${userId}`);
    } catch (error) {
      logger.error('Failed to invalidate token in Redis:', error);
      // Don't throw the error - gracefully degrade
    }
  }

  /**
   * Blacklist a refresh token
   */
  async blacklistToken(refreshToken: string): Promise<void> {
    try {
      // We'll hash the token to avoid storing the actual value
      const tokenHash = Buffer.from(refreshToken).toString('base64');
      const key = `${this.blacklistPrefix}${tokenHash}`;
      
      // Store for 30 days (typical refresh token lifetime)
      await redisClient.set(key, 'blacklisted', { EX: 30 * 24 * 60 * 60 });
      logger.debug('Refresh token blacklisted');
    } catch (error) {
      logger.error('Failed to blacklist token in Redis:', error);
      // Don't throw the error - gracefully degrade
    }
  }

  /**
   * Check if a refresh token is blacklisted
   */
  async isBlacklisted(refreshToken: string): Promise<boolean> {
    try {
      const tokenHash = Buffer.from(refreshToken).toString('base64');
      const key = `${this.blacklistPrefix}${tokenHash}`;
      
      const result = await redisClient.get(key);
      return result !== null;
    } catch (error) {
      logger.error('Failed to check blacklist in Redis:', error);
      return false; // Assume not blacklisted if we can't check
    }
  }
}

// Export a singleton instance
export const redisToken = new RedisTokenService();