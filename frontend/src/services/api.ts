// frontend/src/services/api.ts
import axios, { AxiosInstance } from 'axios';
// import { TokenSet } from 'openid-client';
import * as oauth from 'openid-client';
import { ApiResponseData, ErrorResponse } from '@/types/api.types';
import { logger } from '@/utils';

/**
 * API service to interact with the resource server
 */
export class ApiService {
  private api: AxiosInstance;
  // private tokens?: TokenSet;
  private accessToken?: string;
  private config?: oauth.Configuration;

  constructor(baseURL: string, /** tokens?: TokenSet */ accessToken?: string, config?: oauth.Configuration) {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // this.tokens = tokens;
    this.accessToken = accessToken;
    this.config = config;

    // Add request interceptor to include access token
    this.api.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        let errorResponse: ErrorResponse = {
          error: 'Unknown error',
        };

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorResponse = {
            error: error.response.data?.error || 'API Error',
            error_description: error.response.data?.error_description,
            status_code: error.response.status,
          };
          logger.error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          // The request was made but no response was received
          errorResponse = {
            error: 'No response from server',
            error_description: 'The server did not respond to the request',
          };
          logger.error('API Error: No response received', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          errorResponse = {
            error: 'Request configuration error',
            error_description: error.message,
          };
          logger.error('API Error: Request configuration error', error.message);
        }

        return Promise.reject(errorResponse);
      }
    );
  }

  /**
   * Update access token
   */
  updateAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
  }

  /**
   * Make a fetch directly using the openid-client library for protected resources
   * This is an alternative to using axios, using the built-in oauth client's fetch method
   */
    async fetchWithOAuth(url: string, method: string = 'GET'): Promise<any> {
      if (!this.accessToken || !this.config) {
        throw new Error('Missing access token or OAuth configuration');
      }
      
      try {
        const resourceUrl = new URL(url, this.api.defaults.baseURL);
        const response = await oauth.fetchProtectedResource(
          this.config,
          this.accessToken,
          resourceUrl,
          method
        );
        
        return await response.json();
      } catch (error) {
        logger.error(`Error fetching resource ${url}:`, error);
        throw error;
      }
    }
  

  /**
   * Get public resources
   */
  async getPublicResource(): Promise<ApiResponseData> {
    try {
      const response = await this.api.get('/api/public');
      return { data: response.data };
    } catch (error) {
      logger.error('Error getting public resource:', error);
      return { data: null, error: (error as ErrorResponse).error };
    }
  }

  /**
   * Get protected resources
   */
  async getProtectedResource(): Promise<ApiResponseData> {
    try {
      const response = await this.api.get('/api/protected');
      return { data: response.data };
    } catch (error) {
      logger.error('Error getting protected resource:', error);
      return { data: null, error: (error as ErrorResponse).error };
    }
  }

  /**
   * Get specific resource
   */
  async getResource(id: string): Promise<ApiResponseData> {
    try {
      const response = await this.api.get(`/api/resources/${id}`);
      return { data: response.data };
    } catch (error) {
      logger.error(`Error getting resource ${id}:`, error);
      return { data: null, error: (error as ErrorResponse).error };
    }
  }
}

/**
 * Create API service instance
 */
export const createApiService = (
  tokenResponse?: oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers,
  config?: oauth.Configuration
): ApiService => {
  return new ApiService(
    process.env.API_URL || 'http://localhost:8000',
    tokenResponse?.access_token,
    config
  );
};