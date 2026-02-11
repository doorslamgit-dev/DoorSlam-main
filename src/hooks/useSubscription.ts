// src/hooks/useSubscription.ts
// Hook for subscription status, feature gates, and usage

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSubscriptionStatus } from "../services/subscriptionService";
import type { SubscriptionInfo, SubscriptionTier } from "../types/subscription";
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
} from "../types/subscription";

interface UseSubscriptionResult {
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

  childrenCount: number;
  subjectsCount: number;
  tokenBalance: number;

  refresh: () => Promise<void>;
}

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  tier: "trial",
  status: "trialing",
  trial_ends_at: null,
  has_stripe_customer: false,
  usage: {
    children_count: 0,
    subjects_count: 0,
    token_balance: 0,
  },
  limits: {
    max_children: 1,
    max_subjects: 1,
    can_buy_tokens: false,
  },
};

export function useSubscription(): UseSubscriptionResult {
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
      console.warn("[useSubscription] Error fetching status:", err);
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

  return {
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

    childrenCount: sub.usage.children_count,
    subjectsCount: sub.usage.subjects_count,
    tokenBalance: sub.usage.token_balance,

    refresh: fetchSubscription,
  };
}
