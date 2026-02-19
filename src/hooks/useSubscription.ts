// src/hooks/useSubscription.ts
// Re-exports the subscription hook from SubscriptionContext.
// This keeps all existing imports (import { useSubscription } from '@/hooks/useSubscription')
// working without changes across the codebase.

export { useSubscriptionContext as useSubscription } from "../contexts/SubscriptionContext";
export type { SubscriptionContextValue as UseSubscriptionResult } from "../contexts/SubscriptionContext";
