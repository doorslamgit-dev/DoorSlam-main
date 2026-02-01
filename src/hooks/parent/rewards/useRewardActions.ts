// src/hooks/parent/rewards/useRewardActions.ts
// FEAT-013: Hook for reward actions - toggle, quick start, update, approve/decline

import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

interface UseRewardActionsResult {
  // Loading states
  togglingTemplate: string | null;
  quickStarting: boolean;
  updatingPoints: string | null;
  processingRedemption: string | null;
  processingAddition: string | null;
  
  // Actions
  toggleTemplate: (childId: string, templateId: string, currentEnabled: boolean) => Promise<boolean>;
  quickStart: (childId: string) => Promise<boolean>;
  updatePoints: (rewardId: string, points: number) => Promise<boolean>;
  approveRedemption: (redemptionId: string) => Promise<boolean>;
  declineRedemption: (redemptionId: string, reason?: string) => Promise<boolean>;
  approveAddition: (requestId: string, pointsCost?: number) => Promise<boolean>;
  declineAddition: (requestId: string, note?: string) => Promise<boolean>;
  
  // Error
  error: string | null;
  clearError: () => void;
}

export function useRewardActions(): UseRewardActionsResult {
  const [togglingTemplate, setTogglingTemplate] = useState<string | null>(null);
  const [quickStarting, setQuickStarting] = useState(false);
  const [updatingPoints, setUpdatingPoints] = useState<string | null>(null);
  const [processingRedemption, setProcessingRedemption] = useState<string | null>(null);
  const [processingAddition, setProcessingAddition] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Toggle template on/off
  const toggleTemplate = useCallback(async (
    childId: string, 
    templateId: string, 
    currentEnabled: boolean
  ): Promise<boolean> => {
    setTogglingTemplate(templateId);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('rpc_toggle_reward_template', {
          p_child_id: childId,
          p_template_id: templateId,
          p_enabled: !currentEnabled
        });

      if (rpcError) throw rpcError;
      if (!data.success) {
        setError(data.error || 'Failed to toggle reward');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to toggle template:', err);
      setError('Failed to toggle reward');
      return false;
    } finally {
      setTogglingTemplate(null);
    }
  }, []);

  // Quick start - add 30 mins screen time at 150 pts
  const quickStart = useCallback(async (childId: string): Promise<boolean> => {
    setQuickStarting(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('rpc_quick_start_rewards', { p_child_id: childId });

      if (rpcError) throw rpcError;
      if (!data.success) {
        setError(data.error || 'Quick start failed');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to quick start:', err);
      setError('Failed to set up rewards');
      return false;
    } finally {
      setQuickStarting(false);
    }
  }, []);

  // Update points for a reward
  const updatePoints = useCallback(async (rewardId: string, points: number): Promise<boolean> => {
    setUpdatingPoints(rewardId);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('rpc_update_child_reward_points', {
          p_reward_id: rewardId,
          p_points_cost: points
        });

      if (rpcError) throw rpcError;
      if (!data.success) {
        setError(data.error || 'Failed to update points');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to update points:', err);
      setError('Failed to update points');
      return false;
    } finally {
      setUpdatingPoints(null);
    }
  }, []);

  // Approve redemption
  const approveRedemption = useCallback(async (redemptionId: string): Promise<boolean> => {
    setProcessingRedemption(redemptionId);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('rpc_resolve_redemption', {
          p_redemption_id: redemptionId,
          p_status: 'approved',
          p_reason: null
        });

      if (rpcError) throw rpcError;
      if (!data.success) {
        setError(data.error || 'Failed to approve redemption');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to approve redemption:', err);
      setError('Failed to approve redemption');
      return false;
    } finally {
      setProcessingRedemption(null);
    }
  }, []);

  // Decline redemption
  const declineRedemption = useCallback(async (
    redemptionId: string, 
    reason?: string
  ): Promise<boolean> => {
    setProcessingRedemption(redemptionId);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('rpc_resolve_redemption', {
          p_redemption_id: redemptionId,
          p_status: 'declined',
          p_reason: reason || null
        });

      if (rpcError) throw rpcError;
      if (!data.success) {
        setError(data.error || 'Failed to decline redemption');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to decline redemption:', err);
      setError('Failed to decline redemption');
      return false;
    } finally {
      setProcessingRedemption(null);
    }
  }, []);

  // Approve addition request
  const approveAddition = useCallback(async (
    requestId: string, 
    pointsCost?: number
  ): Promise<boolean> => {
    setProcessingAddition(requestId);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('rpc_resolve_addition_request', {
          p_request_id: requestId,
          p_action: 'approve',
          p_parent_note: null,
          p_points_cost: pointsCost || null
        });

      if (rpcError) throw rpcError;
      if (!data.success) {
        setError(data.error || 'Failed to approve request');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to approve addition:', err);
      setError('Failed to approve addition request');
      return false;
    } finally {
      setProcessingAddition(null);
    }
  }, []);

  // Decline addition request
  const declineAddition = useCallback(async (
    requestId: string, 
    note?: string
  ): Promise<boolean> => {
    setProcessingAddition(requestId);
    setError(null);

    try {
      const { error: rpcError } = await supabase
        .rpc('rpc_resolve_addition_request', {
          p_request_id: requestId,
          p_action: 'decline',
          p_parent_note: note || null,
          p_points_cost: null
        });

      if (rpcError) throw rpcError;
      return true;
    } catch (err) {
      console.error('Failed to decline addition:', err);
      setError('Failed to decline addition request');
      return false;
    } finally {
      setProcessingAddition(null);
    }
  }, []);

  return {
    togglingTemplate,
    quickStarting,
    updatingPoints,
    processingRedemption,
    processingAddition,
    toggleTemplate,
    quickStart,
    updatePoints,
    approveRedemption,
    declineRedemption,
    approveAddition,
    declineAddition,
    error,
    clearError,
  };
}