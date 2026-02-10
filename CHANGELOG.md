# Changelog

All notable changes to Doorslam (RevisionHub) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Fixed
- **Eliminate all 192 ESLint warnings** — zero-warning codebase
  - Removed 5 unused `eslint-disable` directives
  - Replaced 13 `<img>` elements with Next.js `<Image>` / `next/image`
  - Fixed 14 `react-hooks/exhaustive-deps` missing dependency warnings
  - Replaced 160 `@typescript-eslint/no-explicit-any` usages with proper types
  - Fixed pre-existing `AvatarUpload.tsx` build error (Next.js `Image` import shadowing native `Image` constructor)
  - 69 files changed across components, hooks, services, types, and views

### Added
- **Parent Dashboard v3 — Child-Specific View** (PR #11 → develop)
  - Replaced family-aggregate dashboard with child-specific single-child view
  - New composite hook `useChildDashboardData` (family data + plan coverage + rewards)
  - DashboardHeroCard: weekly narrative, rhythm day-pills, 3 KPIs, Next Best Action
  - HealthScoreCard: RAG score/100 with SVG ring, 4 weighted sub-metrics
  - DashboardRevisionPlan: subject progress bars + coming-up sessions (replaces TimetableHeroCard)
  - DashboardRecentActivity, DashboardProgressMoments, DashboardActiveRewards (compact cards)
  - Child selector dropdown with URL param `?child=<id>` sync
  - `healthScore.ts` utility: pure function calculating composite health score
  - See: [ADR-003](docs/decisions/ADR-003-dashboard-v3-child-specific.md)

---

## [3.0.0] - 2026-02-09

v3.0 Layout Overhaul — sidebar navigation, persistent footer, AI panel slot.

### Added
- **Sidebar Navigation** — collapsible sidebar with expand/collapse toggle
  - `Sidebar.tsx`, `SidebarNav.tsx`, `SidebarNavItem.tsx`, `SidebarBottomSection.tsx`
  - `SidebarContext` manages expanded/collapsed state with localStorage persistence
  - Mobile: hamburger menu with slide-out overlay
  - Desktop: icon-only (collapsed) or full labels (expanded)
- **Persistent Footer** — `PersistentFooter.tsx` with quick actions always visible
- **AI Tutor Slot** — `AiTutorSlot.tsx` placeholder panel for future AI integration
- **AppShell** — `AppShell.tsx` wraps authenticated pages with sidebar + footer
- **Reusable Modal** — `Modal.tsx` shared component with backdrop, close button, size variants
- **Insights Data Hook** — `useInsightsDashboardData.ts` extracted from InsightsDashboard view
- **Account Service** — `accountService.ts` extracted from inline Supabase calls

### Changed
- **AppLayout** — conditional rendering: authenticated users → AppShell, unauthenticated → AppHeader
- **AppHeader** — simplified to unauthenticated-only header (removed nav items moved to sidebar)
- **Dark mode** — fixed neutral double-inversion bug across 25+ component files
  - All neutral colours now use CSS custom properties via `themes.css`
  - No more `dark:` Tailwind variants for neutral palette
- **Tailwind config** — extended with `neutral-0` through `neutral-900` CSS variable tokens, new accent colours, `shadow-card`, `max-w-content`
- **themes.css** — added `--color-neutral-0` and `--color-neutral-950` tokens

### Technical
- PR #7 merged to develop, promoted through staging (PR #9) to main (PR #10)
- 188 files changed, 2,881 insertions, 2,593 deletions

---

## [2.0.0] - 2026-02-08

Full codebase review — design tokens, component consolidation, service extraction.

### Changed
- **Design Token Migration** — replaced hardcoded Tailwind colours with CSS custom property tokens across all components
- **Component Consolidation** — merged duplicate components, extracted shared patterns
- **Service Extraction** — moved inline Supabase calls to dedicated service files
- **Timetable Modals** — refactored AddSessionModal, BlockDatesModal, EditScheduleModal (reduced complexity)
- **Form Components** — consolidated duplicate FormField components

### Fixed
- Session step components: consistent error handling and loading states
- Gamification service: type-safe API calls
- Parent onboarding: fixed coverage calculation edge cases

### Removed
- Duplicate `FormField` component from account module (uses shared `ui/FormField`)

### Technical
- PR #6 merged to develop
- Version bump from 1.x to 2.0.0

---

## [1.1.0] - 2026-02-06

Infrastructure and migration release — Next.js App Router, CI pipeline, Supabase CLI.

### Added
- **Next.js App Router Migration** — migrated from Vite + React Router to Next.js 16 App Router (PR #5)
  - All routes converted to `app/` directory structure
  - `'use client'` directives added to all interactive components
  - `@/` path alias configured via `tsconfig.json`
- **CI/CD Pipeline** — GitHub Actions workflow for lint, type-check, test, build (PR #3)
- **Testing Framework** — Vitest + Testing Library setup (PR #2)
- **Code Formatting** — Prettier + ESLint configuration (PR #1)
- **Supabase CLI** — initialised with baseline migration and edge function directory structure

### Fixed
- **ESLint Dependencies** — added missing parser and plugin packages (PR #4)

### Technical
- PRs #1–#5 established the engineering foundation per the Ops Playbook

---

## [1.0.0] - 2026-02-02

Initial release — complete GCSE revision platform.

### Added
- **FEAT-013: Reward System** — complete reward management for parents and children
  - 6 reward categories with templates, custom rewards, points system
  - Redemption flow with parent approval and auto-approve thresholds
  - Child addition requests
- **FEAT-012: Add Subject with Redistribution** — add subjects mid-plan with automatic schedule adjustment
- **FEAT-011: Study Buddy AI** — AI chat assistant with voice input during revision sessions
- **FEAT-010: Unified Status System** — consistent 4-level traffic-light indicators across dashboard
- **FEAT-009: Parent Dashboard v2** — multi-child support with HeroStatusBanner, weekly focus strip, rhythm chart
- **FEAT-008: Parent Insights Dashboard** — 7 RPCs powering 10 widgets, AI-powered tutor advice
- **FEAT-007: RecallStep Refactor** — component extraction pattern for session step architecture
- **FEAT-005: Payload Restructure** — flashcards → recall model, improved data structures
- **FEAT-004: Session System** — 6-step pedagogical session model (Preview → Reinforce → Recall → Practice → Summary → Complete)
- **FEAT-014: Personalized Hero Summaries** — per-child sentences on Parent Dashboard using `preferred_name`
- **Real-Time Dashboard Refresh** — Supabase real-time subscriptions, visibility API, 30s throttle
- **Header Branding** — dark/light logo variants, strapline "Revision without the drama"
- **Core Platform** — authentication, multi-child profiles, gamification, parent onboarding wizard

### Technical
- ErrorBoundary component for graceful error handling
- 54 type guards in `utils/typeGuards.ts`
- 3 reusable hooks: `useFormField`, `useStepNavigation`, `useAsyncData`
- Token-based design system with Tailwind CSS custom properties

---

## Document Conventions

### Change Types
- **Added** — new features
- **Changed** — changes in existing functionality
- **Deprecated** — soon-to-be removed features
- **Removed** — removed features
- **Fixed** — bug fixes
- **Security** — security fixes

### Version Policy (Playbook Section 11.3)
- **PATCH** (x.x.1) — bug fixes, no behaviour changes
- **MINOR** (x.1.0) — new features, backwards compatible
- **MAJOR** (x.0.0) — breaking changes, layout overhauls, major redesigns

### Feature Codes
Features are tracked with codes like `FEAT-014` which correspond to:
- `reference documents/RevisionHub_PRD_v9_0.md`
- `reference documents/RevisionHub_Feature_List.md`

### Cross-References
- Architecture decisions: `docs/decisions/ADR-*.md`
- Feature catalog: `docs/PRODUCT_EVOLUTION.md`
- Engineering playbook: `reference documents/Doorslam Engineering-Operations-Playbook .pdf`

---

*Last Updated: 2026-02-10*
