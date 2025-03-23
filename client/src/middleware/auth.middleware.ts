// client/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { logger } from '../utils';
import { 
  AuthenticatedRequest, 
  UserInfo, 
  CustomToken} from '@/types';
import { 
  initOAuthClient, 
  refreshToken, 
  getUserInfo, 
  handleCallback as customHandleCallback, 
  getAuthorizationUrl, 
  getEndSessionUrl 
} from '../clients';

// Create a custom session interface
interface CustomSession extends session.Session {
  code_verifier?: string;
  oauth_state?: string;
  tokens?: CustomToken;
  userInfo?: UserInfo;
  returnTo?: string;
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
  // Cast the session to our custom type
  const session = req.session as CustomSession;

  // Add isAuthenticated helper
  request.isAuthenticated = false;

  try {
    // Initialize OAuth configuration
    const config = await initOAuthClient();
    request.oauthConfig = config;

    // Check if we have tokens in session
    if (session.tokens) {
      request.tokens = session.tokens;
      request.user = session.userInfo;
      request.isAuthenticated = true;

      // Check if token is about to expire
      const expiresIn = request.tokens.expires_in;

      // If token is about to expire (less than 5 minutes), refresh it
      if (expiresIn !== undefined && expiresIn < 5 * 60 && request.tokens.refresh_token) {
        logger.debug('Access token is about to expire. Refreshing...');

        try {
          const newTokens = await refreshToken(config, request.tokens.refresh_token);
          session.tokens = newTokens;
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
  const session = req.session as CustomSession;

  if (!request.isAuthenticated) {
    // Store the original URL in the session
    session.returnTo = req.originalUrl;
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
  const session = req.session as CustomSession;

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
    const tokens = await customHandleCallback(
      request.oauthConfig,
      currentUrl,
      req
    );

    // Clear PKCE and state from session
    delete session.code_verifier;
    delete session.oauth_state;

    // Store tokens in session
    session.tokens = tokens;

    // Get user info from ID token
    const idTokenClaims = tokens.id_token ? JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()) : {};
    if (!idTokenClaims?.sub) {
      throw new Error('No subject identifier (sub) found in ID token');
    }

    // Get additional user info if needed
    const userInfo = await getUserInfo(
      request.oauthConfig,
      tokens.access_token,
      idTokenClaims.sub
    );

    session.userInfo = userInfo;

    // Redirect to original URL or home
    const returnTo = session.returnTo || '/';
    delete session.returnTo;

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
    const authUrl = await getAuthorizationUrl(config, req);

    // Redirect to authorization URL
    res.redirect(authUrl);
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
      const endSessionUrl = getEndSessionUrl(
        request.oauthConfig,
        request.tokens.id_token,
        `${process.env.BASE_URL}`
      );
      logoutUrl = endSessionUrl.toString();
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