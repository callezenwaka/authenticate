// client/src/types/express.d.ts
// import 'express-session';
import { UserInfo, CustomToken, OAuthConfig } from "./auth.type";

// Extend the session data interface
// Extend express-session
declare module 'express-session' {
  interface SessionData {
    code_verifier?: string;
    oauth_state?: string;
    tokens?: CustomToken;
    userInfo?: UserInfo;
    returnTo?: string;
  }
}

// Extend Express.Request
declare namespace Express {
  interface Request {
    isAuthenticated?: boolean;
    user?: UserInfo;
    tokens?: CustomToken;
    oauthConfig?: OAuthConfig;
  }
}

// declare module 'express-session' {
//   interface SessionData {
//     // OAuth related
//     code_verifier?: string;
//     oauth_state?: string;
//     tokens?: CustomToken;
//     userInfo?: UserInfo;
//     returnTo?: string;
//   }
// }

// declare module "express-session" {
//   interface Session {
//     code_verifier?: string;
//     oauth_state?: string;
//     tokens?: {
//       access_token: string;
//       refresh_token?: string;
//       id_token?: string;
//       expires_in?: number;
//       token_type: string;
//     };
//     userInfo?: any;
//     returnTo?: string;
//   }
// }

// declare module "express-session" {
//   interface SessionData {
//     code_verifier?: string;
//     oauth_state?: string;
//     tokens?: {
//       access_token: string;
//       refresh_token?: string;
//       id_token?: string;
//       expires_in?: number;
//       token_type: string;
//     };
//     userInfo?: any;
//     returnTo?: string;
//   }
// }


// declare module 'express-session' {
//   export interface SessionData {
//     // OAuth related
//     code_verifier?: string;
//     oauth_state?: string;
//     tokens?: CustomToken;
//     // tokens?: {
//     //   access_token: string;
//     //   refresh_token?: string;
//     //   id_token?: string;
//     //   expires_in?: number;
//     //   token_type: string;
//     // };
//     userInfo?: UserInfo;
//     returnTo?: string;
//   }
// }