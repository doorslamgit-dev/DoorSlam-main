-- Migration: Add admin role and RLS policies for curriculum management
-- This adds an 'admin' value to the user_role enum and creates RLS policies
-- so admin users can manage curriculum_staging and read production tables.

-- ============================================================================
-- 1. Add 'admin' to user_role enum
-- ============================================================================

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';

-- ============================================================================
-- 2. Enable RLS on curriculum_staging (if not already enabled)
-- ============================================================================

ALTER TABLE public.curriculum_staging ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Admin RLS policies for curriculum_staging
-- ============================================================================

CREATE POLICY "Admins can read curriculum_staging"
  ON public.curriculum_staging FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Admins can update curriculum_staging"
  ON public.curriculum_staging FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Admins can delete curriculum_staging"
  ON public.curriculum_staging FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  ));

-- ============================================================================
-- 4. Admin RLS policies for reading production curriculum tables
-- ============================================================================

CREATE POLICY "Admins can read subjects"
  ON public.subjects FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Admins can read components"
  ON public.components FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Admins can read themes"
  ON public.themes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Admins can read topics"
  ON public.topics FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  ));

CREATE POLICY "Admins can read exam_boards"
  ON public.exam_boards FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
  ));
