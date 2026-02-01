// src/types/child/childRewardTypes.ts
// FEAT-013 Phase 3b: Enhanced child rewards types

// Dashboard stats (hero card)
export interface RewardsDashboard {
  points_balance: number;
  total_earned: number;
  total_spent: number;
  available_rewards: number;
  unlocked_count: number;
  pending_redemptions: number;
  pending_additions: number;
  total_redeemed: number;
}

// Catalog item (from reward_templates)
export interface CatalogItem {
  id: string;
  name: string;
  suggested_points: number;
  category_code: string;
  category_name: string;
  category_icon: string;
  is_added: boolean;           // Already in child's rewards
  child_reward_id: string | null;
  request_pending: boolean;     // Pending addition request
  pending_request_id: string | null;
}

// My reward (from child_rewards)
export interface MyReward {
  id: string;
  name: string;
  emoji: string;
  category_code: string;
  category_name: string;
  points_cost: number;
  can_afford: boolean;
  limit_type: string | null;
  limit_count: number | null;
  times_used_in_period: number;
  is_available: boolean;
}

// Pending redemption request
export interface PendingRedemption {
  id: string;
  reward_id: string;
  reward_name: string;
  emoji: string;
  points_cost: number;
  requested_at: string;
}

// Addition request (child asked parent to add)
export interface AdditionRequest {
  id: string;
  template_name: string;
  category_name: string;
  category_icon: string;
  suggested_points: number;
  status: 'pending' | 'approved' | 'declined';
  requested_at: string;
  resolved_at: string | null;
  parent_note: string | null;
}

// Redemption history item
export interface RedemptionHistoryItem {
  id: string;
  reward_name: string;
  emoji: string;
  points_cost: number;
  status: 'pending' | 'approved' | 'declined' | 'cancelled' | 'expired';
  requested_at: string;
  resolved_at: string | null;
}

// API response types
export interface RequestAdditionResult {
  success: boolean;
  request_id?: string;
  error?: string;
}

export interface RequestRedemptionResult {
  success: boolean;
  redemption_id?: string;
  auto_approved?: boolean;
  error?: string;
}