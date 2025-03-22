import crypto from 'crypto';

export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
};

export const generateCodeChallenge = (verifier: string): string => {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return Buffer.from(hash).toString('base64url')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};