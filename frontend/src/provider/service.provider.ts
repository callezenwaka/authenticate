import { initOAuthClient, refreshToken } from '../config';
import { BlogService, createBlogService, UserService, createUserService } from '../services';
import { redisToken } from '../redis';
import { logger } from '../utils';

/**
 * Custom Token Type
 */
interface CustomToken {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type: string;
}

/**
 * Enhanced Service Provider that uses Redis for token management
 */
export class ServiceProvider {
  private blogService?: BlogService;
  private userService?: UserService;
  private tokens?: CustomToken;
  private config?: any;
  private apiBaseUrl: string;
  private userId?: string;

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || process.env.API_URL || 'http://localhost:8000';
  }

  /**
   * Initialize the service provider with tokens and OAuth config
   */
  async initialize(
    tokens?: CustomToken,
    userId?: string
  ): Promise<void> {
    try {
      this.tokens = tokens;
      this.userId = userId;
      this.config = await initOAuthClient();

      // Store tokens in Redis if we have userId and tokens
      if (userId && tokens?.access_token) {
        await redisToken.storeToken(userId, tokens);
        logger.debug('Tokens stored in Redis for user', userId);
      }

      // Services will be lazily created when needed
      this.blogService = undefined;
      this.userService = undefined;

      logger.debug('Enhanced service provider initialized');
    } catch (error) {
      logger.error('Failed to initialize service provider:', error);
      throw error;
    }
  }

  /**
   * Update tokens after a refresh
   */
  async updateTokens(refreshTokenValue: string): Promise<void> {
    try {
      if (!this.config) {
        this.config = await initOAuthClient();
      }

      // Check if the token is blacklisted
      if (await redisToken.isBlacklisted(refreshTokenValue)) {
        logger.warn('Attempted to use blacklisted refresh token');
        throw new Error('Refresh token has been revoked');
      }

      // Refresh the token
      const newTokens = await refreshToken(this.config, refreshTokenValue);
      this.tokens = newTokens;

      // Update tokens in Redis
      if (this.userId) {
        await redisToken.storeToken(this.userId, newTokens);
      }

      // Update existing services with new access token
      if (this.blogService && newTokens.access_token) {
        this.blogService.updateAccessToken(newTokens.access_token);
      }

      if (this.userService && newTokens.access_token) {
        this.userService.updateAccessToken(newTokens.access_token);
      }

      logger.debug('Tokens refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh token:', error);
      throw error;
    }
  }

  /**
   * Check if token refresh is needed and perform it
   */
  async ensureValidToken(): Promise<boolean> {
    // Full null check to make TypeScript happy
    if (!this.tokens) {
      logger.debug('No tokens available for refresh');
      return false;
    }

    // Now we can safely check for refresh_token
    if (!this.tokens.refresh_token) {
      logger.debug('No refresh token available');
      return false;
    }

    const expiresIn = this.tokens.expires_in;
    if (expiresIn !== undefined && expiresIn < 60) { // Less than 60 seconds remaining
      logger.debug(`Token expires in ${expiresIn} seconds, refreshing`);
      await this.updateTokens(this.tokens.refresh_token);
      return true;
    }

    logger.debug(`Token valid for ${expiresIn} more seconds`);
    return true;
  }

  /**
   * Get the blog service, ensuring a valid token
   */
  async getBlogService(): Promise<BlogService> {
    await this.ensureValidToken();

    if (!this.blogService) {
      if (!this.tokens?.access_token) {
        logger.error('Cannot create blog service: no access token available');
        throw new Error('Not authenticated');
      }

      if (!this.config) {
        this.config = await initOAuthClient();
      }

      // Create the blog service
      this.blogService = createBlogService(this.apiBaseUrl, this.tokens, this.config);
      logger.debug('Blog service created');
    }

    return this.blogService;
  }

  /**
   * Get the user service, ensuring a valid token
   */
  async getUserService(): Promise<UserService> {
    await this.ensureValidToken();

    if (!this.userService) {
      if (!this.tokens?.access_token) {
        logger.error('Cannot create user service: no access token available');
        throw new Error('Not authenticated');
      }

      if (!this.config) {
        this.config = await initOAuthClient();
      }

      // Create the user service
      this.userService = createUserService(this.apiBaseUrl, this.tokens, this.config);
      logger.debug('User service created');
    }

    return this.userService;
  }

  /**
   * Get the current tokens
   */
  getTokens(): CustomToken | undefined {
    return this.tokens;
  }

  /**
   * Logout/invalidate tokens
   */
  async logout(): Promise<void> {
    try {
      // Type-safe check for refresh token
      if (this.tokens && this.tokens.refresh_token) {
        await redisToken.blacklistToken(this.tokens.refresh_token);
      }

      // Remove tokens from Redis for this user
      if (this.userId) {
        await redisToken.invalidateToken(this.userId);
      }

      // Reset the service provider
      this.reset();

      logger.debug('Logout completed and tokens invalidated');
    } catch (error) {
      logger.error('Error during logout:', error);
      throw error;
    }
  }

  /**
   * Reset the service provider (useful for testing or after logout)
   */
  reset(): void {
    this.blogService = undefined;
    this.userService = undefined;
    this.tokens = undefined;
    logger.debug('Service provider reset');
  }
}

// Export a singleton instance for app-wide use
export const serviceProvider = new ServiceProvider();