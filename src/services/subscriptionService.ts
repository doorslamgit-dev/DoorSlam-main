// src/services/subscriptionService.ts
// Service for Stripe subscription and token operations

import { supabase } from "../lib/supabase";
import type { SubscriptionInfo, PlanLength } from "../types/subscription";

/** Default subscription info returned when the RPC is not yet available. */
const DEFAULT_STATUS: SubscriptionInfo = {
  tier: "trial",
  status: "trialing",
  trial_ends_at: null,
  has_stripe_customer: false,
  stripe_price_id: null,
  usage: { children_count: 0, subjects_count: 0, token_balance: 0 },
  limits: { max_children: 1, max_subjects: 1, can_buy_tokens: false },
};

// Cache: once we discover the RPC is missing, skip future calls in this session
let rpcUnavailable = false;

/**
 * Get full subscription status including limits and usage.
 * Calls the `rpc_get_subscription_status` Postgres function.
 * Returns defaults silently if the RPC does not exist yet (migration not applied).
 */
export async function getSubscriptionStatus(): Promise<SubscriptionInfo> {
  // Skip the network call entirely if we already know the RPC is missing
  if (rpcUnavailable) return DEFAULT_STATUS;

  const { data, error } = await supabase.rpc("rpc_get_subscription_status");

  if (error) {
    // PGRST202 = function not found (migration not applied yet)
    // Cache this so we don't fire more 404s in the browser console
    if (error.code === "PGRST202") {
      rpcUnavailable = true;
      return DEFAULT_STATUS;
    }
    console.error("[subscription] getSubscriptionStatus error:", error);
    throw new Error("Failed to get subscription status");
  }

  const result = data as Record<string, unknown>;

  if (!result.success) {
    throw new Error((result.error as string) || "Failed to get subscription status");
  }

  const usage = result.usage as Record<string, unknown>;
  const limits = result.limits as Record<string, unknown>;

  return {
    tier: result.tier as SubscriptionInfo["tier"],
    status: result.status as SubscriptionInfo["status"],
    trial_ends_at: (result.trial_ends_at as string) ?? null,
    has_stripe_customer: Boolean(result.has_stripe_customer),
    stripe_price_id: (result.stripe_price_id as string) ?? null,
    usage: {
      children_count: Number(usage.children_count ?? 0),
      subjects_count: Number(usage.subjects_count ?? 0),
      token_balance: Number(usage.token_balance ?? 0),
    },
    limits: {
      max_children: limits.max_children != null ? Number(limits.max_children) : null,
      max_subjects: limits.max_subjects != null ? Number(limits.max_subjects) : null,
      can_buy_tokens: Boolean(limits.can_buy_tokens),
    },
  };
}

/**
 * Create a Stripe Checkout session for subscription.
 * Returns the checkout URL to redirect the user to.
 */
export async function createCheckoutSession(priceId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
    body: { price_id: priceId },
  });

  if (error) {
    throw new Error(error.message || "Failed to create checkout session");
  }

  const result = data as Record<string, unknown>;

  if (result.error) {
    throw new Error((result.error as string) || "Failed to create checkout session");
  }

  return result.url as string;
}

/**
 * Open Stripe Customer Portal for billing management.
 * Returns the portal URL to redirect the user to.
 */
export async function openCustomerPortal(): Promise<string> {
  const { data, error } = await supabase.functions.invoke("stripe-customer-portal");

  if (error) {
    throw new Error(error.message || "Failed to open customer portal");
  }

  const result = data as Record<string, unknown>;

  if (result.error) {
    throw new Error((result.error as string) || "Failed to open customer portal");
  }

  return result.url as string;
}

/**
 * Change subscription tier and/or plan length.
 * Keeps billing method (monthly/upfront) locked. Ends trial immediately if trialing.
 * Plan length can only go up (1→3, 1→12, 3→12); downgrades require cancel + re-subscribe.
 */
export async function updateSubscription(
  targetTier: "family" | "premium",
  targetPlanLength?: PlanLength
): Promise<void> {
  const { data, error } = await supabase.functions.invoke("stripe-update-subscription", {
    body: {
      target_tier: targetTier,
      target_plan_length: targetPlanLength ?? null,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to update subscription");
  }

  const result = data as Record<string, unknown>;

  if (result.error) {
    throw new Error((result.error as string) || "Failed to update subscription");
  }
}

/**
 * Create a Stripe Checkout session for a token bundle purchase.
 * Returns the checkout URL to redirect the user to.
 */
export async function buyTokens(bundlePriceId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("stripe-buy-tokens", {
    body: { price_id: bundlePriceId },
  });

  if (error) {
    throw new Error(error.message || "Failed to create token checkout");
  }

  const result = data as Record<string, unknown>;

  if (result.error) {
    throw new Error((result.error as string) || "Failed to create token checkout");
  }

  return result.url as string;
}

/**
 * Get current token balance for the authenticated user.
 */
export async function getTokenBalance(): Promise<number> {
  const { data, error } = await supabase
    .from("token_balances")
    .select("balance")
    .single();

  if (error) {
    // No balance row = 0 tokens (PGRST116 = no rows)
    if (error.code === "PGRST116") return 0;
    console.error("[subscription] getTokenBalance error:", error);
    throw new Error("Failed to get token balance");
  }

  return (data as Record<string, unknown>)?.balance != null
    ? Number((data as Record<string, unknown>).balance)
    : 0;
}
