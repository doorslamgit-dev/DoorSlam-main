-- Migration: Add stripe_price_id to profiles + update RPC
-- Date: 2026-02-19

-- =============================================================================
-- 1. Add stripe_price_id column to profiles
-- =============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- =============================================================================
-- 2. Update RPC to return stripe_price_id
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
    stripe_customer_id,
    stripe_price_id
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
    'stripe_price_id', v_profile.stripe_price_id,
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
