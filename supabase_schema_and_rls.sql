-- AirSwap Growth Platform - Supabase Schema and RLS Policies
-- Database schema for claims, credits, transactions, and user profiles

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('contributor', 'company', 'verifier')),
  full_name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================================================
-- CLAIMS TABLE
-- ============================================================================
-- Stores reforestation claims submitted by contributors
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  polygon JSONB NOT NULL, -- GeoJSON polygon
  evidence_cids TEXT[], -- IPFS CIDs for evidence
  ndvi_before JSONB, -- NDVI data before reforestation
  ndvi_after JSONB, -- NDVI data after reforestation
  ndvi_delta NUMERIC, -- Percentage change in NDVI
  area NUMERIC, -- Area in square meters
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  credits NUMERIC DEFAULT 0, -- Credits earned (only for verified claims)
  verified_by UUID REFERENCES public.profiles(id), -- Verifier who approved/rejected
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON public.claims(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_verified_by ON public.claims(verified_by);

-- ============================================================================
-- CREDITS TABLE
-- ============================================================================
-- Stores carbon credits issued for verified claims
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_id TEXT, -- Blockchain token ID (if minted)
  metadata_cid TEXT, -- IPFS CID for credit metadata
  amount NUMERIC NOT NULL CHECK (amount > 0),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  transferred_to UUID REFERENCES public.profiles(id), -- If credit is transferred
  transferred_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credits_owner ON public.credits(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_credits_claim ON public.credits(claim_id);
CREATE INDEX IF NOT EXISTS idx_credits_issued_at ON public.credits(issued_at DESC);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
-- Logs all credit-related transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tx_hash TEXT, -- Blockchain transaction hash
  type TEXT NOT NULL CHECK (type IN ('issue', 'transfer', 'burn', 'purchase')),
  metadata JSONB, -- Additional transaction details
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- ============================================================================
-- VERIFIER_LOGS TABLE
-- ============================================================================
-- Audit trail for verifier actions
CREATE TABLE IF NOT EXISTS public.verifier_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  verifier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'requested_changes')),
  comment TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verifier_logs_claim ON public.verifier_logs(claim_id);
CREATE INDEX IF NOT EXISTS idx_verifier_logs_verifier ON public.verifier_logs(verifier_id);
CREATE INDEX IF NOT EXISTS idx_verifier_logs_timestamp ON public.verifier_logs(timestamp DESC);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_claims_updated_at ON public.claims;
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifier_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

-- Users can view all profiles (for displaying contributor/company info)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- CLAIMS RLS POLICIES
-- ============================================================================

-- Anyone can view all claims (for marketplace/dashboard)
DROP POLICY IF EXISTS "Claims are viewable by everyone" ON public.claims;
CREATE POLICY "Claims are viewable by everyone"
  ON public.claims FOR SELECT
  USING (true);

-- Authenticated users can create claims
DROP POLICY IF EXISTS "Authenticated users can create claims" ON public.claims;
CREATE POLICY "Authenticated users can create claims"
  ON public.claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending claims
DROP POLICY IF EXISTS "Users can update their own pending claims" ON public.claims;
CREATE POLICY "Users can update their own pending claims"
  ON public.claims FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Verifiers can update any claim
DROP POLICY IF EXISTS "Verifiers can update any claim" ON public.claims;
CREATE POLICY "Verifiers can update any claim"
  ON public.claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'verifier'
    )
  );

-- ============================================================================
-- CREDITS RLS POLICIES
-- ============================================================================

-- Anyone can view all credits (for marketplace)
DROP POLICY IF EXISTS "Credits are viewable by everyone" ON public.credits;
CREATE POLICY "Credits are viewable by everyone"
  ON public.credits FOR SELECT
  USING (true);

-- Only verifiers can issue credits
DROP POLICY IF EXISTS "Verifiers can issue credits" ON public.credits;
CREATE POLICY "Verifiers can issue credits"
  ON public.credits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'verifier'
    )
  );

-- Credit owners can transfer their credits
DROP POLICY IF EXISTS "Owners can transfer credits" ON public.credits;
CREATE POLICY "Owners can transfer credits"
  ON public.credits FOR UPDATE
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- ============================================================================
-- TRANSACTIONS RLS POLICIES
-- ============================================================================

-- Users can view their own transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Verifiers can view all transactions
DROP POLICY IF EXISTS "Verifiers can view all transactions" ON public.transactions;
CREATE POLICY "Verifiers can view all transactions"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'verifier'
    )
  );

-- System can insert transactions (via service role)
DROP POLICY IF EXISTS "Service role can insert transactions" ON public.transactions;
CREATE POLICY "Service role can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- VERIFIER_LOGS RLS POLICIES
-- ============================================================================

-- Verifiers can view all logs
DROP POLICY IF EXISTS "Verifiers can view all logs" ON public.verifier_logs;
CREATE POLICY "Verifiers can view all logs"
  ON public.verifier_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'verifier'
    )
  );

-- Verifiers can insert logs
DROP POLICY IF EXISTS "Verifiers can insert logs" ON public.verifier_logs;
CREATE POLICY "Verifiers can insert logs"
  ON public.verifier_logs FOR INSERT
  WITH CHECK (
    auth.uid() = verifier_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'verifier'
    )
  );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;

GRANT SELECT ON public.claims TO anon, authenticated;
GRANT INSERT, UPDATE ON public.claims TO authenticated;

GRANT SELECT ON public.credits TO anon, authenticated;
GRANT INSERT, UPDATE ON public.credits TO authenticated;

GRANT SELECT ON public.transactions TO authenticated;
GRANT INSERT ON public.transactions TO authenticated;

GRANT SELECT, INSERT ON public.verifier_logs TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Schema version: 1.0
-- Last updated: 2024-12-06
-- Tables: profiles, claims, credits, transactions, verifier_logs
-- RLS: Enabled on all tables with appropriate policies

