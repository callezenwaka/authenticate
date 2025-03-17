// src/services/api/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as oauth from 'openid-client';
import { ErrorResponse } from '@/types/api.types';
import { logger } from '@/utils';

/**
 * Creates a configured Axios instance for API requests
 */
export const createApiClient = (
  baseURL: string, 
  accessToken?: string
): AxiosInstance => {
  const apiClient = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor to include access token
  apiClient.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle errors
  apiClient.interceptors.response.use(
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
          message: error.response.data?.message,
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

  return apiClient;
};

/**
 * Helper function to make protected resource requests using openid-client
 */
export const fetchWithOAuth = async <T>(
  config: oauth.Configuration,
  accessToken: string,
  baseURL: string,
  path: string,
  method: string = 'GET',
  body?: any
): Promise<T> => {
  try {
    const url = new URL(path, baseURL);
    const response = await oauth.fetchProtectedResource(
      config,
      accessToken,
      url,
      method,
      body ? JSON.stringify(body) : undefined,
      new Headers({
        'Content-Type': 'application/json'
      })
    );
    
    // return await response.json();
    const data = await response.json();
    // Use type assertion to inform TypeScript this is the correct type
    return data as T;
  } catch (error) {
    logger.error(`Error fetching resource ${path}:`, error);
    throw error;
  }
};



