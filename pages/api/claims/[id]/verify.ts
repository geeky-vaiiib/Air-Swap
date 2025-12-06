/**
 * Verify Claim API - PATCH endpoint
 * Only verifiers can access this endpoint
 * Approves or rejects a claim
 *
 * Uses MongoDB for data storage
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { isDemo } from '@/lib/isDemo';
import { demoClaims } from '@/demo/demoClaims';
import type { ClaimResponse } from '@/lib/types/claims';
import { VerifyInputSchema } from '@/lib/validators/claims';
import { ClaimsModel } from '@/lib/db/models/claims';
import { CreditsModel } from '@/lib/db/models/credits';
import { VerifierLogsModel } from '@/lib/db/models/verifierLogs';
import { TransactionsModel } from '@/lib/db/models/transactions';

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

    // Find the claim first
    const claim = await ClaimsModel.findById(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found',
      });
    }

    // Update claim in MongoDB
    const verifierId = new ObjectId(user.id);
    const updated = await ClaimsModel.verify(
      id,
      verifierId,
      validatedData.approved,
      validatedData.credits,
      validatedData.comment
    );

    if (!updated) {
      return res.status(500).json({
        success: false,
        error: 'Failed to verify claim',
      });
    }

    // Insert verifier log
    try {
      await VerifierLogsModel.create({
        claim_id: new ObjectId(id),
        verifier_id: verifierId,
        action: validatedData.approved ? 'approve' : 'reject',
        comment: validatedData.comment,
      });
    } catch (logError) {
      console.error('Verifier log error:', logError);
      // Don't fail the request if log insert fails
    }

    // If approved and credits provided, issue credits
    if (validatedData.approved && validatedData.credits) {
      try {
        const credit = await CreditsModel.create({
          claim_id: new ObjectId(id),
          owner_id: claim.user_id,
          amount: validatedData.credits,
        });

        // Insert transaction log
        await TransactionsModel.create({
          user_id: claim.user_id,
          type: 'issue',
          metadata: {
            claim_id: id,
            credit_id: credit._id?.toString(),
            credits: validatedData.credits,
          },
        });
      } catch (creditError) {
        console.error('Credit issuance error:', creditError);
        // Don't fail the request if credit insert fails
      }
    }

    // Get updated claim
    const updatedClaim = await ClaimsModel.findById(id);

    // Serialize for JSON response
    const serializedClaim = updatedClaim ? {
      ...updatedClaim,
      _id: updatedClaim._id?.toString(),
      user_id: updatedClaim.user_id?.toString(),
      verified_by: updatedClaim.verified_by?.toString(),
    } : null;

    return res.status(200).json({
      success: true,
      data: serializedClaim,
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

