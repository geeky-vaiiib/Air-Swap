# MongoDB Connection Error - EREFUSED

## Issue Detected

The signup is failing with error:
```
querySrv EREFUSED _mongodb._tcp.air-swap.ygxlbue.mongodb.net
```

## Root Cause

This DNS error indicates one of the following:

1. **MongoDB Atlas cluster is paused or stopped** (most likely)
2. Network/DNS connectivity issues
3. Connection string format issues

## Solution Steps

### Step 1: Check MongoDB Atlas Cluster Status

1. Log into [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster: `air-swap`
3. Check if cluster status shows "Paused" or "Stopped"
4. If paused, click "Resume" to restart the cluster
5. Wait 2-3 minutes for cluster to become active

### Step 2: Verify Connection String

Your current connection string in `.env.local`:
```
MONGODB_URI=mongodb+srv://jonsnow280905_db_user:muggles2025@air-swap.ygxlbue.mongodb.net/?appName=Air-Swap
```

To get the correct connection string:
1. Go to MongoDB Atlas Dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with: `muggles2025`
6. Update `.env.local` with the new connection string

### Step 3: Test MongoDB Connection

Run the test script:
```bash
node scripts/test-mongodb.js
```

Expected output when working:
```
Testing MongoDB connection...
URI: Set ✓
Database: airswap

Connecting to MongoDB...
✓ Successfully connected to MongoDB
✓ Database selected: airswap

Available collections:
  - users
  - claims
  ...

✓ All tests passed!
```

### Step 4: Alternative - Use Demo Mode

If you can't access MongoDB right now, enable demo mode in `.env.local`:
```env
NEXT_PUBLIC_DEMO_MODE=true
```

This will bypass MongoDB and use mock data for development.

### Step 5: Restart Dev Server

After fixing MongoDB connection:
```bash
# Stop the dev server (Ctrl+C in terminal)
npm run dev
```

## Common MongoDB Atlas Issues

### Cluster Paused
- **Symptom**: DNS EREFUSED error
- **Solution**: Resume cluster in Atlas dashboard
- **Note**: Free tier clusters auto-pause after inactivity

### IP Whitelist
- **Symptom**: Connection timeout
- **Solution**: Add your IP to Network Access in Atlas
  - Go to Network Access → Add IP Address
  - Use "Allow Access from Anywhere" (0.0.0.0/0) for development

### Wrong Credentials
- **Symptom**: Authentication failed error
- **Solution**: Reset database user password in Atlas
  - Go to Database Access → Edit User → Change Password

### Database Name Mismatch
- **Symptom**: Collections not found
- **Solution**: Ensure `MONGODB_DB_NAME` in `.env.local` matches your Atlas database name

## Quick Fix Commands

```bash
# Test connection
node scripts/test-mongodb.js

# Check environment variables
cat .env.local | grep MONGODB

# Restart dev server
pkill -f "next dev" && npm run dev
```

## Updated .env.local Template

```env
# Demo Mode (set to true to bypass MongoDB)
NEXT_PUBLIC_DEMO_MODE=false

# MongoDB Configuration
MONGODB_URI=mongodb+srv://jonsnow280905_db_user:muggles2025@air-swap.ygxlbue.mongodb.net/?appName=Air-Swap
MONGODB_DB_NAME=airswap

# JWT Configuration  
JWT_SECRET=airswap-growth-jwt-secret-2024

# ... rest of your config
```

## Need Help?

If the issue persists:
1. Share the output of `node scripts/test-mongodb.js`
2. Verify cluster status in MongoDB Atlas
3. Check Network Access settings in Atlas
4. Try enabling demo mode as a workaround
