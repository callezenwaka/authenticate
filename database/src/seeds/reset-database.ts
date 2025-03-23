// database/src/reset-database.ts
import { getDataSource, closeDatabase } from '../index';
import { seedDatabase } from './run-seeds';
import { logger } from "../utils";

async function resetDatabase() {
  try {
    const dataSource = await getDataSource();
    
    logger.info('Dropping database schema...');
    await dataSource.dropDatabase();
    
    logger.info('Running migrations...');
    await dataSource.runMigrations();
    
    logger.info('Running seeds...');
    await seedDatabase();
    
    logger.info('Database reset completed successfully');
    await closeDatabase();
  } catch (error) {
    logger.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    logger.error(err);
    process.exit(1);
  });