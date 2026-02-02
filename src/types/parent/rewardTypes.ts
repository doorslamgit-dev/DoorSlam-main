// src/types/parent/rewardTypes.ts
// FEAT-013: Reward Configuration Types

// ============================================================================
// Category Types
// ============================================================================

export type CategoryCode = 
  | 'screen_time' 
  | 'treats' 
  | 'activities' 
  | 'pocket_money' 
  | 'privileges' 
  | 'custom';

export interface RewardCategory {
  id: string;
  code: CategoryCode;
  name: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  templates: RewardTemplate[];
}

// ============================================================================
// Template Types
// ============================================================================

export interface RewardTemplate {
  id: string;
  name: string;
  suggested_points: number;
  display_order: number;
  is_enabled: boolean;
  child_reward_id: string | null;
  points_cost: number;
}

export interface TemplateConfig {
  categories: RewardCategory[];
  custom_rewards: CustomReward[] | null;
}

// ============================================================================
// Child Reward Types
// ============================================================================

export type LimitType = 'per_day' | 'per_week' | 'per_month' | 'unlimited';

export interface ChildReward {
  id: string;
  child_id: string;
  category_id: string;
  category_code: CategoryCode;
  category_name: string;
  template_id: string | null;
  name: string;
  emoji: string | null;
  points_cost: number;
  limit_type: LimitType | null;
  limit_count: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CustomReward {
  id: string;
  name: string;
  points_cost: number;
  is_active: boolean;
}

// ============================================================================
// Enabled Reward (for AgreedRewardsCard)
// ============================================================================

export interface EnabledReward {
  id: string;
  template_id: string;
  name: string;
  points_cost: number;
  category_code: CategoryCode;
  category_name: string;
}

// ============================================================================
// Point Configuration
// ============================================================================

export interface PointConfig {
  weighting_mode: 'auto' | 'manual';
  completion_weight: number;
  accuracy_weight: number;
  focus_weight: number;
  auto_approve_threshold: number;
}

// ============================================================================
// Redemption Types
// ============================================================================

export interface PendingRedemption {
  id: string;
  child_id: string;
  child_name: string;
  reward_id: string;
  reward_name: string;
  points_spent: number;
  requested_at: string;
  expires_at: string;
}

export interface RedemptionHistoryItem {
  id: string;
  reward_name: string;
  points_spent: number;
  status: 'approved' | 'declined' | 'cancelled' | 'expired';
  requested_at: string;
  resolved_at: string | null;
}

// ============================================================================
// Addition Request Types
// ============================================================================

export interface AdditionRequest {
  id: string;
  child_id: string;
  child_name: string;
  template_id: string;
  template_name: string;
  category_name: string;
  suggested_points: number;
  requested_at: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface RewardFormData {
  id?: string;
  category_id: string;
  template_id?: string;
  name: string;
  emoji?: string;
  points_cost: number;
  limit_type?: 'per_day' | 'per_week' | 'per_month' | 'unlimited';
  limit_count?: number;
}

// ============================================================================
// Config Response Types (from RPCs)
// ============================================================================

export interface ChildRewardConfig {
  child_id: string;
  available_points: number;
  pending_redemptions_count: number;
  point_config: PointConfig;
  categories: RewardCategory[];
  rewards: ChildReward[];
}

export interface ChildRewardsCatalog {
  points_balance: number;
  rewards: Array<{
    id: string;
    name: string;
    points_cost: number;
    category_name: string;
    can_afford: boolean;
    is_locked: boolean;
    unlock_progress: number;
  }>;
  pending_redemptions: PendingRedemption[];
}