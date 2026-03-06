# Plan: Coverage Consolidation — Remaining Gaps

**Created**: 6 Mar 2026
**Branch**: `bugfix/coverage-rpc-consolidation` (from `develop`)
**Relates to**: ADR-012 (Planning Parameters), PR #79 (planning parameters)
**Priority**: High — the parent dashboard shows incorrect session-based numbers

---

## Context

PR #79 unified all frontend coverage constants into `planning_parameters` and updated `rpc_get_plan_impact_assessment` to read from the DB. Three backend RPCs still have hardcoded values or don't use topic slots.

## Gap 1 — `rpc_get_plan_coverage_overview` (HIGH PRIORITY)

**What it does**: Powers the parent dashboard (`DashboardRevisionPlan`, `TimetableHeader`, `HealthScoreCard`, `DashboardHeroCard`) and timetable views.

**Current problem**:
- Returns `planned_sessions`, `completed_sessions`, `remaining_sessions` as raw session counts
- Does NOT return topic slot equivalents
- `pace.sessions_per_week_needed` is based on raw sessions, not topic-adjusted capacity
- Does NOT factor in child's goal, needs, or grade gaps
- The dashboard's `scheduledPerWeek` calculation (fixed in PR #78 to use `remaining_sessions`) is still session-based, not topic-slot-based

**Consumers** (12 files):
- `DashboardRevisionPlan.tsx` — progress bars, "X sessions/week scheduled"
- `DashboardHeroCard.tsx` — hero status display
- `HealthScoreCard.tsx` — health score calculation
- `TimetableHeader.tsx` — timetable status badge
- `timetableUtils.ts` — `getTimetableStatus()` helper
- `healthScore.ts` — health score utility
- `useChildDashboardData.ts`, `useTimetableData.ts` — data hooks
- `ParentDashboardV3.tsx`, `Timetable.tsx` — view wiring

**Fix**:
1. SQL: Update `rpc_get_plan_coverage_overview` to:
   - Join `weekly_availability_slots` to calculate topic slots (same pattern as impact assessment RPC)
   - Read `get_planning_param('coverage.target_slots_per_topic', 1.5)` for coverage target
   - Read child's goal and needs for effort-adjusted target
   - Add new fields to response: `total_topic_slots`, `remaining_topic_slots`, `topic_slots_per_week_needed`
   - Keep existing session fields for backwards compatibility
2. Frontend: `PlanCoverageOverview` type already has optional topic slot fields (added in PR #78). Consumers should prefer topic slot fields when available, falling back to session fields.
3. Update `DashboardRevisionPlan.tsx` and `timetableUtils.ts` to use topic-slot-based pace when available.

**Estimated scope**: ~1 SQL migration + ~3 frontend file edits

---

## Gap 2 — `rpc_calculate_coverage_distribution` and `rpc_calculate_sessions_for_coverage` (LOW PRIORITY)

**What they do**: Backend equivalents of `calculateCoverageLocal` and `calculateSessionsForCoverageLocal`. Intended for authoritative calculations using real topic counts from the DB.

**Current problem**:
- Have their own hardcoded constants (not reading from `planning_parameters`)
- Defined in `coverageService.ts` but **never called by any component** — only the `Local` variants are used

**Why low priority**: No frontend code calls these RPCs. They exist for future use when we switch from the 50-topic fallback to real DB topic counts.

**Fix (when needed)**:
1. SQL: Update both RPCs to use `get_planning_param()` for all constants
2. Frontend: Switch onboarding `AvailabilityBuilderStep` from `Local` functions to RPC functions once we have reliable topic counts in the DB
3. Remove `DEFAULT_TOPICS_PER_SUBJECT = 50` fallback when real counts are available

**Estimated scope**: ~1 SQL migration + ~2 frontend file edits (defer until topic counts are populated)

---

## Gap 3 — `p_available_sessions` parameter naming (LOW PRIORITY)

**What it is**: The `rpc_calculate_coverage_distribution` RPC parameter is named `p_available_sessions` but we're passing topic slots.

**Current problem**: Naming mismatch. The code works (value is treated as topic slot capacity internally) but the parameter name is misleading.

**Fix**:
1. SQL: Rename parameter from `p_available_sessions` to `p_available_topic_slots`
2. Frontend: Update the call site in `coverageService.ts` (line ~441)
3. Remove the TODO comment in the code

**Estimated scope**: Trivial — ~1 SQL change + ~1 frontend line. Can be bundled with Gap 2.

---

## Execution Plan

### Phase 1 — Dashboard fix (Gap 1) — Do now
```
Branch: bugfix/coverage-rpc-consolidation
Commit: fix(coverage): update rpc_get_plan_coverage_overview to use topic slots and planning_parameters
```

1. Write SQL migration `20260307120000_coverage_overview_topic_slots.sql`
2. Apply via Supabase Dashboard
3. Update `DashboardRevisionPlan.tsx` to prefer `topic_slots_per_week_needed` over `sessions_per_week_needed`
4. Update `timetableUtils.ts` `getTimetableStatus()` to use topic-slot pace
5. Run lint, type-check, test, build
6. Update CHANGELOG, PRODUCT_EVOLUTION
7. PR to develop

### Phase 2 — RPC cleanup (Gaps 2 + 3) — Defer until topic counts populated
```
Branch: refactor/coverage-rpc-cleanup
Commit: refactor(coverage): update remaining RPCs to use planning_parameters
```

Only needed once curriculum topic counts are reliably populated in the database. Until then, the `Local` calculation functions (now reading from `planning_parameters` via `planningConstants`) are the active code path.

---

## Validation Checklist

After Phase 1:
- [ ] Parent dashboard shows "X topic slots/week" (or equivalent friendly label) instead of raw session counts
- [ ] Dashboard status badges (On Track / Attention / Behind) use topic-slot-based pace
- [ ] Health score reflects topic slot capacity, not raw sessions
- [ ] `rpc_get_plan_coverage_overview` returns `total_topic_slots` and `topic_slots_per_week_needed`
- [ ] Existing session-based fields still returned for backwards compatibility
- [ ] All CI checks pass
