/**
 * Zod validation schemas for Evidence API
 */

import { z } from 'zod';
import { ObjectIdSchema } from './claims';

/**
 * Schema for uploading evidence
 */
export const UploadEvidenceSchema = z.object({
  claim_id: ObjectIdSchema,
  cid: z.string().min(1, 'CID is required'),
  url: z.string().url('Invalid URL format'),
  file_type: z.string().optional(),
  file_size: z.number().int().positive().optional(),
});

export type UploadEvidenceInput = z.infer<typeof UploadEvidenceSchema>;

