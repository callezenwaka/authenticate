import { Request } from 'express';
export type { CreateBlogDto, UpdateBlogDto } from './request.type';

export interface AuthenticatedRequest extends Request {
  auth?: {
    sub: string;
    scope?: string;
    exp?: number;
    iat?: number;
    iss?: string;
    aud?: string | string[];
    client_id?: string;
    [key: string]: any;
  };
}

export interface ErrorResponse {
  error: string;
  error_description?: string;
  status_code?: number;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}