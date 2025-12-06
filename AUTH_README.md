# 🔐 AirSwap Growth - Authentication System

Complete Supabase authentication with role-based access control.

---

## 📖 Documentation Index

Choose your path:

### 🚀 **Just Want to Get Started?**
→ Read: [`QUICKSTART_AUTH.md`](./QUICKSTART_AUTH.md)  
5-minute setup guide to get authentication working immediately.

### 📚 **Need Full Setup Instructions?**
→ Read: [`AUTHENTICATION_SETUP.md`](./AUTHENTICATION_SETUP.md)  
Comprehensive guide covering all features, setup, and usage.

### 🧪 **Ready to Test?**
→ Read: [`TESTING_AUTHENTICATION.md`](./TESTING_AUTHENTICATION.md)  
13 test cases with step-by-step instructions.

### 📊 **Want Implementation Details?**
→ Read: [`SUPABASE_AUTH_IMPLEMENTATION_SUMMARY.md`](./SUPABASE_AUTH_IMPLEMENTATION_SUMMARY.md)  
Complete summary of what was built and how it works.

---

## ⚡ Quick Overview

### What's Included

✅ **User Authentication**
- Email/password signup
- Secure login
- Session management
- Logout functionality

✅ **Role-Based Access Control**
- 3 roles: Contributor, Company, Verifier
- Role selection during signup
- Automatic dashboard routing
- Middleware protection

✅ **Security**
- Supabase Auth (industry-standard)
- JWT tokens
- HttpOnly cookies
- Row Level Security (RLS)
- Zod validation

✅ **User Experience**
- Loading states
- Toast notifications
- Error handling
- Demo mode support

---

## 🎯 User Roles

### 👨‍🌾 Contributor
Submit land for verification and earn Oxygen Credits.
- Dashboard: `/dashboard/contributor`
- Features: Submit claims, track growth, view credits

### 🏢 Company
Purchase verified Oxygen Credits for carbon offsetting.
- Dashboard: `/dashboard/company`
- Features: Browse marketplace, purchase credits, portfolio

### ✅ Verifier
Review and approve submitted vegetation claims.
- Dashboard: `/dashboard/verifier`
- Features: Review claims, verify NDVI data, approve credits

---

## 🗂️ File Structure

```
lib/
├── supabaseClient.ts          # Client-side Supabase
├── supabaseServer.ts          # Server-side Supabase (admin)
├── auth.ts                    # Server auth utilities
├── authHelpers.ts             # Client auth helpers
└── types/
    └── auth.ts                # TypeScript types

pages/
├── signup.tsx                 # Signup page
├── login.tsx                  # Login page
└── api/
    └── auth/
        ├── signup.ts          # Signup API
        ├── login.ts           # Login API
        └── logout.ts          # Logout API

components/
└── dashboard/
    └── DashboardSidebar.tsx   # Includes logout button

middleware.ts                  # Route protection
supabase-setup.sql            # Database schema
.env.local                    # Environment variables (configured)
```

---

## 🔑 Environment Variables

Already configured in `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://fsavledncfmbrnhtiher.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_DB_URL=postgresql://postgres:muggles2025@...
```

---

## 🗄️ Database Schema

### `profiles` Table

| Column       | Type      | Description                    |
|-------------|-----------|--------------------------------|
| id          | UUID      | Primary key                    |
| user_id     | UUID      | Foreign key to auth.users      |
| email       | TEXT      | User email                     |
| full_name   | TEXT      | User's full name               |
| role        | TEXT      | contributor/company/verifier   |
| created_at  | TIMESTAMP | Account creation time          |
| updated_at  | TIMESTAMP | Last update time               |

**Indexes:** user_id, email, role  
**RLS:** Enabled with policies for read/update  
**Triggers:** Auto-update timestamps  

---

## 🔄 Authentication Flow

1. **Signup** → Validate → Create Auth User → Create Profile → Set Session → Redirect
2. **Login** → Validate → Authenticate → Fetch Profile → Set Session → Redirect
3. **Access Dashboard** → Middleware Check → Verify Session → Check Role → Allow/Redirect
4. **Logout** → Clear Session → Clear Cookie → Redirect to Login

---

## 🛠️ API Endpoints

### `POST /api/auth/signup`
Create new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "contributor"
}
```

**Response:**
```json
{
  "success": true,
  "user": { "id": "...", "email": "...", "role": "...", "full_name": "..." },
  "access_token": "..."
}
```

### `POST /api/auth/login`
Authenticate existing user.

### `POST /api/auth/logout`
End user session.

---

## 🎮 Demo Mode

Toggle authentication on/off:

```env
# .env.local
NEXT_PUBLIC_DEMO_MODE=true   # Bypass authentication
NEXT_PUBLIC_DEMO_MODE=false  # Enforce authentication
```

When enabled:
- No API calls made
- No database records created
- All routes accessible
- Perfect for development/demos

---

## ✅ Setup Checklist

- [x] Dependencies installed (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Environment variables configured (`.env.local`)
- [ ] **SQL migration run** (`supabase-setup.sql`) ← **DO THIS FIRST!**
- [ ] Dev server started (`npm run dev`)
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test route protection
- [ ] Test logout

---

## 🚨 Important: Run SQL Migration

**Before testing, you MUST run the SQL migration:**

1. Open: https://app.supabase.com
2. Go to: SQL Editor → New Query
3. Paste: Contents of `supabase-setup.sql`
4. Run: Ctrl/Cmd + Enter

This creates the `profiles` table and all necessary database objects.

---

## 📞 Support & Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
- Restart dev server: `npm run dev`

**"Failed to create user profile"**
- Run SQL migration in Supabase

**Middleware not working**
- Check `middleware.ts` is in root directory
- Clear browser cookies/localStorage

### Get Help

- Check: `TESTING_AUTHENTICATION.md` troubleshooting section
- Supabase Dashboard: https://app.supabase.com
- Supabase Docs: https://supabase.com/docs

---

## 🎉 You're All Set!

Authentication is fully implemented and ready to use.

**Next:** Run the SQL migration and start testing!

→ [`QUICKSTART_AUTH.md`](./QUICKSTART_AUTH.md)

