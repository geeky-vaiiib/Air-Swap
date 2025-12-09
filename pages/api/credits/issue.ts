/**
 * Issue Credits API - POST endpoint
 * Only verifiers can access this endpoint
 * Issues credits for verified claims
 *
 * Uses MongoDB for data storage
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';

import { IssueCreditSchema } from '@/lib/validators/credits';
import { CreditsModel } from '@/lib/db/models/credits';
import { TransactionsModel } from '@/lib/db/models/transactions';

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

    // Insert credit into MongoDB
    const credit = await CreditsModel.create({
      claim_id: new ObjectId(validatedData.claim_id),
      owner_id: new ObjectId(validatedData.user_id),
      amount: validatedData.credits,
      metadata_cid: validatedData.metadata_cid,
    });

    // Insert transaction log
    try {
      await TransactionsModel.create({
        user_id: new ObjectId(validatedData.user_id),
        type: 'issue',
        metadata: {
          claim_id: validatedData.claim_id,
          credits: validatedData.credits,
          ndvi_delta: validatedData.ndvi_delta,
          credit_id: credit._id?.toString(),
        },
      });
    } catch (txError) {
      console.error('Transaction log error:', txError);
      // Don't fail the request if transaction log fails
    }

    // Serialize for JSON response
    const serializedCredit = {
      ...credit,
      _id: credit._id?.toString(),
      claim_id: credit.claim_id?.toString(),
      owner_id: credit.owner_id?.toString(),
    };

    return res.status(201).json({
      success: true,
      data: serializedCredit,
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

