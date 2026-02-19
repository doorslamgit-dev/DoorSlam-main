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
  stripe_price_id: string | null;
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
// Plan length + billing method model
// ---------------------------------------------------------------------------

/** How long the subscription commitment is */
export type PlanLength = "1_month" | "3_months" | "12_months";

/** How the subscriber pays for the commitment */
export type BillingMethod = "monthly" | "upfront";

// ---------------------------------------------------------------------------
// Pricing constants
// ---------------------------------------------------------------------------

export interface PriceOption {
  planLength: PlanLength;
  label: string;
  monthlyRate: number;
  total: number;
  stripePriceId: string;
  savings?: string;
}

export interface UpfrontPrice {
  planLength: PlanLength;
  total: number;
  stripePriceId: string;
  savings: string;
}

// Family tier — monthly-billed prices
export const FAMILY_PRICES: PriceOption[] = [
  { planLength: "1_month", label: "1 Month", monthlyRate: 14.99, total: 14.99, stripePriceId: "price_1T2DyT9ekvh9y28oKGFQPH9W" },
  { planLength: "3_months", label: "3 Months", monthlyRate: 11.99, total: 35.97, stripePriceId: "price_1T2Dyd9ekvh9y28oaxxH7Ob2", savings: "Save 20%" },
  { planLength: "12_months", label: "12 Months", monthlyRate: 6.99, total: 83.88, stripePriceId: "price_1T2Dyg9ekvh9y28otXEF5rPV", savings: "Save 53%" },
];

// Family tier — upfront prices
export const FAMILY_UPFRONT: UpfrontPrice[] = [
  { planLength: "3_months", total: 29.99, stripePriceId: "price_1T2ZIT9ekvh9y28o5Sm9Ee4i", savings: "Save 33%" },
  { planLength: "12_months", total: 59.99, stripePriceId: "price_1T2Dyj9ekvh9y28oZsY9pb82", savings: "Save 67%" },
];

// Premium tier — monthly-billed prices
export const PREMIUM_PRICES: PriceOption[] = [
  { planLength: "1_month", label: "1 Month", monthlyRate: 19.99, total: 19.99, stripePriceId: "price_1T2Dys9ekvh9y28obsL45Hsr" },
  { planLength: "3_months", label: "3 Months", monthlyRate: 16.99, total: 50.97, stripePriceId: "price_1T2Dyv9ekvh9y28oY93U11ig", savings: "Save 15%" },
  { planLength: "12_months", label: "12 Months", monthlyRate: 11.99, total: 143.88, stripePriceId: "price_1T2Dyz9ekvh9y28o0t3ZNGg6", savings: "Save 40%" },
];

// Premium tier — upfront prices
export const PREMIUM_UPFRONT: UpfrontPrice[] = [
  { planLength: "3_months", total: 39.99, stripePriceId: "price_1T2ZIb9ekvh9y28oNbr6xSdl", savings: "Save 33%" },
  { planLength: "12_months", total: 99.99, stripePriceId: "price_1T2Dz29ekvh9y28oH88qdIkh", savings: "Save 58%" },
];

// ---------------------------------------------------------------------------
// Token bundles (Premium only)
// ---------------------------------------------------------------------------

export interface TokenBundle {
  tokens: number;
  price: number;
  stripePriceId: string;
}

export const TOKEN_BUNDLES: TokenBundle[] = [
  { tokens: 500, price: 4.99, stripePriceId: "price_1T2DzD9ekvh9y28oaPcJXIKZ" },
  { tokens: 1000, price: 8.99, stripePriceId: "price_1T2DzG9ekvh9y28oryXFrp0I" },
  { tokens: 2500, price: 19.99, stripePriceId: "price_1T2DzJ9ekvh9y28otSuF4i2u" },
];

// ---------------------------------------------------------------------------
// Price ↔ (tier, planLength, billingMethod) mapping
// ---------------------------------------------------------------------------

export interface PriceMapping {
  tier: "family" | "premium";
  planLength: PlanLength;
  billingMethod: BillingMethod;
}

/** Forward lookup: Stripe price ID → product dimensions */
const PRICE_ID_MAP: Record<string, PriceMapping> = {
  // Family
  "price_1T2DyT9ekvh9y28oKGFQPH9W": { tier: "family", planLength: "1_month", billingMethod: "monthly" },
  "price_1T2Dyd9ekvh9y28oaxxH7Ob2": { tier: "family", planLength: "3_months", billingMethod: "monthly" },
  "price_1T2ZIT9ekvh9y28o5Sm9Ee4i": { tier: "family", planLength: "3_months", billingMethod: "upfront" },
  "price_1T2Dyg9ekvh9y28otXEF5rPV": { tier: "family", planLength: "12_months", billingMethod: "monthly" },
  "price_1T2Dyj9ekvh9y28oZsY9pb82": { tier: "family", planLength: "12_months", billingMethod: "upfront" },
  // Premium
  "price_1T2Dys9ekvh9y28obsL45Hsr": { tier: "premium", planLength: "1_month", billingMethod: "monthly" },
  "price_1T2Dyv9ekvh9y28oY93U11ig": { tier: "premium", planLength: "3_months", billingMethod: "monthly" },
  "price_1T2ZIb9ekvh9y28oNbr6xSdl": { tier: "premium", planLength: "3_months", billingMethod: "upfront" },
  "price_1T2Dyz9ekvh9y28o0t3ZNGg6": { tier: "premium", planLength: "12_months", billingMethod: "monthly" },
  "price_1T2Dz29ekvh9y28oH88qdIkh": { tier: "premium", planLength: "12_months", billingMethod: "upfront" },
};

/** Reverse lookup: (tier:planLength:billingMethod) → Stripe price ID */
const PRICE_LOOKUP: Record<string, string> = {
  "family:1_month:monthly": "price_1T2DyT9ekvh9y28oKGFQPH9W",
  "family:3_months:monthly": "price_1T2Dyd9ekvh9y28oaxxH7Ob2",
  "family:3_months:upfront": "price_1T2ZIT9ekvh9y28o5Sm9Ee4i",
  "family:12_months:monthly": "price_1T2Dyg9ekvh9y28otXEF5rPV",
  "family:12_months:upfront": "price_1T2Dyj9ekvh9y28oZsY9pb82",
  "premium:1_month:monthly": "price_1T2Dys9ekvh9y28obsL45Hsr",
  "premium:3_months:monthly": "price_1T2Dyv9ekvh9y28oY93U11ig",
  "premium:3_months:upfront": "price_1T2ZIb9ekvh9y28oNbr6xSdl",
  "premium:12_months:monthly": "price_1T2Dyz9ekvh9y28o0t3ZNGg6",
  "premium:12_months:upfront": "price_1T2Dz29ekvh9y28oH88qdIkh",
};

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/** Get all dimensions for a Stripe price ID */
export function getPriceMapping(priceId: string | null): PriceMapping | null {
  if (!priceId) return null;
  return PRICE_ID_MAP[priceId] ?? null;
}

/** Get the plan length for a Stripe price ID */
export function getPlanLength(priceId: string | null): PlanLength | null {
  return getPriceMapping(priceId)?.planLength ?? null;
}

/** Get the billing method for a Stripe price ID */
export function getBillingMethod(priceId: string | null): BillingMethod | null {
  return getPriceMapping(priceId)?.billingMethod ?? null;
}

/** Reverse lookup: (tier, planLength, billingMethod) → Stripe price ID */
export function lookupPriceId(
  tier: "family" | "premium",
  planLength: PlanLength,
  billingMethod: BillingMethod
): string | null {
  return PRICE_LOOKUP[`${tier}:${planLength}:${billingMethod}`] ?? null;
}

/** Plan length ordering for upgrade validation */
const PLAN_LENGTH_ORDER: Record<PlanLength, number> = {
  "1_month": 1,
  "3_months": 3,
  "12_months": 12,
};

/** Can the user upgrade from current plan length to target? (same or longer = yes) */
export function canUpgradePlanLength(current: PlanLength, target: PlanLength): boolean {
  return PLAN_LENGTH_ORDER[target] >= PLAN_LENGTH_ORDER[current];
}

/** Get display price info for a specific tier, plan length, and billing method */
export function getDisplayPrice(
  tier: "family" | "premium",
  planLength: PlanLength,
  billingMethod: BillingMethod
): { monthlyRate: number | null; total: number; savings?: string } | null {
  if (billingMethod === "upfront") {
    const upfrontList = tier === "family" ? FAMILY_UPFRONT : PREMIUM_UPFRONT;
    const match = upfrontList.find((p) => p.planLength === planLength);
    if (!match) return null;
    return { monthlyRate: null, total: match.total, savings: match.savings };
  }

  const prices = tier === "family" ? FAMILY_PRICES : PREMIUM_PRICES;
  const match = prices.find((p) => p.planLength === planLength);
  if (!match) return null;
  return { monthlyRate: match.monthlyRate, total: match.total, savings: match.savings };
}

/** Human-readable plan length label */
export function planLengthLabel(pl: PlanLength): string {
  switch (pl) {
    case "1_month": return "1 Month";
    case "3_months": return "3 Months";
    case "12_months": return "12 Months";
  }
}
