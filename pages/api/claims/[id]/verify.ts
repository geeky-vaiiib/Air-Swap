/**
 * Verify Claim API - PATCH endpoint
 * Only verifiers can access this endpoint
 * Approves or rejects a claim
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getUserFromRequest } from '@/lib/auth';
import { isDemo } from '@/lib/isDemo';
import { demoClaims } from '@/demo/demoClaims';
import type { ClaimResponse } from '@/lib/types/claims';

// Validation schema for verification
const VerifyInputSchema = z.object({
  approved: z.boolean(),
  credits: z.number().int().positive().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClaimResponse>
) {
  // Only allow PATCH requests
  if (req.method !== 'PATCH') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid claim ID',
      });
    }

    // Validate request body
    const validatedData = VerifyInputSchema.parse(req.body);

    // Demo mode - return mock updated claim
    if (isDemo()) {
      const claimIndex = demoClaims.findIndex(c => c.id === id);
      
      if (claimIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Claim not found',
        });
      }

      const updatedClaim = {
        ...demoClaims[claimIndex],
        status: validatedData.approved ? 'verified' as const : 'rejected' as const,
        creditsEarned: validatedData.approved ? (validatedData.credits || 0) : 0,
        credits: validatedData.approved ? (validatedData.credits || 0) : 0,
      };

      // Update in-memory demo data (note: this won't persist)
      demoClaims[claimIndex] = updatedClaim;

      return res.status(200).json({
        success: true,
        data: updatedClaim as any,
        message: `Demo claim ${validatedData.approved ? 'approved' : 'rejected'} successfully`,
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
        error: 'Forbidden - Only verifiers can verify claims',
      });
    }

    // Update claim in Supabase
    const updateData: any = {
      status: validatedData.approved ? 'verified' : 'rejected',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (validatedData.approved && validatedData.credits) {
      updateData.credits = validatedData.credits;
    }

    const { data, error } = await supabaseAdmin
      .from('claims')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Claim not found',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to verify claim',
      });
    }

    return res.status(200).json({
      success: true,
      data,
      message: `Claim ${validatedData.approved ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('PATCH /api/claims/[id]/verify error:', error);

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

