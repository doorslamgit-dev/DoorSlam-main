-- Migration: Timetable Redesign
-- Adds time_of_day to planned_sessions, creates parental_controls tables,
-- and new RPCs for topic management and parental controls.

-- ============================================================================
-- 1. Add time_of_day column to planned_sessions
-- ============================================================================

ALTER TABLE public.planned_sessions
  ADD COLUMN IF NOT EXISTS time_of_day TEXT;

COMMENT ON COLUMN public.planned_sessions.time_of_day IS
  'Time slot for this session (early_morning, morning, afternoon, after_school, evening). Populated from weekly_availability_slots during plan generation.';

-- ============================================================================
-- 2. Parental Controls tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.parental_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'none'
    CHECK (access_level IN ('none', 'requires_approval', 'auto_approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id, feature_key)
);

COMMENT ON TABLE public.parental_controls IS
  'Per-child, per-feature access controls. Generic system for gating child actions (timetable_edit, reward_requests, etc.).';

ALTER TABLE public.parental_controls ENABLE ROW LEVEL SECURITY;

-- Parents can manage their own children's controls
CREATE POLICY parental_controls_parent_all ON public.parental_controls
  FOR ALL
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Children can read their own controls
CREATE POLICY parental_controls_child_read ON public.parental_controls
  FOR SELECT
  USING (child_id IN (
    SELECT id FROM public.children WHERE parent_id = auth.uid()
  ) OR parent_id = auth.uid());


CREATE TABLE IF NOT EXISTS public.parental_control_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  request_type TEXT NOT NULL,
  request_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.parental_control_requests IS
  'Approval queue for child actions that require parent approval. Used when access_level = requires_approval.';

ALTER TABLE public.parental_control_requests ENABLE ROW LEVEL SECURITY;

-- Parents can manage requests for their children
CREATE POLICY control_requests_parent_all ON public.parental_control_requests
  FOR ALL
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Children can read and create their own requests
CREATE POLICY control_requests_child_read ON public.parental_control_requests
  FOR SELECT
  USING (child_id IN (
    SELECT id FROM public.children WHERE parent_id = auth.uid()
  ) OR parent_id = auth.uid());

CREATE POLICY control_requests_child_insert ON public.parental_control_requests
  FOR INSERT
  WITH CHECK (child_id IN (
    SELECT id FROM public.children WHERE parent_id = auth.uid()
  ));

-- ============================================================================
-- 3. RPCs — Topic management
-- ============================================================================

-- Move a topic from one session to another
CREATE OR REPLACE FUNCTION public.rpc_move_topic_between_sessions(
  p_topic_id UUID,
  p_source_session_id UUID,
  p_target_session_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_source RECORD;
  v_target RECORD;
  v_max_topics INT;
BEGIN
  -- Fetch source session
  SELECT id, topic_ids, session_pattern
    INTO v_source
    FROM public.planned_sessions
   WHERE id = p_source_session_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Source session not found');
  END IF;

  -- Verify topic exists in source
  IF NOT (p_topic_id = ANY(v_source.topic_ids)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Topic not found in source session');
  END IF;

  -- Fetch target session
  SELECT id, topic_ids, session_pattern
    INTO v_target
    FROM public.planned_sessions
   WHERE id = p_target_session_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Target session not found');
  END IF;

  -- Determine max topics for target session pattern
  v_max_topics := CASE v_target.session_pattern::TEXT
    WHEN 'SINGLE_20' THEN 1
    WHEN 'DOUBLE_45' THEN 2
    WHEN 'TRIPLE_70' THEN 3
    ELSE 3
  END;

  -- Check capacity
  IF array_length(v_target.topic_ids, 1) >= v_max_topics THEN
    RETURN jsonb_build_object('success', false, 'error', 'Target session is full');
  END IF;

  -- Remove from source
  UPDATE public.planned_sessions
     SET topic_ids = array_remove(topic_ids, p_topic_id),
         topic_count = GREATEST(0, topic_count - 1)
   WHERE id = p_source_session_id;

  -- Add to target
  UPDATE public.planned_sessions
     SET topic_ids = array_append(topic_ids, p_topic_id),
         topic_count = topic_count + 1
   WHERE id = p_target_session_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Remove a topic from a session
CREATE OR REPLACE FUNCTION public.rpc_remove_topic_from_session(
  p_topic_id UUID,
  p_session_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
BEGIN
  SELECT id, topic_ids
    INTO v_session
    FROM public.planned_sessions
   WHERE id = p_session_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session not found');
  END IF;

  IF NOT (p_topic_id = ANY(v_session.topic_ids)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Topic not found in session');
  END IF;

  UPDATE public.planned_sessions
     SET topic_ids = array_remove(topic_ids, p_topic_id),
         topic_count = GREATEST(0, topic_count - 1)
   WHERE id = p_session_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================================
-- 4. RPCs — Parental Controls
-- ============================================================================

-- Get all parental controls for a child
CREATE OR REPLACE FUNCTION public.rpc_get_parental_controls(
  p_parent_id UUID,
  p_child_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', pc.id,
        'feature_key', pc.feature_key,
        'access_level', pc.access_level,
        'updated_at', pc.updated_at
      )
    ), '[]'::JSONB)
    FROM public.parental_controls pc
    WHERE pc.parent_id = p_parent_id
      AND pc.child_id = p_child_id
  );
END;
$$;

-- Upsert a parental control setting
CREATE OR REPLACE FUNCTION public.rpc_set_parental_control(
  p_parent_id UUID,
  p_child_id UUID,
  p_feature_key TEXT,
  p_access_level TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.parental_controls (parent_id, child_id, feature_key, access_level)
  VALUES (p_parent_id, p_child_id, p_feature_key, p_access_level)
  ON CONFLICT (parent_id, child_id, feature_key)
  DO UPDATE SET access_level = EXCLUDED.access_level, updated_at = now();

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Get a child's access level for a specific feature
CREATE OR REPLACE FUNCTION public.rpc_get_child_access_level(
  p_child_id UUID,
  p_feature_key TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_level TEXT;
BEGIN
  SELECT access_level INTO v_level
    FROM public.parental_controls
   WHERE child_id = p_child_id
     AND feature_key = p_feature_key;

  RETURN COALESCE(v_level, 'none');
END;
$$;

-- Submit an approval request (child calls this)
CREATE OR REPLACE FUNCTION public.rpc_submit_approval_request(
  p_child_id UUID,
  p_feature_key TEXT,
  p_request_type TEXT,
  p_request_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_parent_id UUID;
  v_request_id UUID;
BEGIN
  -- Find parent for this child
  SELECT parent_id INTO v_parent_id
    FROM public.children
   WHERE id = p_child_id;

  IF v_parent_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Child not found');
  END IF;

  INSERT INTO public.parental_control_requests
    (parent_id, child_id, feature_key, request_type, request_data)
  VALUES
    (v_parent_id, p_child_id, p_feature_key, p_request_type, p_request_data)
  RETURNING id INTO v_request_id;

  RETURN jsonb_build_object('success', true, 'request_id', v_request_id);
END;
$$;

-- Resolve (approve/reject) an approval request
CREATE OR REPLACE FUNCTION public.rpc_resolve_approval_request(
  p_request_id UUID,
  p_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request RECORD;
BEGIN
  SELECT * INTO v_request
    FROM public.parental_control_requests
   WHERE id = p_request_id
     AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found or already resolved');
  END IF;

  UPDATE public.parental_control_requests
     SET status = p_status,
         resolved_at = now()
   WHERE id = p_request_id;

  -- If approved and it's a topic move, execute the move
  IF p_status = 'approved' AND v_request.request_type = 'move_topic' THEN
    PERFORM public.rpc_move_topic_between_sessions(
      (v_request.request_data->>'topic_id')::UUID,
      (v_request.request_data->>'source_session_id')::UUID,
      (v_request.request_data->>'target_session_id')::UUID
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Get pending approval requests for a parent
CREATE OR REPLACE FUNCTION public.rpc_get_pending_control_requests(
  p_parent_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'child_id', r.child_id,
        'child_name', c.name,
        'feature_key', r.feature_key,
        'request_type', r.request_type,
        'request_data', r.request_data,
        'created_at', r.created_at
      )
      ORDER BY r.created_at DESC
    ), '[]'::JSONB)
    FROM public.parental_control_requests r
    JOIN public.children c ON c.id = r.child_id
    WHERE r.parent_id = p_parent_id
      AND r.status = 'pending'
  );
END;
$$;
