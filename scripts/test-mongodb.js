/**
 * Test MongoDB Connection
 * Run: node scripts/test-mongodb.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'airswap_growth';

console.log('Testing MongoDB connection...');
console.log('URI:', MONGODB_URI ? 'Set ✓' : 'Not set ✗');
console.log('Database:', MONGODB_DB_NAME);

async function testConnection() {
  let client;
  try {
    console.log('\nConnecting to MongoDB...');
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    console.log('✓ Successfully connected to MongoDB');

    const db = client.db(MONGODB_DB_NAME);
    console.log('✓ Database selected:', db.databaseName);

    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => {
      console.log('  -', col.name);
    });

    // Test users collection
    console.log('\nTesting users collection...');
    const usersCount = await db.collection('users').countDocuments();
    console.log('  Users count:', usersCount);

    // Test claims collection
    console.log('\nTesting claims collection...');
    const claimsCount = await db.collection('claims').countDocuments();
    console.log('  Claims count:', claimsCount);

    console.log('\n✓ All tests passed!');
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nConnection closed.');
    }
  }
}

testConnection();
