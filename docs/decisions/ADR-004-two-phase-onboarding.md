# ADR-004: Two-Phase Parent Onboarding

## Status
Accepted

## Date
2026-02-12

## Context

The parent onboarding flow required completing 11 steps before seeing the dashboard:
Child Details → Goal → Needs/SEN → Exam Type → Subjects → Pathways → Priority/Grades → Revision Period → Availability → Confirm → Invite

This created high friction. The existing monolithic RPC (`rpc_parent_create_child_and_plan`) could not be called without a revision period and weekly availability — it inserts into `revision_periods`, `revision_plans`, `weekly_availability_template`, `weekly_availability_slots`, and generates `planned_sessions` as part of one atomic transaction.

## Decision

Split onboarding into two phases with the child created in the database after just 3 steps.

**Phase 1** (3 steps): Child Details → Exam Type → Subjects → Dashboard
- New lightweight RPC `rpc_parent_create_child_basic` creates only the child row and subject enrolments
- No revision period, no plan, no sessions — the child exists in a "schedule pending" state
- Parent lands on the dashboard immediately

**Phase 2** (triggered from dashboard CTA): Goal → Needs → Pathways → Grades → Period → Availability → Confirm
- Uses 4 targeted RPCs (3 new + existing `saveTemplateAndRegenerate`) called sequentially
- Each RPC is idempotent — safe to retry on failure
- On completion, sessions are generated and the dashboard populates with real data

**Invite** moved from onboarding wizard to a dashboard modal, shown as a CTA after Phase 2 completes.

## New RPCs

| Function | Purpose |
|----------|---------|
| `rpc_parent_create_child_basic(p_payload)` | Phase 1: create child + enrol subjects |
| `rpc_set_child_goal(p_child_id, p_goal_code)` | Phase 2: upsert into `child_goals` |
| `rpc_update_child_subject_grades(p_child_id, p_grades)` | Phase 2: update `child_subjects` TEXT grades |
| `rpc_init_child_revision_period(p_child_id, p_period)` | Phase 2: create `revision_periods` + `revision_plans` + link to child |

## Consequences

### Positive
- Parents reach the dashboard in ~1 minute instead of ~5 minutes
- Child exists in DB from Phase 1 — no localStorage compromise, no data loss on refresh
- Each Phase 2 RPC is independently testable and reusable
- Dashboard CTA provides a clear "what's next" nudge

### Negative
- Children can exist in a "no plan" state if Phase 2 is never completed
- Dashboard must handle and render the "schedule pending" state gracefully
- 4 new SQL functions to maintain (though each is small and focused)

### Risk Mitigation
- Dashboard detects "no plan" via `planOverview.status === 'no_plan'` and shows "Complete Schedule" CTA
- Phase 2 RPCs are idempotent — abandoned-then-resumed flows work correctly
- Gamification rows auto-created by existing trigger (`ensure_child_gamification_rows`)
