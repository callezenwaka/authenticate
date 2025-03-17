// Add this to a declaration file like `types/express/index.d.ts`

import 'express-session';
import { TokenEndpointResponse, TokenEndpointResponseHelpers } from 'openid-client';

declare module 'express-session' {
  interface Session {
    // OAuth related
    code_verifier?: string;
    oauth_state?: string;
    tokens?: TokenEndpointResponse & TokenEndpointResponseHelpers;
    userInfo?: any;
  }
}