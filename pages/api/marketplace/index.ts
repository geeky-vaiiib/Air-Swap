/**
 * Marketplace API - GET and POST endpoints
 * GET: Retrieve active marketplace listings
 * POST: Create a new listing
 * 
 * Uses MongoDB for data storage
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { isDemo } from '@/lib/isDemo';
import { demoMarketplace } from '@/demo/demoMarketplace';
import { MarketplaceModel } from '@/lib/db/models/marketplace';
import { CreateListingSchema } from '@/lib/validators/marketplace';

interface MarketplaceResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketplaceResponse>
) {
  // GET: Retrieve listings
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  // POST: Create a new listing
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
 * GET /api/marketplace
 * Retrieve active marketplace listings
 */
async function handleGet(
  _req: NextApiRequest,
  res: NextApiResponse<MarketplaceResponse>
) {
  try {
    // Demo mode - return demo data
    if (isDemo()) {
      return res.status(200).json({
        success: true,
        data: demoMarketplace,
        message: 'Demo marketplace listings retrieved successfully',
      });
    }

    // Real mode - query MongoDB with aggregation
    const listings = await MarketplaceModel.findActiveWithDetails();

    // Serialize ObjectIds for JSON response
    const serializedListings = listings.map(listing => ({
      ...listing,
      _id: listing._id?.toString(),
      seller_id: listing.seller_id?.toString(),
      credit_id: listing.credit_id?.toString(),
      seller: listing.seller ? {
        ...listing.seller,
        _id: listing.seller._id?.toString(),
      } : null,
      credit: listing.credit ? {
        ...listing.credit,
        _id: listing.credit._id?.toString(),
        claim_id: listing.credit.claim_id?.toString(),
        owner_id: listing.credit.owner_id?.toString(),
      } : null,
    }));

    return res.status(200).json({
      success: true,
      data: serializedListings,
      message: 'Marketplace listings retrieved successfully',
    });
  } catch (error) {
    console.error('GET /api/marketplace error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * POST /api/marketplace
 * Create a new marketplace listing
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<MarketplaceResponse>
) {
  try {
    // Demo mode - return mock listing
    if (isDemo()) {
      const mockListing = {
        id: `LST-${Date.now()}`,
        ...req.body,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      return res.status(201).json({
        success: true,
        data: mockListing,
        message: 'Demo listing created successfully',
      });
    }

    // Authenticate user
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Please log in',
      });
    }

    // Validate request body
    const validatedData = CreateListingSchema.parse(req.body);

    // Create listing in MongoDB
    const listing = await MarketplaceModel.create({
      seller_id: new ObjectId(user.id),
      credit_id: new ObjectId(validatedData.credit_id),
      price: validatedData.price,
      quantity: validatedData.quantity,
    });

    // Serialize for JSON response
    const serializedListing = {
      ...listing,
      _id: listing._id?.toString(),
      seller_id: listing.seller_id?.toString(),
      credit_id: listing.credit_id?.toString(),
    };

    return res.status(201).json({
      success: true,
      data: serializedListing,
      message: 'Listing created successfully',
    });
  } catch (error) {
    console.error('POST /api/marketplace error:', error);

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

