// database/src/seeds/run-seeds.ts
import { getDataSource, closeDatabase } from '../index';
import { blogSeedData } from './blog.seed';
import { userSeedData } from './user.seed';
import { Blog, User } from "../entities";
import { logger } from '@/utils';

export async function seedDatabase() {
  try {
    const dataSource = await getDataSource();
    
    // Clear existing data
    logger.info('Clearing existing data...');
    const blogRepository = dataSource.getRepository(Blog);
    const userRepository = dataSource.getRepository(User);
    await dataSource.query('TRUNCATE TABLE "blogs", "users" RESTART IDENTITY CASCADE');
    
    // Prepare user seed data - ensure sub field matches id
    const preparedUserData = userSeedData.map(user => ({
      ...user,
      sub: user.id // Set sub to match id
    }));
    
    // Insert seed data for users
    logger.info('Inserting user seed data...');
    // Use insert instead of save to bypass BeforeInsert hook since we're manually setting IDs
    const insertResult = await userRepository.insert(preparedUserData);
    const users = await userRepository.find();
    logger.info(`Inserted ${users.length} user records`);
    
    // Modify blog seed data to link to users
    const modifiedBlogData = blogSeedData.map((blog, index) => {
      return {
        ...blog,
        user: users[index % users.length] // Assign blogs to users in a round-robin fashion
      };
    });
    
    // Insert seed data for blogs
    logger.info('Inserting blog seed data...');
    const blogs = await blogRepository.save(modifiedBlogData);
    logger.info(`Inserted ${blogs.length} blog records`);
    
    logger.info('Seeding completed successfully');
    await closeDatabase();
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    logger.error(err);
    process.exit(1);
  });