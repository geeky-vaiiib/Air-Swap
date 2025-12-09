/**
 * Database Reset Script
 * This script completely wipes all data from the database collections.
 * Use with extreme caution - ALL DATA WILL BE PERMANENTLY DELETED!
 *
 * Run: node scripts/reset-db.js [--force]
 */

const { MongoClient } = require('mongodb');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'airswap_growth';

// Collections to reset
const COLLECTIONS = [
  'users',
  'claims',
  'credits',
  'evidence',
  'marketplace_listings',
  'transactions',
  'verifier_logs'
];

// Create readline interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ask user for confirmation
 */
function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      const isYes = answer.toLowerCase().startsWith('y');
      resolve(isYes);
    });
  });
}

/**
 * Close readline interface
 */
function closeInterface() {
  rl.close();
}

/**
 * Main reset function
 */
async function resetDatabase(forceProduction = false) {
  console.log('🗑️  Database Reset Script');
  console.log('========================\n');

  // Environment checks
  if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI environment variable not found!');
    process.exit(1);
  }

  // Safety check for production
  if (process.env.NODE_ENV === 'production' && !forceProduction) {
    console.error('❌ ERROR: Cannot reset database in production environment!');
    console.error('   If you\'re absolutely sure, run with --force flag:');
    console.error('   node scripts/reset-db.js --force');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && forceProduction) {
    console.log('⚠️  WARNING: Running in PRODUCTION environment with --force flag!');
    console.log(`   Database: ${MONGODB_DB_NAME}`);
    console.log('   MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    console.log('   This will PERMANENTLY DELETE ALL DATA!');
  }

  let client;

  try {
    console.log('🔌 Connecting to database...');

    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    console.log('✅ Connected successfully');
    console.log(`   Database: ${db.databaseName}\n`);

    // User confirmation
    const confirmed = await askConfirmation(
      '⚠️  This will DELETE ALL DATA from the database. Are you sure? (y/n): '
    );

    if (!confirmed) {
      console.log('❌ Operation cancelled by user.');
      return;
    }

    console.log('\n🚨 Starting database wipe...\n');

    // Reset each collection
    const results = {};

    for (const collectionName of COLLECTIONS) {
      try {
        console.log(`Deleting from ${collectionName}...`);
        const collection = db.collection(collectionName);

        const result = await collection.deleteMany({});
        const deletedCount = result.deletedCount || 0;

        results[collectionName] = deletedCount;
        console.log(`  ✅ Deleted ${deletedCount} documents from ${collectionName}`);

      } catch (error) {
        console.error(`  ❌ Error deleting from ${collectionName}:`, error.message);
        throw error;
      }
    }

    // Summary
    console.log('\n📊 Reset Summary:');
    console.log('================');
    let totalDeleted = 0;

    for (const [collection, count] of Object.entries(results)) {
      console.log(`  ${collection}: ${count} documents deleted`);
      totalDeleted += count;
    }

    console.log(`\n💥 Total: ${totalDeleted} documents deleted from ${COLLECTIONS.length} collections`);
    console.log('\n✅ Database reset completed successfully!');
    console.log('\n📝 Note: Database indexes and structure preserved.');

  } catch (error) {
    console.error('\n❌ Error resetting database:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Database connection closed.');
    }
    closeInterface();
  }
}

// Handle script arguments
const args = process.argv.slice(2);
const forceProduction = args.includes('--force');

// Run the script
resetDatabase(forceProduction).catch((error) => {
  console.error('❌ Fatal error:', error.message);
  closeInterface();
  process.exit(1);
});
