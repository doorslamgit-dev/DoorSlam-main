# ADR-005: Timetable Time-Slot Grid and Parental Controls System

## Status
Accepted

## Date
2026-02-20

## Context
The timetable page displayed sessions as flat cards stacked under each day without indicating when during the day sessions occur. Parents had no way to rearrange topics between sessions. Additionally, there was no mechanism for children to interact with the timetable in a controlled manner.

Two architectural decisions were needed:
1. How to restructure the timetable data model and UI to support time-slot-based layout with drag-and-drop topic management
2. How to build a generic access control system for gating child actions across features

## Decision

### Time-Slot Grid
- Added `time_of_day TEXT` column to `planned_sessions` (nullable for backwards compatibility — existing sessions show in an "Unscheduled" row)
- WeekView rendered as a grid: time slots (rows) × days (columns), with each cell mapping to one session via `${day_date}:${time_of_day}` lookup
- Individual topics within sessions rendered as draggable `TopicCard` components
- Used `@dnd-kit/core` (already installed) with `useDraggable` on TopicCards and `useDroppable` on grid cells (cross-container drag, not sortable lists)
- Server-side RPCs (`rpc_move_topic_between_sessions`, `rpc_remove_topic_from_session`) handle the actual data mutation with capacity validation

### Parental Controls
- Generic `parental_controls` table with `feature_key TEXT` (e.g., `timetable_edit`) and `access_level TEXT` (`none`, `requires_approval`, `auto_approved`)
- Separate `parental_control_requests` table for the approval queue when `requires_approval` is active
- Subscription-gated: Family+ and Premium tiers only
- Approval resolution auto-executes the underlying action (e.g., topic move) server-side

## Alternatives Considered

### Sortable-only DnD (reorder within same list)
Rejected — the requirement is cross-cell moves (any day, any time slot), not just reordering within one session.

### Embedded time-slot data in session_pattern
Rejected — `time_of_day` comes from the weekly availability template and is independent of session duration. A separate column is cleaner.

### Feature-specific permission columns on children table
Rejected — adding boolean columns per feature doesn't scale. The `feature_key` pattern allows new features to be controlled without schema migrations.

### Client-side only access checks
Rejected — RLS policies on `parental_controls` enforce access server-side. Client hooks (`useChildAccess`) provide the UX layer but are not the sole gate.

## Consequences

### Positive
- Parents have visual, intuitive control over the revision schedule
- Drag-and-drop feels natural and gives immediate feedback
- Parental controls are reusable for any future feature (rewards, AI tutor, etc.)
- Children get a pathway to independence while parents retain oversight
- Backwards compatible — existing sessions without `time_of_day` render in an "Unscheduled" fallback row

### Negative
- `rpc_get_week_plan` and `rpc_get_todays_sessions` (Supabase RPCs) need to be updated to include `time_of_day` in their JSONB return — this requires a Supabase Dashboard SQL update
- `rpc_regenerate_child_plan` needs to copy `time_of_day` from the weekly template during session generation
- Empty time-slot rows are hidden, which could confuse users who expect to see all 5 rows

### Follow-up work
- Update `rpc_get_week_plan` to include `time_of_day` in returned session JSONB
- Update `rpc_get_todays_sessions` to include `time_of_day`
- Update `rpc_regenerate_child_plan` to populate `time_of_day` from the weekly availability slot
- Optionally backfill existing sessions' `time_of_day` from their template slot order
- Add timetable link to child sidebar navigation
