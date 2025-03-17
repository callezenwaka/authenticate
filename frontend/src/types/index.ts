// // frontend/src/types/index.ts
// import { Request } from 'express';
// import { TokenSet, Client } from 'openid-client';
// import { User } from './user.types';
// src/types/auth.types.ts (continue in same file)
// src/types/index.ts
// import { Request } from 'express';
// import * as oauth from 'openid-client';
// import { ServiceProvider } from '@/provider';
// import { UserInfo } from './auth.types';

// export interface AuthenticatedRequest extends Request {
//   user?: UserInfo;
//   isAuthenticated: boolean;
//   oauthConfig?: oauth.Configuration;
//   tokens?: oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers;
//   services?: ServiceProvider; // Optional: If using the ServiceProvider pattern
// }

// export interface AuthenticatedRequest extends Request {
//   user?: User;
//   isAuthenticated: boolean;
//   oauthConfig?: oauth.Configuration;
//   tokens?: oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers;
//   services?: ServiceProvider; // Optional: If using the ServiceProvider pattern
// }

// export interface UserInfo {
//   sub: string;
//   email?: string;
//   name?: string;
//   given_name?: string;
//   family_name?: string;
//   preferred_username?: string;
//   [key: string]: any;
// }

// export interface ApiResponseData {
//   data: any;
//   error?: string;
// }

// export interface ErrorResponse {
//   error: string;
//   error_description?: string;
//   status_code?: number;
// }