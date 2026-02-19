// src/contexts/SubscriptionContext.tsx
// Shared subscription state — all components read from the same context.
// When refresh() is called anywhere, every consumer updates.

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getSubscriptionStatus } from "../services/subscriptionService";
import type { SubscriptionInfo, SubscriptionTier, PlanLength, BillingMethod } from "../types/subscription";
import {
  canAddChild,
  canAddSubject,
  canUseVoice,
  canUseAITutor,
  canCreateMnemonics,
  canUseAdvancedAnalytics,
  canUseBenchmarks,
  canBuyTokens,
  getTrialDaysRemaining,
  getPlanLength,
  getBillingMethod,
} from "../types/subscription";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubscriptionContextValue {
  loading: boolean;
  error: string | null;
  subscription: SubscriptionInfo | null;

  tier: SubscriptionTier;
  isTrialing: boolean;
  isActive: boolean;
  isPastDue: boolean;
  trialDaysRemaining: number;

  canAddChild: boolean;
  canAddSubject: boolean;
  canUseVoice: boolean;
  canUseAITutor: boolean;
  canCreateMnemonics: boolean;
  canUseAdvancedAnalytics: boolean;
  canUseBenchmarks: boolean;
  canBuyTokens: boolean;

  hasStripeCustomer: boolean;
  currentPriceId: string | null;
  planLength: PlanLength | null;
  billingMethod: BillingMethod | null;

  childrenCount: number;
  subjectsCount: number;
  tokenBalance: number;

  refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  tier: "trial",
  status: "trialing",
  trial_ends_at: null,
  has_stripe_customer: false,
  stripe_price_id: null,
  usage: { children_count: 0, subjects_count: 0, token_balance: 0 },
  limits: { max_children: 1, max_subjects: 1, can_buy_tokens: false },
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isParent } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user || !isParent) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const status = await getSubscriptionStatus();
      setSubscription(status);
    } catch (err: unknown) {
      console.warn("[SubscriptionContext] Error fetching status:", err);
      setError(err instanceof Error ? err.message : String(err));
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setLoading(false);
    }
  }, [user, isParent]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const sub = subscription ?? DEFAULT_SUBSCRIPTION;

  const value: SubscriptionContextValue = {
    loading,
    error,
    subscription,

    tier: sub.tier,
    isTrialing: sub.status === "trialing",
    isActive: sub.status === "active",
    isPastDue: sub.status === "past_due",
    trialDaysRemaining: getTrialDaysRemaining(sub),

    canAddChild: canAddChild(sub),
    canAddSubject: canAddSubject(sub),
    canUseVoice: canUseVoice(sub),
    canUseAITutor: canUseAITutor(sub),
    canCreateMnemonics: canCreateMnemonics(sub),
    canUseAdvancedAnalytics: canUseAdvancedAnalytics(sub),
    canUseBenchmarks: canUseBenchmarks(sub),
    canBuyTokens: canBuyTokens(sub),

    hasStripeCustomer: sub.has_stripe_customer,
    currentPriceId: sub.stripe_price_id,
    planLength: getPlanLength(sub.stripe_price_id),
    billingMethod: getBillingMethod(sub.stripe_price_id),

    childrenCount: sub.usage.children_count,
    subjectsCount: sub.usage.subjects_count,
    tokenBalance: sub.usage.token_balance,

    refresh: fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSubscriptionContext(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptionContext must be used within a SubscriptionProvider");
  }
  return context;
}
