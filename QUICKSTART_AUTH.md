# 🚀 Quick Start - Supabase Authentication

Get authentication up and running in 5 minutes!

## Step 1: Run SQL Migration (2 minutes)

1. Open Supabase Dashboard: https://app.supabase.com
2. Select project: `fsavledncfmbrnhtiher`
3. Go to **SQL Editor** → **New Query**
4. Copy/paste contents of `supabase-setup.sql`
5. Click **Run** (Ctrl/Cmd + Enter)
6. ✅ Success! The `profiles` table is created

## Step 2: Verify Environment (30 seconds)

Your `.env.local` is already configured:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://fsavledncfmbrnhtiher.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

✅ No changes needed!

## Step 3: Start Development Server (30 seconds)

```bash
npm run dev
```

Server starts at: http://localhost:3000

## Step 4: Test Authentication (2 minutes)

### Create Your First User

1. Go to: http://localhost:3000/signup
2. Fill in:
   - **Role**: Contributor
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: password123
3. Click **Create Account**
4. ✅ You're redirected to `/dashboard/contributor`

### Test Login

1. Click **Logout** in sidebar
2. Go to: http://localhost:3000/login
3. Login with:
   - **Email**: test@example.com
   - **Password**: password123
4. ✅ You're logged in and redirected to dashboard

## Step 5: Verify Database (1 minute)

1. Go to Supabase Dashboard → **Table Editor** → `profiles`
2. ✅ You should see your test user record
3. Go to **Authentication** → **Users**
4. ✅ You should see your user in the auth system

---

## 🎉 Done!

Authentication is now fully functional!

### What You Can Do Now:

✅ Sign up users with 3 roles (contributor, company, verifier)  
✅ Login and logout  
✅ Role-based dashboard access  
✅ Protected routes (try accessing `/dashboard/company` as contributor)  
✅ Demo mode (set `NEXT_PUBLIC_DEMO_MODE=true` to bypass auth)  

### Test All Features:

Follow the comprehensive guide: `TESTING_AUTHENTICATION.md`

### Learn More:

- Full setup guide: `AUTHENTICATION_SETUP.md`
- Implementation summary: `SUPABASE_AUTH_IMPLEMENTATION_SUMMARY.md`

---

## 🔧 Troubleshooting

### "Missing Supabase environment variables"
→ Restart dev server: `npm run dev`

### "Failed to create user profile"
→ Run SQL migration in Supabase SQL Editor

### Can't access dashboard
→ Make sure you're logged in (check localStorage in DevTools)

---

## 📚 Key Files

- **Signup**: `/pages/signup.tsx`
- **Login**: `/pages/login.tsx`
- **API Routes**: `/pages/api/auth/`
- **Middleware**: `/middleware.ts`
- **Auth Helpers**: `/lib/authHelpers.ts`

---

## 🎯 Next Steps

1. Test with all 3 roles (contributor, company, verifier)
2. Try accessing wrong dashboard (auto-redirects to correct one)
3. Test logout and re-login
4. Check Supabase Dashboard for user records

**Happy coding! 🚀**

