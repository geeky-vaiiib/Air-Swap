/**
 * Health Check API Endpoint
 * Used for monitoring and load balancer health checks
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@/lib/db/mongo';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
  };
}

const startTime = Date.now();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const version = process.env.npm_package_version || '1.0.0';

  // Check database connection
  let dbStatus: 'up' | 'down' = 'down';
  let dbLatency: number | undefined;
  let dbError: string | undefined;

  // Skip DB check in demo mode
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    dbStatus = 'up';
    dbLatency = 0;
  } else {
    try {
      const startDb = Date.now();
      const db = await getDb();
      await db.command({ ping: 1 });
      dbLatency = Date.now() - startDb;
      dbStatus = 'up';
    } catch (error) {
      dbStatus = 'down';
      dbError = error instanceof Error ? error.message : 'Unknown database error';
    }
  }

  // Determine overall health status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (dbStatus === 'down') {
    status = 'unhealthy';
  } else if (dbLatency && dbLatency > 1000) {
    status = 'degraded';
  }

  const response: HealthCheckResponse = {
    status,
    timestamp,
    version,
    uptime,
    checks: {
      database: {
        status: dbStatus,
        latency: dbLatency,
        ...(dbError && { error: dbError }),
      },
    },
  };

  // Return appropriate status code
  const statusCode = status === 'unhealthy' ? 503 : 200;
  
  // Set cache headers to prevent caching of health status
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  return res.status(statusCode).json(response);
}

