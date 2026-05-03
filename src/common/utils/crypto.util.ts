import * as crypto from 'crypto';

/**
 * Hash a token using SHA-256
 * Used for hashing refresh tokens before storing in database
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify if a token matches a hash
 */
export function verifyHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return tokenHash === hash;
}
