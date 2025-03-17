// frontend/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', err);

  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Determine if it's an API request or a web page request
  const isApiRequest = req.path.startsWith('/api') || 
    req.get('Accept')?.includes('application/json');

  if (isApiRequest) {
    // API error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message
    });
  } else {
    // Web page error response
    res.status(500).render('error', {
      title: 'Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message
    });
  }
};