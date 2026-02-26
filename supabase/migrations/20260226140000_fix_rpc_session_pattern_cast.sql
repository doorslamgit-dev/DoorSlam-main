-- Migration: Fix rpc_get_todays_sessions enum cast
--
-- Fixes 400 error: "Returned type session_pattern does not match expected type text"
-- The session_pattern column is an enum, but the function returns TEXT.
-- Adding ::text cast to the SELECT clause.
--
-- Run in Supabase Dashboard SQL editor.

-- Drop and recreate (return type changed in a prior migration, safe to drop)
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
    ps.session_pattern::text,
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
