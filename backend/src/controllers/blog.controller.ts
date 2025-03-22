// backend/src/controllers/blog.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogService } from '../services';
import { CreateBlogDto, UpdateBlogDto } from '../types';

export class BlogController {
  constructor(private blogService = new BlogService()) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blogs = await this.blogService.findAll();
      res.json({ success: true, data: blogs });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const blog = await this.blogService.findById(id);
      
      if (!blog) {
        return res.status(404).json({ success: false, message: 'Blog not found' });
      }
      
      res.json({ success: true, data: blog });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blogData: CreateBlogDto = req.body;
      const newBlog = await this.blogService.create(blogData);
      res.status(201).json({ success: true, data: newBlog });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const blogData: UpdateBlogDto = req.body;
      const updatedBlog = await this.blogService.update(id, blogData);
      
      if (!updatedBlog) {
        return res.status(404).json({ success: false, message: 'Blog not found' });
      }
      
      res.json({ success: true, data: updatedBlog });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const success = await this.blogService.delete(id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Blog not found' });
      }
      
      res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}