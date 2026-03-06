-- Migration: Planning Parameters — Single source of truth for all coverage/recommendation constants
--
-- These parameters were previously hardcoded (inconsistently) across:
-- - coverageService.ts (SESSIONS_PER_TOPIC=1.0, improve_grade=1.1, excel=1.2, memory=+0.15, gap=0.08)
-- - sessionCalculator.ts (SESSIONS_PER_TOPIC=1.5, improve_grade=1.15, excel=1.3, memory=+0.2, gap=0.1)
-- Now unified in a single table, readable by both frontend and backend RPCs.

-- ============================================================================
-- 1. Create planning_parameters table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.planning_parameters (
  key TEXT PRIMARY KEY,
  value NUMERIC NOT NULL,
  category TEXT NOT NULL,        -- coverage, goals, needs, priority, grades
  label TEXT NOT NULL,           -- human-readable label for admin UI
  description TEXT,              -- explanation of what this controls
  min_value NUMERIC,             -- validation: minimum allowed
  max_value NUMERIC,             -- validation: maximum allowed
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.planning_parameters ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read (frontend needs these)
CREATE POLICY "Authenticated users can read planning parameters"
  ON public.planning_parameters FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update planning parameters"
  ON public.planning_parameters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can insert (for future parameters)
CREATE POLICY "Admins can insert planning parameters"
  ON public.planning_parameters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ============================================================================
-- 2. Seed canonical values
-- ============================================================================

INSERT INTO public.planning_parameters (key, value, category, label, description, min_value, max_value) VALUES
-- Coverage targets
('coverage.target_slots_per_topic',     1.5,  'coverage', 'Target slots per topic',      'Topic slots needed per topic for "good" coverage. Below this triggers recommendations.', 0.5, 5.0),
('coverage.default_topics_per_subject', 50,   'coverage', 'Default topics per subject',   'Fallback topic count when real curriculum data is not yet loaded.',                       10,  200),
('coverage.contingency_percent',        10,   'coverage', 'Contingency buffer %',         'Extra percentage added to recommended sessions for missed days/flexibility.',              0,   50),

-- Goal multipliers (multiply base session requirement)
('goals.pass_exam',       1.0,  'goals', 'Pass exam multiplier',       'Baseline effort — enough to cover all topics once.',                         0.5, 2.0),
('goals.improve_grade',   1.15, 'goals', 'Improve grade multiplier',   'Moderate uplift for grade improvement — more reinforcement and practice.',   0.5, 2.0),
('goals.excel',           1.3,  'goals', 'Excel multiplier',           'Highest effort — deeper coverage, more practice, spaced repetition.',        0.5, 2.0),

-- Learning needs multipliers (additive: base 1.0 + these)
('needs.memory_addition',    0.2, 'needs', 'Memory needs addition',    'Added to base multiplier for children with memory difficulties. More repetition needed.', 0, 1.0),
('needs.attention_addition', 0.1, 'needs', 'Attention/ADHD addition',  'Added to base multiplier for children with attention needs. Sessions should be shorter.',  0, 1.0),

-- Grade gap scaling
('grades.gap_multiplier_per_point', 0.1, 'grades', 'Gap multiplier per grade point', 'Additional effort per grade point gap (e.g. gap of 3 = 1.0 + 3×0.1 = 1.3×).', 0.01, 0.5),

-- Priority weights (for distributing topic slots across subjects)
('priority.high_weight',       1.0,  'priority', 'High priority weight',       'Weight for subjects in positions 1-2.',                    0.1, 2.0),
('priority.medium_weight',     0.85, 'priority', 'Medium priority weight',     'Weight for subjects in positions 3-5.',                    0.1, 2.0),
('priority.low_weight',        0.7,  'priority', 'Low priority weight',        'Weight for subjects in position 6+.',                      0.1, 2.0),
('priority.high_threshold',    2,    'priority', 'High priority max position', 'Subjects at or below this sort_order get high weight.',    1,   10),
('priority.medium_threshold',  5,    'priority', 'Medium priority max position','Subjects at or below this sort_order get medium weight.', 2,   20),

-- Session pattern defaults
('session.attention_recommended_pattern', 20, 'session', 'ADHD recommended duration', 'Recommended session duration (mins) for children with attention needs.', 15, 70)

ON CONFLICT (key) DO NOTHING;


-- ============================================================================
-- 3. Helper function to read a parameter (used by RPCs)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_planning_param(p_key TEXT, p_default NUMERIC DEFAULT 1.0)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT value FROM planning_parameters WHERE key = p_key),
    p_default
  );
$$;


-- ============================================================================
-- 4. RPC to fetch all parameters (for frontend caching)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_get_planning_parameters()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    jsonb_object_agg(key, jsonb_build_object(
      'value', value,
      'category', category,
      'label', label,
      'description', description,
      'min_value', min_value,
      'max_value', max_value
    )),
    '{}'::jsonb
  )
  FROM planning_parameters;
$$;


-- ============================================================================
-- 5. RPC to update a parameter (admin only)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_update_planning_parameter(
  p_key TEXT,
  p_value NUMERIC
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_min NUMERIC;
  v_max NUMERIC;
  v_admin BOOLEAN;
BEGIN
  -- Check admin
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) INTO v_admin;

  IF NOT v_admin THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Get validation bounds
  SELECT min_value, max_value INTO v_min, v_max
  FROM planning_parameters WHERE key = p_key;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown parameter: %', p_key;
  END IF;

  -- Validate range
  IF v_min IS NOT NULL AND p_value < v_min THEN
    RAISE EXCEPTION 'Value % is below minimum %', p_value, v_min;
  END IF;
  IF v_max IS NOT NULL AND p_value > v_max THEN
    RAISE EXCEPTION 'Value % is above maximum %', p_value, v_max;
  END IF;

  -- Update
  UPDATE planning_parameters
  SET value = p_value, updated_at = now(), updated_by = auth.uid()
  WHERE key = p_key;

  RETURN jsonb_build_object('success', true, 'key', p_key, 'value', p_value);
END;
$$;


-- ============================================================================
-- 6. Update rpc_get_plan_impact_assessment to use planning_parameters
--    AND factor in child's goal and needs
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_get_plan_impact_assessment(p_child_id uuid, p_new_subject_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_parent_id uuid;
  v_existing_subjects jsonb := '[]'::jsonb;
  v_new_subjects jsonb := '[]'::jsonb;
  v_current_weekly_sessions int := 5;
  v_current_weekly_topic_slots int := 10;
  v_existing_topic_count int := 0;
  v_new_topic_count int := 0;
  v_total_topics int;
  v_topic_slots_per_topic numeric;
  v_weeks_in_plan int := 12;
  v_total_available_sessions int;
  v_total_available_topic_slots int;
  v_recommendation text;
  v_recommendation_detail text;
  v_additional_sessions_needed int := 0;
  v_end_date date;
  -- Goal/needs variables
  v_goal_code text;
  v_goal_multiplier numeric;
  v_needs_multiplier numeric;
  v_effort_multiplier numeric;
  v_target_slots_per_topic numeric;
  v_effective_target numeric;
BEGIN
  -- Authenticate
  v_parent_id := auth.uid();
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify parent owns child
  IF NOT EXISTS (
    SELECT 1 FROM children
    WHERE id = p_child_id AND parent_id = v_parent_id
  ) THEN
    RAISE EXCEPTION 'Child not found or access denied';
  END IF;

  -- Load configurable parameters
  v_target_slots_per_topic := get_planning_param('coverage.target_slots_per_topic', 1.5);

  -- Get child's goal multiplier
  SELECT g.code INTO v_goal_code
  FROM child_goals cg
  JOIN goals g ON g.id = cg.goal_id
  WHERE cg.child_id = p_child_id
  LIMIT 1;

  v_goal_multiplier := get_planning_param(
    'goals.' || COALESCE(v_goal_code, 'pass_exam'), 1.0
  );

  -- Get child's needs multiplier
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

  -- Combined effort = goal × needs
  v_effort_multiplier := v_goal_multiplier * v_needs_multiplier;
  -- Effective target = base target adjusted by effort
  v_effective_target := v_target_slots_per_topic * v_effort_multiplier;

  -- Get weeks from revision period
  SELECT rp.end_date INTO v_end_date
  FROM revision_periods rp
  WHERE rp.child_id = p_child_id AND rp.is_active = true
  ORDER BY rp.created_at DESC LIMIT 1;

  IF v_end_date IS NOT NULL AND v_end_date > CURRENT_DATE THEN
    v_weeks_in_plan := GREATEST(1, ((v_end_date - CURRENT_DATE) / 7)::int);
  ELSE
    v_weeks_in_plan := 12;
  END IF;

  -- Count weekly sessions AND topic slots from availability template
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

  -- Get existing subjects with topic counts
  SELECT
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'subject_id', cs.subject_id,
        'subject_name', s.subject_name,
        'topic_count', COALESCE(tc.cnt, 0)
      ) ORDER BY cs.sort_order
    ), '[]'::jsonb),
    COALESCE(SUM(COALESCE(tc.cnt, 0)), 0)::int
  INTO v_existing_subjects, v_existing_topic_count
  FROM child_subjects cs
  JOIN subjects s ON s.id = cs.subject_id
  LEFT JOIN LATERAL (
    SELECT COUNT(DISTINCT t.id)::int as cnt
    FROM topics t JOIN themes th ON th.id = t.theme_id
    JOIN components c ON c.id = th.component_id
    WHERE c.subject_id = cs.subject_id
  ) tc ON true
  WHERE cs.child_id = p_child_id;

  v_existing_subjects := COALESCE(v_existing_subjects, '[]'::jsonb);
  v_existing_topic_count := COALESCE(v_existing_topic_count, 0);

  -- Get new subjects with topic counts
  IF p_new_subject_ids IS NOT NULL AND array_length(p_new_subject_ids, 1) > 0 THEN
    SELECT
      COALESCE(jsonb_agg(
        jsonb_build_object(
          'subject_id', s.id, 'subject_name', s.subject_name,
          'topic_count', COALESCE(tc.cnt, 0), 'is_new', true
        )
      ), '[]'::jsonb),
      COALESCE(SUM(COALESCE(tc.cnt, 0)), 0)::int
    INTO v_new_subjects, v_new_topic_count
    FROM subjects s
    LEFT JOIN LATERAL (
      SELECT COUNT(DISTINCT t.id)::int as cnt
      FROM topics t JOIN themes th ON th.id = t.theme_id
      JOIN components c ON c.id = th.component_id
      WHERE c.subject_id = s.id
    ) tc ON true
    WHERE s.id = ANY(p_new_subject_ids);
  END IF;

  v_new_subjects := COALESCE(v_new_subjects, '[]'::jsonb);
  v_new_topic_count := COALESCE(v_new_topic_count, 0);

  -- Calculate coverage using topic slots with effort adjustment
  v_total_topics := v_existing_topic_count + v_new_topic_count;
  v_total_available_sessions := v_current_weekly_sessions * v_weeks_in_plan;
  v_total_available_topic_slots := v_current_weekly_topic_slots * v_weeks_in_plan;

  IF v_total_topics > 0 THEN
    v_topic_slots_per_topic := v_total_available_topic_slots::numeric / v_total_topics;
  ELSE
    v_topic_slots_per_topic := 0;
  END IF;

  -- Determine recommendation using effort-adjusted target
  IF v_total_topics = 0 OR v_topic_slots_per_topic >= v_effective_target THEN
    v_recommendation := 'on_track';
    v_recommendation_detail := 'Your current schedule provides good coverage for all topics.';
    v_additional_sessions_needed := 0;
  ELSIF v_topic_slots_per_topic >= (v_effective_target * 0.67) THEN
    v_recommendation := 'tight_but_ok';
    v_additional_sessions_needed := GREATEST(0,
      CEIL(
        (v_effective_target * v_total_topics - v_total_available_topic_slots)::numeric
        / v_weeks_in_plan
        / GREATEST(1, (v_current_weekly_topic_slots::numeric / GREATEST(1, v_current_weekly_sessions)))
      )::int
    );
    v_recommendation_detail := 'Coverage is tight but manageable. Consider adding ' || v_additional_sessions_needed || ' more sessions per week.';
  ELSIF v_topic_slots_per_topic >= (v_effective_target * 0.47) THEN
    v_recommendation := 'add_sessions';
    v_additional_sessions_needed := GREATEST(0,
      CEIL(
        (v_effective_target * 0.67 * v_total_topics - v_total_available_topic_slots)::numeric
        / v_weeks_in_plan
        / GREATEST(1, (v_current_weekly_topic_slots::numeric / GREATEST(1, v_current_weekly_sessions)))
      )::int
    );
    v_recommendation_detail := 'Adding ' || v_additional_sessions_needed || ' more sessions per week would improve coverage significantly.';
  ELSE
    v_recommendation := 'prioritize';
    v_additional_sessions_needed := GREATEST(0,
      CEIL(
        (v_effective_target * 0.67 * v_total_topics - v_total_available_topic_slots)::numeric
        / v_weeks_in_plan
        / GREATEST(1, (v_current_weekly_topic_slots::numeric / GREATEST(1, v_current_weekly_sessions)))
      )::int
    );
    v_recommendation_detail := 'Coverage is low. Consider adding more sessions or focusing on fewer subjects.';
  END IF;

  RETURN jsonb_build_object(
    'child_id', p_child_id,
    'current_weekly_sessions', v_current_weekly_sessions,
    'current_weekly_topic_slots', v_current_weekly_topic_slots,
    'weeks_in_plan', v_weeks_in_plan,
    'total_available_sessions', v_total_available_sessions,
    'total_available_topic_slots', v_total_available_topic_slots,
    'existing_subjects', v_existing_subjects,
    'existing_subject_count', jsonb_array_length(v_existing_subjects),
    'existing_topic_count', v_existing_topic_count,
    'new_subjects', v_new_subjects,
    'new_subject_count', jsonb_array_length(v_new_subjects),
    'new_topic_count', v_new_topic_count,
    'total_topics', v_total_topics,
    'sessions_per_topic', ROUND(COALESCE(
      CASE WHEN v_total_topics > 0 THEN v_total_available_sessions::numeric / v_total_topics ELSE 0 END, 0), 2),
    'topic_slots_per_topic', ROUND(COALESCE(v_topic_slots_per_topic, 0), 2),
    'coverage_percent', CASE
      WHEN v_total_topics > 0 AND v_topic_slots_per_topic > 0
      THEN LEAST(100, ROUND((v_topic_slots_per_topic / v_effective_target) * 100, 0))
      ELSE 100
    END,
    'goal_code', COALESCE(v_goal_code, 'pass_exam'),
    'goal_multiplier', v_goal_multiplier,
    'needs_multiplier', v_needs_multiplier,
    'effort_multiplier', v_effort_multiplier,
    'recommendation', v_recommendation,
    'recommendation_detail', v_recommendation_detail,
    'additional_sessions_needed', v_additional_sessions_needed
  );
END;
$function$;
