# Supabase Database Schema Setup Guide

**Status**: ⚠️ **Manual Application Required**  
**Date**: December 6, 2024  
**Reason**: DNS resolution error - hostname could not be resolved

---

## 📋 Overview

The database schema has been **created successfully** in the file `supabase_schema_and_rls.sql` but could not be automatically applied due to a network/DNS issue.

**Schema File**: `supabase_schema_and_rls.sql`  
**Tables**: 5 (profiles, claims, credits, transactions, verifier_logs)  
**RLS Policies**: 15 policies across all tables  
**Extensions**: uuid-ossp, postgis

---

## ⚠️ Error Encountered

```
Error: could not translate host name "db.fsavledncfmbrnhtiher.supabase.co" to address
```

**Possible Causes**:
- Network connectivity issue
- Incorrect hostname in connection string
- Supabase project may not be active
- DNS resolution blocked by firewall

---

## ✅ Recommended Solution: Use Supabase Dashboard

### Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Log in to your account

2. **Navigate to Your Project**
   - Select your AirSwap project

3. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

4. **Copy the Schema**
   - Open the file `supabase_schema_and_rls.sql` in this directory
   - Copy ALL contents (Ctrl+A, Ctrl+C)

5. **Paste and Execute**
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for execution to complete

6. **Verify Success**
   - Check for any error messages
   - Go to "Table Editor" to see the new tables
   - Verify all 5 tables are created:
     - ✅ profiles
     - ✅ claims
     - ✅ credits
     - ✅ transactions
     - ✅ verifier_logs

---

## 📊 Database Schema Details

### Tables Created

#### 1. **profiles**
- Extends auth.users with role and profile info
- Columns: id, email, role, full_name, avatar_url, wallet_address
- Roles: contributor, company, verifier

#### 2. **claims**
- Stores reforestation claims
- Columns: id, user_id, location, polygon (GeoJSON), evidence_cids, ndvi_before, ndvi_after, ndvi_delta, area, status, credits
- Status: pending, verified, rejected

#### 3. **credits**
- Carbon credits issued for verified claims
- Columns: id, claim_id, owner_user_id, token_id, metadata_cid, amount, issued_at

#### 4. **transactions**
- Transaction logs for credits
- Columns: id, user_id, tx_hash, type, metadata
- Types: issue, transfer, burn, purchase

#### 5. **verifier_logs**
- Audit trail for verifier actions
- Columns: id, claim_id, verifier_id, action, comment, timestamp

---

## 🔒 Row Level Security (RLS) Policies

### Profiles
- ✅ Everyone can view profiles
- ✅ Users can insert their own profile
- ✅ Users can update their own profile

### Claims
- ✅ Everyone can view claims
- ✅ Authenticated users can create claims
- ✅ Users can update their own pending claims
- ✅ Verifiers can update any claim

### Credits
- ✅ Everyone can view credits
- ✅ Verifiers can issue credits
- ✅ Owners can transfer credits

### Transactions
- ✅ Users can view their own transactions
- ✅ Verifiers can view all transactions
- ✅ Service role can insert transactions

### Verifier Logs
- ✅ Verifiers can view all logs
- ✅ Verifiers can insert logs

---

## 🔧 Alternative Methods

### Method 2: Fix Connection String and Retry

1. **Get Correct Connection String**:
   - Supabase Dashboard > Settings > Database
   - Copy "Connection string" under "Connection pooling"

2. **Update and Retry**:
   ```bash
   PGSSLMODE=require psql "YOUR_CORRECT_CONNECTION_STRING" -f supabase_schema_and_rls.sql
   ```

### Method 3: Use Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

---

## ✅ Verification Steps

After applying the schema, verify it worked:

1. **Check Tables**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Check RLS Policies**:
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

3. **Test Insert** (via SQL Editor):
   ```sql
   -- This should work (creates a test profile)
   INSERT INTO profiles (id, email, role)
   VALUES (gen_random_uuid(), 'test@example.com', 'contributor');
   ```

---

## 🚀 Next Steps After Schema Application

1. ✅ Verify all tables are created
2. ✅ Verify RLS policies are active
3. ✅ Test API endpoints:
   - POST /api/auth/signup
   - POST /api/claims
   - GET /api/claims
4. ✅ Create test data for development
5. ✅ Update environment variables if needed

---

## 📄 Files Created

- ✅ `supabase_schema_and_rls.sql` - Complete schema
- ✅ `supabase-schema-apply-report.json` - Execution report
- ✅ `.backup/supabase-schema-error.log` - Error log
- ✅ `SUPABASE_SCHEMA_SETUP_GUIDE.md` - This guide

---

## 🆘 Troubleshooting

### Issue: "relation already exists"
**Solution**: Tables already created. You can skip or drop existing tables first.

### Issue: "permission denied"
**Solution**: Ensure you're using the postgres role (service_role key).

### Issue: RLS policies not working
**Solution**: Verify RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

---

**Need Help?** Check the error log at `.backup/supabase-schema-error.log`

