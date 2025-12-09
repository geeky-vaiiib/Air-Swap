/**
 * Marketplace Purchase API - POST endpoint
 * Purchase credits from a marketplace listing
 * 
 * Uses MongoDB for data storage
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { MarketplaceModel } from '@/lib/db/models/marketplace';
import { CreditsModel } from '@/lib/db/models/credits';
import { TransactionsModel } from '@/lib/db/models/transactions';
import { PurchaseListingSchema } from '@/lib/validators/marketplace';

interface PurchaseResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PurchaseResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Authenticate user
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Please log in',
      });
    }

    // Validate request body
    const validatedData = PurchaseListingSchema.parse(req.body);

    // Find the listing
    const listing = await MarketplaceModel.findById(validatedData.listing_id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Listing is not active',
      });
    }

    if (listing.quantity < validatedData.quantity) {
      return res.status(400).json({
        success: false,
        error: 'Not enough quantity available',
      });
    }

    // Cannot buy from yourself
    if (listing.seller_id.toString() === user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot purchase your own listing',
      });
    }

    // Process the purchase
    const buyerId = new ObjectId(user.id);
    const purchased = await MarketplaceModel.purchase(
      validatedData.listing_id,
      buyerId,
      validatedData.quantity
    );

    if (!purchased) {
      return res.status(500).json({
        success: false,
        error: 'Failed to complete purchase',
      });
    }

    // Transfer credit ownership
    await CreditsModel.transferOwnership(listing.credit_id, buyerId);

    // Create transaction logs for both buyer and seller
    try {
      // Buyer transaction
      await TransactionsModel.create({
        user_id: buyerId,
        type: 'purchase',
        metadata: {
          listing_id: validatedData.listing_id,
          credit_id: listing.credit_id.toString(),
          quantity: validatedData.quantity,
          price: listing.price,
          total: listing.price * validatedData.quantity,
          from_user_id: listing.seller_id.toString(),
        },
      });

      // Seller transaction
      await TransactionsModel.create({
        user_id: listing.seller_id,
        type: 'sale',
        metadata: {
          listing_id: validatedData.listing_id,
          credit_id: listing.credit_id.toString(),
          quantity: validatedData.quantity,
          price: listing.price,
          total: listing.price * validatedData.quantity,
          to_user_id: user.id,
        },
      });
    } catch (txError) {
      console.error('Transaction log error:', txError);
      // Don't fail the request if transaction log fails
    }

    return res.status(200).json({
      success: true,
      data: {
        listing_id: validatedData.listing_id,
        quantity: validatedData.quantity,
        total_price: listing.price * validatedData.quantity,
        status: 'completed',
      },
      message: 'Purchase completed successfully',
    });
  } catch (error) {
    console.error('POST /api/marketplace/purchase error:', error);

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

