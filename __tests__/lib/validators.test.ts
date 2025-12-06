/**
 * Validator Tests
 */

import { ClaimInputSchema, VerifyInputSchema, ObjectIdSchema } from '@/lib/validators/claims';
import { LoginSchema, SignupSchema } from '@/lib/validators/auth';
import { IssueCreditSchema } from '@/lib/validators/credits';

describe('Validators', () => {
  describe('ObjectIdSchema', () => {
    it('should accept valid ObjectId', () => {
      const validId = '507f1f77bcf86cd799439011';
      expect(() => ObjectIdSchema.parse(validId)).not.toThrow();
    });

    it('should reject invalid ObjectId', () => {
      expect(() => ObjectIdSchema.parse('invalid')).toThrow();
      expect(() => ObjectIdSchema.parse('123')).toThrow();
      expect(() => ObjectIdSchema.parse('')).toThrow();
    });
  });

  describe('LoginSchema', () => {
    it('should accept valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => LoginSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'notanemail',
        password: 'password123',
      };
      expect(() => LoginSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };
      expect(() => LoginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('SignupSchema', () => {
    it('should accept valid signup data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        role: 'contributor',
      };
      expect(() => SignupSchema.parse(validData)).not.toThrow();
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345', // Too short
        full_name: 'Test User',
        role: 'contributor',
      };
      expect(() => SignupSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        role: 'admin', // Invalid role
      };
      expect(() => SignupSchema.parse(invalidData)).toThrow();
    });
  });

  describe('ClaimInputSchema', () => {
    it('should accept valid claim data', () => {
      const validData = {
        user_id: '507f1f77bcf86cd799439011',
        location: 'Test Location',
        polygon: { type: 'Polygon', coordinates: [] },
        area: 100,
      };
      expect(() => ClaimInputSchema.parse(validData)).not.toThrow();
    });

    it('should reject area that is too large', () => {
      const invalidData = {
        user_id: '507f1f77bcf86cd799439011',
        location: 'Test Location',
        polygon: { type: 'Polygon', coordinates: [] },
        area: 999999999, // Too large
      };
      expect(() => ClaimInputSchema.parse(invalidData)).toThrow();
    });
  });

  describe('VerifyInputSchema', () => {
    it('should accept valid verify data', () => {
      const validData = {
        approved: true,
        credits: 100,
        comment: 'Looks good',
      };
      expect(() => VerifyInputSchema.parse(validData)).not.toThrow();
    });

    it('should accept rejection without credits', () => {
      const validData = {
        approved: false,
        comment: 'Not valid',
      };
      expect(() => VerifyInputSchema.parse(validData)).not.toThrow();
    });
  });
});

