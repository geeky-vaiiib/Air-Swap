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
import type { ClaimResponse } from '@/lib/types/claims';
import { VerifyInputSchema } from '@/lib/validators/claims';
import { ClaimsModel } from '@/lib/db/models/claims';
import { CreditsModel } from '@/lib/db/models/credits';
import { VerifierLogsModel } from '@/lib/db/models/verifierLogs';
import { TransactionsModel } from '@/lib/db/models/transactions';
import { UsersModel } from '@/lib/db/models/users';
import { serverMintOxygenCredits } from '@/lib/blockchain/server/oxygenCreditsServer';

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
      user.full_name || 'Verifier',
      validatedData.approved,
      validatedData.credits,
      validatedData.notes
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
        comment: validatedData.notes,
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
          owner_id: claim.contributorId,
          amount: validatedData.credits,
        });

        // Insert transaction log
        await TransactionsModel.create({
          user_id: claim.contributorId,
          type: 'issue',
          metadata: {
            claim_id: id,
            credit_id: credit._id?.toString(),
            credits: validatedData.credits,
          },
        });

        // ---------------------------------------------------------
        // BLOCKCHAIN INTEGRATION: Mint Credits on Polygon Amoy
        // ---------------------------------------------------------
        try {
          // Fetch contributor to get wallet address
          const contributor = await UsersModel.findById(claim.contributorId);

          if (contributor && contributor.wallet_address) {
            console.log(`Minting ${validatedData.credits} credits for ${contributor.wallet_address}...`);

            const mintResult = await serverMintOxygenCredits({
              recipientAddress: contributor.wallet_address,
              amount: validatedData.credits,
              ndviDelta: 0, // Default to 0 if not available in request
              claimId: id as string,
              location: claim.location ? JSON.stringify(claim.location) : "Verified Location"
            });

            if (mintResult.success) {
              console.log(`✅ Blockchain Mint Success: Token ID ${mintResult.tokenId}`);
              // Optionally update credit record with token ID if schema supports it
            } else {
              console.error(`❌ Blockchain Mint Failed: ${mintResult.error}`);
            }
          } else {
            console.warn(`⚠️ Skipping mint: No wallet address for user ${claim.contributorId}`);
          }
        } catch (chainError) {
          console.error('Blockchain integration error:', chainError);
        }
        // ---------------------------------------------------------

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

