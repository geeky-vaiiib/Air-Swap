/**
 * Next.js Middleware for Route Protection
 * Handles authentication and role-based access control
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard/contributor': 'contributor',
  '/dashboard/company': 'company',
  '/dashboard/verifier': 'verifier',
} as const;

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/map'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if demo mode is enabled
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  
  // In demo mode, allow all routes
  if (isDemoMode) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get session from cookies
  const sessionCookie = request.cookies.get('airswap-session');
  
  // If no session and trying to access protected route, redirect to login
  if (!sessionCookie && Object.keys(protectedRoutes).some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Parse session data
  let session;
  try {
    session = sessionCookie ? JSON.parse(sessionCookie.value) : null;
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for dashboard routes
  for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // If user has wrong role, redirect to their correct dashboard
      if (session.role !== requiredRole) {
        const correctDashboard = new URL(`/dashboard/${session.role}`, request.url);
        return NextResponse.redirect(correctDashboard);
      }
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

