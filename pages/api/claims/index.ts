/**
 * Claims API - GET and POST endpoints
 * GET: Retrieve claims (with optional filters)
 * POST: Create a new claim
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { isDemo } from '@/lib/isDemo';
import { demoClaims } from '@/demo/demoClaims';
import type { ClaimResponse } from '@/lib/types/claims';
import { ClaimInputSchema } from '@/lib/validators/claims';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClaimResponse>
) {
  // GET: Retrieve claims
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  // POST: Create a new claim
  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
}

/**
 * GET /api/claims
 * Retrieve claims with optional filters
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ClaimResponse>
) {
  try {
    // Demo mode - return demo data
    if (isDemo()) {
      const { userId, status } = req.query;
      
      let filteredClaims = [...demoClaims];
      
      // Filter by status if provided
      if (status && typeof status === 'string') {
        filteredClaims = filteredClaims.filter(claim => claim.status === status);
      }
      
      return res.status(200).json({
        success: true,
        data: filteredClaims,
        message: 'Demo claims retrieved successfully',
      });
    }

    // Real mode - query Supabase
    const { userId, status } = req.query;
    
    let query = supabaseAdmin
      .from('claims')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (userId && typeof userId === 'string') {
      query = query.eq('user_id', userId);
    }

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve claims',
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      message: 'Claims retrieved successfully',
    });
  } catch (error) {
    console.error('GET /api/claims error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * POST /api/claims
 * Create a new claim
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ClaimResponse>
) {
  try {
    // Validate request body
    const validatedData = ClaimInputSchema.parse(req.body);

    // Demo mode - return mock created claim
    if (isDemo()) {
      const mockClaim = {
        id: `CLM-${Date.now()}`,
        location: validatedData.location,
        area: validatedData.area ? `${validatedData.area} hectares` : 'N/A',
        status: 'pending' as const,
        creditsEarned: 0,
        date: new Date().toISOString().split('T')[0],
        ndviDelta: validatedData.ndvi_delta,
      };

      return res.status(201).json({
        success: true,
        data: mockClaim as any,
        message: 'Demo claim created successfully',
      });
    }

    // Real mode - check rate limiting (10 claims per day per user)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabaseAdmin
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', validatedData.user_id)
      .gte('created_at', today.toISOString());

    if (countError) {
      console.error('Rate limit check error:', countError);
      // Continue anyway, don't block on rate limit check failure
    } else if (count && count >= 10) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded: Maximum 10 claims per day',
      });
    }

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('claims')
      .insert({
        user_id: validatedData.user_id,
        location: validatedData.location,
        polygon: validatedData.polygon,
        evidence_cids: validatedData.evidence_cids,
        ndvi_before: validatedData.ndvi_before,
        ndvi_after: validatedData.ndvi_after,
        ndvi_delta: validatedData.ndvi_delta,
        area: validatedData.area,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create claim',
      });
    }

    // Warning if approaching rate limit
    let message = 'Claim created successfully';
    if (count && count >= 8) {
      message += ` (Warning: ${count + 1}/10 daily claims used)`;
    }

    return res.status(201).json({
      success: true,
      data,
      message,
    });
  } catch (error) {
    console.error('POST /api/claims error:', error);

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

