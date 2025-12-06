/**
 * Logout API Route
 * Clears user session and cookies
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { AuthResponse } from '@/lib/types/auth';
import { createLogoutCookie, getSessionFromCookies } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseServer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Get session from cookies
    const session = getSessionFromCookies(req);

    // Sign out from Supabase if we have a valid session
    if (session?.access_token) {
      await supabaseAdmin.auth.signOut();
    }

    // Clear session cookie
    res.setHeader('Set-Cookie', createLogoutCookie());

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear the cookie
    res.setHeader('Set-Cookie', createLogoutCookie());
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

