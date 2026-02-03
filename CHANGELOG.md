# Changelog

All notable changes to RevisionHub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **FEAT-014: Personalized Hero Card Summaries** - Hero card on Parent Dashboard now displays per-child personalized sentences when multiple children exist
  - Uses child's `preferred_name` (nickname) if set, otherwise `first_name`
  - One sentence per child tailored to their individual status
  - Zero-latency implementation using frontend template generation
  - Architecture ready for future AI-generated summaries via backend
  - Files: `statusStyles.ts`, `HeroStatusBanner.tsx`, `ParentDashboardV2.tsx`, `parentDashboardTypes.ts`

- **Real-Time Dashboard Refresh** - Parent Dashboard now automatically refreshes data
  - Supabase real-time subscriptions for `revision_sessions` and `planned_sessions`
  - Auto-refresh when browser tab becomes visible (Page Visibility API)
  - Auto-refresh when window regains focus
  - 30-second throttle between refreshes to prevent API spam
  - Stale data detection (>5 minutes)
  - New `useParentDashboardData` hook encapsulates all refresh logic
  - Files: `useParentDashboardData.ts`, `ParentDashboardV2.tsx`

- **Header Branding Update** - Refreshed header with new logo and strapline
  - Added dark/light mode logo variants (`logo-dark.png`, `logo-light.png`)
  - New strapline: "Revision without the drama"
  - Increased navigation font sizes from `text-sm` to `text-base`
  - Logo sized at `h-14` (56px) for proper visual balance
  - Files: `AppHeader.tsx`, `ParentNav.tsx`, `ChildNav.tsx`, `public/images/`

### Fixed
- **TypeScript Strict Compilation** - Resolved all 29 TypeScript errors for clean builds
  - Added missing type exports: `MomentType`, `ProgressMomentsCardProps`, `WeeklyFocusStripProps`, `WeeklyRhythmChartProps`
  - Added `WeightingMode` type export to reward types
  - Added `mode` property to `PointConfig` interface
  - Added `points_cost` and `child_current_balance` to `PendingRedemption` type
  - Fixed `AppIcon` to accept `string | IconKey` for dynamic icon names from backend
  - Fixed `SessionHeader` and `TopicHeader` to accept both CSS classes and hex colors
  - Fixed `RewardEditor` `limit_type` null handling
  - Fixed `insightsDashboardService` return type (`SubjectBalance` → `SubjectBalanceData`)

### Changed
- `AppIcon` component now gracefully handles string icon names with runtime validation
- `SessionHeader` and `TopicHeader` components support both `subjectColor` (hex) and `subjectColorClass` (CSS class)
- `ParentDashboardV2` now uses `useParentDashboardData` hook instead of manual state management

### Removed
- Legacy duplicate files: `src/types/parentDashboard.ts`, `src/services/parentDashboardService.ts`

---

## [1.0.0] - 2026-02-02

### Added
- **FEAT-013: Reward System** - Complete reward management for parents and children
  - 6 reward categories, templates, custom rewards
  - Redemption flow with approval/auto-approve thresholds
  - Addition requests from children

- **FEAT-012: Add Subject with Redistribution** - Add subjects mid-plan with automatic schedule adjustment

- **FEAT-011: Study Buddy AI** - AI chat assistant with voice input during sessions

- **FEAT-010: Unified Status System** - Consistent 4-level status indicators across dashboard

- **FEAT-009: Parent Dashboard v2** - Multi-child support with HeroStatusBanner

- **FEAT-008: Parent Insights Dashboard** - 7 RPCs, 10 widgets, AI-powered tutor advice

- **FEAT-007: RecallStep Refactor** - Component extraction pattern for session steps

- **FEAT-005: Payload Restructure** - Flashcards → Recall, improved data structures

- **FEAT-004: Session System** - 6-step pedagogical session model

- **Core Platform** - Authentication, multi-child profiles, gamification, session management

### Technical Improvements
- ErrorBoundary component for graceful error handling
- 54 type guards in `utils/typeGuards.ts`
- 3 reusable custom hooks: `useFormField`, `useStepNavigation`, `useAsyncData`
- Component refactoring reducing critical components from 900+ to <700 lines

---

## Document Conventions

### Change Types
- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security fixes

### Feature Codes
Features are tracked with codes like `FEAT-014` which correspond to entries in:
- `reference documents/RevisionHub_PRD_v9_0.md`
- `reference documents/RevisionHub_Feature_List.md`

---

*Last Updated: 2026-02-03*
