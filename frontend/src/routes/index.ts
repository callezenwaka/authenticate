// frontend/src/routes/index.ts
import { Router, Request, Response } from 'express';
import * as oauth from 'openid-client';
import { initOAuthClient, refreshToken } from '@/config';
import { createBlogService, createUserService } from '@/services';
import { requireAuth, handleLoginCallback, handleLogin, handleLogout } from '@/middleware';
import { AuthenticatedRequest } from '@/types/auth.types';
import { logger } from '@/utils';

const router = Router();

// Home page
router.get('/', async (req: Request, res: Response) => {
  const request = req as AuthenticatedRequest;
  
  try {
    // Get public data from API
    const apiService = createBlogService(process.env.API_URL, request.tokens);
    const publicData = await apiService.getAllBlogs();
    
    res.render('home', {
      title: 'Home',
      user: request.user,
      isAuthenticated: request.isAuthenticated,
      publicData: publicData.data
    });
  } catch (error) {
    logger.error('Home page error:', error);
    res.render('home', {
      title: 'Home',
      user: request.user,
      isAuthenticated: request.isAuthenticated,
      error: 'Failed to load data'
    });
  }
});

// Login
router.get('/login', handleLogin);

// Login callback
router.get('/callback', handleLoginCallback);

// Profile page
router.get('/profile', requireAuth, (req: Request, res: Response) => {
  const request = req as AuthenticatedRequest;
  
  res.render('profile', {
    title: 'Profile',
    user: request.user,
    isAuthenticated: request.isAuthenticated,
    tokens: {
      accessToken: request.tokens?.access_token,
      expiresIn: request.tokens?.expiresIn?.() || 'unknown',
      tokenType: request.tokens?.token_type,
      hasRefreshToken: !!request.tokens?.refresh_token
    }
  });
});

// Dashboard page (example of protected page)
router.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
  const request = req as AuthenticatedRequest;
  
  try {
    // Ensure we have valid tokens
    if (!request.tokens) {
      throw new Error('No valid tokens available');
    }
    
    // Create services
    const config = await initOAuthClient();
    const blogService = createBlogService(process.env.API_URL, request.tokens, config);
    const userService = createUserService(process.env.API_URL, request.tokens, config);
    
    // Get protected data from API
    const blogs = await blogService.getAllBlogs();
    const userProfile = request.user?.sub ? 
      await userService.getUserById(request.user.sub) : null;
    
    res.render('dashboard', {
      title: 'Dashboard',
      user: request.user,
      isAuthenticated: request.isAuthenticated,
      blogs: blogs.data,
      profile: userProfile?.data,
      error: blogs.error || userProfile?.error
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.render('dashboard', {
      title: 'Dashboard',
      user: request.user,
      isAuthenticated: request.isAuthenticated,
      error: error instanceof Error ? error.message : 'Failed to load data'
    });
  }
});

// Logout
router.get('/logout', handleLogout);

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Blog routes
router.get('/blogs', requireAuth, async (req: Request, res: Response) => {
  const request = req as AuthenticatedRequest;
  
  try {
    // Create blog service
    const config = await initOAuthClient();
    const blogService = createBlogService(process.env.API_URL, request.tokens, config);
    
    // Get blogs
    const blogs = await blogService.getAllBlogs();
    
    res.render('blogs', {
      title: 'Blogs',
      user: request.user,
      isAuthenticated: request.isAuthenticated,
      blogs: blogs.data,
      error: blogs.error
    });
  } catch (error) {
    logger.error('Blogs page error:', error);
    res.render('blogs', {
      title: 'Blogs',
      user: request.user,
      isAuthenticated: request.isAuthenticated,
      error: error instanceof Error ? error.message : 'Failed to load blogs'
    });
  }
});

router.get('/blogs/:id', requireAuth, async (req: Request, res: Response) => {
  const request = req as AuthenticatedRequest;
  const blogId = req.params.id;
  
  try {
    // Create blog service
    const config = await initOAuthClient();
    const blogService = createBlogService(process.env.API_URL, request.tokens, config);
    
    // Get blog
    const blog = await blogService.getBlogById(blogId);
    
    if (!blog.data) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Blog not found',
        error: { status: 404 }
      });
    }
    
    res.render('blog-detail', {
      title: blog.data.title,
      user: request.user,
      isAuthenticated: request.isAuthenticated,
      blog: blog.data
    });
  } catch (error) {
    logger.error(`Blog detail page error for ID ${blogId}:`, error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load blog',
      error: { status: 500, stack: error instanceof Error ? error.message : String(error) }
    });
  }
});

// Error route
router.use((req: Request, res: Response) => {
  res.status(404).render('error', {
    title: 'Not Found',
    message: 'The requested page does not exist',
    error: { status: 404 }
  });
});

export const routes = router;