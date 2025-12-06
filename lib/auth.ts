/**
 * Server-side Authentication Utilities
 * Uses JWT for stateless authentication with MongoDB user storage
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { AuthUser, SessionData } from './types/auth';
import { NextApiRequest } from 'next';
import { UsersModel } from './db/models/users';

// JWT secret - must be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'airswap-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  id: string;
  email: string;
  role: 'contributor' | 'company' | 'verifier';
  full_name: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token and return payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Get session from request cookies
 */
export function getSessionFromCookies(req: NextApiRequest): SessionData | null {
  try {
    const sessionCookie = req.cookies['airswap-session'];
    if (!sessionCookie) {
      return null;
    }
    return JSON.parse(sessionCookie);
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    return null;
  }
}

/**
 * Get user from request (checks cookies and verifies JWT token)
 */
export async function getUserFromRequest(req: NextApiRequest): Promise<AuthUser | null> {
  // Check for demo mode headers first
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    const demoRole = req.headers['x-demo-role'] as string;
    const demoUser = req.headers['x-demo-user'] as string;
    if (demoRole && demoUser) {
      return {
        id: demoUser,
        email: `${demoRole}@demo.airswap.io`,
        role: demoRole as 'contributor' | 'company' | 'verifier',
        full_name: `Demo ${demoRole.charAt(0).toUpperCase() + demoRole.slice(1)}`,
      };
    }
  }

  const session = getSessionFromCookies(req);
  if (!session || !session.access_token) {
    return null;
  }

  const payload = verifyToken(session.access_token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    full_name: payload.full_name,
  };
}

/**
 * Create session cookie string
 */
export function createSessionCookie(sessionData: SessionData): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? '; Secure' : '';
  return `airswap-session=${JSON.stringify(sessionData)}; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=604800`; // 7 days
}

/**
 * Create logout cookie string (expires immediately)
 */
export function createLogoutCookie(): string {
  return 'airswap-session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const user = await UsersModel.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    return {
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
      full_name: user.full_name || '',
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

