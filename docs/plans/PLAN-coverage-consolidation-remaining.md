# Plan: Coverage Consolidation — Remaining Gaps

**Created**: 6 Mar 2026
**Branch**: `bugfix/coverage-rpc-consolidation` (from `develop`)
**Relates to**: ADR-012 (Planning Parameters), PR #79 (planning parameters)
**Priority**: High — the parent dashboard shows incorrect session-based numbers

---

## Context

PR #79 unified all frontend coverage constants into `planning_parameters` and updated `rpc_get_plan_impact_assessment` to read from the DB. Three backend RPCs still have hardcoded values or don't use topic slots.

## Gap 1 — `rpc_get_plan_coverage_overview` (HIGH PRIORITY) — DONE

**Status**: Complete (bugfix/coverage-rpc-consolidation branch)

**What was done**:
1. SQL migration `20260307120000_coverage_overview_topic_slots.sql` — Updates RPC to return `total_topic_slots`, `completed_topic_slots`, `remaining_topic_slots`, and `topic_slots_per_week_needed`. Reads `get_planning_param()` for coverage target. Calculates weekly capacity from `weekly_availability_slots`.
2. `PlanCoverageOverview` type updated with optional topic slot fields
3. Fixed `scheduledPerWeek` bug in `DashboardRevisionPlan.tsx` — was dividing `planned_sessions` (total) by remaining weeks, now uses `remaining_sessions`
4. Fixed same `scheduledPerWeek` bug in `timetableUtils.ts`

**Note**: SQL migration must be applied via Supabase Dashboard (Docker not available for CLI push).

---

## Gap 2 — Dead RPC wrapper functions — DONE (removed)

**Status**: Complete — dead code removed

**What was done**:
- Confirmed via codebase-wide search that `calculateCoverageDistribution` and `calculateSessionsForCoverage` RPC wrapper functions in `coverageService.ts` were never called by any component
- Only the `Local` variants (`calculateCoverageLocal`, `calculateSessionsForCoverageLocal`) are used by `AvailabilityBuilderStep.tsx`
- Removed both dead functions (lines 418-487) and the now-unused `supabase` import
- The backend RPCs (`rpc_calculate_coverage_distribution`, `rpc_calculate_sessions_for_coverage`) still exist in the database but have no frontend callers. They can be updated to use `get_planning_param()` in a future migration when real topic counts are populated.

---

## Gap 3 — `p_available_sessions` parameter naming (LOW PRIORITY) — Deferred

**What it is**: The `rpc_calculate_coverage_distribution` RPC parameter is named `p_available_sessions` but receives topic slots.

**Status**: Deferred — the frontend wrapper function has been removed (Gap 2), so there's no frontend code with this naming mismatch. The backend RPC parameter can be renamed in a future migration when these RPCs are activated.

---

## Execution Summary

### Phase 1 — Dashboard fix + dead code cleanup — COMPLETE
```
Branch: bugfix/coverage-rpc-consolidation
```

1. [x] SQL migration `20260307120000_coverage_overview_topic_slots.sql` written
2. [ ] Apply SQL migration via Supabase Dashboard
3. [x] `PlanCoverageOverview` type updated with topic slot fields
4. [x] Fixed `scheduledPerWeek` bug in `DashboardRevisionPlan.tsx`
5. [x] Fixed `scheduledPerWeek` bug in `timetableUtils.ts`
6. [x] Removed dead RPC wrapper functions from `coverageService.ts`
7. [x] Updated CHANGELOG, PRODUCT_EVOLUTION
8. [x] CI checks pass
9. [ ] PR to develop

### Phase 2 — Backend RPC constants cleanup — Deferred
Only needed once curriculum topic counts are reliably populated in the database. The `Local` calculation functions (reading from `planning_parameters` via `planningConstants`) remain the active code path.

---

## Validation Checklist

After Phase 1 + SQL migration applied:
- [ ] Dashboard status badges (On Track / Attention / Behind) use remaining sessions for pace calculation
- [ ] `rpc_get_plan_coverage_overview` returns `total_topic_slots` and `topic_slots_per_week_needed`
- [ ] Existing session-based fields still returned for backwards compatibility
- [ ] Dead RPC wrapper functions no longer in coverageService.ts
- [ ] All CI checks pass
