-- Migration: Update RPCs to include time_of_day
-- Run this in Supabase Dashboard SQL editor to update existing RPCs.
--
-- Fixes:
-- 1. rpc_get_week_plan — adds time_of_day to sessions JSONB
-- 2. rpc_get_todays_sessions — adds time_of_day to return table
-- 3. rpc_regenerate_child_plan — populates time_of_day from weekly template slots
--
-- NOTE: The frontend has been updated to use direct table queries as a
-- fallback, so these RPC updates improve server-side consistency but are
-- not strictly required for the UI to function.

-- ============================================================================
-- 1. Update rpc_get_todays_sessions to include time_of_day
-- ============================================================================

-- Drop old version (different return type)
DROP FUNCTION IF EXISTS public.rpc_get_todays_sessions(uuid, date);

CREATE OR REPLACE FUNCTION public.rpc_get_todays_sessions(
  p_child_id uuid,
  p_session_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  planned_session_id uuid,
  session_date date,
  session_index integer,
  session_pattern text,
  session_duration_minutes integer,
  status text,
  subject_id uuid,
  subject_name text,
  icon text,
  color text,
  topic_count integer,
  topics_preview jsonb,
  time_of_day text
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.id AS planned_session_id,
    ps.session_date,
    ps.session_index,
    ps.session_pattern,
    ps.session_duration_minutes,
    ps.status::text,
    ps.subject_id,
    s.subject_name,
    s.icon,
    s.color,
    COALESCE(array_length(ps.topic_ids, 1), 0) AS topic_count,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', t.id,
            'topic_name', t.topic_name,
            'order_index', COALESCE(t.order_index, 0)
          )
          ORDER BY t.order_index
        )
        FROM unnest(ps.topic_ids) WITH ORDINALITY AS u(topic_id, ord)
        JOIN topics t ON t.id = u.topic_id
      ),
      '[]'::jsonb
    ) AS topics_preview,
    ps.time_of_day
  FROM planned_sessions ps
  JOIN subjects s ON s.id = ps.subject_id
  WHERE ps.child_id = p_child_id
    AND ps.session_date = p_session_date
  ORDER BY ps.session_index;
END;
$$;


-- ============================================================================
-- 2. Update rpc_get_week_plan to include time_of_day in sessions JSONB
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_get_week_plan(
  p_child_id uuid,
  p_week_start_date date
)
RETURNS TABLE(day_date date, sessions jsonb)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_week_end date := p_week_start_date + 6;
  v_day date;
BEGIN
  -- Generate one row per day in the week
  FOR v_day IN SELECT generate_series(p_week_start_date, v_week_end, '1 day'::interval)::date
  LOOP
    day_date := v_day;
    sessions := COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'planned_session_id', ps.id,
            'session_date', ps.session_date,
            'session_index', ps.session_index,
            'session_pattern', ps.session_pattern,
            'session_duration_minutes', ps.session_duration_minutes,
            'status', ps.status,
            'subject_id', ps.subject_id,
            'subject_name', s.subject_name,
            'icon', s.icon,
            'color', s.color,
            'topic_count', COALESCE(array_length(ps.topic_ids, 1), 0),
            'time_of_day', ps.time_of_day,
            'topics_preview', COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', t.id,
                    'topic_name', t.topic_name,
                    'order_index', COALESCE(t.order_index, 0)
                  )
                  ORDER BY t.order_index
                )
                FROM unnest(ps.topic_ids) WITH ORDINALITY AS u(topic_id, ord)
                JOIN topics t ON t.id = u.topic_id
              ),
              '[]'::jsonb
            )
          )
          ORDER BY ps.session_index
        )
        FROM planned_sessions ps
        JOIN subjects s ON s.id = ps.subject_id
        WHERE ps.child_id = p_child_id
          AND ps.session_date = v_day
      ),
      '[]'::jsonb
    );
    RETURN NEXT;
  END LOOP;
END;
$$;


-- ============================================================================
-- 3. Backfill time_of_day on existing planned sessions
-- ============================================================================

-- This sets time_of_day on sessions that currently have NULL, using the
-- weekly template slots. Matches by day_of_week + session_index order.
DO $$
DECLARE
  v_child RECORD;
  v_session RECORD;
  v_slots TEXT[];
  v_slot_idx INTEGER;
BEGIN
  -- For each child that has sessions without time_of_day
  FOR v_child IN
    SELECT DISTINCT child_id
    FROM planned_sessions
    WHERE time_of_day IS NULL
  LOOP
    -- For each day-of-week, get the template slots in order
    FOR v_session IN
      SELECT ps.id, ps.day_of_week, ps.session_index,
             ROW_NUMBER() OVER (
               PARTITION BY ps.session_date
               ORDER BY ps.session_index
             ) AS slot_order
      FROM planned_sessions ps
      WHERE ps.child_id = v_child.child_id
        AND ps.time_of_day IS NULL
      ORDER BY ps.session_date, ps.session_index
    LOOP
      -- Look up the N-th slot for this day in the template
      SELECT array_agg(was.time_of_day ORDER BY was.id)
      INTO v_slots
      FROM weekly_availability_template wat
      JOIN weekly_availability_slots was ON was.template_id = wat.id
      WHERE wat.child_id = v_child.child_id
        AND wat.day_of_week = CASE v_session.day_of_week
          WHEN 'monday' THEN 0
          WHEN 'tuesday' THEN 1
          WHEN 'wednesday' THEN 2
          WHEN 'thursday' THEN 3
          WHEN 'friday' THEN 4
          WHEN 'saturday' THEN 5
          WHEN 'sunday' THEN 6
        END
        AND wat.is_enabled = true;

      IF v_slots IS NOT NULL AND array_length(v_slots, 1) >= v_session.slot_order THEN
        v_slot_idx := v_session.slot_order;
        UPDATE planned_sessions
        SET time_of_day = v_slots[v_slot_idx]
        WHERE id = v_session.id;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
