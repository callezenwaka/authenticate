// frontend/src/services/blog.service.ts
import { logger } from '../utils';
import { fetchWithOAuth } from '../clients';
import { BaseService } from './base.service';
import { ApiResponseData, BlogPost, CustomToken, OAuthConfig } from '@/types';

export class BlogService extends BaseService {
  /**
   * Get all blog posts
   */
  async getAllBlogs(): Promise<ApiResponseData<BlogPost[]>> {
    try {
      const response = await this.api.get('/blogs');
      return { data: response.data };
    } catch (error) {
      logger.error('Error getting blog posts:', error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Get blog post by ID
   */
  async getBlogById(id: string): Promise<ApiResponseData<BlogPost>> {
    try {
      const response = await this.api.get(`/blogs/${id}`);
      return { data: response.data };
    } catch (error) {
      logger.error(`Error getting blog post ${id}:`, error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Create new blog post
   */
  async createBlog(blogPost: BlogPost): Promise<ApiResponseData<BlogPost>> {
    try {
      const response = await this.api.post('/blogs', blogPost);
      return { data: response.data };
    } catch (error) {
      logger.error('Error creating blog post:', error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Update blog post
   */
  async updateBlog(id: string, blogPost: Partial<BlogPost>): Promise<ApiResponseData<BlogPost>> {
    try {
      const response = await this.api.put(`/blogs/${id}`, blogPost);
      return { data: response.data };
    } catch (error) {
      logger.error(`Error updating blog post ${id}:`, error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Delete blog post
   */
  async deleteBlog(id: string): Promise<ApiResponseData<void>> {
    try {
      const response = await this.api.delete(`/blogs/${id}`);
      return { data: response.data };
    } catch (error) {
      logger.error(`Error deleting blog post ${id}:`, error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Alternative: Get all blogs using OAuth client directly
   */
  async getAllBlogsWithOAuth(): Promise<ApiResponseData<BlogPost[]>> {
    if (!this.accessToken || !this.config) {
      return { data: null, error: 'Missing access token or OAuth configuration' };
    }

    try {
      const data = await fetchWithOAuth<BlogPost[]>(
        this.accessToken,
        this.baseURL,
        '/blogs',
        'GET'
      );
      return { data };
    } catch (error) {
      logger.error('Error getting blog posts with OAuth:', error);
      return { data: null, error: (error as any).error || String(error) };
    }
  }
}

/**
 * Factory function to create blog service
 */
export const createBlogService = (
  baseURL: string = process.env.API_URL!,
  tokenResponse?: CustomToken,
  config?: OAuthConfig
): BlogService => {
  return new BlogService(
    baseURL,
    tokenResponse?.access_token,
    config
  );
};