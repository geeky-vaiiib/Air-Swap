/**
 * Signup API Route
 * Creates a new user with Supabase Auth and stores profile data
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseServer';
import type { AuthResponse } from '@/lib/types/auth';
import { createSessionCookie } from '@/lib/auth';

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['contributor', 'company', 'verifier'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
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
    const validatedData = signupSchema.parse(req.body);
    const { email, password, full_name, role } = validatedData;

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for demo purposes
      user_metadata: {
        full_name,
        role,
      },
    });

    if (authError || !authData.user) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        success: false,
        error: authError?.message || 'Failed to create user',
      });
    }

    // Create profile in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email,
        full_name,
        role,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Attempt to delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to create user profile',
      });
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    // Create a proper session by signing in the user
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      console.error('Sign in error:', signInError);
      return res.status(500).json({
        success: false,
        error: 'User created but failed to generate session',
      });
    }

    // Set session cookie
    const sessionCookie = createSessionCookie({
      userId: authData.user.id,
      email,
      role,
      full_name,
      access_token: signInData.session.access_token,
    });

    res.setHeader('Set-Cookie', sessionCookie);

    // Return success response
    return res.status(201).json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        role,
        full_name,
      },
      access_token: signInData.session.access_token,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    
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

