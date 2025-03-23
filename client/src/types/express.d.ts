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