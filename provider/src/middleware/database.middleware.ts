// provider/src/middleware/database.middleware.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if the database is available before proceeding to routes that require it
 * @param criticalEndpoint If true, returns 503 error when DB is down. If false, sets req.dbAvailable flag
 */
export const databaseMiddleware = (criticalEndpoint = true): (req: Request, res: Response, next: NextFunction) => void => {
  return function checkDatabase(req: Request, res: Response, next: NextFunction): void {
    // Check if database is available from the app locals
    const isDatabaseAvailable = req.app.locals.databaseAvailable === true;
    const reconnectionExhausted = req.app.locals.dbReconnectionExhausted === true;
    const reconnectAttempts = req.app.locals.reconnectAttempts || 0;
    
    if (!isDatabaseAvailable && criticalEndpoint) {
      // Different message if we've given up on reconnecting
      if (reconnectionExhausted) {
        res.status(503).json({
          error: 'Service Temporarily Unavailable',
          message: 'Database connection unavailable after multiple attempts. This functionality is currently unavailable.',
          reconnectAttempts: reconnectAttempts,
          status: 'permanent'
        });
        return;
      } else {
        res.status(503).json({
          error: 'Service Temporarily Unavailable',
          message: 'This functionality requires database access which is currently unavailable',
          reconnectAttempts: reconnectAttempts,
          retryAfter: 30, // Suggest client retry after 30 seconds
          status: 'temporary'
        });
        return;
      }
    }
    
    // For non-critical endpoints, attach the database status to the request
    // so route handlers can provide partial functionality if needed
    req.dbAvailable = isDatabaseAvailable;
    next();
  };
};