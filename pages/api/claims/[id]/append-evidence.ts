/**
 * Claims API - Append Evidence Endpoint
 * POST: Add supplementary evidence files to an existing claim
 * 
 * Allows contributors to add additional evidence to pending claims
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { ClaimsModel, type EvidenceFile } from '@/lib/db/models/claims';
import { getUserFromRequest } from '@/lib/auth';
import { AppendEvidenceSchema } from '@/lib/validators/claims';
import { logger } from '@/lib/logger';
import { isDemo } from '@/lib/isDemo';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Claim ID is required',
      });
    }

    // Demo mode
    if (isDemo()) {
      return res.status(200).json({
        success: true,
        data: { id, message: 'Demo mode: Evidence would be appended' },
        message: 'Demo evidence appended successfully',
      });
    }

    // Fetch existing claim
    const claim = await ClaimsModel.findById(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found',
      });
    }

    // Only owner can append evidence
    if (claim.contributorId.toString() !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only add evidence to your own claims',
      });
    }

    // Only pending claims can have evidence appended
    if (claim.status !== 'pending') {
      return res.status(403).json({
        success: false,
        error: 'Cannot add evidence to non-pending claims',
      });
    }

    // Validate request body
    const validatedData = AppendEvidenceSchema.parse(req.body);

    // Process new evidence files
    // For now, use placeholder CIDs (real implementation would upload to IPFS)
    const newEvidence: EvidenceFile[] = validatedData.files.map((file, index) => ({
      name: file.name,
      type: file.type || 'document',
      url: `https://nftstorage.link/ipfs/pending-${Date.now()}-${index}`,
      cid: `pending-${Date.now()}-${index}`,
      uploadedAt: new Date(),
    }));

    // Append evidence to claim
    for (const evidence of newEvidence) {
      await ClaimsModel.appendEvidence(id, evidence);
    }

    // Add audit log entry
    await ClaimsModel.addAuditLog(id, {
      event: 'evidence_appended',
      userId: new ObjectId(user.id),
      userName: user.full_name,
      note: `Added ${newEvidence.length} evidence file(s)`,
    });

    logger.info(`Evidence appended to claim ${id} by user ${user.id}`);

    // Fetch updated claim
    const updatedClaim = await ClaimsModel.findById(id);

    return res.status(200).json({
      success: true,
      data: {
        claimId: updatedClaim?.claimId,
        evidenceCount: updatedClaim?.evidence?.length || 0,
        newFiles: newEvidence.length,
      },
      message: 'Evidence appended successfully',
    });
  } catch (error) {
    logger.error('POST /api/claims/[id]/append-evidence error:', error as Error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.errors[0].message}`,
      });
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
