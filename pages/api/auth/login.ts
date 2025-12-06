/**
 * Login API Route
 * Authenticates user and returns session data
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseServer';
import type { AuthResponse } from '@/lib/types/auth';
import { createSessionCookie } from '@/lib/auth';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

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
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user || !authData.session) {
      console.error('Login error:', authError);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Fetch user profile from profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile',
      });
    }

    // Set session cookie
    const sessionCookie = createSessionCookie({
      userId: authData.user.id,
      email: authData.user.email!,
      role: profile.role,
      full_name: profile.full_name,
      access_token: authData.session.access_token,
    });

    res.setHeader('Set-Cookie', sessionCookie);

    // Return success response
    return res.status(200).json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        role: profile.role,
        full_name: profile.full_name,
      },
      access_token: authData.session.access_token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

