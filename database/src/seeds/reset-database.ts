// database/src/reset-database.ts
import { getDataSource, closeDatabase } from '../index';
import { seedDatabase } from './run-seeds';

async function resetDatabase() {
  try {
    const dataSource = await getDataSource();
    
    console.log('Dropping database schema...');
    await dataSource.dropDatabase();
    
    console.log('Running migrations...');
    await dataSource.runMigrations();
    
    console.log('Running seeds...');
    await seedDatabase();
    
    console.log('Database reset completed successfully');
    await closeDatabase();
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });