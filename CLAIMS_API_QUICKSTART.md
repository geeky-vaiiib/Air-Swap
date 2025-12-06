# 🚀 Claims API - Quick Start Guide

Get the Claims API up and running in 5 minutes!

---

## Step 1: Run SQL Migration (2 minutes)

1. Open Supabase Dashboard: https://app.supabase.com
2. Select your project: `fsavledncfmbrnhtiher`
3. Go to **SQL Editor** → **New Query**
4. Copy/paste contents of `claims-table-setup.sql`
5. Click **Run** (Ctrl/Cmd + Enter)
6. ✅ Success! The `claims` table is created

---

## Step 2: Verify Environment (30 seconds)

Your `.env.local` is already configured:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://fsavledncfmbrnhtiher.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

✅ No changes needed!

---

## Step 3: Start Development Server (30 seconds)

```bash
npm run dev
```

Server starts at: http://localhost:3000

---

## Step 4: Test Claims API (2 minutes)

### Test 1: GET All Claims (Demo Mode)

```bash
curl http://localhost:3000/api/claims
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "CLM-001",
      "location": "Amazon Rainforest, Brazil",
      "status": "verified",
      "creditsEarned": 450,
      ...
    }
  ],
  "message": "Demo claims retrieved successfully"
}
```

### Test 2: Create a Claim

```bash
curl -X POST http://localhost:3000/api/claims \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "location": "Test Forest, USA",
    "polygon": {"type": "Polygon", "coordinates": [[[0,0],[1,0],[1,1],[0,1],[0,0]]]},
    "ndvi_delta": 12.5,
    "area": 100
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "CLM-...",
    "location": "Test Forest, USA",
    "status": "pending",
    ...
  },
  "message": "Demo claim created successfully"
}
```

### Test 3: Verify a Claim (Demo Mode)

```bash
curl -X PATCH http://localhost:3000/api/claims/CLM-001/verify \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "credits": 500
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "CLM-001",
    "status": "verified",
    "creditsEarned": 500,
    ...
  },
  "message": "Demo claim approved successfully"
}
```

---

## Step 5: Test with Real Database (1 minute)

### Switch to Real Mode

```env
# .env.local
NEXT_PUBLIC_DEMO_MODE=false
```

Restart server: `npm run dev`

### Create Real Claim

```bash
curl -X POST http://localhost:3000/api/claims \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID_FROM_SUPABASE",
    "location": "Real Forest, Brazil",
    "polygon": {"type": "Polygon", "coordinates": [[[0,0],[1,0],[1,1],[0,1],[0,0]]]},
    "ndvi_delta": 15.3,
    "area": 150
  }'
```

### Verify in Supabase

1. Go to Supabase Dashboard → **Table Editor** → `claims`
2. ✅ See your new claim row

---

## 🎉 Done!

The Claims API is now fully functional!

### What You Can Do Now:

✅ GET claims with filters (`?userId=...&status=pending`)  
✅ POST new claims  
✅ PATCH verify/reject claims (as verifier)  
✅ Toggle demo mode on/off  
✅ Full Supabase integration  

---

## 📚 Next Steps

### Test All Features
Follow the comprehensive guide: `CLAIMS_API_TESTING.md`

### Integrate with Frontend
```typescript
// Fetch claims
const response = await fetch('/api/claims?userId=USER_ID');
const { success, data } = await response.json();

// Create claim
const response = await fetch('/api/claims', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(claimData),
});

// Verify claim (as verifier)
const response = await fetch(`/api/claims/${claimId}/verify`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ approved: true, credits: 500 }),
});
```

### Learn More
- Full documentation: `CLAIMS_API_SUMMARY.md`
- Testing guide: `CLAIMS_API_TESTING.md`

---

## 🔧 Troubleshooting

### "Failed to retrieve claims"
→ Run SQL migration in Supabase

### "Invalid user ID"
→ Use a valid UUID format

### "Forbidden - Only verifiers can verify"
→ User must have `role: "verifier"` in profiles table

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/claims` | Get all claims (with filters) |
| POST | `/api/claims` | Create new claim |
| PATCH | `/api/claims/[id]/verify` | Verify/reject claim |

---

## ✨ Features

- ✅ Full CRUD operations
- ✅ Role-based access control
- ✅ Supabase integration
- ✅ Demo mode support
- ✅ Zod validation
- ✅ Proper error handling

**Happy coding! 🚀**

