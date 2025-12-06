/**
 * Rate Limit Tests
 */

import { checkRateLimit } from '@/lib/rateLimit';
import type { NextApiRequest } from 'next';
import { Socket } from 'net';

// Mock request factory
function createMockRequest(url: string, ip: string = '127.0.0.1'): NextApiRequest {
  return {
    url,
    headers: {
      'x-forwarded-for': ip,
    },
    socket: {
      remoteAddress: ip,
    } as Socket,
  } as NextApiRequest;
}

describe('Rate Limiting', () => {
  it('should allow requests under the limit', () => {
    const req = createMockRequest('/api/claims', '192.168.1.1');
    
    const result = checkRateLimit(req);
    
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it('should track requests per IP', () => {
    const ip1 = '192.168.1.100';
    const ip2 = '192.168.1.101';
    
    const req1 = createMockRequest('/api/claims', ip1);
    const req2 = createMockRequest('/api/claims', ip2);
    
    const result1 = checkRateLimit(req1);
    const result2 = checkRateLimit(req2);
    
    // Both should succeed and have independent counts
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
  });

  it('should have different limits for auth endpoints', () => {
    const authReq = createMockRequest('/api/auth/login', '192.168.1.200');
    const claimsReq = createMockRequest('/api/claims', '192.168.1.201');
    
    const authResult = checkRateLimit(authReq);
    const claimsResult = checkRateLimit(claimsReq);
    
    // Auth should have lower limit than claims
    expect(authResult.limit).toBeLessThan(claimsResult.limit);
  });

  it('should include rate limit info in result', () => {
    const req = createMockRequest('/api/marketplace', '192.168.1.300');
    
    const result = checkRateLimit(req);
    
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('limit');
    expect(result).toHaveProperty('remaining');
    expect(result).toHaveProperty('resetTime');
    expect(typeof result.resetTime).toBe('number');
  });
});

