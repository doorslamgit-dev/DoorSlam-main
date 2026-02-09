// src/services/subscriptionService.ts
// Service for Stripe subscription operations

import { supabase } from '../lib/supabase';
import type { SubscriptionInfo } from '../types/subscription';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Get full subscription status including limits and usage
 */
export async function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  const { data, error } = await supabase.rpc('rpc_get_subscription_status');

  if (error) {
    console.error('[subscription] getSubscriptionStatus error:', error);
    throw new Error('Failed to get subscription status');
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to get subscription status');
  }

  return {
    tier: data.tier,
    status: data.status,
    trial_ends_at: data.trial_ends_at,
    has_stripe_customer: data.has_stripe_customer,
    usage: data.usage,
    limits: data.limits,
  };
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(priceId: string): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-create-checkout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ price_id: priceId }),
  });

  const result = await response.json();

  if (!response.ok || result.error) {
    throw new Error(result.error || 'Failed to create checkout session');
  }

  return result.url;
}

/**
 * Open Stripe Customer Portal for billing management
 */
export async function openCustomerPortal(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-customer-portal`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok || result.error) {
    throw new Error(result.error || 'Failed to open customer portal');
  }

  return result.url;
}

/**
 * Create a Stripe Checkout session for token bundle purchase
 */
export async function buyTokens(bundlePriceId: string): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-buy-tokens`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ price_id: bundlePriceId }),
  });

  const result = await response.json();

  if (!response.ok || result.error) {
    throw new Error(result.error || 'Failed to create token checkout');
  }

  return result.url;
}

/**
 * Get current token balance
 */
export async function getTokenBalance(): Promise<number> {
  const { data, error } = await supabase
    .from('token_balances')
    .select('balance')
    .single();

  if (error) {
    // No balance row = 0 tokens
    if (error.code === 'PGRST116') {
      return 0;
    }
    console.error('[subscription] getTokenBalance error:', error);
    throw new Error('Failed to get token balance');
  }

  return data?.balance ?? 0;
}

/**
 * Get token cost for a feature
 */
export async function getFeatureTokenCost(featureCode: string): Promise<number> {
  const { data, error } = await supabase
    .from('feature_token_costs')
    .select('tokens_per_use')
    .eq('feature_code', featureCode)
    .single();

  if (error) {
    console.error('[subscription] getFeatureTokenCost error:', error);
    throw new Error(`Unknown feature: ${featureCode}`);
  }

  return data.tokens_per_use;
}
