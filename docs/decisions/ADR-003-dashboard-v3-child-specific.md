# ADR-003: Parent Dashboard v3 — Child-Specific View

## Status
Accepted

## Date
2026-02-09

## Context

The v2 Parent Dashboard (`ParentDashboardV2.tsx`) shows a family-aggregate view: a HeroStatusBanner with family-level stats, a grid of child health cards, quick actions, family overview, support tips, weekly focus, rhythm chart, and resources.

User feedback indicated that:
- Parents primarily focus on one child at a time
- The family grid doesn't provide enough depth on any single child
- Navigating to Insights for detailed data adds friction
- Quick actions and resources have moved to the sidebar/footer in v3.0

The dashboard needed to become the single screen where a parent can assess one child's revision health at a glance.

## Decision

Replace the family-aggregate layout with a **child-specific** view:

### Layout
- **Row 1**: Hero story card (2/3 width) + Health Score widget (1/3 width)
- **Row 2**: Revision Plan (full width) — subject progress + coming-up sessions
- **Row 3**: Three compact cards — Recent Activity, Progress Moments, Active Rewards
- **Entire dashboard fits on one screen** without scrolling (compact spacing, tight typography)

### Data architecture
- **New composite hook** `useChildDashboardData` wraps the existing `useParentDashboardData` (unchanged) and layers on:
  - `fetchPlanCoverageOverview(childId)` from timetableService
  - `useRewardTemplates(childId)` for active rewards
  - Client-side filtering of family data arrays by `child_id`
- **Child selection**: URL param `?child=<id>` + local state (same pattern as Timetable and Insights pages). Deep-linking works, browser back/forward works.
- **No new RPCs**: all data comes from existing backend functions

### Health score
- Pure client-side calculation in `src/utils/healthScore.ts`
- Four sub-metrics (0–25 each, summing to 0–100):
  1. Subjects On Track: `(on_track_count / total) × 25`
  2. Attention Penalty: `25 - (attention_count × 25 / total)`
  3. Average Coverage: `(completion_percent / 100) × 25`
  4. Time Score: 25 (8+ weeks) → 5 (<1 week)
- RAG mapping: ≥75 On Track, 50–74 Keep an Eye, <50 Needs Attention

### V3 alongside V2
- `ParentDashboardV3.tsx` created as a new file — V2 is untouched
- Route swap is a 1-line change in `app/parent/page.tsx`
- V2 can be restored instantly by reverting the import

## Alternatives Considered

1. **Extend V2 with a child filter tab**: Would keep the family overview and add a tab to drill into one child. Rejected because the layout structure (grid of child cards) doesn't work for single-child depth.

2. **New context for child selection**: A `SelectedChildContext` that wraps the entire parent section. Rejected as over-engineered — URL param + local state is simpler and already used by other pages.

3. **Server-side child-specific RPC**: A new `rpc_get_child_dashboard(child_id)` that returns everything in one call. Rejected for now — the existing RPCs provide all needed data, and a new RPC would require backend changes. TODO for performance optimisation if needed.

## Consequences

### Positive
- Parents get a focused, comprehensive view of one child's revision health
- No backend changes required — fully frontend
- V2 remains as immediate rollback option
- Health score gives a single number to assess overall status

### Negative
- `daily_pattern` data is family-level (no `child_id`). For multi-child families, the rhythm display shows aggregate activity. Acceptable for v1; a backend RPC extension is the long-term fix.
- Three KPIs (Confidence Change, Focus Mode Usage) show 0/placeholder values until the Insights RPC data is wired in. These are display-ready but need a follow-up to connect real data.

### Follow-up work
- Wire real Confidence Change and Focus Mode data from Insights RPCs
- Add child-level `daily_pattern` to the dashboard RPC (backend v1.4)
- Cleanup: delete V2 files after V3 is verified in production
