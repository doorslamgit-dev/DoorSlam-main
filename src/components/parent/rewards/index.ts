// src/components/parent/rewards/index.ts
// FEAT-013: Reward components barrel export

// Existing components (Phase 1-3a)
export { PointWeightingConfig } from './PointWeightingConfig';
export { RewardEditor } from './RewardEditor';
export { PendingRedemptions } from './PendingRedemptions';
export { PendingAdditionRequests } from './PendingAdditionRequests';

// New components (Phase 3b refactor)
export { PointsEditor } from './PointsEditor';
export { QuickStartBanner } from './QuickStartBanner';
export { RewardTemplateCard } from './RewardTemplateCard';
export { RewardHeroHeader } from './RewardHeroHeader';
export { AgreedRewardsCard } from './AgreedRewardsCard';
export { PendingApprovalsCard } from './PendingApprovalsCard';
export { RewardCatalogSection } from './RewardCatalogSection';