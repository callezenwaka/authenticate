// database/src/redis/redisClient.ts
import { createClient } from "redis";
import { logger } from "../config";

// function getRedisConfig() {
//   // TODO: Dev config (consider prod??????)
//   return {
//     url: `redis://${process.env.REDIS_PASSWORD ? `${process.env.REDIS_PASSWORD}@` : ''}redis:${process.env.REDIS_PORT}`,
//     socket: {
//       reconnectStrategy: (retries: number) => {
//         const delay = Math.min(retries * 50, 2000);
//         logger.info(`Retrying Redis connection in ${delay}ms...`);
//         return delay;
//       }
//     }
//   };
// }

console.log('===redis: ', process.env.REDIS_HOST);

function getRedisConfig() {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
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

const redisClient = createClient(getRedisConfig());

redisClient.on("error", (err) => {
  logger.error("Redis Error", err);
});

redisClient.on("connect", () => {
  logger.info("Successfully connected to Redis");
});

redisClient.connect().catch((err) => {
  logger.error("Failed to connect to Redis:", err);
});

export default redisClient;