# RevisionHub RPC Function Definitions

**Version:** 2.0
**Last Updated:** 2 February 2026
**Previous Version:** 13 January 2026

---

## Document Overview

This document catalogs all public RPC functions in the RevisionHub Supabase backend. Functions are organized by domain for easy reference.

**Total Functions:** ~67 (50 original + 17 reward system)

---

## Quick Reference Index

### Authentication & Child Management
- `rpc_accept_child_invite`
- `rpc_create_child_invite`
- `rpc_get_child_invite_preview`
- `rpc_get_my_child_id`
- `rpc_parent_create_child_and_plan`

### Session Management
- `rpc_start_planned_session`
- `rpc_complete_planned_session`
- `rpc_skip_planned_session`
- `rpc_advance_to_next_topic`
- `rpc_generate_planned_session_payload`
- `rpc_patch_planned_session_payload`
- `rpc_get_planned_session_overview`
- `rpc_get_todays_planned_sessions`
- `rpc_get_todays_sessions`
- `rpc_get_week_plan`

### Gamification
- `rpc_award_session_points`
- `rpc_update_child_streak`
- `rpc_check_and_award_achievements`
- `rpc_mark_achievements_notified`
- `rpc_get_child_gamification_summary`

### Reward System (FEAT-013) - NEW
- `rpc_get_child_reward_config`
- `rpc_save_point_config`
- `rpc_upsert_child_reward`
- `rpc_remove_child_reward`
- `rpc_enable_template_rewards`
- `rpc_request_reward_redemption`
- `rpc_resolve_redemption`
- `rpc_get_pending_redemptions`
- `rpc_cancel_redemption_request`
- `rpc_get_child_rewards_catalog`
- `rpc_get_child_rewards_summary`
- `rpc_get_child_rewards_dashboard`
- `rpc_request_reward_addition`
- `rpc_resolve_addition_request`
- `rpc_get_pending_addition_requests`
- `rpc_get_reward_catalog_for_child`

### Parent Dashboard
- `rpc_get_parent_dashboard_summary`
- `rpc_get_plan_coverage_overview`
- `rpc_get_subject_progress`

### Scheduling & Availability
- `rpc_calculate_available_sessions`
- `rpc_calculate_coverage_distribution`
- `rpc_calculate_recommended_sessions`
- `rpc_calculate_sessions_for_coverage`
- `rpc_generate_default_availability_template`
- `rpc_set_revision_schedules_from_availability`
- `rpc_set_revision_schedules_from_weekly_template`

### Content & Curriculum
- `rpc_derive_session_policy`
- `rpc_get_curriculum_topic_counts`
- `rpc_get_subject_pathways`
- `rpc_list_exam_types`
- `rpc_list_goals`
- `rpc_list_need_areas`
- `rpc_list_need_clusters`
- `rpc_list_subject_groups_for_exam_types`
- `rpc_list_subject_names`
- `rpc_list_subject_variants`
- `rpc_list_subjects_for_exam_types`
- `rpc_get_clusters_by_area`

### Child Profile
- `rpc_update_child_revision_profile`
- `rpc_set_child_need_cluster`
- `rpc_save_child_pathways`

---

## Function Details by Domain

---

## 1. Authentication & Child Management

### rpc_accept_child_invite

**Purpose:** Child accepts an invite code to link their account to a parent.

```sql
rpc_accept_child_invite(p_code TEXT)
RETURNS JSONB
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| p_code | TEXT | Yes | 6+ character invite code |

**Returns:**
```json
{
  "ok": true,
  "child_id": "uuid"
}
```

**Errors:**
- `Not authenticated` - User not logged in
- `Invalid code` - Code too short or null
- `Invalid or expired code` - Code not found
- `Invite already used` - Child already linked

---

### rpc_create_child_invite

**Purpose:** Parent generates an invite code for a child.

```sql
rpc_create_child_invite(p_child_id UUID)
RETURNS JSONB
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| p_child_id | UUID | Yes | Child to generate invite for |

**Returns:**
```json
{
  "child_id": "uuid",
  "invitation_code": "ABC123XYZ",
  "invitation_link": "/child/signup?code=ABC123XYZ",
  "invitation_sent_at": "2026-01-15T10:00:00Z"
}
```

---

### rpc_get_child_invite_preview

**Purpose:** Preview invite code validity (for child signup flow).

```sql
rpc_get_child_invite_preview(p_code TEXT)
RETURNS JSONB
```

**Returns:**
```json
{
  "ok": true,
  "child_id": "uuid",
  "child_first_name": "Hannah",
  "parent_name": "John Smith"
}
```

---

### rpc_get_my_child_id

**Purpose:** Get the current user's child ID (for child users).

```sql
rpc_get_my_child_id()
RETURNS UUID
```

**Returns:** UUID of the authenticated user's child record, or NULL.

---

### rpc_parent_create_child_and_plan

**Purpose:** Master onboarding function - creates child with full setup including subjects, availability, needs, and generates initial revision plan.

```sql
rpc_parent_create_child_and_plan(p_payload JSONB)
RETURNS JSONB
```

**Payload Structure:**
```json
{
  "child": {
    "first_name": "Hannah",
    "last_name": "Smith",
    "preferred_name": "Han",
    "country": "GB",
    "year_group": 10
  },
  "goal_code": "improve_grade",
  "subjects": [
    {
      "subject_id": "uuid",
      "sort_order": 1,
      "current_grade": 5,
      "target_grade": 7
    }
  ],
  "weekly_availability": {
    "0": { "enabled": true, "slots": [{"time_of_day": "afternoon", "session_pattern": "p45"}] },
    "1": { "enabled": true, "slots": [{"time_of_day": "afternoon", "session_pattern": "p45"}] }
  },
  "revision_period": {
    "start_date": "2026-01-15",
    "end_date": "2026-03-15",
    "contingency_percent": 10
  },
  "need_clusters": [
    { "cluster_code": "ADHD_TRAITS" }
  ]
}
```

**Returns:**
```json
{
  "child_id": "uuid",
  "plan_id": "uuid",
  "revision_period_id": "uuid"
}
```

---

## 2. Session Management

### rpc_start_planned_session

**Purpose:** Atomically start a revision session (prevents race conditions).

```sql
rpc_start_planned_session(p_planned_session_id UUID)
RETURNS TABLE(
  out_planned_session_id UUID,
  out_status TEXT,
  out_started_at TIMESTAMPTZ,
  out_revision_session_id UUID
)
```

**Side Effects:**
1. Creates/updates `revision_sessions` row
2. Creates `revision_session_steps` rows (recall, reinforce, practice, reflection)
3. Updates `planned_sessions.started_at`
4. Generates payload if not exists

---

### rpc_complete_planned_session

**Purpose:** Mark a planned session as completed and award gamification.

```sql
rpc_complete_planned_session(
  p_planned_session_id UUID,
  p_confidence_level TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_duration_minutes INTEGER DEFAULT NULL
)
RETURNS TABLE(
  planned_session_id UUID,
  status TEXT,
  completed_at TIMESTAMPTZ,
  gamification JSONB
)
```

**Gamification Returns:**
```json
{
  "points": { "points_awarded": 15, "new_balance": 245 },
  "streak": { "current_streak": 5, "longest_streak": 12 },
  "achievements": { "newly_earned": [...] }
}
```

---

### rpc_advance_to_next_topic

**Purpose:** Advance multi-topic session to next topic, or complete if last.

```sql
rpc_advance_to_next_topic(p_revision_session_id UUID)
RETURNS TABLE(
  out_current_topic_index INTEGER,
  out_total_topics INTEGER,
  out_is_session_complete BOOLEAN,
  out_next_topic_id UUID,
  out_topic_name TEXT,
  out_gamification JSONB
)
```

---

### rpc_skip_planned_session

**Purpose:** Mark a session as skipped with optional reason.

```sql
rpc_skip_planned_session(
  p_planned_session_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
```

---

### rpc_get_todays_sessions

**Purpose:** Get all sessions for a child on a specific date.

```sql
rpc_get_todays_sessions(
  p_child_id UUID,
  p_session_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  planned_session_id UUID,
  session_date DATE,
  session_index INTEGER,
  session_pattern TEXT,
  session_duration_minutes INTEGER,
  status TEXT,
  subject_id UUID,
  subject_name TEXT,
  icon TEXT,
  color TEXT,
  topic_count INTEGER,
  topics_preview JSONB
)
```

---

### rpc_get_week_plan

**Purpose:** Get all sessions for a 7-day period.

```sql
rpc_get_week_plan(
  p_child_id UUID,
  p_week_start_date DATE
)
RETURNS TABLE(
  day_date DATE,
  sessions JSONB
)
```

---

## 3. Gamification

### rpc_award_session_points

**Purpose:** Award points for completing a session.

```sql
rpc_award_session_points(p_revision_session_id UUID)
RETURNS JSONB
```

**Returns:**
```json
{
  "child_id": "uuid",
  "points_awarded": 15,
  "base_points": 10,
  "focus_bonus": 5,
  "new_balance": 245,
  "lifetime_points": 1240
}
```

---

### rpc_update_child_streak

**Purpose:** Update streak after session completion.

```sql
rpc_update_child_streak(p_child_id UUID)
RETURNS JSONB
```

**Returns:**
```json
{
  "child_id": "uuid",
  "current_streak": 5,
  "longest_streak": 12,
  "last_completed_date": "2026-01-15",
  "streak_broken": false
}
```

---

### rpc_check_and_award_achievements

**Purpose:** Check all achievement criteria and award any newly earned.

```sql
rpc_check_and_award_achievements(p_child_id UUID)
RETURNS JSONB
```

**Returns:**
```json
{
  "child_id": "uuid",
  "newly_earned": [
    {
      "code": "FIRST_SESSION",
      "name": "First Steps",
      "description": "Complete your first revision session",
      "icon": "star",
      "points": 50
    }
  ],
  "achievement_count": 1,
  "points_awarded": 50
}
```

---

### rpc_get_child_gamification_summary

**Purpose:** Get complete gamification overview for a child.

```sql
rpc_get_child_gamification_summary(p_child_id UUID)
RETURNS JSONB
```

**Returns:**
```json
{
  "child_id": "uuid",
  "points": {
    "balance": 245,
    "lifetime": 1240
  },
  "streak": {
    "current": 5,
    "longest": 12,
    "last_completed_date": "2026-01-15"
  },
  "achievements": {
    "total_earned": 8,
    "recent": [...],
    "unnotified": [...]
  }
}
```

---

## 4. Reward System (FEAT-013)

*Added 24 January 2026*

### 4.1 Configuration RPCs

#### rpc_get_child_reward_config

**Purpose:** Get complete reward configuration for a child.

```sql
rpc_get_child_reward_config(p_child_id UUID)
RETURNS JSONB
```

**Returns:**
```json
{
  "point_config": {
    "mode": "manual",
    "completion_weight": 40,
    "accuracy_weight": 35,
    "focus_weight": 25,
    "auto_approve_threshold": 100
  },
  "categories": [
    { "id": "uuid", "code": "screen_time", "name": "Screen Time", "icon": "📱" }
  ],
  "rewards": [
    {
      "id": "uuid",
      "category_code": "screen_time",
      "name": "15 minutes gaming",
      "emoji": "🎮",
      "points_cost": 100,
      "limit_type": "per_day",
      "limit_count": 2,
      "is_active": true
    }
  ],
  "points_balance": 245,
  "pending_count": 2
}
```

---

#### rpc_save_point_config

**Purpose:** Save point weighting configuration.

```sql
rpc_save_point_config(
  p_child_id UUID,
  p_mode TEXT,
  p_completion_weight INTEGER,
  p_accuracy_weight INTEGER,
  p_focus_weight INTEGER,
  p_auto_approve INTEGER
)
RETURNS JSONB
```

**Constraints:**
- Weights must sum to 100 in manual mode
- Each weight must be >= 10

**Returns:**
```json
{ "success": true }
```

---

#### rpc_upsert_child_reward

**Purpose:** Create or update a reward for a child.

```sql
rpc_upsert_child_reward(
  p_child_id UUID,
  p_reward_id UUID,        -- NULL for new
  p_category_id UUID,
  p_name TEXT,
  p_points_cost INTEGER,
  p_emoji TEXT,
  p_limit_type TEXT,       -- 'per_day' | 'per_week' | 'per_month' | 'unlimited'
  p_limit_count INTEGER
)
RETURNS JSONB
```

**Returns:**
```json
{ "success": true, "reward_id": "uuid" }
```

---

#### rpc_remove_child_reward

**Purpose:** Soft-delete a reward (sets is_active = false).

```sql
rpc_remove_child_reward(p_reward_id UUID)
RETURNS JSONB
```

---

#### rpc_enable_template_rewards

**Purpose:** Bulk-enable rewards from templates.

```sql
rpc_enable_template_rewards(
  p_child_id UUID,
  p_template_ids UUID[]
)
RETURNS JSONB
```

**Returns:**
```json
{ "success": true, "created_count": 5 }
```

---

### 4.2 Redemption RPCs

#### rpc_request_reward_redemption

**Purpose:** Child requests to redeem a reward.

```sql
rpc_request_reward_redemption(
  p_child_id UUID,
  p_reward_id UUID
)
RETURNS JSONB
```

**Logic:**
1. Check points balance
2. Check reward limits for period
3. If points_cost ≤ auto_approve_threshold → approve immediately
4. Else → create pending request

**Returns:**
```json
{
  "success": true,
  "redemption_id": "uuid",
  "auto_approved": false
}
```

**Errors:**
- `insufficient_points` - Not enough points
- `limit_reached` - Reward limit hit for period
- `reward_inactive` - Reward no longer available

---

#### rpc_resolve_redemption

**Purpose:** Parent approves or declines a redemption request.

```sql
rpc_resolve_redemption(
  p_redemption_id UUID,
  p_action TEXT,           -- 'approve' | 'decline'
  p_reason TEXT            -- optional decline reason
)
RETURNS JSONB
```

---

#### rpc_get_pending_redemptions

**Purpose:** Get all pending redemptions for parent approval.

```sql
rpc_get_pending_redemptions(p_parent_id UUID)
RETURNS JSONB
```

**Returns:**
```json
[
  {
    "id": "uuid",
    "child_id": "uuid",
    "child_name": "Hannah",
    "reward_name": "Ice cream",
    "emoji": "🍦",
    "points_cost": 150,
    "requested_at": "2026-01-15T10:00:00Z",
    "expires_at": "2026-01-22T10:00:00Z",
    "child_current_balance": 245
  }
]
```

---

#### rpc_cancel_redemption_request

**Purpose:** Child cancels their own pending request.

```sql
rpc_cancel_redemption_request(p_redemption_id UUID)
RETURNS JSONB
```

---

### 4.3 Child Catalog RPCs

#### rpc_get_child_rewards_catalog

**Purpose:** Get rewards with availability status for child UI.

```sql
rpc_get_child_rewards_catalog(p_child_id UUID)
RETURNS JSONB
```

**Returns:**
```json
{
  "points_balance": 245,
  "rewards": [
    {
      "id": "uuid",
      "name": "Ice cream",
      "emoji": "🍦",
      "category_code": "treats",
      "category_name": "Treats",
      "points_cost": 150,
      "can_afford": true,
      "is_available": true,
      "limit_type": "per_day",
      "times_used_in_period": 0
    }
  ]
}
```

---

#### rpc_get_child_rewards_summary

**Purpose:** Mini dashboard card summary.

```sql
rpc_get_child_rewards_summary(p_child_id UUID)
RETURNS JSONB
```

**Returns:**
```json
{
  "points_balance": 245,
  "unlocked_count": 3,
  "next_reward_name": "Cinema trip",
  "next_reward_points": 800,
  "points_needed": 555
}
```

---

#### rpc_get_child_rewards_dashboard

**Purpose:** Full dashboard hero card stats.

```sql
rpc_get_child_rewards_dashboard(p_child_id UUID)
RETURNS JSONB
```

**Returns:**
```json
{
  "points_balance": 245,
  "total_earned": 1240,
  "total_spent": 995,
  "available_rewards": 8,
  "unlocked_count": 3,
  "pending_redemptions": 1,
  "pending_additions": 0,
  "total_redeemed": 5
}
```

---

### 4.4 Addition Request RPCs

#### rpc_request_reward_addition

**Purpose:** Child requests a reward be added from the catalog.

```sql
rpc_request_reward_addition(
  p_child_id UUID,
  p_template_id UUID
)
RETURNS JSONB
```

**Returns:**
```json
{
  "success": true,
  "request_id": "uuid"
}
```

**Errors:**
- `already_have` - Reward already enabled for child
- `already_requested` - Pending request exists

---

#### rpc_resolve_addition_request

**Purpose:** Parent approves/declines addition request.

```sql
rpc_resolve_addition_request(
  p_request_id UUID,
  p_action TEXT,           -- 'approve' | 'decline'
  p_parent_note TEXT,
  p_points_cost INTEGER    -- optional: override suggested points
)
RETURNS JSONB
```

**On Approve:**
1. Creates child_reward from template
2. Uses p_points_cost or template.suggested_points
3. Marks request as approved

---

#### rpc_get_pending_addition_requests

**Purpose:** Get pending addition requests for parent.

```sql
rpc_get_pending_addition_requests(p_parent_id UUID)
RETURNS JSONB
```

**Returns:**
```json
[
  {
    "id": "uuid",
    "child_id": "uuid",
    "child_name": "Hannah",
    "template_id": "uuid",
    "template_name": "Cinema trip",
    "category_name": "Activities",
    "suggested_points": 800,
    "requested_at": "2026-01-15T10:00:00Z"
  }
]
```

---

#### rpc_get_reward_catalog_for_child

**Purpose:** Full template catalog with status for child browsing.

```sql
rpc_get_reward_catalog_for_child(p_child_id UUID)
RETURNS JSONB
```

**Returns:**
```json
[
  {
    "id": "uuid",
    "name": "Cinema trip",
    "suggested_points": 800,
    "category_code": "activities",
    "category_name": "Activities",
    "category_icon": "🎯",
    "is_added": false,
    "child_reward_id": null,
    "request_pending": false,
    "pending_request_id": null
  }
]
```

---

## 5. Parent Dashboard

### rpc_get_parent_dashboard_summary

**Purpose:** Complete parent dashboard data for all children.

```sql
rpc_get_parent_dashboard_summary(
  p_parent_id UUID,
  p_week_start DATE DEFAULT NULL
)
RETURNS JSONB
```

**Returns:** Large object containing:
- `children` - Array with per-child stats, subjects, gamification
- `week_summary` - Aggregate stats for the week
- `daily_pattern` - 7-day activity breakdown
- `gentle_reminders` - AI-generated suggestions
- `coming_up_next` - Next 5 scheduled sessions
- `subject_coverage` - Topics covered per subject

---

### rpc_get_plan_coverage_overview

**Purpose:** Plan progress and coverage statistics.

```sql
rpc_get_plan_coverage_overview(p_child_id UUID)
RETURNS JSONB
```

---

### rpc_get_subject_progress

**Purpose:** Detailed subject-level progress for a child.

```sql
rpc_get_subject_progress(
  p_parent_id UUID,
  p_child_id UUID DEFAULT NULL
)
RETURNS JSONB
```

---

## 6. Scheduling & Availability

### rpc_calculate_available_sessions

**Purpose:** Calculate total sessions available in a date range.

```sql
rpc_calculate_available_sessions(
  p_child_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB
```

**Returns:**
```json
{
  "start_date": "2026-01-15",
  "end_date": "2026-03-15",
  "total_days": 60,
  "total_weeks": 8.6,
  "total_sessions": 48,
  "total_twenty_min_blocks": 96,
  "blocked_days": 2,
  "extra_sessions_added": 0,
  "average_sessions_per_week": 5.6,
  "average_blocks_per_week": 11.2,
  "weekly_template_summary": {...}
}
```

---

### rpc_calculate_recommended_sessions

**Purpose:** Calculate recommended sessions based on subjects and goals.

```sql
rpc_calculate_recommended_sessions(
  p_subject_data JSONB,
  p_goal_code TEXT,
  p_need_cluster_codes TEXT[],
  p_contingency_percent INTEGER DEFAULT 10
)
RETURNS JSONB
```

---

### rpc_generate_default_availability_template

**Purpose:** Generate a sensible default weekly template.

```sql
rpc_generate_default_availability_template(
  p_recommended_sessions INTEGER,
  p_session_pattern TEXT DEFAULT 'p45',
  p_total_weeks INTEGER DEFAULT 8
)
RETURNS JSONB
```

---

## 7. Content & Curriculum

### rpc_derive_session_policy

**Purpose:** Generate session constraints based on child's needs.

```sql
rpc_derive_session_policy(p_child_id UUID)
RETURNS JSONB
```

**Returns:**
```json
{
  "constraints": {
    "avoid_free_text": false,
    "max_difficulty": 3,
    "extra_time_allowed": false
  },
  "step_budget": {
    "recall_items": 6,
    "practice_items": 5,
    "worked_examples": 1
  }
}
```

---

### rpc_list_exam_types

**Purpose:** Get all available exam types.

```sql
rpc_list_exam_types()
RETURNS TABLE(id UUID, name TEXT, code TEXT, sort_order INTEGER)
```

---

### rpc_list_subjects_for_exam_types

**Purpose:** Get subjects for selected exam types.

```sql
rpc_list_subjects_for_exam_types(p_exam_type_ids UUID[])
RETURNS TABLE(
  subject_id UUID,
  subject_name TEXT,
  exam_type_id UUID,
  exam_board_id UUID,
  exam_board_name TEXT,
  subject_code TEXT,
  icon TEXT,
  color TEXT
)
```

---

### rpc_list_need_clusters

**Purpose:** Get all learning need clusters for selection UI.

```sql
rpc_list_need_clusters()
RETURNS TABLE(
  code TEXT,
  name TEXT,
  description TEXT,
  jcq_area jcq_area,
  jcq_area_name TEXT,
  condition_name TEXT,
  parent_friendly_name TEXT,
  typical_behaviours TEXT[],
  example_signs TEXT[],
  typically_has_accommodations BOOLEAN,
  common_arrangements TEXT[],
  sort_order INTEGER
)
```

---

## Appendix A: RPC Naming Conventions

```
rpc_[action]_[entity]_[qualifier]

Actions:
- get     : Read/fetch data
- create  : Create new record
- update  : Modify existing
- delete  : Remove record
- set     : Upsert pattern
- list    : Return multiple items
- start   : Begin process
- complete: Finish process
- calculate: Compute values
- generate : Create complex output

Entities:
- child, parent
- session, planned_session, revision_session
- reward, redemption
- achievement, streak, points
- subject, topic
```

---

## Appendix B: Common Response Patterns

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "error_code",
  "message": "Human readable message"
}
```

### Table Response
Functions returning `TABLE(...)` return row sets directly via PostgREST.

---

## Appendix C: Change Log

| Date | Version | Changes |
|------|---------|---------|
| 13 Jan 2026 | 1.0 | Initial 50 RPC functions documented |
| 24 Jan 2026 | 1.1 | Added FEAT-013 Reward System (17 RPCs) |
| 2 Feb 2026 | 2.0 | Full document consolidation, improved organization |

---

**Document End**

For implementation details, see `Backend_Developer_README.md`.
For feature context, see `RevisionHub_PRD_v9_0.md`.
