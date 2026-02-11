// src/types/subscription.ts
// Subscription tiers, pricing, and feature gate helpers for Stripe integration

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type SubscriptionTier = "trial" | "family" | "premium" | "expired";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export interface SubscriptionLimits {
  max_children: number | null; // null = unlimited
  max_subjects: number | null; // null = unlimited
  can_buy_tokens: boolean;
}

export interface SubscriptionUsage {
  children_count: number;
  subjects_count: number;
  token_balance: number;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  has_stripe_customer: boolean;
  usage: SubscriptionUsage;
  limits: SubscriptionLimits;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TRIAL_DAYS = 14;

// ---------------------------------------------------------------------------
// Feature gate helpers
// ---------------------------------------------------------------------------

/** Can the user add another child? (Trial: 1, Family/Premium: unlimited) */
export function canAddChild(info: SubscriptionInfo): boolean {
  if (info.limits.max_children === null) return true;
  return info.usage.children_count < info.limits.max_children;
}

/** Can the user add another subject? (Trial: 1, Family/Premium: unlimited) */
export function canAddSubject(info: SubscriptionInfo): boolean {
  if (info.limits.max_subjects === null) return true;
  return info.usage.subjects_count < info.limits.max_subjects;
}

/** Voice AI — Study Buddy + AI Tutor voice mode. Premium only. */
export function canUseVoice(info: SubscriptionInfo): boolean {
  return info.tier === "premium";
}

/** Text-based AI Tutor advice for parents. Family + Premium. */
export function canUseAITutor(info: SubscriptionInfo): boolean {
  return info.tier === "family" || info.tier === "premium";
}

/** Children can create custom AI-generated mnemonics. Premium only. */
export function canCreateMnemonics(info: SubscriptionInfo): boolean {
  return info.tier === "premium";
}

/** Advanced analytics (trends, predictions, exam readiness). Premium only. */
export function canUseAdvancedAnalytics(info: SubscriptionInfo): boolean {
  return info.tier === "premium";
}

/** Benchmark comparisons. Premium only. */
export function canUseBenchmarks(info: SubscriptionInfo): boolean {
  return info.tier === "premium";
}

/** Token top-up purchases. Premium only. */
export function canBuyTokens(info: SubscriptionInfo): boolean {
  return info.tier === "premium";
}

/** Is the user's trial expired? */
export function isTrialExpired(info: SubscriptionInfo): boolean {
  if (info.tier !== "trial") return false;
  if (!info.trial_ends_at) return false;
  return new Date(info.trial_ends_at) < new Date();
}

/** Days remaining on trial (0 if expired or not on trial). */
export function getTrialDaysRemaining(info: SubscriptionInfo): number {
  if (info.tier !== "trial" || !info.trial_ends_at) return 0;
  const diff = new Date(info.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export type PriceDuration = "monthly" | "quarterly" | "annual";

export interface PriceOption {
  duration: PriceDuration;
  label: string;
  monthlyRate: number;
  total: number;
  stripePriceId: string;
  savings?: string;
}

export interface AnnualUpfrontPrice {
  total: number;
  stripePriceId: string;
  savings: string;
}

export const FAMILY_PRICES: PriceOption[] = [
  { duration: "monthly", label: "Monthly", monthlyRate: 14.99, total: 14.99, stripePriceId: "" },
  { duration: "quarterly", label: "Quarterly", monthlyRate: 11.99, total: 35.97, stripePriceId: "", savings: "Save 20%" },
  { duration: "annual", label: "Annual", monthlyRate: 6.99, total: 83.88, stripePriceId: "", savings: "Save 53%" },
];

export const FAMILY_ANNUAL_UPFRONT: AnnualUpfrontPrice = {
  total: 59.99,
  stripePriceId: "",
  savings: "Save 67%",
};

export const PREMIUM_PRICES: PriceOption[] = [
  { duration: "monthly", label: "Monthly", monthlyRate: 19.99, total: 19.99, stripePriceId: "" },
  { duration: "quarterly", label: "Quarterly", monthlyRate: 16.99, total: 50.97, stripePriceId: "", savings: "Save 15%" },
  { duration: "annual", label: "Annual", monthlyRate: 11.99, total: 143.88, stripePriceId: "", savings: "Save 40%" },
];

export const PREMIUM_ANNUAL_UPFRONT: AnnualUpfrontPrice = {
  total: 99.99,
  stripePriceId: "",
  savings: "Save 58%",
};

// ---------------------------------------------------------------------------
// Token bundles (Premium only)
// ---------------------------------------------------------------------------

export interface TokenBundle {
  tokens: number;
  price: number;
  stripePriceId: string;
}

export const TOKEN_BUNDLES: TokenBundle[] = [
  { tokens: 500, price: 4.99, stripePriceId: "" },
  { tokens: 1000, price: 8.99, stripePriceId: "" },
  { tokens: 2500, price: 19.99, stripePriceId: "" },
];
