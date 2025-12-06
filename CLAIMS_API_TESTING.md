# Claims API Testing Guide

Complete testing guide for the Claims API endpoints.

---

## Prerequisites

1. ✅ Run `claims-table-setup.sql` in Supabase SQL Editor
2. ✅ Have authentication set up (users with different roles)
3. ✅ Dev server running: `npm run dev`

---

## API Endpoints

### 1. GET /api/claims
Retrieve claims with optional filters.

### 2. POST /api/claims
Create a new claim.

### 3. PATCH /api/claims/[id]/verify
Verify or reject a claim (verifiers only).

---

## Test Cases

### Test 1: GET All Claims (Demo Mode)

**Setup:**
```env
# .env.local
NEXT_PUBLIC_DEMO_MODE=true
```

**Request:**
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
      "area": "125 hectares",
      "status": "verified",
      "creditsEarned": 450,
      "credits": 450,
      "date": "2024-11-15",
      "ndviDelta": 14.2
    },
    ...
  ],
  "message": "Demo claims retrieved successfully"
}
```

---

### Test 2: GET Claims with Status Filter (Demo Mode)

**Request:**
```bash
curl "http://localhost:3000/api/claims?status=pending"
```

**Expected:**
- Only claims with `status: "pending"` returned
- Success response with filtered data

---

### Test 3: POST Create Claim (Demo Mode)

**Request:**
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
    "id": "CLM-1733...",
    "location": "Test Forest, USA",
    "area": "100 hectares",
    "status": "pending",
    "creditsEarned": 0,
    "date": "2024-12-06",
    "ndviDelta": 12.5
  },
  "message": "Demo claim created successfully"
}
```

---

### Test 4: POST Create Claim - Validation Error

**Request:**
```bash
curl -X POST http://localhost:3000/api/claims \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "invalid-uuid",
    "location": ""
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

---

### Test 5: PATCH Verify Claim - Approve (Demo Mode)

**Request:**
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
    "credits": 500,
    ...
  },
  "message": "Demo claim approved successfully"
}
```

---

### Test 6: PATCH Verify Claim - Reject (Demo Mode)

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/claims/CLM-002/verify \
  -H "Content-Type: application/json" \
  -d '{
    "approved": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "CLM-002",
    "status": "rejected",
    "creditsEarned": 0,
    ...
  },
  "message": "Demo claim rejected successfully"
}
```

---

### Test 7: GET Claims (Real Mode - Supabase)

**Setup:**
```env
# .env.local
NEXT_PUBLIC_DEMO_MODE=false
```

**Prerequisites:**
- Run `claims-table-setup.sql` in Supabase
- Have at least one claim in the database

**Request:**
```bash
curl http://localhost:3000/api/claims
```

**Expected:**
- Returns claims from Supabase `claims` table
- Ordered by `created_at DESC`
- Success response with real data

---

### Test 8: POST Create Claim (Real Mode)

**Request:**
```bash
curl -X POST http://localhost:3000/api/claims \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "YOUR_USER_ID_FROM_SUPABASE",
    "location": "Real Forest, Brazil",
    "polygon": {"type": "Polygon", "coordinates": [[[0,0],[1,0],[1,1],[0,1],[0,0]]]},
    "evidence_cids": ["QmXxx..."],
    "ndvi_delta": 15.3,
    "area": 150
  }'
```

**Expected:**
- Claim inserted into Supabase
- Returns inserted claim with UUID
- Status defaults to "pending"

**Verify in Supabase:**
1. Go to Table Editor → `claims`
2. See new row with your data

---

### Test 9: PATCH Verify Claim - Unauthorized (Real Mode)

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/claims/CLAIM_UUID/verify \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "credits": 500
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Unauthorized - Please log in"
}
```

---

### Test 10: PATCH Verify Claim - Forbidden (Non-Verifier)

**Setup:**
- Log in as contributor or company user
- Get session cookie

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/claims/CLAIM_UUID/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: airswap-session=YOUR_SESSION" \
  -d '{
    "approved": true,
    "credits": 500
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Forbidden - Only verifiers can verify claims"
}
```

---

### Test 11: PATCH Verify Claim - Success (Verifier)

**Setup:**
- Log in as verifier user
- Get session cookie
- Have a pending claim

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/claims/CLAIM_UUID/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: airswap-session=VERIFIER_SESSION" \
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
    "id": "...",
    "status": "verified",
    "credits": 500,
    "verified_by": "VERIFIER_USER_ID",
    "verified_at": "2024-12-06T...",
    ...
  },
  "message": "Claim approved successfully"
}
```

**Verify in Supabase:**
1. Check claim status changed to "verified"
2. Credits field populated
3. verified_by and verified_at set

---

## Integration Testing

### Test Frontend Integration

1. **Contributor Dashboard:**
   ```typescript
   // In pages/dashboard/contributor.tsx
   useEffect(() => {
     fetch('/api/claims?userId=USER_ID')
       .then(res => res.json())
       .then(data => {
         if (data.success) {
           setClaims(data.data);
         }
       });
   }, []);
   ```

2. **Submit Claim:**
   ```typescript
   const submitClaim = async (claimData) => {
     const response = await fetch('/api/claims', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(claimData),
     });
     const result = await response.json();
     return result;
   };
   ```

3. **Verifier Dashboard:**
   ```typescript
   const verifyClaim = async (claimId, approved, credits) => {
     const response = await fetch(`/api/claims/${claimId}/verify`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ approved, credits }),
     });
     return await response.json();
   };
   ```

---

## Success Criteria

✅ GET returns demo claims in demo mode  
✅ GET returns Supabase claims in real mode  
✅ GET filters work (userId, status)  
✅ POST creates claim in demo mode  
✅ POST inserts claim in Supabase (real mode)  
✅ POST validates input with Zod  
✅ PATCH requires verifier role  
✅ PATCH updates claim status correctly  
✅ PATCH sets credits for approved claims  
✅ All endpoints return proper error messages  

---

## Troubleshooting

### "Failed to retrieve claims"
- Check Supabase connection
- Verify `claims` table exists
- Check RLS policies

### "Unauthorized" on verify endpoint
- Ensure user is logged in
- Check session cookie is sent
- Verify token is valid

### "Forbidden - Only verifiers can verify"
- User must have `role: "verifier"` in profiles table
- Check profiles table has correct role

### Validation errors
- Check request body matches schema
- Ensure UUIDs are valid format
- Verify required fields are present

---

## Next Steps

1. Test all endpoints in demo mode
2. Run SQL migration
3. Test all endpoints in real mode
4. Test role-based access control
5. Integrate with frontend components

