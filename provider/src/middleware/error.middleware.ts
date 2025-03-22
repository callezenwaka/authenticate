import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', err);

  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  // Check for JWT validation errors
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      error: 'Unauthorized',
      error_description: err.message
    });
  }

  // Generic error response
  res.status(500).json({
    error: 'Internal Server Error',
    error_description: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
};