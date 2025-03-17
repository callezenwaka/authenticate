// backend/src/index.ts
import 'reflect-metadata';
import { Server } from 'http';
import { logger } from "@/utils";
import { getDataSource, closeDatabase } from '@authenticate/database';
import app from './app';

const PORT = process.env.PORT || 8000;

async function bootstrap() {
  try {
    // Initialize database connection
    await getDataSource('backend');
    // logger.info('Database connection established.');
    
    // Start the server
    const server: Server = app.listen(PORT, () => {
      logger.info(`Server running on port http://localhost:${PORT}`);
      // console.log(`Listening on http://localhost:${port}`)
    });
    
    // Handle graceful shutdown
    // const shutdown = async () => {
    //   logger.info('Shutting down server...');
    //   server.close(async () => {
    //     await closeDatabase();
    //     process.exit(0);
    //   });
    // };
    const shutdown = async () => {
      logger.info('Shutting down server...');
      try {
        await new Promise<void>((resolve, reject) => {
            server.close(async (err) => {
                if (err) {
                    logger.error("Server close error:", err);
                    reject(err);
                } else {
                    logger.info("Server closed successfully.");
                    resolve();
                }
            });
        });
        await closeDatabase();
        logger.info('Database connection closed.');
        process.exit(0);
      } catch (error) {
        logger.error('Shutdown error:', error);
        process.exit(1);
      }
    };
    
    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();