/**
 * API Documentation Endpoint
 * Returns OpenAPI specification
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { openApiSpec } from '@/lib/openapi';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  // Set CORS headers for API docs
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json(openApiSpec);
}

