/**
 * Server-side Authentication Utilities
 */

import { supabaseAdmin } from './supabaseServer';
import type { AuthUser, SessionData } from './types/auth';
import { NextApiRequest } from 'next';

/**
 * Verify JWT token and return user data
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      return null;
    }

    // Fetch user profile from profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      role: profile.role,
      full_name: profile.full_name,
    };
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
 * Get user from request (checks cookies and verifies token)
 */
export async function getUserFromRequest(req: NextApiRequest): Promise<AuthUser | null> {
  const session = getSessionFromCookies(req);
  if (!session) {
    return null;
  }

  return await verifyToken(session.access_token);
}

/**
 * Create session cookie string
 */
export function createSessionCookie(sessionData: SessionData): string {
  return `airswap-session=${JSON.stringify(sessionData)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`; // 7 days
}

/**
 * Create logout cookie string (expires immediately)
 */
export function createLogoutCookie(): string {
  return 'airswap-session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}

