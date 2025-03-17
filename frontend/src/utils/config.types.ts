// 
export interface OAuthConfig {
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  serverMetadata?: any;
  timeout?: number;
}