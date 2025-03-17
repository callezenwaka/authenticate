// src/types/express.d.ts
import 'express-session';

declare module 'express-session' {
  interface Session {
    // OAuth related
    code_verifier?: string;
    oauth_state?: string;
    tokens?: {
      access_token: string;
      refresh_token?: string;
      id_token?: string;
      expires_in?: number;
      token_type: string;
    };
    userInfo?: any;
    returnTo?: string;
  }
}