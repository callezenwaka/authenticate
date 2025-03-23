import 'reflect-metadata';
import { Server } from 'http';
import { logger } from "@/utils";
import { getDataSource, closeDatabase, redisClient } from '@authenticate/database';
import app from './app';

const PORT = process.env.PORT || 8000;

async function bootstrap() {
  try {
    // Start the server first
    const server: Server = app.listen(PORT, () => {
      logger.info(`Backend running on http://localhost:${PORT}`);
    });

    // Check Redis connection
    try {
      const pingResult = await redisClient.ping();
      app.locals.redisAvailable = pingResult === 'PONG';
      logger.info('Redis connection established:', app.locals.redisAvailable);
    } catch (redisError) {
      app.locals.redisAvailable = false;
      logger.warn('Redis connection failed:',
        redisError instanceof Error ? redisError.message : String(redisError));

      // Redis will automatically attempt reconnection based on its config
      redisClient.on('connect', () => {
        app.locals.redisAvailable = true;
        logger.info('Redis connection restored');
      });

      redisClient.on('error', () => {
        app.locals.redisAvailable = false;
      });
    }

    // Then attempt database connection
    try {
      await getDataSource('backend');
      logger.info('Database connection established. Full functionality available.');
      app.locals.databaseAvailable = true;
    } catch (dbError) {
      logger.error(String(dbError));
      let databaseError = dbError instanceof Error ? dbError.message : String(dbError);
      logger.warn('Database connection failed. Operating in limited functionality mode:', databaseError);
      app.locals.databaseAvailable = false;

      // Attempt periodic reconnection with attempt tracking
      let reconnectAttempts = 0;
      const MAX_RECONNECT_ATTEMPTS = 10; // Set to -1 for unlimited attempts

      const reconnectInterval = setInterval(async () => {
        reconnectAttempts++;

        try {
          await getDataSource('backend');
          logger.info(`Database connection established after ${reconnectAttempts} attempts. Full functionality restored.`);
          app.locals.databaseAvailable = true;
          app.locals.reconnectAttempts = reconnectAttempts;
          clearInterval(reconnectInterval);
        } catch (error) {
          // Log with attempt count
          logger.debug(`Database reconnection attempt ${reconnectAttempts} failed`);

          // Check if we've reached the max attempts (if not unlimited)
          if (MAX_RECONNECT_ATTEMPTS > 0 && reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            logger.error(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up on database connection.`);
            app.locals.dbReconnectionExhausted = true;
            clearInterval(reconnectInterval);
          }
        }
      }, 30000); // try every 30 seconds
    }

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      try {
        await new Promise<void>((resolve, reject) => {
          server.close(async (err) => {
            if (err) {
              logger.error("Server close error:", err.message);
              reject(err);
            } else {
              logger.info("Server closed successfully.");
              resolve();
            }
          });
        });

        // Close Redis connection
        try {
          await redisClient.quit();
          logger.info('Redis connection closed.');
        } catch (redisError) {
          logger.error('Error closing Redis connection:',
            redisError instanceof Error ? redisError.message : String(redisError));
        }

        // Only attempt to close database if it was connected
        if (app.locals.databaseAvailable) {
          try {
            await closeDatabase();
            logger.info('Database connection closed.');
          } catch (dbError) {
            logger.error('Error closing database connection:',
              dbError instanceof Error ? dbError.message : String(dbError));
          }
        }

        process.exit(0);
      } catch (error) {
        logger.error('Shutdown error:',
          error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    };

    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:',
      error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

bootstrap();