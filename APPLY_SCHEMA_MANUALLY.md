# 🚀 Apply Database Schema Manually - Quick Guide

**Status**: ⚠️ Automatic application failed due to DNS/network issue  
**Solution**: Use Supabase Dashboard (2 minutes)

---

## ✅ Quick Steps (Recommended)

### 1. Open Supabase Dashboard
- Go to: **https://app.supabase.com**
- Log in to your account
- Select your project

### 2. Open SQL Editor
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"** button

### 3. Copy & Paste Schema
- Open the file: **`supabase_schema_and_rls.sql`** (in this directory)
- Select ALL content (Ctrl+A / Cmd+A)
- Copy (Ctrl+C / Cmd+C)
- Paste into the SQL Editor

### 4. Execute
- Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
- Wait 5-10 seconds for execution
- Check for success message

### 5. Verify
- Go to **"Table Editor"** in sidebar
- You should see 5 new tables:
  - ✅ profiles
  - ✅ claims  
  - ✅ credits
  - ✅ transactions
  - ✅ verifier_logs

---

## 📊 What Gets Created

**5 Tables**:
1. **profiles** - User profiles with roles
2. **claims** - Reforestation claims
3. **credits** - Carbon credits
4. **transactions** - Transaction logs
5. **verifier_logs** - Audit trail

**15 RLS Policies** - Row-level security for all tables

**2 Extensions** - uuid-ossp, postgis

**Triggers** - Auto-update timestamps

---

## 🔍 Troubleshooting

### "relation already exists"
✅ **This is OK!** Tables are already created. You can skip or continue.

### "permission denied"
❌ Make sure you're logged in as the project owner.

### "syntax error"
❌ Make sure you copied the ENTIRE file content.

---

## ✅ After Success

Test your API endpoints:
```bash
# Test claims API
curl http://localhost:3000/api/claims

# Test credits API  
curl http://localhost:3000/api/credits/USER_ID
```

---

## 📄 Files

- **`supabase_schema_and_rls.sql`** - The schema file to copy
- **`SUPABASE_SCHEMA_SETUP_GUIDE.md`** - Detailed guide
- **`supabase-schema-apply-report.json`** - Error report

---

**Estimated Time**: 2 minutes  
**Difficulty**: Easy  
**Success Rate**: 99%

