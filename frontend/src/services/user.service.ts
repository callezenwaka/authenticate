// src/services/api/userService.ts
import { AxiosInstance } from 'axios';
import * as oauth from 'openid-client';
import { createApiClient, fetchWithOAuth } from '@/config';
import { ApiResponseData } from '@/types/api.types';
import { User, UserCredentials, UserRegistration, AuthResponse } from '@/types/user.types';
import { logger } from '@/utils';

export class UserService {
  private api: AxiosInstance;
  private accessToken?: string;
  private config?: oauth.Configuration;
  private baseURL: string;

  constructor(baseURL: string, accessToken?: string, config?: oauth.Configuration) {
    this.baseURL = baseURL;
    this.accessToken = accessToken;
    this.config = config;
    this.api = createApiClient(baseURL, accessToken);
  }

  /**
   * Update the access token used for requests
   */
  updateAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
    this.api = createApiClient(this.baseURL, accessToken);
  }

  /**
   * Register new user
   */
  async registerUser(user: UserRegistration): Promise<ApiResponseData<User>> {
    try {
      const response = await this.api.post('/users/register', user);
      return { data: response.data };
    } catch (error) {
      logger.error('Error registering user:', error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Login with username/password (direct API login, not OAuth)
   */
  async loginUser(credentials: UserCredentials): Promise<ApiResponseData<AuthResponse>> {
    try {
      const response = await this.api.post('/users/login', credentials);
      return { data: response.data };
    } catch (error) {
      logger.error('Error logging in:', error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Get all users (requires authentication)
   */
  async getAllUsers(): Promise<ApiResponseData<User[]>> {
    try {
      const response = await this.api.get('/users');
      return { data: response.data };
    } catch (error) {
      logger.error('Error getting users:', error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Get user by ID (requires authentication)
   */
  async getUserById(id: string): Promise<ApiResponseData<User>> {
    try {
      const response = await this.api.get(`/users/${id}`);
      return { data: response.data };
    } catch (error) {
      logger.error(`Error getting user ${id}:`, error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Update user profile (requires authentication)
   */
  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponseData<User>> {
    try {
      const response = await this.api.put(`/users/${id}`, userData);
      return { data: response.data };
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Delete user (requires admin authentication)
   */
  async deleteUser(id: string): Promise<ApiResponseData<void>> {
    try {
      const response = await this.api.delete(`/users/${id}`);
      return { data: response.data };
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      return { data: null, error: (error as any).error };
    }
  }

  /**
   * Alternative: Get user profile using OAuth client directly
   */
  async getUserProfileWithOAuth(id: string): Promise<ApiResponseData<User>> {
    if (!this.accessToken || !this.config) {
      return { data: null, error: 'Missing access token or OAuth configuration' };
    }
    
    try {
      const data = await fetchWithOAuth<User>(
        this.config,
        this.accessToken,
        this.baseURL,
        `/users/${id}`,
        'GET'
      );
      return { data };
    } catch (error) {
      logger.error(`Error getting user ${id} with OAuth:`, error);
      return { data: null, error: (error as any).error || String(error) };
    }
  }
}

/**
 * Factory function to create user service
 */
export const createUserService = (
    baseURL: string = process.env.API_URL || 'http://localhost:8000',
    tokenResponse?: oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers,
    config?: oauth.Configuration
  ): UserService => {
    return new UserService(
      baseURL,
      tokenResponse?.access_token,
      config
    );
  };