/**
 * Credits API - GET endpoint
 * GET: Retrieve credits for a specific user
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { isDemo } from '@/lib/isDemo';
import { demoCredits } from '@/demo/demoCredits';

interface CreditResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreditResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    // Demo mode - return demo data
    if (isDemo()) {
      return res.status(200).json({
        success: true,
        data: demoCredits,
        message: 'Demo credits retrieved successfully',
      });
    }

    // Real mode - query Supabase
    const { data, error } = await supabaseAdmin
      .from('credits')
      .select('*')
      .eq('owner_user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve credits',
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      message: 'Credits retrieved successfully',
    });
  } catch (error) {
    console.error('GET /api/credits/[userId] error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

