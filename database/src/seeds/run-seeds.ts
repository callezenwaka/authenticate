// database/src/seeds/run-seeds.ts
import { getDataSource, closeDatabase } from '../index';
import { blogSeedData } from './blog.seed';
import { userSeedData } from './user.seed';
import { Blog, User } from "../entities";

export async function seedDatabase() {
  try {
    const dataSource = await getDataSource();
    
    // Clear existing data
    console.log('Clearing existing data...');
    const blogRepository = dataSource.getRepository(Blog);
    const userRepository = dataSource.getRepository(User);
    // await blogRepository.clear();
    // await userRepository.clear();
    await dataSource.query('TRUNCATE TABLE "blogs", "users" RESTART IDENTITY CASCADE');
    
    // Insert seed data for users
    console.log('Inserting user seed data...');
    const users = await userRepository.save(userSeedData);
    console.log(`Inserted ${users.length} user records`);
    
    // Modify blog seed data to link to users
    const modifiedBlogData = blogSeedData.map((blog, index) => {
      return {
        ...blog,
        user: users[index % users.length] // Assign blogs to users in a round-robin fashion
      };
    });
    
    // Insert seed data for blogs
    console.log('Inserting blog seed data...');
    const blogs = await blogRepository.save(modifiedBlogData);
    console.log(`Inserted ${blogs.length} blog records`);
    
    console.log('Seeding completed successfully');
    await closeDatabase();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });