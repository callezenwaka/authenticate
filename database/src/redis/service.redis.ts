// database/src/redis/service.redis.ts
import redisClient from './client.redis';
import keyManager from './manager.redis';
import { logger } from '../utils';

/**
 * Default TTL in seconds (5 minutes)
 */
const DEFAULT_TTL = 300;

/**
 * Cache Service provides a consistent interface for caching operations
 * with built-in namespacing and error handling
 */
export class CacheService {
  private serviceName: string;
  
  /**
   * Creates a new cache service instance
   * @param serviceName - Service identifier for namespacing (e.g., 'backend', 'provider')
   */
  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }
  
  /**
   * Store a value in cache
   * @param entity - Entity type (e.g., 'blog', 'user')
   * @param id - Optional entity identifier
   * @param data - Data to cache (will be JSON stringified)
   * @param ttl - Time to live in seconds (default: 5 minutes)
   * @param subtype - Optional subtype or category
   */
  async set(
    entity: string, 
    id: string | undefined, 
    data: any, 
    ttl: number = DEFAULT_TTL,
    subtype?: string
  ): Promise<void> {
    try {
      const key = keyManager.create(this.serviceName, entity, id, subtype);
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      logger.warn(`Redis cache set failed for ${entity}:${id || 'collection'}:`, 
        error instanceof Error ? error.message : String(error));
      // Don't throw - allow operation to continue even if cache fails
    }
  }
  
  /**
   * Get a value from cache
   * @param entity - Entity type (e.g., 'blog', 'user')
   * @param id - Optional entity identifier
   * @param subtype - Optional subtype or category
   * @returns Parsed data or null
   */
  async get<T>(
    entity: string, 
    id?: string,
    subtype?: string
  ): Promise<T | null> {
    try {
      const key = keyManager.create(this.serviceName, entity, id, subtype);
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) as T : null;
    } catch (error) {
      logger.warn(`Redis cache get failed for ${entity}:${id || 'collection'}:`, 
        error instanceof Error ? error.message : String(error));
      return null;
    }
  }
  
  /**
   * Remove a value from cache
   * @param entity - Entity type (e.g., 'blog', 'user')
   * @param id - Optional entity identifier
   * @param subtype - Optional subtype or category
   */
  async delete(
    entity: string, 
    id?: string,
    subtype?: string
  ): Promise<void> {
    try {
      const key = keyManager.create(this.serviceName, entity, id, subtype);
      await redisClient.del(key);
    } catch (error) {
      logger.warn(`Redis cache delete failed for ${entity}:${id || 'collection'}:`, 
        error instanceof Error ? error.message : String(error));
    }
  }
  
  /**
   * Check if the Redis connection is active
   * @returns True if Redis is connected
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try a basic Redis operation to check connection
      const testKey = `${this.serviceName}:connection:test:${Date.now()}`;
      await redisClient.set(testKey, '1');
      const result = await redisClient.get(testKey);
      await redisClient.del(testKey);
      return result === '1';
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Specialized methods for common entities
   */
  
  // Blog-specific cache methods
  blog = {
    /**
     * Cache all blogs
     * @param blogs - Array of blog objects
     * @param ttl - Optional TTL
     */
    setAll: async (blogs: any[], ttl?: number): Promise<void> => {
      await this.set('blog', undefined, blogs, ttl, 'all');
    },
    
    /**
     * Get all cached blogs
     * @returns Array of blogs or null
     */
    getAll: async <T = any[]>(): Promise<T | null> => {
      return this.get<T>('blog', undefined, 'all');
    },
    
    /**
     * Cache a single blog
     * @param id - Blog ID
     * @param blog - Blog data
     * @param ttl - Optional TTL
     */
    setSingle: async (id: string, blog: any, ttl?: number): Promise<void> => {
      await this.set('blog', id, blog, ttl);
    },
    
    /**
     * Get a single cached blog
     * @param id - Blog ID
     * @returns Blog data or null
     */
    getSingle: async <T = any>(id: string): Promise<T | null> => {
      return this.get<T>('blog', id);
    },
    
    /**
     * Delete a single blog from cache
     * @param id - Blog ID
     */
    deleteSingle: async (id: string): Promise<void> => {
      await this.delete('blog', id);
    }
  };
  
  // Add more entity-specific methods as needed
}

/**
 * Create and export cache service instances for different services
 */
export const backendCache = new CacheService('backend');
export const providerCache = new CacheService('provider');

// Default export for backward compatibility
export default {
  backendCache,
  providerCache
};