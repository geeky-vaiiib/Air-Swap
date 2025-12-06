/**
 * Zod validation schemas for Claims API
 */

import { z } from 'zod';

/**
 * Schema for creating a new claim
 */
export const ClaimInputSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  location: z.string().min(1, 'Location is required'),
  polygon: z.any(), // GeoJSON polygon - basic validation
  evidence_cids: z.array(z.string()).optional(),
  ndvi_before: z.any().optional(),
  ndvi_after: z.any().optional(),
  ndvi_delta: z.number().optional(),
  area: z.number()
    .positive('Area must be positive')
    .min(1, 'Area must be at least 1 sqm')
    .max(10000000, 'Area must be less than 10,000,000 sqm')
    .optional(),
});

/**
 * Schema for verifying a claim
 */
export const VerifyInputSchema = z.object({
  approved: z.boolean(),
  credits: z.number().int().positive().optional(),
  comment: z.string().optional(),
});

export type ClaimInput = z.infer<typeof ClaimInputSchema>;
export type VerifyInput = z.infer<typeof VerifyInputSchema>;

