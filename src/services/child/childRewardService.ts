// src/services/child/childRewardService.ts
// FEAT-013 Phase 3: Child Reward Service

import { supabase } from '../../lib/supabase';
import type {
  ChildRewardsSummary,
  RewardsCatalog,
  RedemptionHistoryItem,
  RedemptionRequestResult,
} from '../../types/child/childRewardTypes';
import { isRewardsCatalog } from '../../utils/typeGuards';

/**
 * Get rewards summary for mini card on Today.tsx
 */
export async function getChildRewardsSummary(childId: string): Promise<ChildRewardsSummary> {
  const { data, error } = await supabase.rpc('rpc_get_child_rewards_summary', {
    p_child_id: childId,
  });

  if (error) {
    console.error('getChildRewardsSummary error:', error);
    throw error;
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid rewards summary data received from API');
  }

  return data as ChildRewardsSummary;
}

/**
 * Get full rewards catalog for child
 */
export async function getChildRewardsCatalog(childId: string): Promise<RewardsCatalog> {
  const { data, error } = await supabase.rpc('rpc_get_child_rewards_catalog', {
    p_child_id: childId,
  });

  if (error) {
    console.error('getChildRewardsCatalog error:', error);
    throw error;
  }

  if (!isRewardsCatalog(data)) {
    throw new Error('Invalid rewards catalog data received from API');
  }

  return data;
}

/**
 * Request a reward redemption
 */
export async function requestRedemption(
  childId: string,
  rewardId: string
): Promise<RedemptionRequestResult> {
  const { data, error } = await supabase.rpc('rpc_request_reward_redemption', {
    p_child_id: childId,
    p_reward_id: rewardId,
  });

  if (error) {
    console.error('requestRedemption error:', error);
    return { success: false, error: error.message };
  }

  if (!data || typeof data !== 'object' || !('success' in data) || typeof data.success !== 'boolean') {
    throw new Error('Invalid redemption request response from API');
  }

  return data as RedemptionRequestResult;
}

/**
 * Cancel a pending redemption request
 */
export async function cancelRedemption(redemptionId: string): Promise<{ success: boolean }> {
  const { data, error } = await supabase.rpc('rpc_cancel_redemption_request', {
    p_redemption_id: redemptionId,
  });

  if (error) {
    console.error('cancelRedemption error:', error);
    return { success: false };
  }

  return { success: true };
}

/**
 * Get redemption history for child
 */
export async function getRedemptionHistory(
  childId: string,
  limit: number = 20
): Promise<RedemptionHistoryItem[]> {
  const { data, error } = await supabase.rpc('rpc_get_redemption_history', {
    p_child_id: childId,
    p_limit: limit,
  });

  if (error) {
    console.error('getRedemptionHistory error:', error);
    throw error;
  }

  if (!Array.isArray(data)) {
    throw new Error('Invalid redemption history data received from API');
  }

  return data as RedemptionHistoryItem[];
}