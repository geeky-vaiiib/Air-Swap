/**
 * Client-side Authentication Helpers
 */

import type { SessionData } from './types/auth';

/**
 * Get session from localStorage
 */
export function getSession(): SessionData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const sessionStr = localStorage.getItem('airswap-session');
    if (!sessionStr) {
      return null;
    }
    return JSON.parse(sessionStr);
  } catch (error) {
    console.error('Error parsing session:', error);
    return null;
  }
}

/**
 * Save session to localStorage
 */
export function saveSession(session: SessionData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('airswap-session', JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

/**
 * Clear session from localStorage
 */
export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('airswap-session');
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Get current user's role
 */
export function getUserRole(): string | null {
  const session = getSession();
  return session?.role || null;
}

/**
 * Logout user (clear session and call logout API)
 */
export async function logout(): Promise<void> {
  try {
    // Call logout API
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // Always clear local session
    clearSession();
  }
}

