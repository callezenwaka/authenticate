// database/src/redis/redisClient.ts
import { createClient, RedisClientType } from "redis";
import { logger } from "../utils";

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;
  
  private constructor() {
    this.client = createClient(this.getRedisConfig());
    
    this.client.on("error", (err) => {
      logger.error("Redis Error", err);
    });
    
    this.client.on("connect", () => {
      logger.info("Successfully connected to Redis");
    });
    
    this.client.connect().catch((err) => {
      logger.error("Failed to connect to Redis:", err);
    });
  }
  
  private getRedisConfig() {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const password = process.env.REDIS_PASSWORD;
    
    const url = password 
      ? `redis://:${password}@${host}:${port}`
      : `redis://${host}:${port}`;
      
    return {
      url,
      socket: {
        reconnectStrategy: (retries: number) => {
          const delay = Math.min(retries * 50, 2000);
          logger.info(`Retrying Redis connection in ${delay}ms...`);
          return delay;
        }
      }
    };
  }

  public static getInstance(): RedisClientType {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    
    return RedisClient.instance.client;
  }
}

// Create and export the client instance to maintain backwards compatibility
const redisClient = RedisClient.getInstance();

export default redisClient;