-- Migration: Split onboarding into Phase 1 (child + subjects) and Phase 2 (schedule setup)
-- Deploy via: Supabase Dashboard → SQL Editor → paste & run
-- Context: The monolithic rpc_parent_create_child_and_plan requires revision_period + availability.
--          These 4 new functions enable a lighter Phase 1 (just child + subjects) and
--          fill gaps in Phase 2 where no existing RPC existed.

-- ============================================================
-- 0a. rpc_parent_create_child_basic — Phase 1
--     Creates child + enrolls subjects. No revision period, no plan, no sessions.
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_parent_create_child_basic(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid := auth.uid();
  v_child_id uuid;
  v_child jsonb := p_payload->'child';
  v_subjects jsonb := p_payload->'subjects';
  v_qual_id uuid;
  i integer;
BEGIN
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Resolve qualification_id from exam_type_ids if provided
  IF p_payload->'exam_type_ids' IS NOT NULL AND jsonb_array_length(p_payload->'exam_type_ids') > 0 THEN
    v_qual_id := (p_payload->'exam_type_ids'->>0)::uuid;
  END IF;

  -- 1. Create child
  INSERT INTO public.children (parent_id, first_name, last_name, preferred_name, country, year_group, primary_qualification_id)
  VALUES (
    v_parent_id,
    v_child->>'first_name',
    NULLIF(TRIM(v_child->>'last_name'), ''),
    NULLIF(TRIM(v_child->>'preferred_name'), ''),
    COALESCE(NULLIF(TRIM(v_child->>'country'), ''), 'England'),
    COALESCE((v_child->>'year_group')::integer, 11),
    v_qual_id
  )
  RETURNING id INTO v_child_id;

  -- 2. Enrol subjects (no grades yet — grades set in Phase 2)
  IF v_subjects IS NOT NULL AND jsonb_array_length(v_subjects) > 0 THEN
    FOR i IN 0..jsonb_array_length(v_subjects) - 1 LOOP
      INSERT INTO public.child_subjects (child_id, subject_id, sort_order)
      VALUES (
        v_child_id,
        (v_subjects->i->>'subject_id')::uuid,
        COALESCE((v_subjects->i->>'sort_order')::integer, i + 1)
      );
    END LOOP;
  END IF;

  -- Gamification rows (child_points, child_streaks, child_point_config) are
  -- auto-created by the existing trigger: ensure_child_gamification_rows

  RETURN jsonb_build_object('child_id', v_child_id);
END;
$$;


-- ============================================================
-- 0b. rpc_set_child_goal — Phase 2
--     Upserts child_goals. Accepts goal_code text, resolves to goal_id internally.
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_set_child_goal(p_child_id uuid, p_goal_code text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_goal_id uuid;
BEGIN
  SELECT id INTO v_goal_id FROM public.goals WHERE code = p_goal_code;
  IF v_goal_id IS NULL THEN
    RAISE EXCEPTION 'Unknown goal code: %', p_goal_code;
  END IF;

  INSERT INTO public.child_goals (child_id, goal_id)
  VALUES (p_child_id, v_goal_id)
  ON CONFLICT (child_id) DO UPDATE SET goal_id = v_goal_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;


-- ============================================================
-- 0c. rpc_update_child_subject_grades — Phase 2
--     Updates current_grade and target_grade (both TEXT) on child_subjects.
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_update_child_subject_grades(p_child_id uuid, p_grades jsonb)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_updated integer := 0;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_grades) LOOP
    UPDATE public.child_subjects
    SET current_grade = v_item->>'current_grade',
        target_grade = v_item->>'target_grade',
        grade_confidence = COALESCE(v_item->>'grade_confidence', grade_confidence),
        updated_at = now()
    WHERE child_id = p_child_id
      AND subject_id = (v_item->>'subject_id')::uuid;

    IF FOUND THEN
      v_updated := v_updated + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'updated', v_updated);
END;
$$;


-- ============================================================
-- 0d. rpc_init_child_revision_period — Phase 2
--     Creates revision_periods + revision_plans rows, links period to child.
--     Must be called BEFORE saveTemplateAndRegenerate (which needs a plan row).
-- ============================================================
CREATE OR REPLACE FUNCTION public.rpc_init_child_revision_period(p_child_id uuid, p_period jsonb)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_id uuid;
  v_plan_id uuid;
  v_start date := (p_period->>'start_date')::date;
  v_end date := (p_period->>'end_date')::date;
BEGIN
  IF v_start IS NULL OR v_end IS NULL THEN
    RAISE EXCEPTION 'start_date and end_date are required';
  END IF;

  IF v_end <= v_start THEN
    RAISE EXCEPTION 'end_date must be after start_date';
  END IF;

  -- 1. Deactivate any existing active revision periods for this child
  UPDATE public.revision_periods
  SET is_active = false, updated_at = now()
  WHERE child_id = p_child_id AND is_active = true;

  -- 2. Create new revision period
  INSERT INTO public.revision_periods (child_id, start_date, end_date, contingency_percent, feeling_code, history_code, is_active)
  VALUES (
    p_child_id,
    v_start,
    v_end,
    COALESCE((p_period->>'contingency_percent')::integer, 10),
    p_period->>'feeling_code',
    p_period->>'history_code',
    true
  )
  RETURNING id INTO v_period_id;

  -- 3. Link period to child + update feeling/history codes
  UPDATE public.children
  SET active_revision_period_id = v_period_id,
      feeling_code = COALESCE(p_period->>'feeling_code', feeling_code),
      history_code = COALESCE(p_period->>'history_code', history_code),
      updated_at = now()
  WHERE id = p_child_id;

  -- 4. Create revision plan (needed by rpc_regenerate_child_plan)
  INSERT INTO public.revision_plans (child_id, start_date, end_date, status)
  VALUES (p_child_id, v_start, v_end, 'active')
  RETURNING id INTO v_plan_id;

  RETURN jsonb_build_object('revision_period_id', v_period_id, 'plan_id', v_plan_id);
END;
$$;
