-- Migration: Add admin role to user_role enum
-- Split into separate transaction because PostgreSQL cannot use a newly
-- added enum value in the same transaction where it was created.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';
