# Doorslam — Product Evolution Catalog

A plain-English record of how Doorslam has evolved from its baseline through each release. This document is designed for developers joining the project to understand **what each feature does**, **why it exists**, and **how it was built**.

For the technical changelog (version numbers, file lists, breaking changes), see [CHANGELOG.md](../CHANGELOG.md).
For architecture decisions, see [docs/decisions/](decisions/).

---

## Baseline — v1.0.0 (2 Feb 2026)

### What the product is

Doorslam is a GCSE revision platform. Parents set up their child's subjects, exam boards, and revision schedule. The platform generates a personalised timetable of revision sessions. Children work through sessions that follow a 6-step learning model. Parents monitor progress through a dashboard.

### Core user journeys

1. **Parent onboarding**: Parent signs up → adds child → selects subjects and exam boards → sets availability → platform generates a revision timetable.
2. **Child daily revision**: Child logs in → sees today's sessions → works through each session's 6 steps (Preview → Reinforce → Recall → Practice → Summary → Complete) → earns points.
3. **Parent monitoring**: Parent views dashboard → sees which subjects are on track → checks child's activity and streaks → adjusts plan if needed.

### Features delivered at v1.0.0

| Feature | What it does | Key files |
|---------|-------------|-----------|
| **Session System** (FEAT-004) | 6-step pedagogical model. Each session walks the child through Preview (what they'll learn), Reinforce (teaching slides/worked examples), Recall (flashcards with spaced repetition ratings), Practice (exam-style questions with difficulty selector), Summary (AI mnemonic), and Complete (celebration + points). | `src/views/child/sessionSteps/`, `src/components/child/` |
| **Payload Restructure** (FEAT-005) | Reorganised session data from flat "flashcards" to structured Recall/Practice/Reinforce payloads. Made each step independent with its own data contract. | `src/services/child/` |
| **RecallStep Refactor** (FEAT-007) | Established the component extraction pattern: large monolithic step components broken into focused sub-components (IntroScreen, FlashcardViewer, CompleteScreen, etc.). This pattern was then applied to all other steps. | `src/components/child/recallStep/` |
| **Parent Insights** (FEAT-008) | Dashboard with 10 widgets showing revision analytics: confidence heatmap, trend charts, subject balance, momentum, focus mode usage, and AI tutor advice. Powered by 7 Supabase RPCs. | `src/views/parent/InsightsDashboard.tsx`, `src/components/parent/insights/` |
| **Parent Dashboard v2** (FEAT-009) | Multi-child family view. HeroStatusBanner with family stats, child health card grid, weekly focus strip, rhythm chart, support tips. Each child shown as a card with traffic-light status. | `src/views/parent/ParentDashboardV2.tsx`, `src/components/parent/dashboard/` |
| **Unified Status System** (FEAT-010) | Consistent 4-level traffic-light indicators (On Track / Keep Going / Needs Attention / Behind) used across dashboard, subjects, and timetable. Replaced inconsistent ad-hoc status logic. | `src/utils/statusStyles.ts` |
| **Study Buddy AI** (FEAT-011) | AI chat panel during sessions. Child can ask questions about the topic. Supports voice input via browser speech recognition. Streamed responses from backend AI. | `src/components/child/studyBuddy/` |
| **Add Subject with Redistribution** (FEAT-012) | Parents can add new subjects mid-plan. The platform automatically redistributes the existing timetable to accommodate the new subject, preserving balance across all subjects. | `src/components/subjects/AddSubjectModal.tsx` |
| **Reward System** (FEAT-013) | Parents configure rewards (screen time, treats, activities, pocket money, privileges, custom). Children earn points through sessions and redeem them. Supports parent approval thresholds and child addition requests. | `src/components/parent/rewards/`, `src/views/child/ChildRewardsCatalog.tsx` |
| **Personalised Hero Summaries** (FEAT-014) | Dashboard hero card shows per-child personalised sentences (e.g., "Olivia completed 8 sessions this week and is on track in Maths"). Uses child's preferred_name if set. | `src/components/parent/dashboard/HeroStatusBanner.tsx` |
| **Real-Time Dashboard** | Parent dashboard auto-refreshes when sessions are completed in another tab. Uses Supabase real-time subscriptions on `revision_sessions` and `planned_sessions` tables, plus Page Visibility API refresh. 30-second throttle prevents API spam. | `src/hooks/parent/useParentDashboardData.ts` |
| **Gamification** | Points, streaks, and celebration moments. Children earn points per completed session. Streak counter tracks consecutive days. Progress moments celebrate milestones (first session, 5-day streak, etc.). | `src/services/gamificationService.ts`, `src/components/gamification/` |

---

## v1.1.0 — Infrastructure & Migration (6 Feb 2026)

### Why this release happened

The v1.0.0 codebase used Vite with React Router. To prepare for production deployment on Vercel with proper SSR support, SEO, and the App Router pattern, the entire application was migrated to Next.js 16. At the same time, the engineering foundation (CI pipeline, testing, linting) was established per the Engineering Ops Playbook.

### What changed

| Change | What it does | PR |
|--------|-------------|-----|
| **Next.js Migration** | Converted all routes from React Router to Next.js App Router (`app/` directory). Added `'use client'` directives to all interactive components. Configured `@/` path alias. | PR #5 |
| **CI/CD Pipeline** | GitHub Actions workflow runs lint, type-check, test, and build on every PR to develop/staging/main. Quality gate — nothing merges without passing. | PR #3 |
| **Testing Framework** | Vitest + React Testing Library configured. `npm run test` runs unit tests. | PR #2 |
| **Code Formatting** | Prettier + ESLint with TypeScript parser. Standardised code style across the team. | PR #1 |
| **ESLint Fix** | Added missing parser and plugin dependencies that caused CI failures. | PR #4 |
| **Supabase CLI** | Initialised `supabase/` directory with baseline migration and edge function structure. | Pre-PR |

### How it was developed

Each infrastructure change was a separate PR to develop, following the playbook for the first time. The CI pipeline was established first (PR #1-#4), then the Next.js migration (PR #5) was the first feature to go through the full lint → type-check → test → build gate.

---

## v2.0.0 — Codebase Review (8 Feb 2026)

### Why this release happened

Before adding new features, the entire codebase was audited for code quality. Priorities were: replace hardcoded colours with design tokens, consolidate duplicate components, extract services from views, and fix TypeScript errors.

### What changed

| Change | What it does | Impact |
|--------|-------------|--------|
| **Design Token Migration** | Replaced ~200 hardcoded Tailwind colour classes (e.g., `bg-blue-600`) with CSS custom property tokens (e.g., `bg-primary-600`). Enables theming and dark mode. | All component files |
| **Component Consolidation** | Removed duplicate components (e.g., two `FormField` implementations). Established single sources of truth. | ~30 files |
| **Service Extraction** | Moved inline Supabase `rpc()` and `from()` calls out of views into dedicated service files. Views now call service functions instead of database directly. | `src/services/` |
| **Timetable Modal Refactor** | The three timetable modals (AddSession, BlockDates, EditSchedule) were each 300+ lines of mixed concerns. Refactored to separate form state, validation, and UI. | `src/components/timetable/` |

### How it was developed

A single large PR (#6) with changes grouped by priority (P0 design tokens → P1 consolidation → P2 extraction → P3 cleanup). Reviewed file-by-file. Version bumped to 2.0.0 because the design token migration touched nearly every component.

---

## v3.0.0 — Layout Overhaul (9 Feb 2026)

### Why this release happened

The v2 layout had a horizontal top navigation bar, no persistent actions, and no designated space for the planned AI tutor panel. The v3 overhaul introduced a professional sidebar navigation pattern that scales better for the growing number of parent pages (Dashboard, Subjects, Timetable, Insights, Rewards, Settings).

### What changed

| Change | What it does | Key files |
|--------|-------------|-----------|
| **Sidebar** | Left-side navigation panel. Desktop: expands (labels) or collapses (icons only). Mobile: hamburger button opens a slide-out overlay. Remembers state in localStorage. | `src/components/layout/Sidebar.tsx`, `sidebar/` |
| **Persistent Footer** | Always-visible footer with quick action buttons. Previously, quick actions were embedded in the dashboard — now they're accessible from every page. | `src/components/layout/PersistentFooter.tsx` |
| **AI Tutor Slot** | Empty panel slot in the layout for the future AI tutor. Positioned as a right-side panel that can expand/collapse. No AI functionality yet — just the layout placeholder. | `src/components/layout/AiTutorSlot.tsx` |
| **AppShell** | New wrapper component for authenticated pages. Composes Sidebar + main content area + PersistentFooter + AiTutorSlot. Unauthenticated pages (Login, SignUp, Landing) use the simpler AppHeader instead. | `src/components/layout/AppShell.tsx` |
| **Dark Mode Fix** | The design token migration in v2.0.0 introduced a double-inversion bug: `themes.css` inverts neutral colours in dark mode, but many components still had `dark:bg-neutral-*` Tailwind classes that inverted again. Fixed by removing all `dark:` neutral variants from 25+ files. | Across all component directories |

### How it was developed

Single feature branch `feat/v3-layout-overhaul` (PR #7 to develop). The sidebar was built first as an isolated component, then integrated into AppShell. Dark mode fixes were done file-by-file with visual testing. Promoted through staging (PR #9) to main (PR #10).

---

## Unreleased — Parent Dashboard v3 (In Progress)

### Why this change is happening

The v2 Parent Dashboard (FEAT-009) shows a **family-aggregate** view: all children summarised on one page with a grid of health cards. User testing showed that parents primarily care about one child at a time and want deeper detail without navigating to separate pages. The v3 redesign replaces the family overview with a **child-specific** view focused on one selected child.

### What the new dashboard does

The parent navigates to `/parent` and sees a dashboard focused on their selected child:

1. **Header row**: "Dashboard" title on the left. On the right: child's avatar, name, year group, and exam type. If the parent has multiple children, a dropdown lets them switch.

2. **Row 1 — Hero + Health Score** (side by side):
   - **This Week's Story** (2/3 width): A narrative sentence like "Olivia completed 8 of 12 sessions this week." Below it: a compact day-pill strip showing which days had activity, three KPI cards (Sessions Completed, Confidence Change, Focus Mode Usage), and a "Next Best Action" recommendation with action buttons.
   - **Health Score** (1/3 width): A 0–100 composite score displayed in an SVG ring. RAG status capsule (On Track / Keep an Eye / Needs Attention). Four sub-metrics: subjects on track, subjects needing attention, average coverage percentage, and weeks until exams.

3. **Row 2 — Revision Plan** (full width): Left side shows progress-by-subject with coloured bars and completion percentages. Right side shows the next 4 upcoming sessions with subject icons and day labels. A status banner shows scheduled vs needed sessions per week.

4. **Row 3 — Three compact cards**:
   - **Recent Activity**: upcoming sessions and coverage milestones
   - **Progress Moments**: recent celebration events (streaks, milestones)
   - **Active Rewards**: the child's configured rewards with points costs

### How it was developed

- **Data layer**: New composite hook `useChildDashboardData` wraps the existing `useParentDashboardData` (unchanged) and adds child-specific fetches for plan coverage and reward data. Client-side filtering by `child_id` for coming-up sessions, subject coverage, and progress moments.
- **Health score**: Pure utility function `calculateHealthScore()` in `src/utils/healthScore.ts`. Four sub-metrics (0–25 each) summed to 0–100: subjects on track, attention penalty, average coverage, time score.
- **V3 alongside V2**: `ParentDashboardV3.tsx` created as a new file. The route swap in `app/parent/page.tsx` is a single import change. V2 remains untouched as fallback.
- **Iterative design**: Initial layout was refined through 3 rounds of feedback — adjusting grid proportions, compacting vertical spacing to fit one screen, and creating a dashboard-specific revision plan component.

### Architecture decision

See [ADR-003: Dashboard v3 — Child-Specific View](decisions/ADR-003-dashboard-v3-child-specific.md)

---

## How to Document Future Changes

When adding a new feature, bug fix, or change:

1. **CHANGELOG.md** — add an entry under `[Unreleased]` with the technical summary (files changed, what was added/modified/removed).

2. **This file (PRODUCT_EVOLUTION.md)** — add a new section with:
   - **Why this change is happening** — the problem or user need
   - **What it does** — plain English description a non-developer could understand
   - **How it was developed** — technical approach, key decisions, files involved
   - **Subsequent changes** — if the feature is later modified, add notes here

3. **ADR (if applicable)** — for significant architectural decisions, create `docs/decisions/ADR-NNN-description.md` following the template in the first ADR.

4. **PR description** — every PR should include Summary, New/Modified files table, and Test Plan (per Playbook Section 2.4).
