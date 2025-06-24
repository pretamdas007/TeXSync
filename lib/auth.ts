import * as bcrypt from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import type { Secret } from 'jsonwebtoken';

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

/**
 * Hash a password with bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

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
