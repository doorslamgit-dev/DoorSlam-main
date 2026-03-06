-- Migration: Update rpc_get_plan_coverage_overview to use topic slots and planning_parameters
--
-- Adds topic_slots fields to the response while keeping all existing session fields
-- for backwards compatibility. Uses get_planning_param() from the planning_parameters table.
--
-- Related: ADR-012, PLAN-coverage-consolidation-remaining.md (Gap 1)

CREATE OR REPLACE FUNCTION public.rpc_get_plan_coverage_overview(p_child_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_parent_id uuid;
  v_child_exists boolean;
  v_end_date date;
  v_days_remaining int;
  v_weeks_remaining numeric;
  v_planned_sessions int := 0;
  v_completed_sessions int := 0;
  v_remaining_sessions int := 0;
  v_total_minutes int := 0;
  v_completion_percent numeric := 0;
  v_subjects jsonb := '[]'::jsonb;
  v_status text := 'no_plan';
  v_sessions_per_week_needed numeric := 0;
  v_hours_per_week_needed numeric := 0;
  -- Topic slot fields (new)
  v_total_topic_slots int := 0;
  v_completed_topic_slots int := 0;
  v_remaining_topic_slots int := 0;
  v_topic_slots_per_week_needed numeric := 0;
  v_weekly_topic_slot_capacity int := 0;
  -- Planning parameter
  v_target_slots_per_topic numeric;
BEGIN
  -- Authenticate
  v_parent_id := auth.uid();
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify parent owns child
  SELECT EXISTS(
    SELECT 1 FROM children WHERE id = p_child_id AND parent_id = v_parent_id
  ) INTO v_child_exists;

  IF NOT v_child_exists THEN
    RAISE EXCEPTION 'Child not found or access denied';
  END IF;

  -- Load configurable parameters
  v_target_slots_per_topic := get_planning_param('coverage.target_slots_per_topic', 1.5);

  -- Get revision period end date
  SELECT rp.end_date INTO v_end_date
  FROM revision_periods rp
  WHERE rp.child_id = p_child_id AND rp.is_active = true
  ORDER BY rp.created_at DESC LIMIT 1;

  -- Check if any planned sessions exist
  IF NOT EXISTS (
    SELECT 1 FROM planned_sessions WHERE child_id = p_child_id
  ) THEN
    RETURN jsonb_build_object(
      'child_id', p_child_id,
      'revision_period', NULL,
      'totals', jsonb_build_object(
        'planned_sessions', 0, 'completed_sessions', 0, 'remaining_sessions', 0,
        'total_minutes', 0, 'total_hours', 0, 'completion_percent', 0,
        'total_topic_slots', 0, 'completed_topic_slots', 0, 'remaining_topic_slots', 0
      ),
      'subjects', '[]'::jsonb,
      'status', 'no_plan',
      'pace', NULL
    );
  END IF;

  -- Calculate days/weeks remaining
  IF v_end_date IS NOT NULL AND v_end_date > CURRENT_DATE THEN
    v_days_remaining := (v_end_date - CURRENT_DATE)::int;
    v_weeks_remaining := ROUND(v_days_remaining / 7.0, 1);
  ELSE
    v_days_remaining := 0;
    v_weeks_remaining := 0;
  END IF;

  -- Aggregate session totals with topic slot calculation
  SELECT
    COUNT(*)::int,
    COUNT(*) FILTER (WHERE ps.status = 'completed')::int,
    COUNT(*) FILTER (WHERE ps.status != 'completed')::int,
    COALESCE(SUM(ps.session_duration_minutes), 0)::int,
    -- Topic slot totals: p20=1, p45=2, p70=3
    COALESCE(SUM(
      CASE ps.session_pattern
        WHEN 'SINGLE_20' THEN 1 WHEN 'DOUBLE_45' THEN 2 WHEN 'TRIPLE_70' THEN 3 ELSE 2
      END
    ), 0)::int,
    COALESCE(SUM(
      CASE WHEN ps.status = 'completed' THEN
        CASE ps.session_pattern
          WHEN 'SINGLE_20' THEN 1 WHEN 'DOUBLE_45' THEN 2 WHEN 'TRIPLE_70' THEN 3 ELSE 2
        END
      ELSE 0 END
    ), 0)::int,
    COALESCE(SUM(
      CASE WHEN ps.status != 'completed' THEN
        CASE ps.session_pattern
          WHEN 'SINGLE_20' THEN 1 WHEN 'DOUBLE_45' THEN 2 WHEN 'TRIPLE_70' THEN 3 ELSE 2
        END
      ELSE 0 END
    ), 0)::int
  INTO
    v_planned_sessions, v_completed_sessions, v_remaining_sessions, v_total_minutes,
    v_total_topic_slots, v_completed_topic_slots, v_remaining_topic_slots
  FROM planned_sessions ps
  WHERE ps.child_id = p_child_id;

  -- Completion percent
  IF v_planned_sessions > 0 THEN
    v_completion_percent := ROUND((v_completed_sessions::numeric / v_planned_sessions) * 100, 1);
  END IF;

  -- Per-subject breakdown with topic slots
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'subject_id', sub.subject_id,
      'subject_name', sub.subject_name,
      'color', sub.color,
      'icon', sub.icon,
      'planned_sessions', sub.planned,
      'completed_sessions', sub.completed,
      'remaining_sessions', sub.remaining,
      'total_minutes', sub.total_min,
      'completion_percent', CASE WHEN sub.planned > 0
        THEN ROUND((sub.completed::numeric / sub.planned) * 100, 1) ELSE 0 END,
      'planned_topic_slots', sub.planned_slots,
      'completed_topic_slots', sub.completed_slots,
      'remaining_topic_slots', sub.remaining_slots
    )
  ), '[]'::jsonb)
  INTO v_subjects
  FROM (
    SELECT
      ps.subject_id,
      s.subject_name,
      s.color,
      s.icon,
      COUNT(*)::int AS planned,
      COUNT(*) FILTER (WHERE ps.status = 'completed')::int AS completed,
      COUNT(*) FILTER (WHERE ps.status != 'completed')::int AS remaining,
      COALESCE(SUM(ps.session_duration_minutes), 0)::int AS total_min,
      COALESCE(SUM(
        CASE ps.session_pattern
          WHEN 'SINGLE_20' THEN 1 WHEN 'DOUBLE_45' THEN 2 WHEN 'TRIPLE_70' THEN 3 ELSE 2
        END
      ), 0)::int AS planned_slots,
      COALESCE(SUM(
        CASE WHEN ps.status = 'completed' THEN
          CASE ps.session_pattern
            WHEN 'SINGLE_20' THEN 1 WHEN 'DOUBLE_45' THEN 2 WHEN 'TRIPLE_70' THEN 3 ELSE 2
          END
        ELSE 0 END
      ), 0)::int AS completed_slots,
      COALESCE(SUM(
        CASE WHEN ps.status != 'completed' THEN
          CASE ps.session_pattern
            WHEN 'SINGLE_20' THEN 1 WHEN 'DOUBLE_45' THEN 2 WHEN 'TRIPLE_70' THEN 3 ELSE 2
          END
        ELSE 0 END
      ), 0)::int AS remaining_slots
    FROM planned_sessions ps
    JOIN subjects s ON s.id = ps.subject_id
    WHERE ps.child_id = p_child_id
    GROUP BY ps.subject_id, s.subject_name, s.color, s.icon
    ORDER BY s.subject_name
  ) sub;

  -- Get weekly topic slot capacity from availability template
  SELECT COALESCE(SUM(
    CASE was.session_pattern
      WHEN 'p20' THEN 1 WHEN 'p45' THEN 2 WHEN 'p70' THEN 3 ELSE 2
    END
  ), 0)::int
  INTO v_weekly_topic_slot_capacity
  FROM weekly_availability_template wat
  JOIN weekly_availability_slots was ON was.template_id = wat.id
  WHERE wat.child_id = p_child_id AND wat.is_enabled = true;

  -- Calculate pace needed
  IF v_weeks_remaining > 0 AND v_remaining_sessions > 0 THEN
    v_sessions_per_week_needed := ROUND(v_remaining_sessions::numeric / v_weeks_remaining, 1);
    v_hours_per_week_needed := ROUND(
      (v_total_minutes - COALESCE(
        (SELECT SUM(session_duration_minutes) FROM planned_sessions
         WHERE child_id = p_child_id AND status = 'completed'), 0
      ))::numeric / v_weeks_remaining / 60, 1
    );
    v_topic_slots_per_week_needed := ROUND(v_remaining_topic_slots::numeric / v_weeks_remaining, 1);
  END IF;

  -- Determine status
  IF v_completion_percent >= 100 THEN
    v_status := 'complete';
  ELSIF v_weeks_remaining > 0 AND v_weekly_topic_slot_capacity > 0 THEN
    -- Use topic slot capacity vs need for status
    IF v_weekly_topic_slot_capacity >= v_topic_slots_per_week_needed THEN
      v_status := 'on_track';
    ELSIF v_weekly_topic_slot_capacity >= (v_topic_slots_per_week_needed * 0.7) THEN
      v_status := 'manageable';
    ELSE
      v_status := 'intensive';
    END IF;
  ELSE
    v_status := 'on_track';
  END IF;

  RETURN jsonb_build_object(
    'child_id', p_child_id,
    'revision_period', CASE
      WHEN v_end_date IS NOT NULL THEN jsonb_build_object(
        'end_date', v_end_date,
        'days_remaining', v_days_remaining,
        'weeks_remaining', v_weeks_remaining
      )
      ELSE NULL
    END,
    'totals', jsonb_build_object(
      'planned_sessions', v_planned_sessions,
      'completed_sessions', v_completed_sessions,
      'remaining_sessions', v_remaining_sessions,
      'total_minutes', v_total_minutes,
      'total_hours', ROUND(v_total_minutes / 60.0, 1),
      'completion_percent', v_completion_percent,
      -- New topic slot fields
      'total_topic_slots', v_total_topic_slots,
      'completed_topic_slots', v_completed_topic_slots,
      'remaining_topic_slots', v_remaining_topic_slots
    ),
    'subjects', v_subjects,
    'status', v_status,
    'pace', CASE
      WHEN v_weeks_remaining > 0 THEN jsonb_build_object(
        'sessions_per_week_needed', v_sessions_per_week_needed,
        'hours_per_week_needed', v_hours_per_week_needed,
        'topic_slots_per_week_needed', v_topic_slots_per_week_needed
      )
      ELSE NULL
    END
  );
END;
$function$;
