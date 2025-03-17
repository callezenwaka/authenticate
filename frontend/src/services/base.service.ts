import { AxiosInstance } from 'axios';
import { createApiClient } from '../config/apiClient';
import { logger } from '../utils';
import { OAuthConfig } from '../types';

/**
 * Base service class with common functionality for all services
 */
export abstract class BaseService {
  protected api: AxiosInstance;
  protected accessToken?: string;
  protected config?: OAuthConfig;
  protected baseURL: string;

  constructor(baseURL: string, accessToken?: string, config?: OAuthConfig) {
    this.baseURL = baseURL;
    this.accessToken = accessToken;
    this.config = config;
    this.api = createApiClient(baseURL, accessToken);
  }

  /**
   * Update the access token used for requests
   */
  updateAccessToken(accessToken: string): void {
    if (this.accessToken === accessToken) {
      logger.debug('Access token unchanged, skipping API client recreation');
      return;
    }

    this.accessToken = accessToken;
    this.api = createApiClient(this.baseURL, accessToken);
    logger.debug('API client updated with new access token');
  }
}