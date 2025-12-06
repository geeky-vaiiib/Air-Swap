/**
 * Zod validation schemas for Auth API
 */

import { z } from 'zod';

/**
 * Schema for user signup
 */
export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['contributor', 'company', 'verifier'], {
    errorMap: () => ({ message: 'Invalid role. Must be contributor, company, or verifier' }),
  }),
});

/**
 * Schema for user login
 */
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

