// backend/src/services/blog.service.ts
import { Blog, getBlogRepository } from '@authenticate/database';
import { CreateBlogDto, UpdateBlogDto } from '../types';

export class BlogService {
  async findAll(): Promise<Blog[]> {
    const blogRepository = await getBlogRepository();
    return blogRepository.find({
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findById(id: string): Promise<Blog | null> {
    const blogRepository = await getBlogRepository();
    return blogRepository.findOneBy({ id });
  }

  async create(blogData: CreateBlogDto): Promise<Blog> {
    const blogRepository = await getBlogRepository();
    const newBlog = blogRepository.create(blogData);
    return blogRepository.save(newBlog);
  }

  async update(id: string, blogData: UpdateBlogDto): Promise<Blog | null> {
    const blogRepository = await getBlogRepository();
    const blog = await blogRepository.findOneBy({ id });
    
    if (!blog) {
      return null;
    }
    
    Object.assign(blog, blogData);
    return blogRepository.save(blog);
  }

  async delete(id: string): Promise<boolean> {
    const blogRepository = await getBlogRepository();
    const result = await blogRepository.delete(id);
    return result.affected !== 0;
  }
}