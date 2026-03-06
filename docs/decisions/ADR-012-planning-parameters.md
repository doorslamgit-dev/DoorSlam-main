# ADR-012: Configurable Planning Parameters

## Status
Accepted

## Date
2026-03-06

## Context

The Doorslam platform uses several constants to calculate session recommendations, coverage percentages, and feasibility assessments during onboarding and plan management. These constants were duplicated across two independent frontend calculators with inconsistent values:

| Parameter | `coverageService.ts` | `sessionCalculator.ts` |
|-----------|---------------------|----------------------|
| SESSIONS_PER_TOPIC | 1.0 | 1.5 |
| improve_grade goal multiplier | 1.1 | 1.15 |
| excel goal multiplier | 1.2 | 1.3 |
| Memory needs multiplier | +0.15 | +0.2 |
| Grade gap scaling | 0.08 per point | 0.1 per point |
| Priority weights (medium) | 0.6 | 0.85 |
| Priority weights (low) | 0.4 | 0.7 |

The backend RPCs (`rpc_get_plan_impact_assessment`, `rpc_get_plan_coverage_overview`) also had their own hardcoded constants that did not factor in goals, needs, or grade gaps.

This inconsistency meant parents could see different coverage numbers depending on which screen they were viewing. The values also could not be tuned without code changes.

## Decision

1. **Single source of truth in the database**: Create a `planning_parameters` table storing all tuning constants as key-value rows with category, description, and min/max validation bounds.

2. **SQL helper function**: `get_planning_param(key, default)` for use inside RPCs, so backend calculations always read from the same table.

3. **Frontend service with caching**: `planningParametersService.ts` fetches all parameters once, caches for 5 minutes, and exposes sync getters. Both `coverageService.ts` and `sessionCalculator.ts` import from a shared `planningConstants.ts` module that delegates to this service.

4. **Admin UI**: A parameter management page at `/admin/parameters` allows tuning values within their validated bounds without deploying code.

5. **Canonical values** (from `sessionCalculator.ts`, validated as more accurate):
   - `coverage_target_per_topic`: 1.5 topic slots
   - Goal multipliers: pass_exam=1.0, improve_grade=1.15, excel=1.3
   - Needs: memory=+0.2, attention=+0.1
   - Grade gap: 0.1 per grade point
   - Priority weights: high=1.0, medium=0.85, low=0.7

## Alternatives Considered

1. **Hardcoded shared constants file**: Simpler but requires a code deploy to change any value. Rejected because the team needs to tune these as real usage data comes in.

2. **Environment variables**: Would centralise values but cannot be changed at runtime and are not visible to RPCs.

3. **Keep two calculators with aligned constants**: Reduces the fix to syncing values. Rejected because the underlying architecture (two independent calculators) would still invite drift over time.

## Consequences

### Positive
- Single canonical set of values used by frontend and backend
- Parameters can be tuned without code deploys via admin UI
- All RPCs factor in goals, needs, and grade gaps consistently
- Validation bounds prevent accidental misconfiguration

### Negative
- Additional database table and RPC calls (mitigated by 5-minute frontend cache)
- Migration must be applied manually via Supabase Dashboard (no Docker for CLI)
- Existing onboarding flows need testing to confirm they read the new parameters correctly

### Follow-up work
- Update `rpc_get_plan_coverage_overview` to read from `planning_parameters`
- Remove hardcoded constants from both frontend calculators
- Add parameter audit logging for traceability
