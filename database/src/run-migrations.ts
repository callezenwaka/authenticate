import { getDataSource, closeDatabase } from './index';
import { logger } from './utils';

async function runMigrations() {
  try {
    const dataSource = await getDataSource();
    
    logger.info('Running migrations...');
    const migrations = await dataSource.runMigrations();
    
    logger.info(`Applied ${migrations.length} migrations:`);
    migrations.forEach(migration => {
      logger.info(`- ${migration.name}`);
    });
    
    await closeDatabase();
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(err => {
    logger.error(err);
    process.exit(1);
  });