import { Request } from 'express';
export type { CreateBlogDto, UpdateBlogDto } from './blog.type';
export type { CreateUserDto, LoginUserDto, UpdateUserDto } from './user.types';

export interface AuthenticatedRequest extends Request {
  auth?: {
    sub: string;
    scp?: string[];  // Add this field for Hydra's scope array
    exp?: number;
    iat?: number;
    iss?: string;
    aud?: string | string[];
    client_id?: string;
    jti?: string;
    nbf?: number;
    ext?: any;
    [key: string]: any;  // Keep this for any other fields
  };
  isAuthenticated?: boolean;
  user?: any;
  tokens?: any;
  services?: any;
}

export interface ErrorResponse {
  error: string;
  error_description?: string;
  status_code?: number;
}