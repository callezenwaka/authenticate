// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import * as oauth from 'openid-client';
import { initOAuthClient, refreshToken, getUserInfo } from '@/config';
import { AuthenticatedRequest } from '@/types/auth.types';
import { logger } from '@/utils';

// Extend Express session
declare module 'express-session' {
  interface Session {
    tokens?: oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers;
    userInfo?: any;
    returnTo?: string;
    code_verifier?: string;
    oauth_state?: string;
  }
}

/**
 * Authentication middleware
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const request = req as AuthenticatedRequest;

  // Add isAuthenticated helper
  request.isAuthenticated = false;

  try {
    // Initialize OAuth configuration
    const config = await initOAuthClient();
    request.oauthConfig = config;

    // Check if we have tokens in session
    if (req.session.tokens) {
      request.tokens = req.session.tokens;
      request.user = req.session.userInfo;
      request.isAuthenticated = true;

      // Check if token is about to expire
      const expiresIn = request.tokens.expiresIn();
      
      // If token is about to expire (less than 5 minutes), refresh it
      if (expiresIn !== undefined && expiresIn < 5 * 60 && request.tokens.refresh_token) {
        logger.debug('Access token is about to expire. Refreshing...');
        
        try {
          const newTokens = await refreshToken(config, request.tokens.refresh_token);
          req.session.tokens = newTokens;
          request.tokens = newTokens;
          logger.debug('Token refreshed successfully');
        } catch (error) {
          logger.error('Failed to refresh token:', error);
          // Clear session on token refresh error
          req.session.destroy((err) => {
            if (err) {
              logger.error('Error destroying session after token refresh failure:', err);
            }
          });
          request.isAuthenticated = false;
          request.user = undefined;
          request.tokens = undefined;
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    next(error);
  }
};

/**
 * Require authentication middleware
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const request = req as AuthenticatedRequest;
  
  if (!request.isAuthenticated) {
    // Store the original URL in the session
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }
  
  next();
};

/**
 * Login callback handler middleware
 */
export const handleLoginCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const request = req as AuthenticatedRequest;
  
  try {
    if (!request.oauthConfig) {
      throw new Error('OAuth configuration not initialized');
    }

    // Create current URL from request
    const protocol = req.protocol;
    const host = req.get('host') || '';
    const originalUrl = req.originalUrl;
    const currentUrl = new URL(`${protocol}://${host}${originalUrl}`);
    
    // Exchange code for tokens
    const tokens = await oauth.authorizationCodeGrant(
      request.oauthConfig,
      currentUrl,
      {
        pkceCodeVerifier: req.session.code_verifier,
        expectedState: req.session.oauth_state
      }
    );
    
    // Clear PKCE and state from session
    delete req.session.code_verifier;
    delete req.session.oauth_state;
    
    // Store tokens in session
    req.session.tokens = tokens;
    
    // Get user info from ID token
    const idTokenClaims = tokens.claims();
    if (!idTokenClaims?.sub) {
      throw new Error('No subject identifier (sub) found in ID token');
    }
    
    // Get additional user info if needed
    const userInfo = await getUserInfo(
      request.oauthConfig,
      tokens.access_token,
      idTokenClaims.sub
    );
    
    req.session.userInfo = userInfo;
    
    // Redirect to original URL or home
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    
    res.redirect(returnTo);
  } catch (error) {
    logger.error('Login callback error:', error);
    next(error);
  }
};

/**
 * Login route handler
 */
export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await initOAuthClient();
    
    // Get authorization URL with PKCE
    const authUrl = await oauth.buildAuthorizationUrl(config, {
      redirect_uri: `${process.env.BASE_URL || 'http://localhost:5555'}/callback`,
      scope: process.env.OAUTH_SCOPE || 'openid profile email',
      // Generate PKCE code verifier and challenge
      code_challenge: await oauth.calculatePKCECodeChallenge(
        // Store code_verifier in session
        req.session.code_verifier = oauth.randomPKCECodeVerifier()
      ),
      code_challenge_method: 'S256',
      // Generate and store state
      state: req.session.oauth_state = oauth.randomState()
    });
    
    // Redirect to authorization URL
    res.redirect(authUrl.href);
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Logout route handler
 */
export const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const request = req as AuthenticatedRequest;
    
    // Get end session URL if we have an ID token
    let logoutUrl = '/';
    
    if (request.oauthConfig && request.tokens?.id_token) {
      const endSessionUrl = oauth.buildEndSessionUrl(
        request.oauthConfig, 
        {
          id_token_hint: request.tokens.id_token,
          post_logout_redirect_uri: `${process.env.BASE_URL || 'http://localhost:5555'}`
        }
      );
      logoutUrl = endSessionUrl.href;
    }
    
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        logger.error('Error destroying session:', err);
      }
      
      // Redirect to logout URL
      res.redirect(logoutUrl);
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};