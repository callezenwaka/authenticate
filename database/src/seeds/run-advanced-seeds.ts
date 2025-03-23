// postgresql-database/src/seeds/run-seeds.ts
import { getDataSource, closeDatabase } from '../index';
import { blogSeedData } from './blog.seed';
import { logger } from "../utils";

type SeedFunction = () => Promise<void>;

// Map of environment-specific seed functions
const seeders: Record<string, SeedFunction[]> = {
  development: [
    async () => {
      const dataSource = await getDataSource();
      const blogRepository = dataSource.getRepository('Blog');
      
      // Clear existing data
      await blogRepository.clear();
      
      // Insert seed data
      await blogRepository.save(blogSeedData);
      logger.info(`Seeded ${blogSeedData.length} blog records for development`);
    }
  ],
  
  production: [
    async () => {
      // You might want more restricted seeds for production
      const dataSource = await getDataSource();
      const blogRepository = dataSource.getRepository('Blog');
      
      // Maybe just add some initial admin content or default settings
      const productionSeeds = blogSeedData.slice(0, 1); // Just one sample post
      await blogRepository.save(productionSeeds);
      logger.info(`Seeded ${productionSeeds.length} blog records for production`);
    }
  ],
  
  test: [
    async () => {
      // Test-specific seeds
      const dataSource = await getDataSource();
      const blogRepository = dataSource.getRepository('Blog');
      
      await blogRepository.clear();
      
      // Maybe just a couple test records
      const testSeeds = blogSeedData.slice(0, 2);
      await blogRepository.save(testSeeds);
      logger.info(`Seeded ${testSeeds.length} blog records for testing`);
    }
  ]
};

async function seedDatabase() {
  try {
    // Get the environment
    const env = process.env.NODE_ENV || 'development';
    logger.info(`Seeding database for ${env} environment`);
    
    // Get the appropriate seeders
    const envSeeders = seeders[env] || seeders.development;
    
    // Run each seeder in sequence
    for (const seeder of envSeeders) {
      await seeder();
    }
    
    logger.info('Seeding completed successfully');
    await closeDatabase();
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Check if this script was run directly (not imported)
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error(err);
      process.exit(1);
    });
}

// Export for programmatic use
export { seedDatabase };