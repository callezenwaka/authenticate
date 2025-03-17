// frontend/src/services/oauth.ts
// import { Issuer, Client, TokenSet } from 'openid-client';
import express, { Request } from 'express';
import * as oauth from 'openid-client';
import { logger } from '@/utils';

// let client: Client | null = null;
let config: oauth.Configuration | null = null;

/**
 * Initialize OAuth client
 */
export const initOAuthClient = async (): Promise<oauth.Configuration> => {
  try {
    if (config) return config;

    const issuerUrl = process.env.ISSUER_BASE_URL || 'http://localhost:4444/';
    logger.debug(`Discovering OpenID Connect issuer at ${issuerUrl}`);

    // Create a URL instance from the issuer URL
    const issuerUrlObj = new URL(issuerUrl);

    // Client ID and Secret
    const clientId = process.env.CLIENT_ID || 'client-app';
    const clientSecret = process.env.CLIENT_SECRET || 'client-secret';
    
    // Discover the OpenID Connect issuer
    const discoveredConfig = await oauth.discovery(issuerUrlObj, clientId, clientSecret);
    logger.info('Discovered issuer %s', discoveredConfig.serverMetadata().issuer);
    

    // const issuer = await Issuer.discover(issuerUrl);
    // logger.info('Discovered issuer %s %O', issuer.issuer, issuer.metadata);
    
    // Create client
    // client = new issuer.Client({
    //   client_id: process.env.CLIENT_ID || 'client-app',
    //   client_secret: process.env.CLIENT_SECRET || 'client-secret',
    //   redirect_uris: [`${process.env.BASE_URL || 'http://localhost:5555'}/callback`],
    //   response_types: ['code'],
    //   // For better security, include PKCE (code_challenge)
    //   token_endpoint_auth_method: 'client_secret_basic',
    // });
    
    // return client;
    config = discoveredConfig;
    return discoveredConfig;
  } catch (error) {
    logger.error('Failed to initialize OAuth client:', error);
    throw error;
  }
};

/**
 * Get authorization URL
 */
export const getAuthorizationUrl = async (
  // client: Client,
  // scope = 'openid profile email',
  // state = Math.random().toString(36).substring(2, 15),
  // nonce = Math.random().toString(36).substring(2, 15),
  config: oauth.Configuration,
  req: Request,
  scope = 'openid profile email',
  state = oauth.randomState()
): Promise<URL> => {
  // Generate PKCE code verifier and challenge
  const code_verifier = oauth.randomPKCECodeVerifier();
  const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);
  
  // The code_verifier should be stored in the session to be retrieved during the callback
  // Note: This function should receive the session object from the Express request
  // This is expected to be passed from the route handler
  if (!req || !req.session) {
    throw new Error('Session object required to store PKCE parameters');
  }

  // Store in Express session
  req.session.code_verifier = code_verifier;
  req.session.oauth_state = state;

  // return client.authorizationUrl({
  //   scope,
  //   state,
  //   nonce,
  //   // For better security, include PKCE
  //   code_challenge: 'xyz', // In a real app, generate this properly
  //   code_challenge_method: 'S256',
  // });

  return oauth.buildAuthorizationUrl(config, {
    redirect_uri: `${process.env.BASE_URL || 'http://localhost:5555'}/callback`,
    scope,
    state,
    code_challenge,
    code_challenge_method: 'S256',
  });
};

/**
 * Callback handler to exchange code for tokens
 */
export const handleCallback = async (
  // client: Client,
  // params: any,
  // redirectUri = `${process.env.BASE_URL || 'http://localhost:5555'}/callback`,
  config: oauth.Configuration,
  currentUrl: URL,
  req: Request
): Promise<oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers> => {
  try {
    // const tokenSet = await client.callback(redirectUri, params, {
    //   code_verifier: 'xyz', // In a real app, this should match the code_challenge
    // });
    // Retrieve code_verifier and state from Express session
    const code_verifier = req.session.code_verifier;
    const state = req.session.oauth_state;

    if (!code_verifier) {
      throw new Error('Missing code_verifier from session');
    }

    // Exchange the authorization code for tokens
    const tokenSet = await oauth.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: code_verifier,
      expectedState: state || undefined,
    });

    // Clean up session
    delete req.session.code_verifier;
    delete req.session.oauth_state;
    
    return tokenSet;
  } catch (error) {
    logger.error('Token exchange error:', error);
    throw error;
  }
};

/**
 * Refresh tokens
 */
export const refreshToken = async (
  // client: Client,
  config: oauth.Configuration,
  refreshToken: string,
): Promise<oauth.TokenEndpointResponse & oauth.TokenEndpointResponseHelpers> => {
  try {
    // const tokenSet = await client.refresh(refreshToken);
    const tokenSet = await oauth.refreshTokenGrant(config, refreshToken);
    return tokenSet;
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Get userinfo from token
 */
export const getUserInfo = async (
  // client: Client,
  config: oauth.Configuration,
  accessToken: string,
  sub?: string,
): Promise<any> => {
  try {
    // If we have a subject (sub) from an ID token, we can verify it matches
    // Otherwise, we can use skipSubjectCheck to bypass the check
    if (!sub) {
      throw new Error("Subject (sub) claim is missing. Cannot proceed without verifying the subject.");
    }

    // Always validate the subject
    const userInfo = await oauth.fetchUserInfo(config, accessToken, sub);
    // const userInfo = await client.userinfo(accessToken);

    return userInfo;
  } catch (error) {
    logger.error('UserInfo error:', error);
    throw error;
  }
};

/**
 * Introspect token
 */
export const introspectToken = async (
  // client: Client,
  // token: string,
  // tokenType = 'access_token'
  config: oauth.Configuration,
  token: string,
  tokenTypeHint?: string,
): Promise<any> => {
  try {
    const params: Record<string, string> = {};
    if (tokenTypeHint) {
      params.token_type_hint = tokenTypeHint;
    }

    // const introspection = await client.introspect(token, tokenType);
    const introspection = await oauth.tokenIntrospection(config, token, params);

    return introspection;
  } catch (error) {
    logger.error('Token introspection error:', error);
    throw error;
  }
};

/**
 * Revoke token
 */
export const revokeToken = async (
  // client: Client,
  config: oauth.Configuration,
  token: string,
  tokenTypeHint?: string
  // tokenType = 'access_token'
): Promise<void> => {
  try {
    const params: Record<string, string> = {};
    if (tokenTypeHint) {
      params.token_type_hint = tokenTypeHint;
    }

    // await client.revoke(token, tokenType);
    await oauth.tokenRevocation(config, token, params);
  } catch (error) {
    logger.error('Token revocation error:', error);
    throw error;
  }
};

/**
 * End session (logout)
 */
export const getEndSessionUrl = (
  // client: Client,
  config: oauth.Configuration,
  idToken?: string,
  postLogoutRedirectUri = `${process.env.BASE_URL}`
): URL => {
  // const params: any = {};
  const params: Record<string, string> = {};
  
  if (idToken) {
    params.id_token_hint = idToken;
  }
  
  params.post_logout_redirect_uri = postLogoutRedirectUri;
  
  // return client.endSessionUrl(params);
  return oauth.buildEndSessionUrl(config, params);
};