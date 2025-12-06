/**
 * Test Google Earth Engine Connection
 * 
 * Run this to verify your GEE setup is correct
 */

import { testConnection, getImageCount } from '../lib/services/earthEngineNDVI';

async function testGEE() {
  console.log('🧪 Testing Google Earth Engine Connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic Authentication');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Connection failed');
      console.log('\n📝 Setup Instructions:');
      console.log('   1. Follow GEE_SETUP_GUIDE.md');
      console.log('   2. Create service account at https://console.cloud.google.com/');
      console.log('   3. Download JSON key and save to credentials/gee-service-account.json');
      console.log('   4. Update .env.local with service account email');
      process.exit(1);
    }
    
    console.log('✅ Connected successfully!\n');
    
    // Test 2: Query image availability
    console.log('Test 2: Query Sentinel-2 Images');
    
    // Test geometry (Central Park, NYC)
    const testGeometry = {
      type: 'Polygon',
      coordinates: [[
        [-73.9812, 40.7829],
        [-73.9581, 40.7829],
        [-73.9581, 40.7644],
        [-73.9812, 40.7644],
        [-73.9812, 40.7829]
      ]]
    };
    
    const imageCount = await getImageCount(
      testGeometry,
      '2024-06-01',
      '2024-06-30'
    );
    
    console.log(`   Found ${imageCount} Sentinel-2 images for test region (June 2024)`);
    
    if (imageCount === 0) {
      console.warn('⚠️  No images found - this might indicate an issue');
    } else {
      console.log('✅ Image query successful!\n');
    }
    
    console.log('🎉 All tests passed!');
    console.log('\n📊 Ready to analyze NDVI for real claims');
    console.log('   Next: Test with a real claim using /api/claims/verify-ndvi');
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n📝 Troubleshooting:');
    console.log('   - Check GEE_SERVICE_ACCOUNT_EMAIL in .env.local');
    console.log('   - Check GEE_PRIVATE_KEY_PATH points to correct JSON file');
    console.log('   - Ensure service account is registered at https://code.earthengine.google.com/');
    console.log('   - Verify Earth Engine API is enabled in Google Cloud Console');
    console.log('\nFor detailed setup: See GEE_SETUP_GUIDE.md');
    process.exit(1);
  }
}

testGEE();
