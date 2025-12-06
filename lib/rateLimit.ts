/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for API endpoints
 * For production, consider using Redis-based rate limiting
 */

import type { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Note: This resets on server restart and doesn't work across multiple instances
// For production, use Redis or a similar distributed cache
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const DEFAULT_MAX_REQUESTS = 60; // 60 requests per minute

// Different limits for different endpoint types
const RATE_LIMITS: Record<string, number> = {
  'auth': 10, // 10 auth attempts per minute
  'claims': 30, // 30 claim requests per minute
  'credits': 30,
  'marketplace': 40,
  'evidence': 20,
  'default': DEFAULT_MAX_REQUESTS,
};

/**
 * Get the client identifier (IP address or user ID if authenticated)
 */
function getClientIdentifier(req: NextApiRequest): string {
  // Try to get real IP from headers (for proxied requests)
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  let ip: string;
  if (typeof forwarded === 'string') {
    ip = forwarded.split(',')[0].trim();
  } else if (typeof realIp === 'string') {
    ip = realIp;
  } else {
    ip = req.socket?.remoteAddress || 'unknown';
  }
  
  return ip;
}

/**
 * Get the endpoint type from the request path
 */
function getEndpointType(path: string): string {
  if (path.includes('/auth')) return 'auth';
  if (path.includes('/claims')) return 'claims';
  if (path.includes('/credits')) return 'credits';
  if (path.includes('/marketplace')) return 'marketplace';
  if (path.includes('/evidence')) return 'evidence';
  return 'default';
}

/**
 * Clean up expired entries from the rate limit store
 * Should be called periodically to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes (only in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(req: NextApiRequest): RateLimitResult {
  const clientId = getClientIdentifier(req);
  const endpointType = getEndpointType(req.url || '');
  const maxRequests = RATE_LIMITS[endpointType] || DEFAULT_MAX_REQUESTS;
  
  const key = `${clientId}:${endpointType}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Create new entry if none exists or window has expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore.set(key, entry);
  }
  
  entry.count++;
  
  const remaining = Math.max(0, maxRequests - entry.count);
  const success = entry.count <= maxRequests;
  
  return {
    success,
    limit: maxRequests,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware wrapper
 * Use this to wrap API handlers with rate limiting
 */
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip rate limiting in demo mode
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      return handler(req, res);
    }
    
    const result = checkRateLimit(req);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    
    if (!result.success) {
      res.setHeader('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000));
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
    }
    
    return handler(req, res);
  };
}

