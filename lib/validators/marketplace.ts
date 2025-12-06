/**
 * Zod validation schemas for Marketplace API
 */

import { z } from 'zod';
import { ObjectIdSchema } from './claims';

/**
 * Schema for creating a marketplace listing
 */
export const CreateListingSchema = z.object({
  credit_id: ObjectIdSchema,
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

/**
 * Schema for purchasing from a listing
 */
export const PurchaseListingSchema = z.object({
  listing_id: ObjectIdSchema,
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

/**
 * Schema for updating a listing
 */
export const UpdateListingSchema = z.object({
  price: z.number().positive('Price must be positive').optional(),
  quantity: z.number().int().positive('Quantity must be a positive integer').optional(),
  status: z.enum(['active', 'cancelled']).optional(),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type PurchaseListingInput = z.infer<typeof PurchaseListingSchema>;
export type UpdateListingInput = z.infer<typeof UpdateListingSchema>;

