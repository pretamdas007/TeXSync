import { sign, verify } from 'jsonwebtoken';
import type { Secret } from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: object, expiresIn = '7d'): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return sign(payload, secret as Secret, { expiresIn });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): any {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    return verify(token, secret as Secret);
  } catch (error) {
    return null;
  }
}
