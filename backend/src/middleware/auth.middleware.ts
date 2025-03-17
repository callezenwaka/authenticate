import { Request, Response, NextFunction } from 'express';
import { expressjwt as jwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { AuthenticatedRequest } from '@/types';
import { logger } from '@/utils';

/**
 * JWT validation middleware
 */
export const authenticateJwt = jwt({
  // Get the JWKS from Hydra's well-known endpoint
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.JWKS_URI || 'http://localhost:4444/.well-known/jwks.json'
  }) as GetVerificationKey,
  // Validate audience and issuer
  audience: process.env.TOKEN_AUDIENCE || 'http://localhost:8000',
  issuer: process.env.TOKEN_ISSUER || 'http://localhost:4444/',
  algorithms: ['RS256']
});

/**
 * Custom scope validation middleware
 */
export const requireScopes = (requiredScopes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const request = req as AuthenticatedRequest;
    
    if (!request.auth) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        error_description: 'No authentication token provided' 
      });
    }

    const tokenScopes = request.auth.scope?.split(' ') || [];
    logger.debug(`Token scopes: ${tokenScopes.join(', ')}`);
    logger.debug(`Required scopes: ${requiredScopes.join(', ')}`);
    
    const hasRequiredScopes = requiredScopes.every(scope => 
      tokenScopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      return res.status(403).json({ 
        error: 'Insufficient scope',
        error_description: 'The token does not have the required scopes',
        required_scopes: requiredScopes,
        provided_scopes: tokenScopes
      });
    }

    next();
  };
};