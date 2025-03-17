// src/services/serviceProvider.ts
import * as oauth from 'openid-client';
import { BlogService, UserService, createBlogService, createUserService } from '@/services';
import { initOAuthClient, refreshToken } from '@/config';

/**
 * A service provider that maintains service instances and handles token refreshes
 */
export class ServiceProvider {
  private blogService?: BlogService;
  private userService?: UserService;
  private tokens?: oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers;
  private config?: oauth.Configuration;
  private apiBaseUrl: string;

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || process.env.API_URL || 'http://localhost:8000';
  }

  /**
   * Initialize the service provider with tokens and OAuth config
   */
  async initialize(tokens?: oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers): Promise<void> {
    this.tokens = tokens;
    this.config = await initOAuthClient();
    
    // Initialize services if tokens are provided
    if (tokens?.access_token) {
      this.blogService = createBlogService(this.apiBaseUrl, tokens, this.config);
      this.userService = createUserService(this.apiBaseUrl, tokens, this.config);
    }
  }

  /**
   * Update tokens after a refresh
   */
  async updateTokens(refreshTokenValue: string): Promise<void> {
    if (!this.config) {
      this.config = await initOAuthClient();
    }
    
    try {
      // Refresh the token
      const newTokens = await refreshToken(this.config, refreshTokenValue);
      this.tokens = newTokens;
      
      // Update existing services with new access token
      if (this.blogService) {
        // HERE is where we call updateAccessToken
        this.blogService.updateAccessToken(newTokens.access_token);
      }
      
      if (this.userService) {
        // HERE is where we call updateAccessToken
        this.userService.updateAccessToken(newTokens.access_token);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  /**
   * Check if token refresh is needed and perform it
   */
  async ensureValidToken(): Promise<boolean> {
    if (!this.tokens || !this.tokens.refresh_token) {
      return false;
    }

    const expiresIn = this.tokens.expiresIn();
    if (expiresIn !== undefined && expiresIn < 60) { // Less than 60 seconds remaining
      await this.updateTokens(this.tokens.refresh_token);
      return true;
    }
    
    return true;
  }

  /**
   * Get the blog service, ensuring a valid token
   */
  async getBlogService(): Promise<BlogService> {
    await this.ensureValidToken();
    
    if (!this.blogService) {
      if (!this.tokens?.access_token) {
        throw new Error('Not authenticated');
      }
      
      this.blogService = createBlogService(this.apiBaseUrl, this.tokens, this.config);
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
        throw new Error('Not authenticated');
      }
      
      this.userService = createUserService(this.apiBaseUrl, this.tokens, this.config);
    }
    
    return this.userService;
  }
  
  /**
   * Get the current tokens
   */
  getTokens(): oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers | undefined {
    return this.tokens;
  }
}

// Create a singleton instance
export let serviceProvider = new ServiceProvider();

// Example of using the service provider in a middleware
export const initializeServices = async (
  req: any,
  res: any,
  next: () => void
) => {
  try {
    if (req.session?.tokens) {
      // Initialize the service provider with tokens from the session
      await serviceProvider.initialize(req.session.tokens);
    }
    
    // Make the service provider available on the request
    req.services = serviceProvider;
    
    next();
  } catch (error) {
    next();
  }
};