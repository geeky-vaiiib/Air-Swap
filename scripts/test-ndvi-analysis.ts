/**
 * Test NDVI Analysis with Google Earth Engine
 * 
 * This script demonstrates how to analyze NDVI for a real location
 */

import { analyzeNDVI } from '../lib/services/earthEngineNDVI';

async function testNDVIAnalysis() {
  console.log('🌱 Testing NDVI Analysis with Google Earth Engine\n');
  
  try {
    // Test Case: Central Park, New York City
    // Known to have consistent vegetation
    const testGeometry = {
      type: 'Polygon',
      coordinates: [[
        [-73.9812, 40.7829],  // Northwest corner
        [-73.9581, 40.7829],  // Northeast corner
        [-73.9581, 40.7644],  // Southeast corner
        [-73.9812, 40.7644],  // Southwest corner
        [-73.9812, 40.7829]   // Close polygon
      ]]
    };
    
    console.log('📍 Test Location: Central Park, NYC');
    console.log('   Coordinates:', testGeometry.coordinates[0][0]);
    console.log('');
    
    // Analyze vegetation change from winter to summer 2024
    console.log('📅 Analyzing seasonal change:');
    console.log('   Before: January 2024 (winter)');
    console.log('   After: June 2024 (summer)');
    console.log('');
    
    console.log('⏳ Fetching satellite imagery (this may take 10-30 seconds)...\n');
    
    const result = await analyzeNDVI(
      testGeometry,
      '2024-01-15',  // Winter (lower vegetation)
      '2024-06-15'   // Summer (higher vegetation)
    );
    
    console.log('📊 Results:');
    console.log('═══════════════════════════════════════════════');
    console.log(`   Before NDVI (Winter):  ${result.beforeNDVI}`);
    console.log(`   After NDVI (Summer):   ${result.afterNDVI}`);
    console.log(`   Improvement:           ${result.improvement > 0 ? '+' : ''}${result.improvement}`);
    console.log(`   Improvement %:         ${result.improvementPercentage > 0 ? '+' : ''}${result.improvementPercentage}%`);
    console.log(`   Status:                ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('───────────────────────────────────────────────');
    console.log(`   Images analyzed:       Before=${result.imageCount.before}, After=${result.imageCount.after}`);
    console.log(`   Average cloud cover:   Before=${result.cloudCover.before}%, After=${result.cloudCover.after}%`);
    console.log('═══════════════════════════════════════════════\n');
    
    if (result.passed) {
      const credits = Math.floor(result.improvement * 100);
      console.log('💰 Credits to mint:', credits);
      console.log('   Formula: NDVI improvement × 100');
      console.log(`   Calculation: ${result.improvement} × 100 = ${credits} credits\n`);
    }
    
    console.log('✅ NDVI analysis completed successfully!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Create a claim in your database with this geometry');
    console.log('   2. Call /api/claims/verify-ndvi with the claim ID');
    console.log('   3. Credits will be automatically minted on blockchain');
    
  } catch (error: any) {
    console.error('\n❌ NDVI analysis failed:', error.message);
    
    if (error.message.includes('not configured')) {
      console.log('\n📝 Setup Required:');
      console.log('   1. Complete Google Earth Engine setup (see GEE_SETUP_GUIDE.md)');
      console.log('   2. Run: npx ts-node scripts/test-gee-connection.ts');
      console.log('   3. Try this script again');
    } else if (error.message.includes('No clear')) {
      console.log('\n💡 Tip: Try different dates or locations');
      console.log('   - Choose dates with less cloud cover');
      console.log('   - Ensure dates are not too recent (satellite processing delay)');
      console.log('   - Try a larger area for better image availability');
    } else {
      console.log('\n📝 Troubleshooting:');
      console.log('   - Verify GEE credentials in .env.local');
      console.log('   - Check internet connection');
      console.log('   - Ensure dates are valid (YYYY-MM-DD)');
      console.log('   - Try running: npx ts-node scripts/test-gee-connection.ts');
    }
    
    process.exit(1);
  }
}

testNDVIAnalysis();
