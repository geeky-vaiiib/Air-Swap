/**
 * Jest Setup File
 */

// Set test environment variables
process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017';
process.env.MONGODB_DB_NAME = 'airswap_test';

// Extend expect with testing-library matchers
require('@testing-library/jest-dom');

