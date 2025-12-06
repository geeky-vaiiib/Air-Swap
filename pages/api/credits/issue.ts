/**
 * Issue Credits API - POST endpoint
 * Only verifiers can access this endpoint
 * Issues credits for verified claims
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getUserFromRequest } from '@/lib/auth';
import { isDemo } from '@/lib/isDemo';
import { IssueCreditSchema } from '@/lib/validators/credits';

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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Validate request body
    const validatedData = IssueCreditSchema.parse(req.body);

    // Demo mode - return mock credit
    if (isDemo()) {
      const mockCredit = {
        id: `CRD-${Date.now()}`,
        claim_id: validatedData.claim_id,
        owner_user_id: validatedData.user_id,
        token_id: null,
        metadata_cid: validatedData.metadata_cid || null,
        amount: validatedData.credits,
        ndvi_delta: validatedData.ndvi_delta,
        issued_at: new Date().toISOString(),
      };

      return res.status(201).json({
        success: true,
        data: mockCredit,
        message: 'Demo credit issued successfully',
      });
    }

    // Real mode - check user role
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Please log in',
      });
    }

    if (user.role !== 'verifier') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Only verifiers can issue credits',
      });
    }

    // Insert credit into Supabase
    const { data: creditData, error: creditError } = await supabaseAdmin
      .from('credits')
      .insert({
        claim_id: validatedData.claim_id,
        owner_user_id: validatedData.user_id,
        token_id: null,
        metadata_cid: validatedData.metadata_cid || null,
        amount: validatedData.credits,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (creditError) {
      console.error('Supabase credit insert error:', creditError);
      return res.status(500).json({
        success: false,
        error: 'Failed to issue credit',
      });
    }

    // Insert transaction log
    const { error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: validatedData.user_id,
        tx_hash: null,
        type: 'issue',
        metadata: {
          claim_id: validatedData.claim_id,
          credits: validatedData.credits,
          ndvi_delta: validatedData.ndvi_delta,
          credit_id: creditData.id,
        },
      });

    if (txError) {
      console.error('Transaction log error:', txError);
      // Don't fail the request if transaction log fails
    }

    return res.status(201).json({
      success: true,
      data: creditData,
      message: 'Credit issued successfully',
    });
  } catch (error) {
    console.error('POST /api/credits/issue error:', error);

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

