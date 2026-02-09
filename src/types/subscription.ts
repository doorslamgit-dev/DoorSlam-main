// src/types/subscription.ts
// Subscription and billing types for Stripe integration

export type SubscriptionTier = 'trial' | 'family' | 'premium' | 'expired';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';

export interface SubscriptionLimits {
  max_children: number | null; // null = unlimited
  max_subjects: number | null; // null = unlimited
  can_buy_tokens?: boolean;
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

// Feature access helpers
export function canAddChild(info: SubscriptionInfo): boolean {
  if (info.limits.max_children === null) return true;
  return info.usage.children_count < info.limits.max_children;
}

export function canAddSubject(info: SubscriptionInfo): boolean {
  if (info.limits.max_subjects === null) return true;
  return info.usage.subjects_count < info.limits.max_subjects;
}

export function canUseVoice(info: SubscriptionInfo): boolean {
  return info.tier === 'family' || info.tier === 'premium';
}

export function canUseAITutorAdvice(info: SubscriptionInfo): boolean {
  return info.tier === 'premium';
}

export function canUseBenchmarks(info: SubscriptionInfo): boolean {
  return info.tier === 'premium';
}

export function canBuyTokens(info: SubscriptionInfo): boolean {
  return info.tier === 'premium';
}

export function isTrialExpired(info: SubscriptionInfo): boolean {
  if (info.tier !== 'trial') return false;
  if (!info.trial_ends_at) return false;
  return new Date(info.trial_ends_at) < new Date();
}

export function getTrialDaysRemaining(info: SubscriptionInfo): number {
  if (info.tier !== 'trial' || !info.trial_ends_at) return 0;
  const now = new Date();
  const ends = new Date(info.trial_ends_at);
  const diff = ends.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Pricing display
export interface PriceOption {
  duration: '1mo' | '3mo' | '12mo' | 'annual';
  label: string;
  monthlyRate: number;
  total: number;
  stripePriceId: string;
  savings?: string; // e.g., "Save 67%"
}

export const FAMILY_PRICES: PriceOption[] = [
  { duration: '1mo', label: '1 month', monthlyRate: 14.99, total: 14.99, stripePriceId: '' },
  { duration: '3mo', label: '3 months', monthlyRate: 11.99, total: 35.97, stripePriceId: '', savings: 'Save 20%' },
  { duration: '12mo', label: '12 months', monthlyRate: 6.99, total: 83.88, stripePriceId: '', savings: 'Save 53%' },
  { duration: 'annual', label: 'Annual (Best Value)', monthlyRate: 4.99, total: 59.88, stripePriceId: '', savings: 'Save 67%' },
];

export const PREMIUM_PRICES: PriceOption[] = [
  { duration: '1mo', label: '1 month', monthlyRate: 19.99, total: 19.99, stripePriceId: '' },
  { duration: '3mo', label: '3 months', monthlyRate: 16.99, total: 50.97, stripePriceId: '', savings: 'Save 15%' },
  { duration: '12mo', label: '12 months', monthlyRate: 11.99, total: 143.88, stripePriceId: '', savings: 'Save 40%' },
  { duration: 'annual', label: 'Annual (Best Value)', monthlyRate: 9.99, total: 119.88, stripePriceId: '', savings: 'Save 50%' },
];

export interface TokenBundle {
  tokens: number;
  price: number;
  stripePriceId: string;
}

export const TOKEN_BUNDLES: TokenBundle[] = [
  { tokens: 500, price: 4.99, stripePriceId: '' },
  { tokens: 1000, price: 8.99, stripePriceId: '' },
  { tokens: 2500, price: 19.99, stripePriceId: '' },
];
