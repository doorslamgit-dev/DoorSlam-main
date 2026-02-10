// src/components/child/today/index.ts 
// REFACTORED: January 2026 - Proper componentized structure
// FEAT-013: Added StreakMomentumCard and RewardsMiniCard

// Header
export { default as TodayHeader } from "./TodayHeader";

// Session components
export { default as SessionList } from "./SessionList";

// Progress
export { default as TodayProgressCard } from "./TodayProgressCard";

// Upcoming
export { default as UpcomingSection } from "./UpcomingSection";

// Streak & Rewards (side-by-side cards)
export { default as StreakMomentumCard } from "./StreakMomentumCard";
export { default as RewardsMiniCard } from "./RewardsMiniCard";

// Tip
export { default as TodayTipCard } from "./TodayTipCard";

// States
export { LoadingState, ErrorState } from "./EmptyState";

// Legacy exports (for backward compatibility if needed)
export { default as GamificationBar, GamificationInline } from "./GamificationBar";
export { default as SessionCard } from "./SessionCard";
export { default as SessionStatus } from "./SessionStatus";
export { default as UpcomingDayCard } from "./UpcomingDayCard";