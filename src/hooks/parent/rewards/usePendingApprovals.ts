// src/hooks/parent/rewards/usePendingApprovals.ts
// FEAT-013: Hook for fetching pending redemptions and addition requests

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { PendingRedemption, AdditionRequest } from '../../../types/parent/rewardTypes';

interface UsePendingApprovalsResult {
  redemptions: PendingRedemption[];
  additions: AdditionRequest[];
  totalPending: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  removeRedemption: (id: string) => void;
  removeAddition: (id: string) => void;
}

export function usePendingApprovals(): UsePendingApprovalsResult {
  const [redemptions, setRedemptions] = useState<PendingRedemption[]>([]);
  const [additions, setAdditions] = useState<AdditionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch redemptions
      const { data: redemptionData, error: redemptionError } = await supabase
        .rpc('rpc_get_pending_redemptions', { p_parent_id: user.id });

      if (redemptionError) throw redemptionError;
      setRedemptions((redemptionData || []) as PendingRedemption[]);

      // Fetch addition requests
      const { data: additionData, error: additionError } = await supabase
        .rpc('rpc_get_pending_addition_requests', { p_parent_id: user.id });

      if (additionError) throw additionError;
      setAdditions((additionData || []) as AdditionRequest[]);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
      setError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // Optimistic removal helpers
  const removeRedemption = useCallback((id: string) => {
    setRedemptions(prev => prev.filter(r => r.id !== id));
  }, []);

  const removeAddition = useCallback((id: string) => {
    setAdditions(prev => prev.filter(a => a.id !== id));
  }, []);

  const totalPending = redemptions.length + additions.length;

  return {
    redemptions,
    additions,
    totalPending,
    loading,
    error,
    refresh: fetchPending,
    removeRedemption,
    removeAddition,
  };
}