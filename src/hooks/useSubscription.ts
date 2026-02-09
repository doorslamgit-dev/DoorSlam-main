// src/hooks/useSubscription.ts
// Hook for subscription status and feature access

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus } from '../services/subscriptionService';
import type {
  SubscriptionInfo,
  SubscriptionTier
} from '../types/subscription';
import {
  canAddChild,
  canAddSubject,
  canUseVoice,
  canUseAITutorAdvice,
  canUseBenchmarks,
  canBuyTokens,
  isTrialExpired,
  getTrialDaysRemaining,
} from '../types/subscription';

interface UseSubscriptionResult {
  // Status
  loading: boolean;
  error: string | null;
  subscription: SubscriptionInfo | null;

  // Quick access
  tier: SubscriptionTier;
  isTrialing: boolean;
  isActive: boolean;
  isPastDue: boolean;
  trialDaysRemaining: number;

  // Feature access
  canAddChild: boolean;
  canAddSubject: boolean;
  canUseVoice: boolean;
  canUseAITutorAdvice: boolean;
  canUseBenchmarks: boolean;
  canBuyTokens: boolean;

  // Usage
  childrenCount: number;
  subjectsCount: number;
  tokenBalance: number;

  // Actions
  refresh: () => Promise<void>;
}

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  tier: 'trial',
  status: 'trialing',
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
    } catch (err) {
      console.error('[useSubscription] Error fetching status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
      // Use default on error so UI doesn't break
      setSubscription(DEFAULT_SUBSCRIPTION);
    } finally {
      setLoading(false);
    }
  }, [user, isParent]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Use subscription or default values
  const sub = subscription || DEFAULT_SUBSCRIPTION;

  return {
    loading,
    error,
    subscription,

    // Quick access
    tier: sub.tier,
    isTrialing: sub.status === 'trialing',
    isActive: sub.status === 'active',
    isPastDue: sub.status === 'past_due',
    trialDaysRemaining: getTrialDaysRemaining(sub),

    // Feature access
    canAddChild: canAddChild(sub),
    canAddSubject: canAddSubject(sub),
    canUseVoice: canUseVoice(sub),
    canUseAITutorAdvice: canUseAITutorAdvice(sub),
    canUseBenchmarks: canUseBenchmarks(sub),
    canBuyTokens: canBuyTokens(sub),

    // Usage
    childrenCount: sub.usage.children_count,
    subjectsCount: sub.usage.subjects_count,
    tokenBalance: sub.usage.token_balance,

    // Actions
    refresh: fetchSubscription,
  };
}
