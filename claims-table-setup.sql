-- AirSwap Growth - Claims Table Setup
-- Run this SQL in your Supabase SQL Editor to set up the claims table

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  polygon JSONB NOT NULL,
  evidence_cids TEXT[],
  ndvi_before JSONB,
  ndvi_after JSONB,
  ndvi_delta NUMERIC(5, 2),
  area NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  credits INTEGER,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_verified_by ON claims(verified_by);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own claims
CREATE POLICY "Users can read own claims"
  ON claims
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Verifiers can read all claims
CREATE POLICY "Verifiers can read all claims"
  ON claims
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'verifier'
    )
  );

-- Create policy: Users can insert their own claims
CREATE POLICY "Users can insert own claims"
  ON claims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Verifiers can update claims (for verification)
CREATE POLICY "Verifiers can update claims"
  ON claims
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'verifier'
    )
  );

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON claims TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create a view for claim statistics (optional)
CREATE OR REPLACE VIEW claim_stats AS
SELECT 
  user_id,
  COUNT(*) as total_claims,
  COUNT(*) FILTER (WHERE status = 'verified') as verified_claims,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_claims,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_claims,
  COALESCE(SUM(credits) FILTER (WHERE status = 'verified'), 0) as total_credits
FROM claims
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON claim_stats TO anon, authenticated;

