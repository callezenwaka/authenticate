import { Request } from 'express';
import axios from 'axios';
import { logger } from '../utils';
import { OAuthConfig } from '../types';

let config: OAuthConfig | null = null;

/**
 * Initialize OAuth client
 */
export const initOAuthClient = async (): Promise<OAuthConfig> => {
  try {
    if (config) return config;

    const issuerUrl = process.env.ISSUER_BASE_URL || 'http://localhost:4444/';
    logger.debug(`Discovering OpenID Connect issuer at ${issuerUrl}`);

    // Fetch OpenID Connect configuration
    const response = await axios.get(`${issuerUrl}/.well-known/openid-configuration`);
    const discovery = response.data;

    config = {
      issuer: discovery.issuer,
      authorizationEndpoint: discovery.authorization_endpoint,
      tokenEndpoint: discovery.token_endpoint,
      userInfoEndpoint: discovery.userinfo_endpoint,
      clientId: process.env.CLIENT_ID || 'client-app',
      clientSecret: process.env.CLIENT_SECRET || 'client-secret',
      redirectUri: `${process.env.BASE_URL || 'http://localhost:5555'}/callback`
    };

    logger.info('Discovered issuer %s', config.issuer);
    return config;
  } catch (error) {
    logger.error('Failed to initialize OAuth client:', error);
    throw error;
  }
};

/**
 * Generate a random string
 */
const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Get authorization URL
 */
export const getAuthorizationUrl = async (
  config: OAuthConfig,
  req: Request,
  scope = 'openid profile email',
  state = generateRandomString(16)
): Promise<string> => {
  // Generate PKCE code verifier and challenge
  const code_verifier = generateRandomString(64);
  const code_challenge = Buffer.from(code_verifier).toString('base64url');

  // Store in Express session
  if (!req || !req.session) {
    throw new Error('Session object required to store PKCE parameters');
  }
  req.session.code_verifier = code_verifier;
  req.session.oauth_state = state;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope,
    state,
    code_challenge,
    code_challenge_method: 'S256'
  }).toString();

  return `${config.authorizationEndpoint}?${params}`;
};

/**
 * Callback handler to exchange code for tokens
 */
export const handleCallback = async (
  config: OAuthConfig,
  currentUrl: URL,
  req: Request
): Promise<any> => {
  try {
    const code_verifier = req.session.code_verifier;
    const state = req.session.oauth_state;

    if (!code_verifier) {
      throw new Error('Missing code_verifier from session');
    }

    // Exchange the authorization code for tokens
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'authorization_code',
      code: currentUrl.searchParams.get('code') || '',
      redirect_uri: config.redirectUri,
      code_verifier
    }).toString();

    const response = await axios.post(config.tokenEndpoint, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Clean up session
    delete req.session.code_verifier;
    delete req.session.oauth_state;

    return response.data;
  } catch (error) {
    logger.error('Token exchange error:', error);
    throw error;
  }
};

/**
 * Refresh tokens
 */
export const refreshToken = async (
  config: OAuthConfig,
  refreshToken: string
): Promise<any> => {
  try {
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }).toString();

    const response = await axios.post(config.tokenEndpoint, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Get userinfo from token
 */
export const getUserInfo = async (
  config: OAuthConfig,
  accessToken: string,
  sub?: string
): Promise<any> => {
  try {
    const response = await axios.get(config.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Log the sub claim if provided
    if (sub) {
      logger.debug(`Fetching user info for sub: ${sub}`);
    }

    return response.data;
  } catch (error) {
    logger.error('UserInfo error:', error);
    throw error;
  }
};

/**
 * Introspect token
 */
export const introspectToken = async (
  config: OAuthConfig,
  token: string
): Promise<any> => {
  try {
    const params = new URLSearchParams({
      token,
      client_id: config.clientId,
      client_secret: config.clientSecret
    }).toString();

    const response = await axios.post(`${config.issuer}/introspect`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  } catch (error) {
    logger.error('Token introspection error:', error);
    throw error;
  }
};

/**
 * Revoke token
 */
export const revokeToken = async (
  config: OAuthConfig,
  token: string
): Promise<void> => {
  try {
    const params = new URLSearchParams({
      token,
      client_id: config.clientId,
      client_secret: config.clientSecret
    }).toString();

    await axios.post(`${config.issuer}/revoke`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  } catch (error) {
    logger.error('Token revocation error:', error);
    throw error;
  }
};

/**
 * End session (logout)
 */
export const getEndSessionUrl = (
  config: OAuthConfig,
  idToken?: string,
  postLogoutRedirectUri = `${process.env.BASE_URL}`
): string => {
  const params = new URLSearchParams({
    post_logout_redirect_uri: postLogoutRedirectUri
  });

  if (idToken) {
    params.append('id_token_hint', idToken);
  }

  return `${config.issuer}/logout?${params.toString()}`;
};