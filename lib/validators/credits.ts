/**
 * Zod validation schemas for Credits API
 * Updated for MongoDB (uses ObjectId string format)
 */

import { z } from 'zod';
import { ObjectIdSchema } from './claims';

/**
 * Schema for issuing credits
 */
export const IssueCreditSchema = z.object({
  claim_id: ObjectIdSchema,
  user_id: ObjectIdSchema,
  credits: z.number().int().positive('Credits must be a positive integer'),
  ndvi_delta: z.number().positive('NDVI delta must be positive').optional(),
  metadata_cid: z.string().optional(),
});

/**
 * Schema for transferring credits
 */
export const TransferCreditSchema = z.object({
  credit_id: ObjectIdSchema,
  to_user_id: ObjectIdSchema,
  amount: z.number().int().positive('Amount must be a positive integer'),
});

export type IssueCreditInput = z.infer<typeof IssueCreditSchema>;
export type TransferCreditInput = z.infer<typeof TransferCreditSchema>;

