# 🌱 NDVI Integration with OxygenCredits Contract

## Overview
This guide shows how to integrate NDVI (Normalized Difference Vegetation Index) verification with automatic blockchain credit minting.

---

## 📊 Integration Flow

```
User Submits Claim
    ↓
NDVI Analysis (Sentinel/NASA API)
    ↓
Calculate NDVI Improvement
    ↓
Verification Passed?
    ↓ YES
Mint Oxygen Credits on Blockchain
    ↓
Update MongoDB with Blockchain Data
    ↓
Notify User
```

---

## 🔧 Step-by-Step Integration

### Step 1: Update Claim API to Include NDVI Data

**Location:** `pages/api/claims/submit.ts`

```typescript
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = verifyToken(token);
    
    const db = await connectDB();
    
    // Create claim with geometry and NDVI parameters
    const claim = {
      userId: decoded.userId,
      walletAddress: req.body.walletAddress, // Add wallet address to claim
      geometry: req.body.geometry, // GeoJSON polygon
      location: req.body.location,
      beforeDate: req.body.beforeDate, // Date range for NDVI analysis
      afterDate: req.body.afterDate,
      status: 'pending',
      verification: null,
      blockchain: null, // Will store blockchain data after minting
      createdAt: new Date()
    };
    
    const result = await db.collection('claims').insertOne(claim);
    
    res.json({ 
      success: true, 
      claimId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ error: 'Failed to create claim' });
  }
}
```

---

### Step 2: Create NDVI Verification API

**Location:** `pages/api/claims/verify-ndvi.ts`

```typescript
import { connectDB } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { serverMintOxygenCredits } from '@/lib/blockchain/server/oxygenCreditsServer';

// NDVI Analysis Function (simplified - use real satellite API)
async function analyzeNDVI(geometry, beforeDate, afterDate) {
  // TODO: Replace with actual Sentinel/NASA API calls
  // This is a simplified example
  
  // Example: Call Sentinel Hub API or Google Earth Engine
  const beforeNDVI = await getSatelliteNDVI(geometry, beforeDate);
  const afterNDVI = await getSatelliteNDVI(geometry, afterDate);
  
  const improvement = afterNDVI - beforeNDVI;
  const improvementPercentage = (improvement / beforeNDVI) * 100;
  
  return {
    beforeNDVI,
    afterNDVI,
    improvement,
    improvementPercentage,
    passed: improvement > 0.1 // Pass if NDVI improved by more than 0.1
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { claimId } = req.body;
    
    const db = await connectDB();
    const claim = await db.collection('claims').findOne({ 
      _id: new ObjectId(claimId) 
    });
    
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    
    // Step 1: Analyze NDVI
    console.log('📊 Analyzing NDVI for claim:', claimId);
    const ndviResult = await analyzeNDVI(
      claim.geometry,
      claim.beforeDate,
      claim.afterDate
    );
    
    // Step 2: Update claim with verification results
    await db.collection('claims').updateOne(
      { _id: new ObjectId(claimId) },
      {
        $set: {
          verification: {
            beforeNDVI: ndviResult.beforeNDVI,
            afterNDVI: ndviResult.afterNDVI,
            improvement: ndviResult.improvement,
            improvementPercentage: ndviResult.improvementPercentage,
            passed: ndviResult.passed,
            verifiedAt: new Date(),
            verifier: 'system'
          },
          status: ndviResult.passed ? 'verified' : 'rejected'
        }
      }
    );
    
    // Step 3: If verification passed, mint credits on blockchain
    if (ndviResult.passed) {
      console.log('✅ NDVI verification passed, minting credits...');
      
      // Calculate credits (100 credits per 1.0 NDVI improvement)
      const creditsToMint = Math.floor(ndviResult.improvement * 100);
      
      if (creditsToMint > 0) {
        // Prepare location data as GeoJSON string
        const locationData = JSON.stringify({
          type: "Feature",
          geometry: claim.geometry,
          properties: {
            address: claim.location?.address,
            city: claim.location?.city,
            state: claim.location?.state
          }
        });
        
        // Mint credits on blockchain
        const mintResult = await serverMintOxygenCredits({
          recipientAddress: claim.walletAddress,
          amount: creditsToMint,
          ndviDelta: Math.floor(ndviResult.improvement * 1000), // Scale by 1000
          claimId: claimId,
          location: locationData,
          verificationData: {
            beforeNDVI: ndviResult.beforeNDVI,
            afterNDVI: ndviResult.afterNDVI,
            improvementPercentage: ndviResult.improvementPercentage,
            verifiedAt: new Date().toISOString(),
            verifier: 'system'
          }
        });
        
        if (mintResult.success) {
          console.log('🎉 Credits minted successfully!');
          console.log('   Token ID:', mintResult.tokenId);
          console.log('   TX Hash:', mintResult.transactionHash);
          
          // Step 4: Update MongoDB with blockchain data
          await db.collection('claims').updateOne(
            { _id: new ObjectId(claimId) },
            {
              $set: {
                blockchain: {
                  tokenId: mintResult.tokenId,
                  transactionHash: mintResult.transactionHash,
                  contractAddress: process.env.NEXT_PUBLIC_OXYGEN_CREDITS_CONTRACT,
                  creditsAmount: creditsToMint,
                  mintedAt: new Date(),
                  blockExplorerUrl: `https://amoy.polygonscan.com/tx/${mintResult.transactionHash}`
                }
              }
            }
          );
          
          return res.json({
            success: true,
            verification: ndviResult,
            blockchain: {
              tokenId: mintResult.tokenId,
              transactionHash: mintResult.transactionHash,
              creditsAmount: creditsToMint
            }
          });
        } else {
          console.error('❌ Failed to mint credits:', mintResult.error);
          
          return res.json({
            success: true,
            verification: ndviResult,
            blockchain: {
              error: mintResult.error,
              message: 'Verification passed but blockchain minting failed'
            }
          });
        }
      }
    }
    
    res.json({
      success: true,
      verification: ndviResult,
      blockchain: null
    });
    
  } catch (error) {
    console.error('Error verifying claim:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}

// Helper function to get NDVI from satellite data
async function getSatelliteNDVI(geometry, date) {
  // TODO: Implement actual satellite API integration
  // Options:
  // 1. Sentinel Hub API: https://www.sentinel-hub.com/
  // 2. Google Earth Engine: https://earthengine.google.com/
  // 3. NASA MODIS: https://modis.gsfc.nasa.gov/
  
  // For now, return mock data
  // In production, this should make API calls to satellite services
  
  // Example using Sentinel Hub (pseudo-code):
  /*
  const response = await fetch('https://services.sentinel-hub.com/api/v1/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SENTINEL_HUB_TOKEN}`
    },
    body: JSON.stringify({
      input: {
        bounds: {
          geometry: geometry
        },
        data: [{
          type: 'sentinel-2-l2a',
          dataFilter: {
            timeRange: {
              from: date,
              to: date
            }
          }
        }]
      },
      evalscript: `
        // Calculate NDVI from NIR and RED bands
        return [(B08 - B04) / (B08 + B04)];
      `
    })
  });
  */
  
  // Mock NDVI value for testing
  return 0.65 + Math.random() * 0.2; // Returns value between 0.65 and 0.85
}
```

---

### Step 3: Update MongoDB Claims Schema

Add these fields to your claims collection:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  walletAddress: String, // User's wallet address for receiving credits
  geometry: {
    type: "Polygon",
    coordinates: [[[lng, lat], ...]]
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String
  },
  beforeDate: Date,
  afterDate: Date,
  status: String, // 'pending', 'verified', 'rejected'
  verification: {
    beforeNDVI: Number,
    afterNDVI: Number,
    improvement: Number,
    improvementPercentage: Number,
    passed: Boolean,
    verifiedAt: Date,
    verifier: String
  },
  blockchain: {
    tokenId: String,
    transactionHash: String,
    contractAddress: String,
    creditsAmount: Number,
    mintedAt: Date,
    blockExplorerUrl: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

### Step 4: Update Frontend to Show Blockchain Status

**Location:** `components/dashboard/ClaimCard.tsx`

```typescript
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Leaf, CheckCircle } from 'lucide-react';

export default function ClaimCard({ claim }) {
  const [verifying, setVerifying] = useState(false);
  
  const handleVerify = async () => {
    setVerifying(true);
    try {
      const response = await fetch('/api/claims/verify-ndvi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: claim._id })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Verification complete! Credits minted on blockchain.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{claim.location?.address}</h3>
          <p className="text-sm text-gray-600">
            {claim.location?.city}, {claim.location?.state}
          </p>
        </div>
        <Badge variant={
          claim.status === 'verified' ? 'success' : 
          claim.status === 'rejected' ? 'destructive' : 
          'default'
        }>
          {claim.status}
        </Badge>
      </div>
      
      {/* NDVI Results */}
      {claim.verification && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="font-medium">NDVI Analysis</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Before NDVI</p>
              <p className="font-semibold">{claim.verification.beforeNDVI.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-gray-600">After NDVI</p>
              <p className="font-semibold">{claim.verification.afterNDVI.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-gray-600">Improvement</p>
              <p className="font-semibold text-green-600">
                +{claim.verification.improvement.toFixed(3)} 
                ({claim.verification.improvementPercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Blockchain Status */}
      {claim.blockchain && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Blockchain Credits</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Credits Minted:</span>
              <span className="font-semibold">{claim.blockchain.creditsAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token ID:</span>
              <span className="font-mono text-xs">{claim.blockchain.tokenId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transaction:</span>
              <a 
                href={claim.blockchain.blockExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      {claim.status === 'pending' && (
        <Button 
          className="mt-4 w-full" 
          onClick={handleVerify}
          disabled={verifying}
        >
          {verifying ? 'Verifying...' : 'Verify & Mint Credits'}
        </Button>
      )}
    </Card>
  );
}
```

---

## 🛠️ Satellite API Integration Options

### Option 1: Sentinel Hub (Recommended)

```bash
# Sign up at: https://www.sentinel-hub.com/
npm install @sentinel-hub/sentinelhub-js
```

```typescript
import { SHApiV3, BBox, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';

async function getSentinelNDVI(geometry, date) {
  const api = new SHApiV3({
    authToken: process.env.SENTINEL_HUB_TOKEN
  });
  
  const bbox = new BBox(CRS_EPSG4326, ...getBBoxFromGeometry(geometry));
  
  const response = await api.processImage({
    bbox,
    timeRange: { from: date, to: date },
    evalscript: `
      //VERSION=3
      function setup() {
        return {
          input: ["B04", "B08"],
          output: { bands: 1 }
        };
      }
      function evaluatePixel(sample) {
        let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
        return [ndvi];
      }
    `
  });
  
  // Calculate average NDVI from response
  return calculateAverageNDVI(response.data);
}
```

### Option 2: Google Earth Engine

```typescript
// Requires Google Earth Engine API setup
// Documentation: https://developers.google.com/earth-engine
```

### Option 3: NASA MODIS

```typescript
// NASA API: https://modis.gsfc.nasa.gov/data/dataprod/mod13.php
```

---

## 📊 Credit Calculation Formula

```typescript
// Calculate credits based on NDVI improvement
function calculateCredits(ndviImprovement, areaInHectares) {
  // Base: 100 credits per 1.0 NDVI improvement
  const baseCredits = ndviImprovement * 100;
  
  // Multiply by area (optional)
  const totalCredits = baseCredits * areaInHectares;
  
  // Round down to whole credits
  return Math.floor(totalCredits);
}

// Example:
// NDVI improvement: 0.15 (from 0.65 to 0.80)
// Area: 1 hectare
// Credits: 0.15 * 100 * 1 = 15 credits
```

---

## 🧪 Testing the Integration

### Test with Mock Data (Development)

```bash
# 1. Create a test claim
curl -X POST http://localhost:3000/api/claims/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x590e1a671d353e9c5c6dd285975cf2a45ac5c742",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[-73.935, 40.730], ...]]
    },
    "location": {
      "address": "123 Green St",
      "city": "New York",
      "state": "NY"
    },
    "beforeDate": "2024-01-01",
    "afterDate": "2024-06-01"
  }'

# 2. Verify and mint credits
curl -X POST http://localhost:3000/api/claims/verify-ndvi \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": "YOUR_CLAIM_ID"
  }'
```

---

## 📈 Dashboard Integration

Add NDVI metrics to your dashboard:

```typescript
// pages/dashboard/index.tsx
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);
  
  return (
    <div className="grid grid-cols-3 gap-6">
      <StatCard 
        title="Total Credits Minted"
        value={stats?.totalCredits}
        icon="🌱"
      />
      <StatCard 
        title="Average NDVI Improvement"
        value={`+${stats?.avgNDVI?.toFixed(3)}`}
        icon="📈"
      />
      <StatCard 
        title="Verified Claims"
        value={stats?.verifiedClaims}
        icon="✅"
      />
    </div>
  );
}
```

---

## 🔒 Security Considerations

1. **Validate Wallet Addresses**: Ensure user wallet addresses are valid before minting
2. **Rate Limiting**: Prevent spam verification requests
3. **NDVI Thresholds**: Set minimum improvement thresholds
4. **Admin Review**: Option for manual review of high-value claims
5. **Blockchain Retries**: Implement retry logic for failed minting

---

## ✅ Implementation Checklist

- [ ] Update claims API to include wallet address
- [ ] Integrate satellite NDVI API (Sentinel/NASA)
- [ ] Create NDVI verification endpoint
- [ ] Update MongoDB schema
- [ ] Update frontend to show blockchain status
- [ ] Test with mock data
- [ ] Test with real satellite data
- [ ] Deploy to production

---

**Need help with any specific part?** Let me know which satellite API you want to use or if you need help with any integration step!
