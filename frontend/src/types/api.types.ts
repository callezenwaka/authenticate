// src/types/api.types.ts
export interface ApiResponseData<T = any> {
    data: T | null;
    error?: string;
    message?: string;
  }
  
  export interface ErrorResponse {
    error: string;
    error_description?: string;
    status_code?: number;
    message?: string;
  }