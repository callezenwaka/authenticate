import 'reflect-metadata';
import { logger } from "./utils";
import { getDataSource, closeDatabase } from '@authenticate/database';
import app from './app';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // Initialize database connection
    await getDataSource();
    logger.info('Database connection established');
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
    
    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
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