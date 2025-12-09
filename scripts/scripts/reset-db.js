"use strict";
/**
 * Database Reset Script
 * This script completely wipes all data from the database collections.
 * Use with extreme caution - ALL DATA WILL BE PERMANENTLY DELETED!
 *
 * Run: npx tsx scripts/reset-db.ts [--force]
 */
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const readline_1 = require("readline");
const mongo_1 = require("../lib/db/mongo");
// Load environment variables
(0, dotenv_1.config)({ path: '.env.local' });
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
const rl = (0, readline_1.createInterface)({
    input: process.stdin,
    output: process.stdout
});
/**
 * Ask user for confirmation
 */
async function askConfirmation(question) {
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
    // Safety check for production
    if (process.env.NODE_ENV === 'production' && !forceProduction) {
        console.error('❌ ERROR: Cannot reset database in production environment!');
        console.error('   If you\'re absolutely sure, run with --force flag:');
        console.error('   npx tsx scripts/reset-db.ts --force');
        process.exit(1);
    }
    if (process.env.NODE_ENV === 'production' && forceProduction) {
        console.log('⚠️  WARNING: Running in PRODUCTION environment with --force flag!');
        console.log(`   Database: ${process.env.MONGODB_DB_NAME || 'airswap_growth'}`);
        console.log('   This will PERMANENTLY DELETE ALL DATA!');
    }
    try {
        console.log('🔌 Connecting to database...');
        const db = await (0, mongo_1.getDb)();
        console.log('✅ Connected successfully\n');
        // User confirmation
        const confirmed = await askConfirmation('⚠️  This will DELETE ALL DATA from the database. Are you sure? (y/n): ');
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
            }
            catch (error) {
                console.error(`  ❌ Error deleting from ${collectionName}:`, error);
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
    }
    catch (error) {
        console.error('\n❌ Error resetting database:', error);
        process.exit(1);
    }
    finally {
        closeInterface();
    }
}
// Handle script arguments
const args = process.argv.slice(2);
const forceProduction = args.includes('--force');
// Run the script
resetDatabase(forceProduction).catch((error) => {
    console.error('Fatal error:', error);
    closeInterface();
    process.exit(1);
});
