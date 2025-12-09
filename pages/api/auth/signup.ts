/**
 * Signup API Route
 * Creates a new user with MongoDB and returns JWT token
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import type { AuthResponse } from '@/lib/types/auth';
import { createSessionCookie, hashPassword, generateToken } from '@/lib/auth';
import { UsersModel } from '@/lib/db/models/users';
import { SignupSchema } from '@/lib/validators/auth';

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
    const validatedData = SignupSchema.parse(req.body);
    const { email, password, full_name, role } = validatedData;

    // Check if user already exists
    const existingUser = await UsersModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user in MongoDB
    const newUser = await UsersModel.create({
      email,
      password_hash,
      full_name,
      role,
    });

    // Generate JWT token
    const tokenPayload = {
      id: newUser._id!.toString(),
      email: newUser.email,
      role: newUser.role,
      full_name: newUser.full_name || '',
    };

    const token = generateToken(tokenPayload);

    // Set session cookie
    const sessionCookie = createSessionCookie({
      userId: newUser._id!.toString(),
      email: newUser.email,
      role: newUser.role,
      full_name: newUser.full_name || '',
      access_token: token,
    });

    res.setHeader('Set-Cookie', sessionCookie);

    // Return success response
    return res.status(201).json({
      success: true,
      user: {
        id: newUser._id!.toString(),
        email: newUser.email,
        role: newUser.role,
        full_name: newUser.full_name || '',
      },
      access_token: token,
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

    // Better error messages for debugging
    if (error instanceof Error) {
      // Don't expose internal errors in production
      const isDev = process.env.NODE_ENV === 'development';
      return res.status(500).json({
        success: false,
        error: isDev ? error.message : 'Internal server error',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

