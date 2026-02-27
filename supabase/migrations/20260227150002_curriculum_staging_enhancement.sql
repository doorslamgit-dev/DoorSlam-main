-- ==========================================================================
-- Migration: Curriculum Staging Enhancement
-- Date: 2026-02-27
--
-- Enhances the curriculum_staging table with ordering, validation, and
-- batch tracking columns. Creates the rpc_normalize_curriculum_staging
-- function to move approved staging rows into the normalised hierarchy
-- (components → themes → topics).
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. Enhance curriculum_staging table
-- --------------------------------------------------------------------------

ALTER TABLE public.curriculum_staging
  ADD COLUMN IF NOT EXISTS component_order int4 NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS component_weighting text,
  ADD COLUMN IF NOT EXISTS theme_order int4 NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS topic_order int4 NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS canonical_code text,
  ADD COLUMN IF NOT EXISTS extraction_batch_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Add CHECK constraint for status (separate statement for IF NOT EXISTS safety)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'curriculum_staging_status_check'
  ) THEN
    ALTER TABLE public.curriculum_staging
      ADD CONSTRAINT curriculum_staging_status_check
      CHECK (status IN ('pending', 'review', 'approved', 'rejected', 'imported'));
  END IF;
END $$;

-- Index for batch lookups
CREATE INDEX IF NOT EXISTS idx_curriculum_staging_batch
  ON public.curriculum_staging (extraction_batch_id);

-- Index for subject + status queries (normalization reads approved rows per subject)
CREATE INDEX IF NOT EXISTS idx_curriculum_staging_subject_status
  ON public.curriculum_staging (subject_id, status);

-- --------------------------------------------------------------------------
-- 2. Add unique constraints on production tables for ON CONFLICT support
-- --------------------------------------------------------------------------

-- Components: unique per subject + name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'components_subject_name_unique'
  ) THEN
    ALTER TABLE public.components
      ADD CONSTRAINT components_subject_name_unique
      UNIQUE (subject_id, component_name);
  END IF;
END $$;

-- Themes: unique per component + name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'themes_component_name_unique'
  ) THEN
    ALTER TABLE public.themes
      ADD CONSTRAINT themes_component_name_unique
      UNIQUE (component_id, theme_name);
  END IF;
END $$;

-- Topics: unique per theme + name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topics_theme_name_unique'
  ) THEN
    ALTER TABLE public.topics
      ADD CONSTRAINT topics_theme_name_unique
      UNIQUE (theme_id, topic_name);
  END IF;
END $$;

-- --------------------------------------------------------------------------
-- 3. Normalization RPC
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_normalize_curriculum_staging(
  p_subject_id UUID,
  p_batch_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_comp RECORD;
  v_theme RECORD;
  v_topic RECORD;
  v_component_id UUID;
  v_theme_id UUID;
  v_components_created INT := 0;
  v_themes_created INT := 0;
  v_topics_created INT := 0;
  v_rows_imported INT := 0;
BEGIN
  -- -----------------------------------------------------------------------
  -- Step 1: Insert distinct components
  -- -----------------------------------------------------------------------
  FOR v_comp IN
    SELECT DISTINCT ON (component_name)
      component_name,
      component_order,
      component_weighting
    FROM public.curriculum_staging
    WHERE subject_id = p_subject_id
      AND status = 'approved'
      AND (p_batch_id IS NULL OR extraction_batch_id = p_batch_id)
    ORDER BY component_name, component_order
  LOOP
    INSERT INTO public.components (subject_id, component_name, component_weighting, order_index)
    VALUES (p_subject_id, v_comp.component_name, v_comp.component_weighting, v_comp.component_order)
    ON CONFLICT (subject_id, component_name) DO UPDATE
      SET component_weighting = EXCLUDED.component_weighting,
          order_index = EXCLUDED.order_index;

    v_components_created := v_components_created + 1;
  END LOOP;

  -- -----------------------------------------------------------------------
  -- Step 2: Insert distinct themes per component
  -- -----------------------------------------------------------------------
  FOR v_theme IN
    SELECT DISTINCT ON (cs.component_name, cs.theme_name)
      cs.component_name,
      cs.theme_name,
      cs.theme_order
    FROM public.curriculum_staging cs
    WHERE cs.subject_id = p_subject_id
      AND cs.status = 'approved'
      AND (p_batch_id IS NULL OR cs.extraction_batch_id = p_batch_id)
    ORDER BY cs.component_name, cs.theme_name, cs.theme_order
  LOOP
    -- Look up the component_id
    SELECT c.id INTO v_component_id
    FROM public.components c
    WHERE c.subject_id = p_subject_id
      AND c.component_name = v_theme.component_name;

    IF v_component_id IS NULL THEN
      RAISE WARNING 'Component not found for theme %: %', v_theme.theme_name, v_theme.component_name;
      CONTINUE;
    END IF;

    INSERT INTO public.themes (component_id, theme_name, order_index)
    VALUES (v_component_id, v_theme.theme_name, v_theme.theme_order)
    ON CONFLICT (component_id, theme_name) DO UPDATE
      SET order_index = EXCLUDED.order_index;

    v_themes_created := v_themes_created + 1;
  END LOOP;

  -- -----------------------------------------------------------------------
  -- Step 3: Insert topics per theme
  -- -----------------------------------------------------------------------
  FOR v_topic IN
    SELECT
      cs.component_name,
      cs.theme_name,
      cs.topic_name,
      cs.topic_order,
      cs.canonical_code
    FROM public.curriculum_staging cs
    WHERE cs.subject_id = p_subject_id
      AND cs.status = 'approved'
      AND (p_batch_id IS NULL OR cs.extraction_batch_id = p_batch_id)
    ORDER BY cs.component_order, cs.theme_order, cs.topic_order
  LOOP
    -- Look up the theme_id via component
    SELECT t.id INTO v_theme_id
    FROM public.themes t
    JOIN public.components c ON c.id = t.component_id
    WHERE c.subject_id = p_subject_id
      AND c.component_name = v_topic.component_name
      AND t.theme_name = v_topic.theme_name;

    IF v_theme_id IS NULL THEN
      RAISE WARNING 'Theme not found for topic %: % > %',
        v_topic.topic_name, v_topic.component_name, v_topic.theme_name;
      CONTINUE;
    END IF;

    INSERT INTO public.topics (theme_id, topic_name, order_index, canonical_code)
    VALUES (v_theme_id, v_topic.topic_name, v_topic.topic_order, v_topic.canonical_code)
    ON CONFLICT (theme_id, topic_name) DO UPDATE
      SET order_index = EXCLUDED.order_index,
          canonical_code = EXCLUDED.canonical_code;

    v_topics_created := v_topics_created + 1;
  END LOOP;

  -- -----------------------------------------------------------------------
  -- Step 4: Mark staging rows as imported
  -- -----------------------------------------------------------------------
  UPDATE public.curriculum_staging
  SET status = 'imported'
  WHERE subject_id = p_subject_id
    AND status = 'approved'
    AND (p_batch_id IS NULL OR extraction_batch_id = p_batch_id);

  GET DIAGNOSTICS v_rows_imported = ROW_COUNT;

  RETURN jsonb_build_object(
    'components_created', v_components_created,
    'themes_created', v_themes_created,
    'topics_created', v_topics_created,
    'staging_rows_imported', v_rows_imported
  );
END;
$$;

-- Grant execute to authenticated users (admin operations only)
GRANT EXECUTE ON FUNCTION public.rpc_normalize_curriculum_staging(UUID, UUID)
  TO authenticated;
