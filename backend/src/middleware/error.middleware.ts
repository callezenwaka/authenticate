// Update in src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils';

export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if headers have already been sent
    if (res.headersSent) {
      return next(error);
    }

    const status = error.status || error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    logger.error(`[ERROR] ${status}: ${message}`);

    // Structured error response
    return res.status(status).json({
      status: status,
      error: error.name || 'Error',
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  } catch (err) {
    logger.error('Error in error middleware:', err);
    
    // Only attempt to send a response if headers haven't been sent
    if (!res.headersSent) {
      return res.status(500).json({
        status: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred in the error handler'
      });
    }
    
    return next(err);
  }
};