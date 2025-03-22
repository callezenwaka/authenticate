// database/src/redis/index.ts
// Export Redis-related modules
import redisClient from './client.redis';
import keyManager from './manager.redis';
import { CacheService, backendCache, providerCache } from './service.redis';

export {
  redisClient,
  keyManager,
  CacheService,
  backendCache,
  providerCache
};

// Default export the client for backward compatibility
export default redisClient;