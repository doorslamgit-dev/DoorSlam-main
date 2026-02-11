-- Migration: Add Subscription Support
-- Date: 2026-02-09

-- =============================================================================
-- 1. Add subscription columns to profiles table
-- =============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'trial';
  -- Values: 'trial', 'family', 'premium', 'expired'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';
  -- Values: 'trialing', 'active', 'past_due', 'canceled'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Index for Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- =============================================================================
-- 2. Token balance table
-- =============================================================================

CREATE TABLE IF NOT EXISTS token_balances (
  parent_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own balance
CREATE POLICY "Users can view own token balance" ON token_balances
  FOR SELECT USING (auth.uid() = parent_id);

-- Policy: Only service role can update (webhooks)
CREATE POLICY "Service role can update token balance" ON token_balances
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- 3. Configurable token costs
-- =============================================================================

CREATE TABLE IF NOT EXISTS feature_token_costs (
  feature_code TEXT PRIMARY KEY,
  tokens_per_use INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (public read)
ALTER TABLE feature_token_costs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read token costs
CREATE POLICY "Anyone can read token costs" ON feature_token_costs
  FOR SELECT USING (true);

-- Seed initial values (adjustable in Supabase dashboard)
INSERT INTO feature_token_costs (feature_code, tokens_per_use, description) VALUES
  ('study_buddy_voice_minute', 10, 'Study Buddy voice transcription per minute'),
  ('ai_tutor_advice', 50, 'AI Tutor advice generation'),
  ('custom_mnemonic', 15, 'Custom AI-generated mnemonic creation'),
  ('benchmark_report', 25, 'Benchmark comparison report')
ON CONFLICT (feature_code) DO NOTHING;

-- =============================================================================
-- 4. Stripe webhook events (idempotency)
-- =============================================================================

CREATE TABLE IF NOT EXISTS stripe_events (
  stripe_event_id TEXT PRIMARY KEY,
  event_type TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (service role only)
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- No public policies — webhook handler uses service role

-- =============================================================================
-- 5. RPC: Get subscription status
-- =============================================================================

CREATE OR REPLACE FUNCTION rpc_get_subscription_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_parent_id UUID;
  v_profile RECORD;
  v_child_count INTEGER;
  v_subject_count INTEGER;
  v_token_balance INTEGER;
BEGIN
  v_parent_id := auth.uid();

  IF v_parent_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get profile with subscription info
  SELECT
    subscription_tier,
    subscription_status,
    trial_ends_at,
    stripe_customer_id
  INTO v_profile
  FROM profiles
  WHERE id = v_parent_id;

  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  -- Get child count
  SELECT COUNT(*) INTO v_child_count
  FROM children WHERE parent_id = v_parent_id;

  -- Get subject count (approximate via child_subjects)
  SELECT COUNT(DISTINCT subject_id) INTO v_subject_count
  FROM child_subjects cs
  JOIN children c ON c.id = cs.child_id
  WHERE c.parent_id = v_parent_id;

  -- Get token balance
  SELECT COALESCE(balance, 0) INTO v_token_balance
  FROM token_balances WHERE parent_id = v_parent_id;

  RETURN jsonb_build_object(
    'success', true,
    'tier', COALESCE(v_profile.subscription_tier, 'trial'),
    'status', COALESCE(v_profile.subscription_status, 'trialing'),
    'trial_ends_at', v_profile.trial_ends_at,
    'has_stripe_customer', v_profile.stripe_customer_id IS NOT NULL,
    'usage', jsonb_build_object(
      'children_count', v_child_count,
      'subjects_count', v_subject_count,
      'token_balance', v_token_balance
    ),
    'limits', CASE COALESCE(v_profile.subscription_tier, 'trial')
      WHEN 'trial' THEN jsonb_build_object('max_children', 1, 'max_subjects', 1, 'can_buy_tokens', false)
      WHEN 'family' THEN jsonb_build_object('max_children', null, 'max_subjects', null, 'can_buy_tokens', false)
      WHEN 'premium' THEN jsonb_build_object('max_children', null, 'max_subjects', null, 'can_buy_tokens', true)
      ELSE jsonb_build_object('max_children', 0, 'max_subjects', 0, 'can_buy_tokens', false)
    END
  );
END;
$$;

-- =============================================================================
-- 6. Set trial_ends_at for new users (trigger) — 14-day trial
-- =============================================================================

CREATE OR REPLACE FUNCTION set_trial_end_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.trial_ends_at IS NULL AND NEW.subscription_tier = 'trial' THEN
    NEW.trial_ends_at := NOW() + INTERVAL '14 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_trial_end_date ON profiles;
CREATE TRIGGER trigger_set_trial_end_date
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_trial_end_date();

-- =============================================================================
-- Done! Remember to:
-- 1. Create Stripe products and prices in Stripe Dashboard
-- 2. Set up webhook endpoint: /functions/v1/stripe-webhook
-- 3. Add environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
-- =============================================================================
