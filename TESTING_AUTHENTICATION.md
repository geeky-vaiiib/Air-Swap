# Testing Authentication - Step-by-Step Guide

## Prerequisites

Before testing, ensure you have:

1. ✅ Run the SQL migration in Supabase SQL Editor (`supabase-setup.sql`)
2. ✅ Configured `.env.local` with your Supabase credentials
3. ✅ Installed dependencies (`npm install`)
4. ✅ Started the dev server (`npm run dev`)

## Step 1: Database Setup

### Run SQL Migration

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `fsavledncfmbrnhtiher`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase-setup.sql`
6. Click **Run** or press `Ctrl/Cmd + Enter`
7. Verify success - you should see "Success. No rows returned"

### Verify Tables Created

1. In Supabase Dashboard, go to **Table Editor**
2. You should see a new table: `profiles`
3. Click on `profiles` to view its structure:
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `email` (text)
   - `full_name` (text)
   - `role` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## Step 2: Test Signup Flow

### Test Case 1: Contributor Signup

1. Navigate to http://localhost:3000/signup
2. Fill in the form:
   - **Role**: Click "Contributor"
   - **Full Name**: "John Contributor"
   - **Email**: "john.contributor@test.com"
   - **Password**: "password123"
3. Click "Create Account"
4. **Expected Results**:
   - ✅ Toast notification: "Account created successfully"
   - ✅ Redirected to `/dashboard/contributor`
   - ✅ Dashboard loads with contributor-specific content

### Test Case 2: Company Signup

1. Navigate to http://localhost:3000/signup
2. Fill in the form:
   - **Role**: Click "Company"
   - **Full Name**: "Acme Corporation"
   - **Email**: "admin@acme.com"
   - **Password**: "password123"
3. Click "Create Account"
4. **Expected Results**:
   - ✅ Toast notification: "Account created successfully"
   - ✅ Redirected to `/dashboard/company`
   - ✅ Dashboard loads with company-specific content

### Test Case 3: Verifier Signup

1. Navigate to http://localhost:3000/signup
2. Fill in the form:
   - **Role**: Click "Verifier"
   - **Full Name**: "Jane Verifier"
   - **Email**: "jane.verifier@test.com"
   - **Password**: "password123"
3. Click "Create Account"
4. **Expected Results**:
   - ✅ Toast notification: "Account created successfully"
   - ✅ Redirected to `/dashboard/verifier`
   - ✅ Dashboard loads with verifier-specific content

### Test Case 4: Validation Errors

Test each validation:

**Invalid Email:**
- Email: "notanemail"
- Expected: Error toast "Invalid email address"

**Short Password:**
- Password: "12345"
- Expected: Error toast "Password must be at least 6 characters"

**Short Name:**
- Full Name: "A"
- Expected: Error toast "Full name must be at least 2 characters"

**Duplicate Email:**
- Use an email that already exists
- Expected: Error toast with Supabase error message

## Step 3: Verify Database Records

After creating test accounts:

1. Go to Supabase Dashboard → **Table Editor** → `profiles`
2. You should see 3 rows (one for each test user)
3. Verify each row has:
   - Correct `email`
   - Correct `full_name`
   - Correct `role` (contributor, company, or verifier)
   - Valid `user_id` (UUID)
   - Timestamps for `created_at` and `updated_at`

4. Go to **Authentication** → **Users**
5. You should see 3 users with matching emails

## Step 4: Test Login Flow

### Test Case 5: Successful Login

1. Click "Logout" in the dashboard sidebar
2. Navigate to http://localhost:3000/login
3. Fill in the form:
   - **Email**: "john.contributor@test.com"
   - **Password**: "password123"
4. Click "Log In"
5. **Expected Results**:
   - ✅ Toast notification: "Logged in successfully"
   - ✅ Redirected to `/dashboard/contributor`
   - ✅ Dashboard loads with user's data

### Test Case 6: Invalid Credentials

1. Navigate to http://localhost:3000/login
2. Fill in the form:
   - **Email**: "wrong@email.com"
   - **Password**: "wrongpassword"
3. Click "Log In"
4. **Expected Results**:
   - ✅ Error toast: "Invalid email or password"
   - ✅ Stays on login page

### Test Case 7: Role-Based Redirect

1. Login as contributor: "john.contributor@test.com"
2. **Expected**: Redirected to `/dashboard/contributor`

3. Logout and login as company: "admin@acme.com"
4. **Expected**: Redirected to `/dashboard/company`

5. Logout and login as verifier: "jane.verifier@test.com"
6. **Expected**: Redirected to `/dashboard/verifier`

## Step 5: Test Route Protection

### Test Case 8: Unauthenticated Access

1. Logout (or open incognito window)
2. Try to access: http://localhost:3000/dashboard/contributor
3. **Expected Results**:
   - ✅ Redirected to `/login?redirect=/dashboard/contributor`
   - ✅ Cannot access dashboard without login

### Test Case 9: Wrong Role Access

1. Login as contributor: "john.contributor@test.com"
2. Try to access: http://localhost:3000/dashboard/company
3. **Expected Results**:
   - ✅ Redirected to `/dashboard/contributor` (your correct dashboard)
   - ✅ Cannot access other role's dashboard

### Test Case 10: Public Routes

1. Logout
2. Try to access these routes (should work without login):
   - ✅ http://localhost:3000/ (homepage)
   - ✅ http://localhost:3000/login
   - ✅ http://localhost:3000/signup
   - ✅ http://localhost:3000/map

## Step 6: Test Logout Flow

### Test Case 11: Logout

1. Login as any user
2. Navigate to their dashboard
3. Click "Logout" in the sidebar
4. **Expected Results**:
   - ✅ Toast notification: "Logged out"
   - ✅ Redirected to `/login`
   - ✅ Session cleared from localStorage
   - ✅ Cookie cleared
   - ✅ Cannot access dashboard anymore

## Step 7: Test Demo Mode

### Test Case 12: Demo Mode Enabled

1. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_DEMO_MODE=true
   ```
2. Restart dev server
3. Navigate to http://localhost:3000/signup
4. Fill in any data and submit
5. **Expected Results**:
   - ✅ Toast: "Demo Mode - Redirecting to dashboard..."
   - ✅ Redirected without API call
   - ✅ No database record created

6. Try accessing any dashboard directly
7. **Expected Results**:
   - ✅ Access granted (middleware bypassed in demo mode)

### Test Case 13: Demo Mode Disabled

1. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_DEMO_MODE=false
   ```
2. Restart dev server
3. Verify authentication is enforced again

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:**
- Check `.env.local` exists in root directory
- Verify all 4 Supabase variables are set
- Restart dev server: `npm run dev`

### Issue: "Failed to create user profile"

**Solution:**
- Run the SQL migration in Supabase
- Check Supabase logs: Dashboard → Logs → Postgres Logs
- Verify RLS policies are created

### Issue: Middleware not redirecting

**Solution:**
- Ensure `middleware.ts` is in root directory (not in `/pages`)
- Clear browser cookies and localStorage
- Hard refresh: `Cmd/Ctrl + Shift + R`

### Issue: Session not persisting

**Solution:**
- Check browser console for errors
- Verify cookies are enabled
- Check localStorage in DevTools → Application → Local Storage

## Success Criteria

✅ All 13 test cases pass  
✅ Users can sign up with all 3 roles  
✅ Users can log in and are redirected correctly  
✅ Route protection works (unauthenticated users blocked)  
✅ Role-based access works (wrong role redirected)  
✅ Logout clears session and redirects  
✅ Demo mode bypasses authentication  
✅ Database records created correctly  

## Next Steps

Once all tests pass:
1. Test on different browsers (Chrome, Firefox, Safari)
2. Test on mobile devices
3. Add password reset functionality
4. Add email verification
5. Consider adding OAuth providers (Google, GitHub)

