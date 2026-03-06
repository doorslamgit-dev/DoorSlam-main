-- Migration: RPCs for removing subjects from a child's revision plan
--
-- Creates two RPCs:
--   1. rpc_get_deletion_impact_assessment — read-only preview of what happens
--   2. rpc_remove_subjects_from_child — execute the deletion
--
-- Related: PLAN-delete-subject-modal.md

-- ============================================================================
-- RPC 1: Preview deletion impact (read-only)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_get_deletion_impact_assessment(
  p_child_id uuid,
  p_subject_ids uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_parent_id uuid;
  v_remaining_subjects jsonb := '[]'::jsonb;
  v_removing_subjects jsonb := '[]'::jsonb;
  v_remaining_topic_count int := 0;
  v_removing_topic_count int := 0;
  v_current_weekly_sessions int := 5;
  v_current_weekly_topic_slots int := 10;
  v_weeks_in_plan int := 12;
  v_total_available_topic_slots int;
  v_end_date date;
  v_future_sessions_to_delete int := 0;
  v_completed_sessions_preserved int := 0;
  v_current_total_topics int := 0;
  v_current_slots_per_topic numeric := 0;
  v_new_slots_per_topic numeric := 0;
  v_current_coverage_percent numeric := 0;
  v_new_coverage_percent numeric := 0;
  v_recommendation text;
  v_recommendation_detail text;
  v_excess_sessions_per_week numeric := 0;
  -- Planning parameters
  v_target_slots_per_topic numeric;
  v_goal_code text;
  v_goal_multiplier numeric;
  v_needs_multiplier numeric;
  v_effective_target numeric;
BEGIN
  -- Authenticate
  v_parent_id := auth.uid();
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify parent owns child
  IF NOT EXISTS (
    SELECT 1 FROM children WHERE id = p_child_id AND parent_id = v_parent_id
  ) THEN
    RAISE EXCEPTION 'Child not found or access denied';
  END IF;

  -- Validate input
  IF p_subject_ids IS NULL OR array_length(p_subject_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'No subjects specified for removal';
  END IF;

  -- Load planning parameters
  v_target_slots_per_topic := get_planning_param('coverage.target_slots_per_topic', 1.5);

  -- Goal multiplier
  SELECT g.code INTO v_goal_code
  FROM child_goals cg
  JOIN goals g ON g.id = cg.goal_id
  WHERE cg.child_id = p_child_id
  LIMIT 1;

  v_goal_multiplier := get_planning_param(
    'goals.' || COALESCE(v_goal_code, 'pass_exam'), 1.0
  );

  -- Needs multiplier
  v_needs_multiplier := 1.0;
  IF EXISTS (
    SELECT 1 FROM child_need_clusters cnc
    JOIN need_clusters nc ON nc.id = cnc.cluster_id
    WHERE cnc.child_id = p_child_id
      AND nc.code IN ('REMEMBERING_FACTS', 'MEMORY_DIFFICULTIES')
  ) THEN
    v_needs_multiplier := v_needs_multiplier + get_planning_param('needs.memory_addition', 0.2);
  END IF;

  IF EXISTS (
    SELECT 1 FROM child_need_clusters cnc
    JOIN need_clusters nc ON nc.id = cnc.cluster_id
    WHERE cnc.child_id = p_child_id
      AND nc.code IN ('ADHD_TRAITS', 'ATTENTION_FOCUS')
  ) THEN
    v_needs_multiplier := v_needs_multiplier + get_planning_param('needs.attention_addition', 0.1);
  END IF;

  v_effective_target := v_target_slots_per_topic * v_goal_multiplier * v_needs_multiplier;

  -- Weeks remaining
  SELECT rp.end_date INTO v_end_date
  FROM revision_periods rp
  WHERE rp.child_id = p_child_id AND rp.is_active = true
  ORDER BY rp.created_at DESC LIMIT 1;

  IF v_end_date IS NOT NULL AND v_end_date > CURRENT_DATE THEN
    v_weeks_in_plan := GREATEST(1, ((v_end_date - CURRENT_DATE) / 7)::int);
  ELSE
    v_weeks_in_plan := 12;
  END IF;

  -- Weekly capacity
  SELECT
    COALESCE(COUNT(*), 0)::int,
    COALESCE(SUM(
      CASE was.session_pattern
        WHEN 'p20' THEN 1 WHEN 'p45' THEN 2 WHEN 'p70' THEN 3 ELSE 2
      END
    ), 0)::int
  INTO v_current_weekly_sessions, v_current_weekly_topic_slots
  FROM weekly_availability_template wat
  JOIN weekly_availability_slots was ON was.template_id = wat.id
  WHERE wat.child_id = p_child_id AND wat.is_enabled = true;

  IF v_current_weekly_sessions IS NULL OR v_current_weekly_sessions = 0 THEN
    v_current_weekly_sessions := 5;
    v_current_weekly_topic_slots := 10;
  END IF;

  v_total_available_topic_slots := v_current_weekly_topic_slots * v_weeks_in_plan;

  -- Remaining subjects (NOT being removed)
  SELECT
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'subject_id', cs.subject_id,
        'subject_name', s.subject_name,
        'topic_count', COALESCE(tc.cnt, 0)
      ) ORDER BY cs.sort_order
    ), '[]'::jsonb),
    COALESCE(SUM(COALESCE(tc.cnt, 0)), 0)::int
  INTO v_remaining_subjects, v_remaining_topic_count
  FROM child_subjects cs
  JOIN subjects s ON s.id = cs.subject_id
  LEFT JOIN LATERAL (
    SELECT COUNT(DISTINCT t.id)::int as cnt
    FROM topics t JOIN themes th ON th.id = t.theme_id
    JOIN components c ON c.id = th.component_id
    WHERE c.subject_id = cs.subject_id
  ) tc ON true
  WHERE cs.child_id = p_child_id
    AND cs.subject_id != ALL(p_subject_ids);

  -- Subjects being removed
  SELECT
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'subject_id', cs.subject_id,
        'subject_name', s.subject_name,
        'topic_count', COALESCE(tc.cnt, 0)
      ) ORDER BY cs.sort_order
    ), '[]'::jsonb),
    COALESCE(SUM(COALESCE(tc.cnt, 0)), 0)::int
  INTO v_removing_subjects, v_removing_topic_count
  FROM child_subjects cs
  JOIN subjects s ON s.id = cs.subject_id
  LEFT JOIN LATERAL (
    SELECT COUNT(DISTINCT t.id)::int as cnt
    FROM topics t JOIN themes th ON th.id = t.theme_id
    JOIN components c ON c.id = th.component_id
    WHERE c.subject_id = cs.subject_id
  ) tc ON true
  WHERE cs.child_id = p_child_id
    AND cs.subject_id = ANY(p_subject_ids);

  -- Count future planned sessions to delete
  SELECT COALESCE(COUNT(*), 0)::int
  INTO v_future_sessions_to_delete
  FROM planned_sessions
  WHERE child_id = p_child_id
    AND subject_id = ANY(p_subject_ids)
    AND status = 'planned'
    AND session_date > CURRENT_DATE;

  -- Count completed/started sessions to preserve
  SELECT COALESCE(COUNT(*), 0)::int
  INTO v_completed_sessions_preserved
  FROM planned_sessions
  WHERE child_id = p_child_id
    AND subject_id = ANY(p_subject_ids)
    AND status IN ('completed', 'started');

  -- Coverage calculations
  v_current_total_topics := v_remaining_topic_count + v_removing_topic_count;

  IF v_current_total_topics > 0 THEN
    v_current_slots_per_topic := v_total_available_topic_slots::numeric / v_current_total_topics;
    v_current_coverage_percent := LEAST(100, ROUND(
      (v_current_slots_per_topic / v_effective_target) * 100, 0
    ));
  ELSE
    v_current_coverage_percent := 100;
  END IF;

  IF v_remaining_topic_count > 0 THEN
    v_new_slots_per_topic := v_total_available_topic_slots::numeric / v_remaining_topic_count;
    v_new_coverage_percent := LEAST(100, ROUND(
      (v_new_slots_per_topic / v_effective_target) * 100, 0
    ));
  ELSE
    v_new_coverage_percent := 100;
  END IF;

  -- Excess capacity calculation
  IF v_remaining_topic_count > 0 AND v_new_slots_per_topic > (v_effective_target * 2) THEN
    -- Calculate how many sessions per week could be freed
    v_excess_sessions_per_week := ROUND(
      ((v_new_slots_per_topic - v_effective_target * 1.5) * v_remaining_topic_count)
      / v_weeks_in_plan
      / GREATEST(1, (v_current_weekly_topic_slots::numeric / GREATEST(1, v_current_weekly_sessions)))
    , 1);
    v_excess_sessions_per_week := GREATEST(0, v_excess_sessions_per_week);
  END IF;

  -- Determine recommendation
  IF v_remaining_topic_count = 0 THEN
    v_recommendation := 'no_subjects_remain';
    v_recommendation_detail := 'All subjects will be removed. The revision schedule will be empty.';
  ELSIF v_excess_sessions_per_week > 0 THEN
    v_recommendation := 'excess_capacity';
    v_recommendation_detail := 'After removing ' || jsonb_array_length(v_removing_subjects)
      || ' subject(s), coverage improves to ' || v_new_coverage_percent
      || '%. You could reduce your weekly schedule by ~'
      || v_excess_sessions_per_week || ' session(s) if you want.';
  ELSIF v_new_coverage_percent > v_current_coverage_percent THEN
    v_recommendation := 'coverage_improves';
    v_recommendation_detail := 'Removing ' || jsonb_array_length(v_removing_subjects)
      || ' subject(s) frees up capacity. Coverage for remaining subjects improves from '
      || v_current_coverage_percent || '% to ' || v_new_coverage_percent || '%.';
  ELSE
    v_recommendation := 'no_change';
    v_recommendation_detail := 'Coverage remains the same after removal.';
  END IF;

  RETURN jsonb_build_object(
    'child_id', p_child_id,
    'current_weekly_sessions', v_current_weekly_sessions,
    'weeks_in_plan', v_weeks_in_plan,
    'remaining_subjects', COALESCE(v_remaining_subjects, '[]'::jsonb),
    'remaining_subject_count', COALESCE(jsonb_array_length(v_remaining_subjects), 0),
    'remaining_topic_count', v_remaining_topic_count,
    'removing_subjects', COALESCE(v_removing_subjects, '[]'::jsonb),
    'removing_subject_count', COALESCE(jsonb_array_length(v_removing_subjects), 0),
    'removing_topic_count', v_removing_topic_count,
    'future_sessions_to_delete', v_future_sessions_to_delete,
    'completed_sessions_preserved', v_completed_sessions_preserved,
    'current_coverage_percent', v_current_coverage_percent,
    'new_coverage_percent', v_new_coverage_percent,
    'current_sessions_per_topic', ROUND(COALESCE(v_current_slots_per_topic, 0), 2),
    'new_sessions_per_topic', ROUND(COALESCE(v_new_slots_per_topic, 0), 2),
    'recommendation', v_recommendation,
    'recommendation_detail', v_recommendation_detail,
    'excess_sessions_per_week', COALESCE(v_excess_sessions_per_week, 0)
  );
END;
$function$;


-- ============================================================================
-- RPC 2: Execute subject removal
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_remove_subjects_from_child(
  p_child_id uuid,
  p_subject_ids uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_parent_id uuid;
  v_removed_subjects jsonb := '[]'::jsonb;
  v_removed_count int := 0;
  v_sessions_deleted int := 0;
  v_sessions_preserved int := 0;
  v_future_session_ids uuid[];
  v_child_subject_ids uuid[];
BEGIN
  -- Authenticate
  v_parent_id := auth.uid();
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify parent owns child
  IF NOT EXISTS (
    SELECT 1 FROM children WHERE id = p_child_id AND parent_id = v_parent_id
  ) THEN
    RAISE EXCEPTION 'Child not found or access denied';
  END IF;

  -- Validate input
  IF p_subject_ids IS NULL OR array_length(p_subject_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'No subjects specified for removal';
  END IF;

  -- Collect subject names before deletion (for response)
  SELECT
    COALESCE(jsonb_agg(
      jsonb_build_object('subject_id', cs.subject_id, 'subject_name', s.subject_name)
    ), '[]'::jsonb),
    COALESCE(COUNT(*), 0)::int
  INTO v_removed_subjects, v_removed_count
  FROM child_subjects cs
  JOIN subjects s ON s.id = cs.subject_id
  WHERE cs.child_id = p_child_id AND cs.subject_id = ANY(p_subject_ids);

  IF v_removed_count = 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'child_id', p_child_id,
      'removed_count', 0,
      'removed_subjects', '[]'::jsonb,
      'sessions_deleted', 0,
      'sessions_preserved', 0,
      'message', 'No matching subjects found to remove'
    );
  END IF;

  -- Get child_subject IDs for FK cleanup
  SELECT ARRAY_AGG(id) INTO v_child_subject_ids
  FROM child_subjects
  WHERE child_id = p_child_id AND subject_id = ANY(p_subject_ids);

  -- Count completed sessions to preserve (for response)
  SELECT COALESCE(COUNT(*), 0)::int INTO v_sessions_preserved
  FROM planned_sessions
  WHERE child_id = p_child_id
    AND subject_id = ANY(p_subject_ids)
    AND status IN ('completed', 'started');

  -- Collect future planned session IDs for FK cleanup
  SELECT ARRAY_AGG(id) INTO v_future_session_ids
  FROM planned_sessions
  WHERE child_id = p_child_id
    AND subject_id = ANY(p_subject_ids)
    AND status = 'planned'
    AND session_date > CURRENT_DATE;

  v_sessions_deleted := COALESCE(array_length(v_future_session_ids, 1), 0);

  -- === DELETION ORDER (respecting FK constraints) ===

  -- 1. child_pathways → FK to child_subjects.id (no cascade)
  IF v_child_subject_ids IS NOT NULL THEN
    DELETE FROM child_pathways
    WHERE child_subject_id = ANY(v_child_subject_ids);
  END IF;

  -- 2. child_exams → FK to children.id + subjects.id
  DELETE FROM child_exams
  WHERE child_id = p_child_id AND subject_id = ANY(p_subject_ids);

  -- 3. child_subject_progress → keyed by (child_id, subject_id)
  DELETE FROM child_subject_progress
  WHERE child_id = p_child_id AND subject_id = ANY(p_subject_ids);

  -- 4. Null out FKs pointing to future planned sessions
  IF v_future_session_ids IS NOT NULL THEN
    -- study_buddy_threads.planned_session_id → planned_sessions.id
    UPDATE study_buddy_threads
    SET planned_session_id = NULL
    WHERE planned_session_id = ANY(v_future_session_ids);

    -- study_buddy_learning_notes referencing these threads
    -- (no direct FK to planned_sessions, so safe)

    -- revision_sessions.planned_session_id → planned_sessions.id
    UPDATE revision_sessions
    SET planned_session_id = NULL
    WHERE planned_session_id = ANY(v_future_session_ids);

    -- 5. Delete future planned sessions
    DELETE FROM planned_sessions
    WHERE id = ANY(v_future_session_ids);
  END IF;

  -- 6. Delete child_subjects records
  DELETE FROM child_subjects
  WHERE child_id = p_child_id AND subject_id = ANY(p_subject_ids);

  RETURN jsonb_build_object(
    'success', true,
    'child_id', p_child_id,
    'removed_count', v_removed_count,
    'removed_subjects', v_removed_subjects,
    'sessions_deleted', v_sessions_deleted,
    'sessions_preserved', v_sessions_preserved
  );
END;
$function$;
