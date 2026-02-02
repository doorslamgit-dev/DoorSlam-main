// src/services/parent/rewardService.ts
// FEAT-013: Reward Configuration & Redemption

import { supabase } from '../../lib/supabase';
import type {
  ChildRewardConfig,
  ChildRewardsCatalog,
  PointConfig,
  RewardFormData,
  PendingRedemption,
  RedemptionHistoryItem,
} from '../../types/parent/rewardTypes';
import { isChildRewardConfig } from '../../utils/typeGuards';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Get full reward configuration for a child (parent view)
 */
export async function getChildRewardConfig(childId: string): Promise<ChildRewardConfig> {
  const { data, error } = await supabase.rpc('rpc_get_child_reward_config', {
    p_child_id: childId,
  });

  if (error) throw error;
  if (!isChildRewardConfig(data)) {
    throw new Error('Invalid reward config data received from API');
  }
  return data;
}

/**
 * Save point weighting configuration
 */
export async function savePointConfig(
  childId: string,
  config: PointConfig
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('rpc_save_point_config', {
    p_child_id: childId,
    p_mode: config.mode,
    p_completion_weight: config.completion_weight,
    p_accuracy_weight: config.accuracy_weight,
    p_focus_weight: config.focus_weight,
    p_auto_approve_threshold: config.auto_approve_threshold,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object' || !('success' in data) || typeof data.success !== 'boolean') {
    throw new Error('Invalid point config save response from API');
  }
  return data as { success: boolean; error?: string };
}

/**
 * Add or update a single reward
 */
export async function upsertReward(
  childId: string,
  reward: RewardFormData
): Promise<{ success: boolean; reward_id?: string; error?: string }> {
  const { data, error } = await supabase.rpc('rpc_upsert_child_reward', {
    p_child_id: childId,
    p_reward_id: reward.id || null,
    p_category_id: reward.category_id,
    p_template_id: reward.template_id || null,
    p_name: reward.name,
    p_points_cost: reward.points_cost,
    p_emoji: reward.emoji || null,
    p_limit_type: reward.limit_type || null,
    p_limit_count: reward.limit_count || null,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object' || !('success' in data) || typeof data.success !== 'boolean') {
    throw new Error('Invalid reward upsert response from API');
  }
  return data as { success: boolean; reward_id?: string; error?: string };
}

/**
 * Remove (deactivate) a reward
 */
export async function removeReward(
  rewardId: string
): Promise<{ success: boolean; declined_redemptions?: number }> {
  const { data, error } = await supabase.rpc('rpc_remove_child_reward', {
    p_reward_id: rewardId,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object' || !('success' in data) || typeof data.success !== 'boolean') {
    throw new Error('Invalid reward removal response from API');
  }
  return data as { success: boolean; declined_redemptions?: number };
}

/**
 * Toggle reward active status
 */
export async function toggleReward(
  rewardId: string,
  isActive: boolean
): Promise<{ success: boolean; is_active?: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('rpc_toggle_child_reward', {
    p_reward_id: rewardId,
    p_is_active: isActive,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object' || !('success' in data) || typeof data.success !== 'boolean') {
    throw new Error('Invalid reward toggle response from API');
  }
  return data as { success: boolean; is_active?: boolean; error?: string };
}

/**
 * Quick start - adds 30 mins screen time at 150 pts with auto-approve
 */
export async function quickStartRewards(
  childId: string
): Promise<{ success: boolean; reward_id?: string; auto_approve_threshold?: number; error?: string }> {
  const { data, error } = await supabase.rpc('rpc_quick_start_rewards', {
    p_child_id: childId,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object' || !('success' in data) || typeof data.success !== 'boolean') {
    throw new Error('Invalid quick start rewards response from API');
  }
  return data as { success: boolean; reward_id?: string; auto_approve_threshold?: number; error?: string };
}

/**
 * Bulk enable rewards from templates
 */
export async function enableTemplateRewards(
  childId: string,
  templateIds: string[],
  pointOverrides: Record<string, number> = {}
): Promise<{ success: boolean; rewards_created?: number }> {
  const { data, error } = await supabase.rpc('rpc_enable_template_rewards', {
    p_child_id: childId,
    p_template_ids: templateIds,
    p_point_overrides: pointOverrides,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object' || !('success' in data) || typeof data.success !== 'boolean') {
    throw new Error('Invalid enable template rewards response from API');
  }
  return data as { success: boolean; rewards_created?: number };
}

// ============================================================================
// REDEMPTIONS (PARENT)
// ============================================================================

/**
 * Get pending redemptions for all children (parent view)
 */
export async function getPendingRedemptions(
  parentId: string
): Promise<PendingRedemption[]> {
  const { data, error } = await supabase.rpc('rpc_get_pending_redemptions', {
    p_parent_id: parentId,
  });

  if (error) throw error;
  if (!Array.isArray(data)) {
    throw new Error('Invalid pending redemptions data received from API');
  }
  return data as PendingRedemption[];
}

/**
 * Approve or decline a redemption request
 */
export async function resolveRedemption(
  redemptionId: string,
  status: 'approved' | 'declined',
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('rpc_resolve_redemption', {
    p_redemption_id: redemptionId,
    p_status: status,
    p_reason: reason || null,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object' || !('success' in data) || typeof data.success !== 'boolean') {
    throw new Error('Invalid resolve redemption response from API');
  }
  return data as { success: boolean; error?: string };
}

// ============================================================================
// REDEMPTIONS (CHILD)
// ============================================================================

/**
 * Get rewards catalog for a child (child view)
 */
export async function getChildRewardsCatalog(
  childId: string
): Promise<ChildRewardsCatalog> {
  const { data, error } = await supabase.rpc('rpc_get_child_rewards_catalog', {
    p_child_id: childId,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid rewards catalog data received from API');
  }
  return data as ChildRewardsCatalog;
}

/**
 * Request a redemption (child action)
 */
export async function requestRedemption(
  childId: string,
  rewardId: string
): Promise<{
  success: boolean;
  redemption_id?: string;
  status?: string;
  auto_approved?: boolean;
  error?: string;
}> {
  const { data, error } = await supabase.rpc('rpc_request_redemption', {
    p_child_id: childId,
    p_reward_id: rewardId,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object' || !('success' in data) || typeof data.success !== 'boolean') {
    throw new Error('Invalid request redemption response from API');
  }
  return data as {
    success: boolean;
    redemption_id?: string;
    status?: string;
    auto_approved?: boolean;
    error?: string;
  };
}

/**
 * Cancel a pending redemption (child action)
 */
export async function cancelRedemption(
  childId: string,
  redemptionId: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('rpc_cancel_redemption', {
    p_child_id: childId,
    p_redemption_id: redemptionId,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object' || !('success' in data) || typeof data.success !== 'boolean') {
    throw new Error('Invalid cancel redemption response from API');
  }
  return data as { success: boolean; error?: string };
}

/**
 * Get redemption history for a child
 */
export async function getRedemptionHistory(
  childId: string,
  limit: number = 20
): Promise<RedemptionHistoryItem[]> {
  const { data, error } = await supabase.rpc('rpc_get_redemption_history', {
    p_child_id: childId,
    p_limit: limit,
  });

  if (error) throw error;
  if (!Array.isArray(data)) {
    throw new Error('Invalid redemption history data received from API');
  }
  return data as RedemptionHistoryItem[];
}