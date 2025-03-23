// backend/src/middleware/auth.middleware.ts
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
    jwksUri: process.env.JWKS_URI!,
  }) as GetVerificationKey,
  // Validate audience and issuer
  audience: process.env.TOKEN_AUDIENCE,
  issuer: process.env.TOKEN_ISSUER,
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

    // Extract scopes from the token, Hydra uses 'scp' as an array
    const tokenScopes: string[] = Array.isArray(request.auth.scp) ? request.auth.scp : [];
    
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