/**
 * Zod validation schemas for Credits API
 */

import { z } from 'zod';

/**
 * Schema for issuing credits
 */
export const IssueCreditSchema = z.object({
  claim_id: z.string().uuid('Invalid claim ID'),
  user_id: z.string().uuid('Invalid user ID'),
  credits: z.number().int().positive('Credits must be a positive integer'),
  ndvi_delta: z.number().positive('NDVI delta must be positive'),
  metadata_cid: z.string().optional(),
});

export type IssueCreditInput = z.infer<typeof IssueCreditSchema>;

