// src/redis/client.redis.ts
import { createClient } from 'redis';
import { logger } from '../utils';

// In-memory fallback storage when Redis is unavailable
class MemoryStore {
  private storage: Map<string, string> = new Map();

  async get(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    this.storage.set(key, value);
    // For simplicity, we don't implement expiration in the memory store
  }

  async del(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

class RedisClient {
  private client: any;
  private memoryFallback: MemoryStore = new MemoryStore();
  private useRedisFallback: boolean = false;
  private connectionAttempts: number = 0;
  private maxRetries: number = 3;

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL,
      });

      this.client.on('error', (err: Error) => {
        this.handleRedisError(err);
      });

      await this.client.connect();
      logger.info('Redis connected successfully');
      this.useRedisFallback = false;
    } catch (error) {
      this.handleRedisError(error);
    }
  }

  private handleRedisError(error: any): void {
    this.connectionAttempts++;
    
    if (this.connectionAttempts <= this.maxRetries) {
      const retryDelay = Math.min(50 * Math.pow(2, this.connectionAttempts - 1), 2000);
      logger.info(`Retrying Redis connection in ${retryDelay}ms...`);
      logger.error('Redis Error', error);
      
      // Retry connection after delay
      setTimeout(() => this.initialize(), retryDelay);
    } else if (!this.useRedisFallback) {
      // After max retries, switch to fallback
      logger.warn('Redis connection failed after multiple attempts. Using in-memory fallback.');
      this.useRedisFallback = true;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.useRedisFallback) {
        return await this.memoryFallback.get(key);
      }
      
      if (!this.client.isReady) {
        throw new Error('Redis client not ready');
      }
      return await this.client.get(key);
    } catch (error) {
      logger.debug('Redis get failed, using fallback', { key });
      return this.memoryFallback.get(key);
    }
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    try {
      if (this.useRedisFallback) {
        await this.memoryFallback.set(key, value, options);
        return;
      }
      
      if (!this.client.isReady) {
        throw new Error('Redis client not ready');
      }
      
      if (options?.EX) {
        await this.client.set(key, value, { EX: options.EX });
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.debug('Redis set failed, using fallback', { key });
      await this.memoryFallback.set(key, value, options);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.useRedisFallback) {
        await this.memoryFallback.del(key);
        return;
      }
      
      if (!this.client.isReady) {
        throw new Error('Redis client not ready');
      }
      await this.client.del(key);
    } catch (error) {
      logger.debug('Redis del failed, using fallback', { key });
      await this.memoryFallback.del(key);
    }
  }
}

// Export a singleton instance
export const redisClient = new RedisClient();