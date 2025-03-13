import { getDataSource, closeDatabase } from './index';

async function runMigrations() {
  try {
    const dataSource = await getDataSource();
    
    console.log('Running migrations...');
    const migrations = await dataSource.runMigrations();
    
    console.log(`Applied ${migrations.length} migrations:`);
    migrations.forEach(migration => {
      console.log(`- ${migration.name}`);
    });
    
    await closeDatabase();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });