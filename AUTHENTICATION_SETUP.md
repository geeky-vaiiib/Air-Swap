# AirSwap Growth - Authentication Setup Guide

## Overview
This project now includes full Supabase authentication with role-based access control.

## Features Implemented

✅ **Supabase Integration**
- Client-side authentication (`/lib/supabaseClient.ts`)
- Server-side admin operations (`/lib/supabaseServer.ts`)
- JWT verification utilities (`/lib/auth.ts`)

✅ **API Routes**
- `/api/auth/signup` - User registration with role selection
- `/api/auth/login` - User authentication
- `/api/auth/logout` - Session termination

✅ **Frontend Integration**
- Updated `/pages/signup.tsx` with API integration
- Updated `/pages/login.tsx` with role-based redirects
- Loading states and error handling
- Toast notifications for user feedback

✅ **Route Protection**
- Middleware-based authentication (`/middleware.ts`)
- Role-based dashboard access
- Automatic redirects for unauthorized access

✅ **User Roles**
- `contributor` - Submit land for verification
- `company` - Purchase Oxygen Credits
- `verifier` - Review and approve claims

## Setup Instructions

### 1. Database Setup

Run the SQL migration in your Supabase SQL Editor:

```bash
# The SQL file is located at: supabase-setup.sql
```

This will create:
- `profiles` table with user data
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### 2. Environment Variables

Your `.env.local` file has been configured with your Supabase credentials:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://fsavledncfmbrnhtiher.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_DB_URL=postgresql://postgres:muggles2025@...
```

### 3. Install Dependencies

Dependencies have been installed:
- `@supabase/supabase-js` - Supabase client library
- `@supabase/ssr` - Server-side rendering support

### 4. Run the Application

```bash
npm run dev
```

## Usage

### Sign Up Flow

1. Navigate to `/signup`
2. Select role (contributor, company, or verifier)
3. Enter full name, email, and password
4. Submit form
5. Automatically redirected to role-specific dashboard

### Login Flow

1. Navigate to `/login`
2. Enter email and password
3. Submit form
4. Automatically redirected to dashboard based on user role

### Logout

Use the logout helper:

```typescript
import { logout } from '@/lib/authHelpers';

await logout();
router.push('/login');
```

## Demo Mode

Demo mode is still supported! Set in `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

When enabled:
- Authentication is bypassed
- Demo data is used
- All routes are accessible

## File Structure

```
lib/
├── supabaseClient.ts      # Client-side Supabase instance
├── supabaseServer.ts      # Server-side admin instance
├── auth.ts                # Server auth utilities
├── authHelpers.ts         # Client auth helpers
└── types/
    └── auth.ts            # TypeScript types

pages/
├── api/
│   └── auth/
│       ├── signup.ts      # Signup endpoint
│       ├── login.ts       # Login endpoint
│       └── logout.ts      # Logout endpoint
├── signup.tsx             # Signup page
└── login.tsx              # Login page

middleware.ts              # Route protection
supabase-setup.sql         # Database schema
```

## Security Features

- **Password Hashing**: Handled by Supabase Auth
- **JWT Tokens**: Secure session management
- **HttpOnly Cookies**: Session stored in secure cookies
- **Row Level Security**: Database-level access control
- **Role Validation**: Zod schema validation
- **CSRF Protection**: SameSite cookie policy

## API Endpoints

### POST `/api/auth/signup`

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
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "contributor",
    "full_name": "John Doe"
  },
  "access_token": "jwt_token"
}
```

### POST `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "contributor",
    "full_name": "John Doe"
  },
  "access_token": "jwt_token"
}
```

### POST `/api/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Next Steps

1. **Run the SQL migration** in Supabase SQL Editor
2. **Test the authentication flow**:
   - Sign up with different roles
   - Log in and verify redirects
   - Test route protection
3. **Customize as needed**:
   - Add password reset functionality
   - Implement email verification
   - Add OAuth providers (Google, GitHub, etc.)

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` exists with all required variables
- Restart the dev server after adding env vars

### "Failed to create user profile"
- Run the SQL migration in Supabase
- Check Supabase logs for errors

### Middleware not working
- Ensure `middleware.ts` is in the root directory
- Check that routes match the config matcher

## Support

For issues or questions, check:
- Supabase Dashboard: https://app.supabase.com
- Supabase Docs: https://supabase.com/docs

