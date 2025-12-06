/**
 * Credits API - GET endpoint
 * GET: Retrieve credits for a specific user
 *
 * Uses MongoDB for data storage
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { isDemo } from '@/lib/isDemo';
import { demoCredits } from '@/demo/demoCredits';
import { CreditsModel } from '@/lib/db/models/credits';

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

    // Real mode - query MongoDB
    const credits = await CreditsModel.findByOwnerId(userId);

    // Serialize ObjectIds for JSON response
    const serializedCredits = credits.map(credit => ({
      ...credit,
      _id: credit._id?.toString(),
      claim_id: credit.claim_id?.toString(),
      owner_id: credit.owner_id?.toString(),
    }));

    // Also get total credits
    const totalCredits = await CreditsModel.getTotalByOwner(userId);

    return res.status(200).json({
      success: true,
      data: {
        credits: serializedCredits,
        total: totalCredits,
      },
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

