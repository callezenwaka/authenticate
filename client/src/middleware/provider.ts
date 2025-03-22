// src/middleware/provider.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { providerClient } from '../clients';
import { AuthenticatedRequest } from '@/types';
import { logger } from '../utils';

/**
 * Middleware to initialize the service provider with current session tokens
 * and make it available on the request object
 */
export const providerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const request = req as AuthenticatedRequest;

    // Initialize service provider with tokens from session
    if (request.tokens) {
      await providerClient.initialize(request.tokens);
      logger.debug('Service provider initialized with tokens from session');
    } else {
      // Still initialize without tokens for potential public services
      await providerClient.initialize();
      logger.debug('Service provider initialized without tokens');
    }

    // Make service provider available on the request
    request.services = providerClient;

    // Listen for response finish to update session if tokens were refreshed
    res.on('finish', () => {
      if (request.tokens !== providerClient.getTokens() && providerClient.getTokens()) {
        // Update tokens in session if they changed
        req.session.tokens = providerClient.getTokens();
        logger.debug('Updated session with refreshed tokens');
      }
    });

    next();
  } catch (error) {
    logger.error('Provider middleware error:', error);
    next(error);
  }
};