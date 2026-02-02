// src/utils/typeGuards.ts
// Type Guards Library - Replaces unsafe type assertions across the codebase
//
// Purpose:
// This library provides runtime type validation for API responses, RPC results,
// and data structures throughout the application. Use these guards to safely
// validate data before treating it as a specific type.
//
// Usage Pattern:
//   const data = await someApiCall();
//   if (isChildRewardConfig(data)) {
//     // data is now safely typed as ChildRewardConfig
//     console.log(data.available_points);
//   }
//
// Guidelines:
// - Guards check required fields exist and have correct types
// - Optional fields are not exhaustively checked to avoid over-validation
// - Use helper functions to reduce repetition
// - All guards return type predicates for TypeScript narrowing

// ============================================================================
// Imports
// ============================================================================

import type {
  ChildRewardConfig,
  RewardCategory,
  PendingRedemption as ParentPendingRedemption,
  RedemptionHistoryItem as ParentRedemptionHistoryItem,
  PointConfig,
  ChildReward,
  CategoryCode,
  LimitType
} from '../types/parent/rewardTypes';

import type {
  RewardsCatalog,
  RewardsDashboard,
  MyReward,
  CatalogItem,
  AdditionRequest,
  PendingRedemption as ChildPendingRedemption,
  RedemptionHistoryItem as ChildRedemptionHistoryItem
} from '../types/child/childRewardTypes';

import type {
  AllInsightsData,
  InsightsSummary,
  WeeklyProgress,
  SessionsSummary,
  ConfidenceSummary,
  FocusModeSummary,
  StreakSummary,
  DateRangeBoundary,
  DayProgress,
  BestWorstDay,
  FocusModeComparison,
  SubjectBalanceData,
  ConfidenceHeatmap,
  ConfidenceTrend,
  TopTopicsData
} from '../types/parent/insightsDashboardTypes';

import type {
  AddSubjectsResult,
  ImpactAssessment,
  SubjectForPrioritization,
  SubjectWithTopics
} from '../services/addSubjectService';

import type {
  ExamType,
  Goal,
  NeedCluster,
  Subject,
  JcqArea
} from '../services/referenceData/referenceDataService';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks if value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Checks if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Checks if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard that checks if an object has a specific property
 */
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

/**
 * Checks if value is a string or null
 */
export function isStringOrNull(value: unknown): value is string | null {
  return value === null || isString(value);
}

/**
 * Checks if value is a number or null
 */
export function isNumberOrNull(value: unknown): value is number | null {
  return value === null || isNumber(value);
}

// ============================================================================
// Generic RPC Result Guards
// ============================================================================

/**
 * Validates basic success result shape
 */
export function isSuccessResult(data: unknown): data is { success: boolean } {
  return isObject(data) && hasProperty(data, 'success') && isBoolean(data.success);
}

/**
 * Validates error result shape
 */
export function isErrorResult(data: unknown): data is { error?: string } {
  if (!isObject(data)) return false;
  if (!hasProperty(data, 'error')) return true;
  return isStringOrNull(data.error);
}

// ============================================================================
// Reward System Type Guards (PRIORITY 1 - CRITICAL)
// ============================================================================

/**
 * Validates CategoryCode literal type
 */
export function isCategoryCode(value: unknown): value is CategoryCode {
  return (
    isString(value) &&
    ['screen_time', 'treats', 'activities', 'pocket_money', 'privileges', 'custom'].includes(value)
  );
}

/**
 * Validates LimitType literal type
 */
export function isLimitType(value: unknown): value is LimitType {
  return (
    isString(value) &&
    ['per_day', 'per_week', 'per_month', 'unlimited'].includes(value)
  );
}

/**
 * Validates PointConfig structure
 */
export function isPointConfig(data: unknown): data is PointConfig {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'weighting_mode') &&
    (data.weighting_mode === 'auto' || data.weighting_mode === 'manual') &&
    hasProperty(data, 'completion_weight') && isNumber(data.completion_weight) &&
    hasProperty(data, 'accuracy_weight') && isNumber(data.accuracy_weight) &&
    hasProperty(data, 'focus_weight') && isNumber(data.focus_weight) &&
    hasProperty(data, 'auto_approve_threshold') && isNumber(data.auto_approve_threshold)
  );
}

/**
 * Validates RewardCategory structure
 */
export function isRewardCategory(data: unknown): data is RewardCategory {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'code') && isCategoryCode(data.code) &&
    hasProperty(data, 'name') && isString(data.name) &&
    hasProperty(data, 'icon') && isString(data.icon) &&
    hasProperty(data, 'display_order') && isNumber(data.display_order) &&
    hasProperty(data, 'is_active') && isBoolean(data.is_active) &&
    hasProperty(data, 'templates') && isArray(data.templates)
  );
}

/**
 * Validates ChildReward structure
 */
export function isChildReward(data: unknown): data is ChildReward {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'child_id') && isString(data.child_id) &&
    hasProperty(data, 'category_id') && isString(data.category_id) &&
    hasProperty(data, 'category_code') && isCategoryCode(data.category_code) &&
    hasProperty(data, 'category_name') && isString(data.category_name) &&
    hasProperty(data, 'name') && isString(data.name) &&
    hasProperty(data, 'points_cost') && isNumber(data.points_cost) &&
    hasProperty(data, 'is_active') && isBoolean(data.is_active) &&
    hasProperty(data, 'created_at') && isString(data.created_at)
  );
}

/**
 * Validates ChildRewardConfig structure from parent RPC
 * Required fields: child_id, available_points, categories, rewards, point_config
 */
export function isChildRewardConfig(data: unknown): data is ChildRewardConfig {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'child_id') && isString(data.child_id) &&
    hasProperty(data, 'available_points') && isNumber(data.available_points) &&
    hasProperty(data, 'pending_redemptions_count') && isNumber(data.pending_redemptions_count) &&
    hasProperty(data, 'point_config') && isPointConfig(data.point_config) &&
    hasProperty(data, 'categories') && isArray(data.categories) &&
    hasProperty(data, 'rewards') && isArray(data.rewards)
  );
}

/**
 * Validates RewardsDashboard structure (child dashboard stats)
 */
export function isRewardsDashboard(data: unknown): data is RewardsDashboard {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'points_balance') && isNumber(data.points_balance) &&
    hasProperty(data, 'total_earned') && isNumber(data.total_earned) &&
    hasProperty(data, 'total_spent') && isNumber(data.total_spent) &&
    hasProperty(data, 'available_rewards') && isNumber(data.available_rewards) &&
    hasProperty(data, 'unlocked_count') && isNumber(data.unlocked_count) &&
    hasProperty(data, 'pending_redemptions') && isNumber(data.pending_redemptions) &&
    hasProperty(data, 'pending_additions') && isNumber(data.pending_additions) &&
    hasProperty(data, 'total_redeemed') && isNumber(data.total_redeemed)
  );
}

/**
 * Validates MyReward structure (child's reward item)
 */
export function isMyReward(data: unknown): data is MyReward {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'name') && isString(data.name) &&
    hasProperty(data, 'emoji') && isString(data.emoji) &&
    hasProperty(data, 'category_code') && isString(data.category_code) &&
    hasProperty(data, 'category_name') && isString(data.category_name) &&
    hasProperty(data, 'points_cost') && isNumber(data.points_cost) &&
    hasProperty(data, 'can_afford') && isBoolean(data.can_afford) &&
    hasProperty(data, 'times_used_in_period') && isNumber(data.times_used_in_period) &&
    hasProperty(data, 'is_available') && isBoolean(data.is_available)
  );
}

/**
 * Validates CatalogItem structure
 */
export function isCatalogItem(data: unknown): data is CatalogItem {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'name') && isString(data.name) &&
    hasProperty(data, 'suggested_points') && isNumber(data.suggested_points) &&
    hasProperty(data, 'category_code') && isString(data.category_code) &&
    hasProperty(data, 'category_name') && isString(data.category_name) &&
    hasProperty(data, 'category_icon') && isString(data.category_icon) &&
    hasProperty(data, 'is_added') && isBoolean(data.is_added) &&
    hasProperty(data, 'request_pending') && isBoolean(data.request_pending)
  );
}

/**
 * Validates AdditionRequest structure (child's request)
 */
export function isAdditionRequest(data: unknown): data is AdditionRequest {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'template_name') && isString(data.template_name) &&
    hasProperty(data, 'category_name') && isString(data.category_name) &&
    hasProperty(data, 'category_icon') && isString(data.category_icon) &&
    hasProperty(data, 'suggested_points') && isNumber(data.suggested_points) &&
    hasProperty(data, 'status') && isString(data.status) &&
    hasProperty(data, 'requested_at') && isString(data.requested_at)
  );
}

/**
 * Validates PendingRedemption structure (parent version)
 */
export function isPendingRedemption(data: unknown): data is ParentPendingRedemption {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'child_id') && isString(data.child_id) &&
    hasProperty(data, 'child_name') && isString(data.child_name) &&
    hasProperty(data, 'reward_id') && isString(data.reward_id) &&
    hasProperty(data, 'reward_name') && isString(data.reward_name) &&
    hasProperty(data, 'points_spent') && isNumber(data.points_spent) &&
    hasProperty(data, 'requested_at') && isString(data.requested_at) &&
    hasProperty(data, 'expires_at') && isString(data.expires_at)
  );
}

/**
 * Validates PendingRedemption structure (child version)
 */
export function isChildPendingRedemption(data: unknown): data is ChildPendingRedemption {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'reward_id') && isString(data.reward_id) &&
    hasProperty(data, 'reward_name') && isString(data.reward_name) &&
    hasProperty(data, 'emoji') && isString(data.emoji) &&
    hasProperty(data, 'points_cost') && isNumber(data.points_cost) &&
    hasProperty(data, 'requested_at') && isString(data.requested_at)
  );
}

/**
 * Validates RedemptionHistoryItem structure (parent version)
 */
export function isRedemptionHistoryItem(data: unknown): data is ParentRedemptionHistoryItem {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'reward_name') && isString(data.reward_name) &&
    hasProperty(data, 'points_spent') && isNumber(data.points_spent) &&
    hasProperty(data, 'status') && isString(data.status) &&
    hasProperty(data, 'requested_at') && isString(data.requested_at)
  );
}

/**
 * Validates RedemptionHistoryItem structure (child version)
 */
export function isChildRedemptionHistoryItem(data: unknown): data is ChildRedemptionHistoryItem {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'reward_name') && isString(data.reward_name) &&
    hasProperty(data, 'emoji') && isString(data.emoji) &&
    hasProperty(data, 'points_cost') && isNumber(data.points_cost) &&
    hasProperty(data, 'status') && isString(data.status) &&
    hasProperty(data, 'requested_at') && isString(data.requested_at)
  );
}

/**
 * Validates RewardsCatalog structure (child's full rewards data)
 * Required fields: dashboard, my_rewards, pending_redemptions, catalog_items, addition_requests, history
 */
export function isRewardsCatalog(data: unknown): data is RewardsCatalog {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'dashboard') && isRewardsDashboard(data.dashboard) &&
    hasProperty(data, 'my_rewards') && isArray(data.my_rewards) &&
    hasProperty(data, 'pending_redemptions') && isArray(data.pending_redemptions) &&
    hasProperty(data, 'catalog_items') && isArray(data.catalog_items) &&
    hasProperty(data, 'addition_requests') && isArray(data.addition_requests) &&
    hasProperty(data, 'history') && isArray(data.history)
  );
}

// ============================================================================
// Insights & Analytics Type Guards (PRIORITY 1 - CRITICAL)
// ============================================================================

/**
 * Validates SessionsSummary structure
 */
export function isSessionsSummary(data: unknown): data is SessionsSummary {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'planned') && isNumber(data.planned) &&
    hasProperty(data, 'completed') && isNumber(data.completed) &&
    hasProperty(data, 'skipped') && isNumber(data.skipped) &&
    hasProperty(data, 'completion_rate') && isNumber(data.completion_rate)
  );
}

/**
 * Validates ConfidenceSummary structure
 */
export function isConfidenceSummary(data: unknown): data is ConfidenceSummary {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'avg_pre') && isNumberOrNull(data.avg_pre) &&
    hasProperty(data, 'avg_post') && isNumberOrNull(data.avg_post) &&
    hasProperty(data, 'avg_change') && isNumberOrNull(data.avg_change) &&
    hasProperty(data, 'avg_change_percent') && isNumberOrNull(data.avg_change_percent)
  );
}

/**
 * Validates FocusModeSummary structure
 */
export function isFocusModeSummary(data: unknown): data is FocusModeSummary {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'total_sessions') && isNumber(data.total_sessions) &&
    hasProperty(data, 'sessions_with_focus') && isNumber(data.sessions_with_focus) &&
    hasProperty(data, 'usage_rate') && isNumber(data.usage_rate)
  );
}

/**
 * Validates StreakSummary structure
 */
export function isStreakSummary(data: unknown): data is StreakSummary {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'current') && isNumber(data.current) &&
    hasProperty(data, 'longest') && isNumber(data.longest) &&
    hasProperty(data, 'last_completed') && isStringOrNull(data.last_completed)
  );
}

/**
 * Validates DateRangeBoundary structure
 */
export function isDateRangeBoundary(data: unknown): data is DateRangeBoundary {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'type') && isString(data.type) &&
    hasProperty(data, 'start_date') && isString(data.start_date) &&
    hasProperty(data, 'end_date') && isString(data.end_date)
  );
}

/**
 * Validates InsightsSummary structure
 */
export function isInsightsSummary(data: unknown): data is InsightsSummary {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'sessions') && isSessionsSummary(data.sessions) &&
    hasProperty(data, 'confidence') && isConfidenceSummary(data.confidence) &&
    hasProperty(data, 'focus_mode') && isFocusModeSummary(data.focus_mode) &&
    hasProperty(data, 'streak') && isStreakSummary(data.streak) &&
    hasProperty(data, 'date_range') && isDateRangeBoundary(data.date_range)
  );
}

/**
 * Validates DayProgress structure
 */
export function isDayProgress(data: unknown): data is DayProgress {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'day_of_week') && isNumber(data.day_of_week) &&
    hasProperty(data, 'day_name') && isString(data.day_name) &&
    hasProperty(data, 'date') && isString(data.date) &&
    hasProperty(data, 'planned') && isNumber(data.planned) &&
    hasProperty(data, 'completed') && isNumber(data.completed)
  );
}

/**
 * Validates BestWorstDay structure
 */
export function isBestWorstDay(data: unknown): data is BestWorstDay {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'day_name') && isString(data.day_name) &&
    hasProperty(data, 'date') && isString(data.date)
  );
}

/**
 * Validates WeeklyProgress structure
 */
export function isWeeklyProgress(data: unknown): data is WeeklyProgress {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'by_day') && isArray(data.by_day) &&
    hasProperty(data, 'best_day') &&
    hasProperty(data, 'worst_day')
  );
}

/**
 * Validates FocusModeComparison structure
 */
export function isFocusModeComparison(data: unknown): data is FocusModeComparison {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'focus_on') && isObject(data.focus_on) &&
    hasProperty(data, 'focus_off') && isObject(data.focus_off)
  );
}

/**
 * Validates SubjectBalanceData structure
 */
export function isSubjectBalanceData(data: unknown): data is SubjectBalanceData {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'subjects') && isArray(data.subjects) &&
    hasProperty(data, 'total_sessions') && isNumber(data.total_sessions) &&
    hasProperty(data, 'total_minutes') && isNumber(data.total_minutes)
  );
}

/**
 * Validates ConfidenceHeatmap structure
 */
export function isConfidenceHeatmap(data: unknown): data is ConfidenceHeatmap {
  if (!isObject(data)) return false;

  return hasProperty(data, 'topics') && isArray(data.topics);
}

/**
 * Validates ConfidenceTrend structure
 */
export function isConfidenceTrend(data: unknown): data is ConfidenceTrend {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'sessions') && isArray(data.sessions) &&
    hasProperty(data, 'largest_lift') &&
    hasProperty(data, 'most_fragile')
  );
}

/**
 * Validates TopTopicsData structure
 */
export function isTopTopicsData(data: unknown): data is TopTopicsData {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'period_days') && isNumber(data.period_days) &&
    hasProperty(data, 'overall') && isObject(data.overall) &&
    hasProperty(data, 'by_subject') && isArray(data.by_subject) &&
    hasProperty(data, 'struggling_topics') && isArray(data.struggling_topics) &&
    hasProperty(data, 'improving_topics') && isArray(data.improving_topics)
  );
}

/**
 * Validates AllInsightsData structure (full insights response)
 * Required fields: summary, weekly_progress, focus_comparison, subject_balance,
 * confidence_heatmap, confidence_trend, top_topics
 */
export function isAllInsightsData(data: unknown): data is AllInsightsData {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'summary') && isInsightsSummary(data.summary) &&
    hasProperty(data, 'weekly_progress') && isWeeklyProgress(data.weekly_progress) &&
    hasProperty(data, 'focus_comparison') && isFocusModeComparison(data.focus_comparison) &&
    hasProperty(data, 'subject_balance') && isSubjectBalanceData(data.subject_balance) &&
    hasProperty(data, 'confidence_heatmap') && isConfidenceHeatmap(data.confidence_heatmap) &&
    hasProperty(data, 'confidence_trend') && isConfidenceTrend(data.confidence_trend) &&
    hasProperty(data, 'top_topics') && isTopTopicsData(data.top_topics)
  );
}

// ============================================================================
// Subject & Onboarding Type Guards (PRIORITY 2 - HIGH)
// ============================================================================

/**
 * Validates SubjectWithTopics structure
 */
export function isSubjectWithTopics(data: unknown): data is SubjectWithTopics {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'subject_id') && isString(data.subject_id) &&
    hasProperty(data, 'subject_name') && isString(data.subject_name) &&
    hasProperty(data, 'topic_count') && isNumber(data.topic_count) &&
    hasProperty(data, 'icon') && isString(data.icon) &&
    hasProperty(data, 'color') && isString(data.color)
  );
}

/**
 * Validates ImpactAssessment structure
 */
export function isImpactAssessment(data: unknown): data is ImpactAssessment {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'child_id') && isString(data.child_id) &&
    hasProperty(data, 'current_weekly_sessions') && isNumber(data.current_weekly_sessions) &&
    hasProperty(data, 'weeks_in_plan') && isNumber(data.weeks_in_plan) &&
    hasProperty(data, 'total_available_sessions') && isNumber(data.total_available_sessions) &&
    hasProperty(data, 'existing_subjects') && isArray(data.existing_subjects) &&
    hasProperty(data, 'existing_subject_count') && isNumber(data.existing_subject_count) &&
    hasProperty(data, 'existing_topic_count') && isNumber(data.existing_topic_count) &&
    hasProperty(data, 'new_subjects') && isArray(data.new_subjects) &&
    hasProperty(data, 'new_subject_count') && isNumber(data.new_subject_count) &&
    hasProperty(data, 'new_topic_count') && isNumber(data.new_topic_count) &&
    hasProperty(data, 'total_topics') && isNumber(data.total_topics) &&
    hasProperty(data, 'sessions_per_topic') && isNumber(data.sessions_per_topic) &&
    hasProperty(data, 'coverage_percent') && isNumber(data.coverage_percent) &&
    hasProperty(data, 'recommendation') && isString(data.recommendation) &&
    hasProperty(data, 'recommendation_detail') && isString(data.recommendation_detail) &&
    hasProperty(data, 'additional_sessions_needed') && isNumber(data.additional_sessions_needed)
  );
}

/**
 * Validates SubjectForPrioritization structure
 */
export function isSubjectForPrioritization(data: unknown): data is SubjectForPrioritization {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'subject_id') && isString(data.subject_id) &&
    hasProperty(data, 'subject_name') && isString(data.subject_name) &&
    hasProperty(data, 'exam_board_name') && isString(data.exam_board_name) &&
    hasProperty(data, 'sort_order') && isNumber(data.sort_order) &&
    hasProperty(data, 'grade_confidence') && isString(data.grade_confidence) &&
    hasProperty(data, 'grade_gap') && isNumber(data.grade_gap) &&
    hasProperty(data, 'topic_count') && isNumber(data.topic_count) &&
    hasProperty(data, 'topics_covered') && isNumber(data.topics_covered) &&
    hasProperty(data, 'icon') && isString(data.icon) &&
    hasProperty(data, 'color') && isString(data.color)
  );
}

/**
 * Validates AddSubjectsResult structure
 */
export function isAddSubjectsResult(data: unknown): data is AddSubjectsResult {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'success') && isBoolean(data.success)
  );
}

// ============================================================================
// Reference Data Type Guards (PRIORITY 2 - HIGH)
// ============================================================================

/**
 * Validates JcqArea literal type
 */
export function isJcqArea(value: unknown): value is JcqArea {
  return (
    isString(value) &&
    [
      'cognition_learning',
      'communication_interaction',
      'sensory_physical',
      'semh',
      'study_skills'
    ].includes(value)
  );
}

/**
 * Validates ExamType structure
 */
export function isExamType(data: unknown): data is ExamType {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'name') && isString(data.name) &&
    hasProperty(data, 'code') && isString(data.code) &&
    hasProperty(data, 'sort_order') && isNumber(data.sort_order)
  );
}

/**
 * Validates Goal structure
 */
export function isGoal(data: unknown): data is Goal {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'id') && isString(data.id) &&
    hasProperty(data, 'code') && isString(data.code) &&
    hasProperty(data, 'name') && isString(data.name) &&
    hasProperty(data, 'sort_order') && isNumber(data.sort_order)
  );
}

/**
 * Validates NeedCluster structure
 */
export function isNeedCluster(data: unknown): data is NeedCluster {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'code') && isString(data.code) &&
    hasProperty(data, 'name') && isString(data.name) &&
    hasProperty(data, 'typically_has_accommodations') && isBoolean(data.typically_has_accommodations)
  );
}

/**
 * Validates Subject structure
 */
export function isSubject(data: unknown): data is Subject {
  if (!isObject(data)) return false;

  return (
    hasProperty(data, 'subject_id') && isString(data.subject_id) &&
    hasProperty(data, 'subject_name') && isString(data.subject_name) &&
    hasProperty(data, 'exam_type_id') && isString(data.exam_type_id) &&
    hasProperty(data, 'exam_board_id') && isString(data.exam_board_id) &&
    hasProperty(data, 'exam_board_name') && isString(data.exam_board_name) &&
    hasProperty(data, 'subject_code') && isString(data.subject_code) &&
    hasProperty(data, 'icon') && isString(data.icon) &&
    hasProperty(data, 'color') && isString(data.color)
  );
}

// ============================================================================
// Array Type Guards
// ============================================================================

/**
 * Validates array of ExamTypes
 */
export function isExamTypeArray(data: unknown): data is ExamType[] {
  return isArray(data) && data.every(isExamType);
}

/**
 * Validates array of Goals
 */
export function isGoalArray(data: unknown): data is Goal[] {
  return isArray(data) && data.every(isGoal);
}

/**
 * Validates array of NeedClusters
 */
export function isNeedClusterArray(data: unknown): data is NeedCluster[] {
  return isArray(data) && data.every(isNeedCluster);
}

/**
 * Validates array of Subjects
 */
export function isSubjectArray(data: unknown): data is Subject[] {
  return isArray(data) && data.every(isSubject);
}

/**
 * Validates array of SubjectsForPrioritization
 */
export function isSubjectForPrioritizationArray(data: unknown): data is SubjectForPrioritization[] {
  return isArray(data) && data.every(isSubjectForPrioritization);
}
