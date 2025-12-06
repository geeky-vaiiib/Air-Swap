/**
 * Authentication and User Types
 */

export type UserRole = "contributor" | "company" | "verifier";

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  access_token?: string;
  error?: string;
  message?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SessionData {
  userId: string;
  email: string;
  role: UserRole;
  full_name: string;
  access_token: string;
}

