# Google Earth Engine Integration Setup Guide

## Prerequisites

### 1. Sign up for Google Earth Engine
1. Visit: https://earthengine.google.com/signup/
2. Fill out the application form
3. Wait for approval (usually 1-2 days)
4. Once approved, you'll get access to the Earth Engine Code Editor

### 2. Create a Service Account

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Earth Engine API:
   - Go to "APIs & Services" > "Library"
   - Search for "Earth Engine API"
   - Click "Enable"

4. Create Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name: `airswap-earth-engine`
   - Click "Create and Continue"
   - Grant role: "Earth Engine Resource Writer"
   - Click "Done"

5. Create Private Key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Click "Create"
   - **Save the JSON file securely** (this is your private key)

6. Register the Service Account with Earth Engine:
   - Go to: https://code.earthengine.google.com/
   - Click "Assets" tab
   - Click "NEW" > "Service Account"
   - Enter your service account email (from the JSON file)
   - Format: `airswap-earth-engine@your-project.iam.gserviceaccount.com`

---

## Configuration

### 1. Store Service Account Key

```bash
# Create credentials directory (don't commit this!)
mkdir -p /Users/vaibhavjp/Documents/airswap-growth/credentials

# Move your downloaded JSON key file here
mv ~/Downloads/your-project-xxxxx.json /Users/vaibhavjp/Documents/airswap-growth/credentials/gee-service-account.json

# Add to .gitignore
echo "credentials/" >> .gitignore
```

### 2. Update .env.local

Add these variables to your `.env.local`:

```bash
# Google Earth Engine
GEE_SERVICE_ACCOUNT_EMAIL=airswap-earth-engine@your-project.iam.gserviceaccount.com
GEE_PRIVATE_KEY_PATH=./credentials/gee-service-account.json
GEE_PROJECT_ID=your-project-id
```

---

## Testing Connection

Run this test to verify your setup:

```bash
npx ts-node scripts/test-gee-connection.ts
```

If successful, you'll see:
```
✅ Google Earth Engine authenticated successfully!
📡 Available Sentinel-2 images: XXX
```

---

## Usage

The Earth Engine NDVI service is now integrated in:
- `lib/services/earthEngineNDVI.ts` - Main NDVI analysis service
- `pages/api/claims/verify-ndvi.ts` - Already updated to use real GEE data

---

## Troubleshooting

### Issue: "User not registered"
**Solution**: Make sure you registered your service account at https://code.earthengine.google.com/

### Issue: "Permission denied"
**Solution**: Check that Earth Engine API is enabled in your Google Cloud project

### Issue: "No private key found"
**Solution**: Verify the path to your JSON key file in `.env.local`

---

## Rate Limits

**Free Tier:**
- 10,000 requests per day
- 250 requests per minute
- Sufficient for testing and small-scale production

**Production:**
- Consider caching NDVI results in MongoDB
- Implement request batching
- Monitor usage in Google Cloud Console

---

## Next Steps

1. Complete GEE signup and service account setup
2. Update `.env.local` with your credentials
3. Test connection: `npx ts-node scripts/test-gee-connection.ts`
4. Test NDVI analysis with a real claim
5. Deploy to production

---

**Need help?** Check the troubleshooting section or Google Earth Engine documentation: https://developers.google.com/earth-engine
