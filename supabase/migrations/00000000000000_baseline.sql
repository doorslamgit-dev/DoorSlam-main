-- ==========================================================================
-- Doorslam Baseline Migration
-- Generated: 2026-02-09
-- 
-- This migration captures the complete database schema as of this date.
-- All tables, enums, primary keys, unique constraints, and foreign keys
-- are included. RLS policies to be added in a follow-up migration.
-- ==========================================================================

-- ==========================================================================
-- Section 1: Custom Enum Types
-- ==========================================================================

CREATE TYPE public.content_status_enum AS ENUM ('active', 'archived');
CREATE TYPE public.content_type_enum AS ENUM ('flashcard', 'worked_example', 'practice_question', 'teaching_slide');
CREATE TYPE public.exam_type_enum AS ENUM ('GCSE', 'IGCSE');
CREATE TYPE public.insights_date_range AS ENUM ('this_week', 'last_week', 'this_month', 'last_month', 'lifetime');
CREATE TYPE public.jcq_area AS ENUM ('cognition_learning', 'communication_interaction', 'sensory_physical', 'semh', 'study_skills');
CREATE TYPE public.need_source AS ENUM ('formal', 'observed');
CREATE TYPE public.plan_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE public.planned_session_status AS ENUM ('planned', 'started', 'completed', 'skipped');
CREATE TYPE public.session_pattern AS ENUM ('SINGLE_20', 'DOUBLE_45', 'TRIPLE_70');
CREATE TYPE public.user_role AS ENUM ('parent', 'child');

-- ==========================================================================
-- Section 2: Tables
-- ==========================================================================

CREATE TABLE public._fn_backup (
  backed_up_at timestamptz NOT NULL DEFAULT now(),
  schema_name text NOT NULL,
  function_name text NOT NULL,
  identity_args text NOT NULL,
  definition text NOT NULL
);

CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text,
  points_value int4 NOT NULL DEFAULT 0,
  category text NOT NULL,
  trigger_type text NOT NULL,
  trigger_threshold int4,
  sort_order int4 NOT NULL DEFAULT 100,
  is_active bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.qualifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  display_name text,
  grade_type text NOT NULL DEFAULT 'numeric'::text,
  grade_scale text,
  country_origin text DEFAULT 'UK'::text,
  is_active bool DEFAULT true,
  sort_order int4 DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.revision_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  contingency_percent int4 DEFAULT 10,
  feeling_code text,
  history_code text,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  role user_role NOT NULL DEFAULT 'parent'::user_role,
  country text,
  avatar_url text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  postcode text,
  timezone text DEFAULT 'Europe/London'::text,
  notification_settings jsonb DEFAULT '{"weekly_summary": true,
  "session_reminders": true,
  "achievement_alerts": true,
  "insights_available": true}'::jsonb,
  analytics_sharing jsonb DEFAULT '{"scope": "county",
  "enabled": false,
  "children": []}'::jsonb,
  share_anonymised_data bool DEFAULT false,
  insights_widget_config jsonb DEFAULT '[{"id": "hero-story",
  "order": 0,
  "enabled": true},
  {"id": "progress-plan",
  "order": 1,
  "enabled": true},
  {"id": "confidence-trend",
  "order": 2,
  "enabled": true},
  {"id": "focus-impact",
  "order": 3,
  "enabled": true},
  {"id": "momentum",
  "order": 4,
  "enabled": true},
  {"id": "building-confidence",
  "order": 5,
  "enabled": true},
  {"id": "needs-attention",
  "order": 6,
  "enabled": true},
  {"id": "subject-balance",
  "order": 7,
  "enabled": true},
  {"id": "confidence-heatmap",
  "order": 8,
  "enabled": true},
  {"id": "tutor-advice",
  "order": 9,
  "enabled": true}]'::jsonb
);

CREATE TABLE public.children (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  first_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  year_group int4,
  revision_state text DEFAULT 'active'::text,
  revision_paused_until date,
  last_name text,
  nickname text,
  country text,
  email text,
  invitation_code text,
  invitation_sent_at timestamptz,
  invitation_accepted_at timestamptz,
  auth_user_id uuid,
  preferred_name text,
  exam_date date,
  feeling_code text,
  history_code text,
  revision_profile jsonb,
  exam_timeline jsonb,
  revision_profile_updated_at timestamptz,
  active_revision_period_id uuid,
  notification_settings jsonb DEFAULT '{"session_reminders": true,
  "achievement_alerts": true}'::jsonb,
  school_name text,
  school_town text,
  school_postcode_prefix text,
  primary_qualification_id uuid,
  target_entry_year int4,
  current_school_year int4
);

CREATE TABLE public.availability_date_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  override_date date NOT NULL,
  override_type text NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.availability_override_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  override_id uuid NOT NULL,
  time_of_day text NOT NULL,
  session_pattern text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.child_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  achievement_id uuid NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  notified bool NOT NULL DEFAULT false
);

CREATE TABLE public.skill_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  applicable_qualifications _text DEFAULT ARRAY['11plus'::text],
  sort_order int4 DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.child_assessment_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  skill_type_id uuid,
  assessment_type text NOT NULL,
  assessment_name text NOT NULL,
  assessment_provider text,
  assessment_date date NOT NULL,
  raw_score int4,
  max_score int4,
  percentage_score numeric,
  standardised_score int4,
  percentile numeric,
  time_taken_minutes int4,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.child_daily_voice_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  total_minutes_used numeric NOT NULL DEFAULT 0,
  total_interactions int4 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_name text NOT NULL,
  exam_board_id uuid NOT NULL,
  icon text NOT NULL DEFAULT 'book'::text,
  color text NOT NULL DEFAULT '#7C3AED'::text,
  created_at timestamptz DEFAULT now(),
  code text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  requires_pathway_selection bool DEFAULT false,
  spec_code text,
  qualification_id uuid NOT NULL,
  slug text
);

CREATE TABLE public.child_exams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  exam_type text NOT NULL,
  exam_date date NOT NULL,
  exam_time time,
  paper_name text,
  paper_code text,
  duration_minutes int4,
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  theme_id uuid NOT NULL,
  order_index int4 NOT NULL DEFAULT 0,
  canonical_code text,
  skill_type_id uuid
);

CREATE TABLE public.themes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  component_id uuid NOT NULL,
  theme_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  order_index int4 NOT NULL DEFAULT 0
);

CREATE TABLE public.exam_pathways (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid,
  pathway_code text NOT NULL,
  pathway_name text NOT NULL,
  parent_pathway_id uuid,
  is_required_choice bool DEFAULT false,
  display_order int2 DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.components (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL,
  component_name text NOT NULL,
  component_weighting text,
  created_at timestamptz DEFAULT now(),
  order_index int4 NOT NULL DEFAULT 0
);

CREATE TABLE public.exam_spec_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL,
  spec_version text NOT NULL,
  effective_from date,
  effective_to date,
  is_current bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.content_units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL,
  exam_spec_version_id uuid NOT NULL,
  component_id uuid,
  theme_id uuid,
  topic_id uuid NOT NULL,
  content_type content_type_enum NOT NULL,
  difficulty int2 NOT NULL DEFAULT 1,
  estimated_seconds int4 NOT NULL DEFAULT 60,
  content_body jsonb NOT NULL DEFAULT '{}'::jsonb,
  pedagogy jsonb NOT NULL DEFAULT '{}'::jsonb,
  assessment jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status content_status_enum NOT NULL DEFAULT 'active'::content_status_enum,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'manual'::text,
  marks_available int2,
  command_word text,
  source_reference text,
  source_type text,
  pathway_id uuid,
  mark_scheme jsonb,
  common_mistakes _text,
  examiner_notes text,
  archetype text,
  source_document_id uuid,
  mark_scheme_template_id uuid,
  skill_type_id uuid
);

CREATE TABLE public.child_flashcard_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  flashcard_id uuid NOT NULL,
  topic_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'learning'::text,
  times_seen int4 NOT NULL DEFAULT 1,
  times_correct int4 NOT NULL DEFAULT 0,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  next_review_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  affects_planning bool NOT NULL DEFAULT true,
  sort_order int4 NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.child_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  goal_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mnemonics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  external_id uuid,
  subject text NOT NULL,
  level text NOT NULL,
  exam_board text,
  topic_id uuid,
  topic_name text,
  style text NOT NULL,
  lyrics text,
  audio_url text,
  duration_seconds int4,
  created_at timestamptz NOT NULL DEFAULT now(),
  style_reference text,
  content_summary text,
  status text,
  error_message text,
  error_code text,
  completed_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE public.child_mnemonic_rollup (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  mnemonic_id uuid NOT NULL,
  play_count int4 NOT NULL DEFAULT 0,
  first_played_at timestamptz NOT NULL DEFAULT now(),
  last_played_at timestamptz,
  is_favourite bool NOT NULL DEFAULT false,
  downloaded bool NOT NULL DEFAULT false,
  downloaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.child_mnemonic_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  topic_id uuid NOT NULL,
  mnemonic_external_id uuid NOT NULL,
  subject text NOT NULL,
  level text NOT NULL,
  topic_name text NOT NULL,
  style text NOT NULL,
  audio_url text,
  lyrics text,
  duration_seconds int4,
  play_count int4 NOT NULL DEFAULT 0,
  first_played_at timestamptz NOT NULL DEFAULT now(),
  last_played_at timestamptz,
  is_favourite bool NOT NULL DEFAULT false,
  downloaded bool NOT NULL DEFAULT false,
  downloaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.need_clusters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  sort_order int4,
  created_at timestamptz NOT NULL DEFAULT now(),
  typical_behaviours _text,
  is_active bool NOT NULL DEFAULT true,
  typically_has_accommodations bool DEFAULT false,
  category text DEFAULT 'learning'::text,
  jcq_area jcq_area,
  condition_name text,
  parent_friendly_name text,
  example_signs _text,
  common_arrangements _text,
  is_jcq_recognised bool NOT NULL DEFAULT true
);

CREATE TABLE public.child_need_clusters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  cluster_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'observed'::text,
  has_exam_accommodations bool DEFAULT false,
  accommodation_details text,
  diagnosed_date date,
  parent_notes text,
  pending_assessment bool DEFAULT false,
  arrangements_approved_date date,
  access_arrangements jsonb,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.revision_strategies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  min_difficulty int2 NOT NULL DEFAULT 1,
  max_difficulty int2 NOT NULL DEFAULT 5,
  preferred_difficulty int2 NOT NULL DEFAULT 3,
  min_marks int2 DEFAULT 1,
  max_marks int2 DEFAULT 6,
  prefer_low_mark_questions bool DEFAULT false,
  preferred_archetypes _text DEFAULT '{}'::text[],
  avoid_archetypes _text DEFAULT '{}'::text[],
  max_cognitive_level int2 DEFAULT 6,
  target_grade_bands _text DEFAULT ARRAY['foundation'::text,
  'crossover'::text,
  'higher'::text],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.child_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  target_sessions_per_week int4 NOT NULL DEFAULT 3,
  priority text NOT NULL DEFAULT 'medium'::text,
  created_at timestamptz DEFAULT now(),
  is_paused bool DEFAULT false,
  paused_until date,
  pause_reason text,
  sort_order int4 NOT NULL DEFAULT 1,
  current_grade text,
  target_grade text,
  grade_confidence text NOT NULL DEFAULT 'confirmed'::text,
  revision_strategy_id uuid,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.child_pathways (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  child_subject_id uuid NOT NULL,
  pathway_id uuid NOT NULL,
  selected_at timestamptz DEFAULT now()
);

CREATE TABLE public.reward_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  display_order int4 NOT NULL,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.reward_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid,
  name text NOT NULL,
  suggested_points int4 NOT NULL,
  display_order int4 NOT NULL,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.child_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid,
  category_id uuid,
  template_id uuid,
  name text NOT NULL,
  points_cost int4 NOT NULL,
  emoji text,
  is_active bool DEFAULT true,
  limit_type text,
  limit_count int4,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.child_point_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid,
  weighting_mode text NOT NULL DEFAULT 'auto'::text,
  completion_weight int4 DEFAULT 40,
  accuracy_weight int4 DEFAULT 35,
  focus_weight int4 DEFAULT 25,
  auto_approve_threshold int4 DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  goal_reward_id uuid
);

CREATE TABLE public.child_points (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  points_balance int4 NOT NULL DEFAULT 0,
  lifetime_points int4 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.revision_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  exam_timeline text,
  status plan_status NOT NULL DEFAULT 'active'::plan_status,
  settings_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  revision_profile jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE public.planned_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  child_id uuid NOT NULL,
  session_date date NOT NULL,
  day_of_week text NOT NULL,
  session_pattern session_pattern NOT NULL,
  session_duration_minutes int4 NOT NULL,
  subject_id uuid NOT NULL,
  topic_ids _uuid NOT NULL DEFAULT '{}'::uuid[],
  status planned_session_status NOT NULL DEFAULT 'planned'::planned_session_status,
  generated_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  session_index int4 NOT NULL DEFAULT 1,
  started_at timestamptz,
  completed_at timestamptz,
  exam_spec_version_id uuid
);

CREATE TABLE public.revision_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  topic_id uuid,
  session_date timestamptz DEFAULT now(),
  duration_minutes int4 NOT NULL DEFAULT 15,
  confidence_level text NOT NULL DEFAULT 'on_track'::text,
  notes text,
  completed bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  planned_session_id uuid,
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'created'::text,
  started_at timestamptz,
  current_step text,
  current_step_index int4 NOT NULL DEFAULT 0,
  current_item_index int4 NOT NULL DEFAULT 0,
  payload_version int4 NOT NULL DEFAULT 1,
  current_topic_index int4 NOT NULL DEFAULT 0,
  total_topics int4 NOT NULL DEFAULT 1,
  focus_mode_requested bool NOT NULL DEFAULT false,
  focus_mode_active bool NOT NULL DEFAULT false,
  focus_mode_overridden bool NOT NULL DEFAULT false,
  focus_mode_duration_minutes int4,
  pre_confidence_level text,
  focus_mode_enabled bool DEFAULT false,
  focus_score numeric
);

CREATE TABLE public.child_session_reflections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  revision_session_id uuid,
  audio_url text,
  audio_duration_seconds int4,
  transcription text,
  transcription_status text DEFAULT 'pending'::text,
  context_type text NOT NULL DEFAULT 'session_reflection'::text,
  created_at timestamptz NOT NULL DEFAULT now(),
  transcribed_at timestamptz,
  transcription_error text,
  text_note text
);

CREATE TABLE public.child_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.child_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  current_streak int4 NOT NULL DEFAULT 0,
  longest_streak int4 NOT NULL DEFAULT 0,
  last_completed_date date,
  streak_frozen_until date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.child_subject_progress (
  child_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  last_topic_order int4 NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  school_type text NOT NULL,
  region text,
  local_authority text,
  test_provider text,
  test_date_typical text,
  website_url text,
  notes text,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.child_target_schools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  school_id uuid NOT NULL,
  preference_rank int4 DEFAULT 1,
  application_status text DEFAULT 'considering'::text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.curriculum_staging (
  id int8 NOT NULL DEFAULT nextval('curriculum_staging_id_seq'::regclass),
  subject_id uuid NOT NULL,
  component_name text NOT NULL,
  theme_name text NOT NULL,
  topic_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.exam_boards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  provider_type text,
  supported_qualification_codes _text
);

CREATE TABLE public.exam_papers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exam_spec_version_id uuid NOT NULL,
  paper_code text,
  paper_name text NOT NULL,
  duration_minutes int4,
  weighting_percent numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.grade_scales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exam_board_id uuid,
  scale_type text NOT NULL,
  grades jsonb NOT NULL,
  pass_grade text NOT NULL,
  created_at timestamptz DEFAULT now(),
  score_min int4,
  score_max int4,
  score_mean int4,
  is_score_based bool DEFAULT false,
  qualification_id uuid NOT NULL
);

CREATE TABLE public.mark_scheme_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exam_board_id uuid NOT NULL,
  template_code text NOT NULL,
  name text NOT NULL,
  description text,
  schema_template jsonb NOT NULL,
  example jsonb,
  accept_term text DEFAULT 'Accept'::text,
  reject_term text DEFAULT 'Do not accept'::text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  milestone_date date NOT NULL,
  milestone_type text NOT NULL DEFAULT 'other'::text,
  subjects _text DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.mnemonic_favourites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  mnemonic_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.mnemonic_plays (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  mnemonic_id uuid NOT NULL,
  session_id uuid,
  source text,
  played_at timestamptz DEFAULT now(),
  completed bool DEFAULT false,
  play_duration_seconds int4
);

CREATE TABLE public.mnemonic_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  original_prompt text NOT NULL,
  parsed_topic text,
  parsed_style text,
  parsed_type text,
  subject text,
  level text,
  exam_board text,
  mnemonic_id uuid,
  was_cached bool DEFAULT false,
  status text DEFAULT 'pending'::text,
  error_message text,
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  topic_id uuid,
  topic_name text,
  style text
);

CREATE TABLE public.need_areas (
  code jcq_area NOT NULL,
  name text NOT NULL,
  description text,
  helper_text text,
  sort_order int4 DEFAULT 0,
  is_jcq_recognised bool DEFAULT true
);

CREATE TABLE public.parent_override_alerts (
  id uuid,
  child_id uuid,
  session_id uuid,
  auto_strategy_code text,
  override_strategy_code text,
  override_reason text,
  override_type text,
  created_at timestamptz,
  parent_viewed_at timestamptz,
  parent_acknowledged bool,
  child_name text,
  subject_name text,
  override_description text
);

CREATE TABLE public.physics_staging (
  id int8 NOT NULL DEFAULT nextval('physics_staging_id_seq'::regclass),
  subject_id uuid NOT NULL,
  component_name text NOT NULL,
  theme_name text NOT NULL,
  topic_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.plan_config_multipliers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  config_key text NOT NULL,
  config_value numeric NOT NULL,
  description text,
  category text DEFAULT 'general'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.point_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  points int4 NOT NULL,
  reason text NOT NULL,
  source_type text NOT NULL,
  source_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  weighted_breakdown jsonb
);

CREATE TABLE public.revision_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  day_of_week text NOT NULL,
  session_duration_minutes int4 NOT NULL DEFAULT 15,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  session_pattern session_pattern NOT NULL,
  slot_index int4 NOT NULL DEFAULT 1
);

CREATE TABLE public.revision_session_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  revision_session_id uuid NOT NULL,
  step_key text NOT NULL,
  status text NOT NULL DEFAULT 'not_started'::text,
  started_at timestamptz,
  completed_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  current_item_index int4 NOT NULL DEFAULT 0,
  total_items int4 NOT NULL DEFAULT 0,
  answer_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  step_index int4
);

CREATE TABLE public.reward_addition_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  template_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid,
  parent_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reward_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid,
  reward_id uuid,
  reward_name text NOT NULL,
  points_cost int4 NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  requested_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + '7 days'::interval),
  resolved_at timestamptz,
  resolved_by uuid,
  decline_reason text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.strategy_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  session_id uuid,
  auto_strategy_code text NOT NULL,
  override_strategy_code text NOT NULL,
  override_reason text,
  override_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  parent_viewed_at timestamptz,
  parent_acknowledged bool DEFAULT false,
  parent_notes text
);

CREATE TABLE public.study_buddy_learning_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  notes_text text NOT NULL DEFAULT ''::text,
  common_struggles jsonb DEFAULT '[]'::jsonb,
  effective_explanations jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.study_buddy_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  revision_session_id uuid NOT NULL,
  planned_session_id uuid,
  subject_id uuid,
  message_count int4 NOT NULL DEFAULT 0,
  voice_minutes_used numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.study_buddy_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  role text NOT NULL,
  input_mode text,
  content_text text NOT NULL,
  step_key text,
  content_type text,
  content_unit_id uuid,
  topic_id uuid,
  latency_ms int4,
  voice_duration_seconds numeric,
  token_count int4,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.study_buddy_thread_summaries (
  thread_id uuid NOT NULL,
  summary_text text NOT NULL DEFAULT ''::text,
  misconceptions_noted jsonb DEFAULT '[]'::jsonb,
  helpful_approaches jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.study_buddy_voice_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'elevenlabs'::text,
  elevenlabs_conversation_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds numeric,
  status text NOT NULL DEFAULT 'active'::text
);

CREATE TABLE public.tier_systems (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tier_system_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  grade_cap text,
  grade_floor text,
  sort_order int4 DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.v_child_needs_full (
  id uuid,
  child_id uuid,
  cluster_id uuid,
  cluster_code text,
  cluster_name text,
  description text,
  jcq_area jcq_area,
  is_jcq_recognised bool,
  typical_behaviours _text,
  example_signs _text,
  source text,
  access_arrangements jsonb,
  diagnosed_date date,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
);

CREATE TABLE public.voice_quota_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tier_code text NOT NULL,
  voice_enabled bool NOT NULL DEFAULT false,
  max_voice_minutes_per_session numeric NOT NULL DEFAULT 0,
  max_voice_minutes_per_day numeric NOT NULL DEFAULT 0,
  max_voice_interactions_per_session int4 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.weekly_availability_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL,
  time_of_day text NOT NULL,
  session_pattern text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.weekly_availability_template (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  day_of_week int4 NOT NULL,
  is_enabled bool DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.weekly_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  week_start_date date NOT NULL,
  target_sessions int4 NOT NULL DEFAULT 20,
  completed_sessions int4 NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ==========================================================================
-- Section 3: Primary Key Constraints
-- ==========================================================================

ALTER TABLE public.achievements ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);
ALTER TABLE public.availability_date_overrides ADD CONSTRAINT availability_date_overrides_pkey PRIMARY KEY (id);
ALTER TABLE public.availability_override_slots ADD CONSTRAINT availability_override_slots_pkey PRIMARY KEY (id);
ALTER TABLE public.child_achievements ADD CONSTRAINT child_achievements_pkey PRIMARY KEY (id);
ALTER TABLE public.child_assessment_scores ADD CONSTRAINT child_assessment_scores_pkey PRIMARY KEY (id);
ALTER TABLE public.child_daily_voice_usage ADD CONSTRAINT child_daily_voice_usage_pkey PRIMARY KEY (id);
ALTER TABLE public.child_exams ADD CONSTRAINT child_exams_pkey PRIMARY KEY (id);
ALTER TABLE public.child_flashcard_progress ADD CONSTRAINT child_flashcard_progress_pkey PRIMARY KEY (id);
ALTER TABLE public.child_goals ADD CONSTRAINT child_goals_pkey PRIMARY KEY (id);
ALTER TABLE public.child_mnemonic_rollup ADD CONSTRAINT child_mnemonic_rollup_pkey PRIMARY KEY (id);
ALTER TABLE public.child_mnemonic_usage ADD CONSTRAINT child_mnemonic_usage_pkey PRIMARY KEY (id);
ALTER TABLE public.child_need_clusters ADD CONSTRAINT child_need_clusters_pkey PRIMARY KEY (id);
ALTER TABLE public.child_pathways ADD CONSTRAINT child_pathways_pkey PRIMARY KEY (id);
ALTER TABLE public.child_point_config ADD CONSTRAINT child_point_config_pkey PRIMARY KEY (id);
ALTER TABLE public.child_points ADD CONSTRAINT child_points_pkey PRIMARY KEY (id);
ALTER TABLE public.child_rewards ADD CONSTRAINT child_rewards_pkey PRIMARY KEY (id);
ALTER TABLE public.child_session_reflections ADD CONSTRAINT child_voice_notes_pkey PRIMARY KEY (id);
ALTER TABLE public.child_settings ADD CONSTRAINT child_settings_pkey PRIMARY KEY (id);
ALTER TABLE public.child_streaks ADD CONSTRAINT child_streaks_pkey PRIMARY KEY (id);
ALTER TABLE public.child_subject_progress ADD CONSTRAINT child_subject_progress_pkey PRIMARY KEY (child_id, subject_id);
ALTER TABLE public.child_subjects ADD CONSTRAINT child_subjects_pkey PRIMARY KEY (id);
ALTER TABLE public.child_target_schools ADD CONSTRAINT child_target_schools_pkey PRIMARY KEY (id);
ALTER TABLE public.children ADD CONSTRAINT children_pkey PRIMARY KEY (id);
ALTER TABLE public.components ADD CONSTRAINT components_pkey PRIMARY KEY (id);
ALTER TABLE public.content_units ADD CONSTRAINT content_units_pkey PRIMARY KEY (id);
ALTER TABLE public.curriculum_staging ADD CONSTRAINT curriculum_staging_pkey PRIMARY KEY (id);
ALTER TABLE public.exam_boards ADD CONSTRAINT exam_boards_pkey PRIMARY KEY (id);
ALTER TABLE public.exam_papers ADD CONSTRAINT exam_papers_pkey PRIMARY KEY (id);
ALTER TABLE public.exam_pathways ADD CONSTRAINT exam_pathways_pkey PRIMARY KEY (id);
ALTER TABLE public.exam_spec_versions ADD CONSTRAINT exam_spec_versions_pkey PRIMARY KEY (id);
ALTER TABLE public.goals ADD CONSTRAINT goals_pkey PRIMARY KEY (id);
ALTER TABLE public.grade_scales ADD CONSTRAINT grade_scales_pkey PRIMARY KEY (id);
ALTER TABLE public.mark_scheme_templates ADD CONSTRAINT mark_scheme_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.milestones ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);
ALTER TABLE public.mnemonic_favourites ADD CONSTRAINT mnemonic_favourites_pkey PRIMARY KEY (id);
ALTER TABLE public.mnemonic_plays ADD CONSTRAINT mnemonic_plays_pkey PRIMARY KEY (id);
ALTER TABLE public.mnemonic_requests ADD CONSTRAINT mnemonic_requests_pkey PRIMARY KEY (id);
ALTER TABLE public.mnemonics ADD CONSTRAINT mnemonics_pkey PRIMARY KEY (id);
ALTER TABLE public.need_areas ADD CONSTRAINT need_areas_pkey PRIMARY KEY (code);
ALTER TABLE public.need_clusters ADD CONSTRAINT need_clusters_pkey PRIMARY KEY (id);
ALTER TABLE public.physics_staging ADD CONSTRAINT physics_staging_pkey PRIMARY KEY (id);
ALTER TABLE public.plan_config_multipliers ADD CONSTRAINT plan_config_multipliers_pkey PRIMARY KEY (id);
ALTER TABLE public.planned_sessions ADD CONSTRAINT planned_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.point_transactions ADD CONSTRAINT point_transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.profiles ADD CONSTRAINT parents_pkey PRIMARY KEY (id);
ALTER TABLE public.qualifications ADD CONSTRAINT qualifications_pkey PRIMARY KEY (id);
ALTER TABLE public.revision_periods ADD CONSTRAINT revision_periods_pkey PRIMARY KEY (id);
ALTER TABLE public.revision_plans ADD CONSTRAINT revision_plans_pkey PRIMARY KEY (id);
ALTER TABLE public.revision_schedules ADD CONSTRAINT revision_schedules_pkey PRIMARY KEY (id);
ALTER TABLE public.revision_session_steps ADD CONSTRAINT revision_session_steps_pkey PRIMARY KEY (id);
ALTER TABLE public.revision_sessions ADD CONSTRAINT revision_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.revision_strategies ADD CONSTRAINT revision_strategies_pkey PRIMARY KEY (id);
ALTER TABLE public.reward_addition_requests ADD CONSTRAINT reward_addition_requests_pkey PRIMARY KEY (id);
ALTER TABLE public.reward_categories ADD CONSTRAINT reward_categories_pkey PRIMARY KEY (id);
ALTER TABLE public.reward_redemptions ADD CONSTRAINT reward_redemptions_pkey PRIMARY KEY (id);
ALTER TABLE public.reward_templates ADD CONSTRAINT reward_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.schools ADD CONSTRAINT schools_pkey PRIMARY KEY (id);
ALTER TABLE public.skill_types ADD CONSTRAINT skill_types_pkey PRIMARY KEY (id);
ALTER TABLE public.strategy_overrides ADD CONSTRAINT strategy_overrides_pkey PRIMARY KEY (id);
ALTER TABLE public.study_buddy_learning_notes ADD CONSTRAINT study_buddy_learning_notes_pkey PRIMARY KEY (id);
ALTER TABLE public.study_buddy_messages ADD CONSTRAINT study_buddy_messages_pkey PRIMARY KEY (id);
ALTER TABLE public.study_buddy_thread_summaries ADD CONSTRAINT study_buddy_thread_summaries_pkey PRIMARY KEY (thread_id);
ALTER TABLE public.study_buddy_threads ADD CONSTRAINT study_buddy_threads_pkey PRIMARY KEY (id);

-- ==========================================================================
-- Section 4: Unique Constraints
-- ==========================================================================

ALTER TABLE public.achievements ADD CONSTRAINT achievements_code_unique UNIQUE (code);
ALTER TABLE public.availability_date_overrides ADD CONSTRAINT availability_date_overrides_child_id_override_date_key UNIQUE (child_id, override_date);
ALTER TABLE public.child_achievements ADD CONSTRAINT child_achievements_unique UNIQUE (child_id, achievement_id);
ALTER TABLE public.child_daily_voice_usage ADD CONSTRAINT child_daily_voice_usage_unique UNIQUE (child_id, usage_date);
ALTER TABLE public.child_flashcard_progress ADD CONSTRAINT child_flashcard_progress_child_id_flashcard_id_key UNIQUE (child_id, flashcard_id);
ALTER TABLE public.child_goals ADD CONSTRAINT child_goals_child_unique UNIQUE (child_id);
ALTER TABLE public.child_mnemonic_rollup ADD CONSTRAINT child_mnemonic_rollup_child_mnemonic_key UNIQUE (child_id, mnemonic_id);
ALTER TABLE public.child_mnemonic_usage ADD CONSTRAINT child_mnemonic_usage_child_id_mnemonic_external_id_key UNIQUE (child_id, mnemonic_external_id);
ALTER TABLE public.child_need_clusters ADD CONSTRAINT child_need_clusters_child_cluster_unique UNIQUE (child_id, cluster_id);
ALTER TABLE public.child_pathways ADD CONSTRAINT child_pathways_child_id_pathway_id_key UNIQUE (child_id, pathway_id);
ALTER TABLE public.child_point_config ADD CONSTRAINT child_point_config_child_id_key UNIQUE (child_id);
ALTER TABLE public.child_points ADD CONSTRAINT child_points_child_unique UNIQUE (child_id);
ALTER TABLE public.child_settings ADD CONSTRAINT child_settings_child_unique UNIQUE (child_id);
ALTER TABLE public.child_streaks ADD CONSTRAINT child_streaks_child_unique UNIQUE (child_id);
ALTER TABLE public.child_subjects ADD CONSTRAINT child_subjects_child_id_subject_id_key UNIQUE (child_id, subject_id);
ALTER TABLE public.child_target_schools ADD CONSTRAINT child_target_schools_child_id_school_id_key UNIQUE (child_id, school_id);
ALTER TABLE public.children ADD CONSTRAINT children_auth_user_id_unique UNIQUE (auth_user_id);
ALTER TABLE public.children ADD CONSTRAINT children_email_unique UNIQUE (email);
ALTER TABLE public.children ADD CONSTRAINT children_invitation_code_unique UNIQUE (invitation_code);
ALTER TABLE public.exam_boards ADD CONSTRAINT exam_boards_code_key UNIQUE (code);
ALTER TABLE public.exam_boards ADD CONSTRAINT exam_boards_name_key UNIQUE (name);
ALTER TABLE public.exam_pathways ADD CONSTRAINT exam_pathways_subject_id_pathway_code_key UNIQUE (subject_id, pathway_code);
ALTER TABLE public.exam_spec_versions ADD CONSTRAINT exam_spec_versions_unique UNIQUE (subject_id, spec_version);
ALTER TABLE public.goals ADD CONSTRAINT goals_code_unique UNIQUE (code);
ALTER TABLE public.mark_scheme_templates ADD CONSTRAINT uq_mark_scheme_template UNIQUE (exam_board_id, template_code);
ALTER TABLE public.mnemonic_favourites ADD CONSTRAINT mnemonic_favourites_child_id_mnemonic_id_key UNIQUE (child_id, mnemonic_id);
ALTER TABLE public.mnemonics ADD CONSTRAINT mnemonics_external_id_key UNIQUE (external_id);
ALTER TABLE public.need_clusters ADD CONSTRAINT need_clusters_code_key UNIQUE (code);
ALTER TABLE public.plan_config_multipliers ADD CONSTRAINT plan_config_multipliers_config_key_key UNIQUE (config_key);
ALTER TABLE public.profiles ADD CONSTRAINT parents_email_key UNIQUE (email);
ALTER TABLE public.qualifications ADD CONSTRAINT qualifications_code_key UNIQUE (code);
ALTER TABLE public.revision_session_steps ADD CONSTRAINT revision_session_steps_revision_session_id_step_key_key UNIQUE (revision_session_id, step_key);
ALTER TABLE public.revision_sessions ADD CONSTRAINT revision_sessions_planned_session_id_key UNIQUE (planned_session_id);
ALTER TABLE public.revision_strategies ADD CONSTRAINT revision_strategies_code_key UNIQUE (code);
ALTER TABLE public.reward_categories ADD CONSTRAINT reward_categories_code_key UNIQUE (code);
ALTER TABLE public.skill_types ADD CONSTRAINT skill_types_code_key UNIQUE (code);
ALTER TABLE public.study_buddy_learning_notes ADD CONSTRAINT study_buddy_learning_notes_unique UNIQUE (child_id, subject_id);
ALTER TABLE public.study_buddy_threads ADD CONSTRAINT study_buddy_threads_session_unique UNIQUE (revision_session_id);

-- ==========================================================================
-- Section 5: Foreign Key Constraints
-- ==========================================================================

ALTER TABLE public.availability_date_overrides ADD CONSTRAINT availability_date_overrides_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.availability_override_slots ADD CONSTRAINT availability_override_slots_override_id_fkey FOREIGN KEY (override_id) REFERENCES public.availability_date_overrides (id);
ALTER TABLE public.child_achievements ADD CONSTRAINT child_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements (id);
ALTER TABLE public.child_achievements ADD CONSTRAINT child_achievements_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_assessment_scores ADD CONSTRAINT child_assessment_scores_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_assessment_scores ADD CONSTRAINT child_assessment_scores_skill_type_id_fkey FOREIGN KEY (skill_type_id) REFERENCES public.skill_types (id);
ALTER TABLE public.child_daily_voice_usage ADD CONSTRAINT child_daily_voice_usage_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_exams ADD CONSTRAINT child_exams_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_exams ADD CONSTRAINT child_exams_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);
ALTER TABLE public.child_flashcard_progress ADD CONSTRAINT child_flashcard_progress_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_flashcard_progress ADD CONSTRAINT child_flashcard_progress_flashcard_id_fkey FOREIGN KEY (flashcard_id) REFERENCES public.content_units (id);
ALTER TABLE public.child_flashcard_progress ADD CONSTRAINT child_flashcard_progress_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics (id);
ALTER TABLE public.child_goals ADD CONSTRAINT child_goals_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_goals ADD CONSTRAINT child_goals_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.goals (id);
ALTER TABLE public.child_mnemonic_rollup ADD CONSTRAINT child_mnemonic_rollup_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_mnemonic_rollup ADD CONSTRAINT child_mnemonic_rollup_mnemonic_id_fkey FOREIGN KEY (mnemonic_id) REFERENCES public.mnemonics (id);
ALTER TABLE public.child_mnemonic_usage ADD CONSTRAINT child_mnemonic_usage_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_mnemonic_usage ADD CONSTRAINT child_mnemonic_usage_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics (id);
ALTER TABLE public.child_need_clusters ADD CONSTRAINT child_need_clusters_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_need_clusters ADD CONSTRAINT child_need_clusters_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES public.need_clusters (id);
ALTER TABLE public.child_pathways ADD CONSTRAINT child_pathways_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_pathways ADD CONSTRAINT child_pathways_child_subject_id_fkey FOREIGN KEY (child_subject_id) REFERENCES public.child_subjects (id);
ALTER TABLE public.child_pathways ADD CONSTRAINT child_pathways_pathway_id_fkey FOREIGN KEY (pathway_id) REFERENCES public.exam_pathways (id);
ALTER TABLE public.child_point_config ADD CONSTRAINT child_point_config_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_point_config ADD CONSTRAINT child_point_config_goal_reward_id_fkey FOREIGN KEY (goal_reward_id) REFERENCES public.child_rewards (id);
ALTER TABLE public.child_points ADD CONSTRAINT child_points_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_rewards ADD CONSTRAINT child_rewards_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.reward_categories (id);
ALTER TABLE public.child_rewards ADD CONSTRAINT child_rewards_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_rewards ADD CONSTRAINT child_rewards_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.reward_templates (id);
ALTER TABLE public.child_session_reflections ADD CONSTRAINT child_voice_notes_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_session_reflections ADD CONSTRAINT child_voice_notes_revision_session_id_fkey FOREIGN KEY (revision_session_id) REFERENCES public.revision_sessions (id);
ALTER TABLE public.child_settings ADD CONSTRAINT child_settings_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
-- child_settings_created_by_fkey: references auth.users (cross-schema FK)
ALTER TABLE public.child_settings ADD CONSTRAINT child_settings_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id);
ALTER TABLE public.child_streaks ADD CONSTRAINT child_streaks_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_subject_progress ADD CONSTRAINT child_subject_progress_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_subject_progress ADD CONSTRAINT child_subject_progress_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);
ALTER TABLE public.child_subjects ADD CONSTRAINT child_subjects_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_subjects ADD CONSTRAINT child_subjects_revision_strategy_id_fkey FOREIGN KEY (revision_strategy_id) REFERENCES public.revision_strategies (id);
ALTER TABLE public.child_subjects ADD CONSTRAINT child_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);
ALTER TABLE public.child_target_schools ADD CONSTRAINT child_target_schools_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.child_target_schools ADD CONSTRAINT child_target_schools_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools (id);
ALTER TABLE public.children ADD CONSTRAINT children_active_revision_period_id_fkey FOREIGN KEY (active_revision_period_id) REFERENCES public.revision_periods (id);
-- children_auth_user_id_fkey: references auth.users (cross-schema FK)
ALTER TABLE public.children ADD CONSTRAINT children_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users (id);
ALTER TABLE public.children ADD CONSTRAINT children_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.profiles (id);
ALTER TABLE public.children ADD CONSTRAINT children_primary_qualification_id_fkey FOREIGN KEY (primary_qualification_id) REFERENCES public.qualifications (id);
ALTER TABLE public.components ADD CONSTRAINT components_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);
ALTER TABLE public.content_units ADD CONSTRAINT content_units_component_fkey FOREIGN KEY (component_id) REFERENCES public.components (id);
ALTER TABLE public.content_units ADD CONSTRAINT content_units_pathway_id_fkey FOREIGN KEY (pathway_id) REFERENCES public.exam_pathways (id);
ALTER TABLE public.content_units ADD CONSTRAINT content_units_skill_type_id_fkey FOREIGN KEY (skill_type_id) REFERENCES public.skill_types (id);
ALTER TABLE public.content_units ADD CONSTRAINT content_units_spec_fkey FOREIGN KEY (exam_spec_version_id) REFERENCES public.exam_spec_versions (id);
ALTER TABLE public.content_units ADD CONSTRAINT content_units_subject_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);
ALTER TABLE public.content_units ADD CONSTRAINT content_units_theme_fkey FOREIGN KEY (theme_id) REFERENCES public.themes (id);
ALTER TABLE public.content_units ADD CONSTRAINT content_units_topic_fkey FOREIGN KEY (topic_id) REFERENCES public.topics (id);
ALTER TABLE public.exam_papers ADD CONSTRAINT exam_papers_spec_fkey FOREIGN KEY (exam_spec_version_id) REFERENCES public.exam_spec_versions (id);
ALTER TABLE public.exam_pathways ADD CONSTRAINT exam_pathways_parent_pathway_id_fkey FOREIGN KEY (parent_pathway_id) REFERENCES public.exam_pathways (id);
ALTER TABLE public.exam_pathways ADD CONSTRAINT exam_pathways_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);
ALTER TABLE public.exam_spec_versions ADD CONSTRAINT exam_spec_versions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);
ALTER TABLE public.grade_scales ADD CONSTRAINT grade_scales_exam_board_id_fkey FOREIGN KEY (exam_board_id) REFERENCES public.exam_boards (id);
ALTER TABLE public.grade_scales ADD CONSTRAINT grade_scales_qualification_id_fkey FOREIGN KEY (qualification_id) REFERENCES public.qualifications (id);
ALTER TABLE public.mark_scheme_templates ADD CONSTRAINT mark_scheme_templates_exam_board_id_fkey FOREIGN KEY (exam_board_id) REFERENCES public.exam_boards (id);
ALTER TABLE public.milestones ADD CONSTRAINT milestones_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.mnemonic_favourites ADD CONSTRAINT mnemonic_favourites_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.mnemonic_plays ADD CONSTRAINT mnemonic_plays_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.mnemonic_requests ADD CONSTRAINT mnemonic_requests_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.mnemonic_requests ADD CONSTRAINT mnemonic_requests_mnemonic_id_fkey FOREIGN KEY (mnemonic_id) REFERENCES public.mnemonics (id);
ALTER TABLE public.mnemonic_requests ADD CONSTRAINT mnemonic_requests_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics (id);
ALTER TABLE public.mnemonics ADD CONSTRAINT mnemonics_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics (id);
ALTER TABLE public.planned_sessions ADD CONSTRAINT planned_sessions_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.planned_sessions ADD CONSTRAINT planned_sessions_exam_spec_version_id_fkey FOREIGN KEY (exam_spec_version_id) REFERENCES public.exam_spec_versions (id);
ALTER TABLE public.planned_sessions ADD CONSTRAINT planned_sessions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.revision_plans (id);
ALTER TABLE public.planned_sessions ADD CONSTRAINT planned_sessions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);
ALTER TABLE public.point_transactions ADD CONSTRAINT point_transactions_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
-- parents_id_fkey: references auth.users (cross-schema FK)
ALTER TABLE public.profiles ADD CONSTRAINT parents_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id);
ALTER TABLE public.revision_periods ADD CONSTRAINT revision_periods_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.revision_plans ADD CONSTRAINT revision_plans_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.revision_schedules ADD CONSTRAINT revision_schedules_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.revision_session_steps ADD CONSTRAINT revision_session_steps_revision_session_id_fkey FOREIGN KEY (revision_session_id) REFERENCES public.revision_sessions (id);
ALTER TABLE public.revision_sessions ADD CONSTRAINT revision_sessions_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.revision_sessions ADD CONSTRAINT revision_sessions_planned_session_id_fkey FOREIGN KEY (planned_session_id) REFERENCES public.planned_sessions (id);
ALTER TABLE public.revision_sessions ADD CONSTRAINT revision_sessions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);
ALTER TABLE public.revision_sessions ADD CONSTRAINT revision_sessions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics (id);
ALTER TABLE public.reward_addition_requests ADD CONSTRAINT reward_addition_requests_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
-- reward_addition_requests_resolved_by_fkey: references auth.users (cross-schema FK)
ALTER TABLE public.reward_addition_requests ADD CONSTRAINT reward_addition_requests_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users (id);
ALTER TABLE public.reward_addition_requests ADD CONSTRAINT reward_addition_requests_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.reward_templates (id);
ALTER TABLE public.reward_redemptions ADD CONSTRAINT reward_redemptions_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.reward_redemptions ADD CONSTRAINT reward_redemptions_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.profiles (id);
ALTER TABLE public.reward_redemptions ADD CONSTRAINT reward_redemptions_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES public.child_rewards (id);
ALTER TABLE public.reward_templates ADD CONSTRAINT reward_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.reward_categories (id);
ALTER TABLE public.strategy_overrides ADD CONSTRAINT strategy_overrides_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.strategy_overrides ADD CONSTRAINT strategy_overrides_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.revision_sessions (id);
ALTER TABLE public.study_buddy_learning_notes ADD CONSTRAINT study_buddy_learning_notes_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.study_buddy_learning_notes ADD CONSTRAINT study_buddy_learning_notes_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);
ALTER TABLE public.study_buddy_messages ADD CONSTRAINT study_buddy_messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.study_buddy_threads (id);
ALTER TABLE public.study_buddy_messages ADD CONSTRAINT study_buddy_messages_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics (id);
ALTER TABLE public.study_buddy_thread_summaries ADD CONSTRAINT study_buddy_thread_summaries_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.study_buddy_threads (id);
ALTER TABLE public.study_buddy_threads ADD CONSTRAINT study_buddy_threads_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children (id);
ALTER TABLE public.study_buddy_threads ADD CONSTRAINT study_buddy_threads_planned_session_id_fkey FOREIGN KEY (planned_session_id) REFERENCES public.planned_sessions (id);
ALTER TABLE public.study_buddy_threads ADD CONSTRAINT study_buddy_threads_revision_session_id_fkey FOREIGN KEY (revision_session_id) REFERENCES public.revision_sessions (id);
ALTER TABLE public.study_buddy_threads ADD CONSTRAINT study_buddy_threads_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects (id);

-- ==========================================================================
-- Section 6: Row Level Security Policies
-- ==========================================================================

-- availability_date_overrides
ALTER TABLE public.availability_date_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can delete own children overrides"
  ON public.availability_date_overrides
  FOR DELETE
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can insert own children overrides"
  ON public.availability_date_overrides
  FOR INSERT
  TO authenticated
  WITH CHECK (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can update own children overrides"
  ON public.availability_date_overrides
  FOR UPDATE
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())))
  WITH CHECK (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can view own children overrides"
  ON public.availability_date_overrides
  FOR SELECT
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


-- availability_override_slots
ALTER TABLE public.availability_override_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can delete own children override slots"
  ON public.availability_override_slots
  FOR DELETE
  TO authenticated
  USING (override_id IN ( SELECT o.id
   FROM (availability_date_overrides o
     JOIN children c ON ((c.id = o.child_id)))
  WHERE (c.parent_id = auth.uid())));

CREATE POLICY "Parents can insert own children override slots"
  ON public.availability_override_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (override_id IN ( SELECT o.id
   FROM (availability_date_overrides o
     JOIN children c ON ((c.id = o.child_id)))
  WHERE (c.parent_id = auth.uid())));

CREATE POLICY "Parents can update own children override slots"
  ON public.availability_override_slots
  FOR UPDATE
  TO authenticated
  USING (override_id IN ( SELECT o.id
   FROM (availability_date_overrides o
     JOIN children c ON ((c.id = o.child_id)))
  WHERE (c.parent_id = auth.uid())))
  WITH CHECK (override_id IN ( SELECT o.id
   FROM (availability_date_overrides o
     JOIN children c ON ((c.id = o.child_id)))
  WHERE (c.parent_id = auth.uid())));

CREATE POLICY "Parents can view own children override slots"
  ON public.availability_override_slots
  FOR SELECT
  TO authenticated
  USING (override_id IN ( SELECT o.id
   FROM (availability_date_overrides o
     JOIN children c ON ((c.id = o.child_id)))
  WHERE (c.parent_id = auth.uid())));


-- child_daily_voice_usage
ALTER TABLE public.child_daily_voice_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can insert own voice usage"
  ON public.child_daily_voice_usage
  FOR INSERT
  TO public
  WITH CHECK (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Children can update own voice usage"
  ON public.child_daily_voice_usage
  FOR UPDATE
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Children can view own voice usage"
  ON public.child_daily_voice_usage
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Parents can view children's voice usage"
  ON public.child_daily_voice_usage
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


-- child_flashcard_progress
ALTER TABLE public.child_flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can manage own flashcard progress"
  ON public.child_flashcard_progress
  FOR ALL
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Children can view own flashcard progress"
  ON public.child_flashcard_progress
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Parents can view children flashcard progress"
  ON public.child_flashcard_progress
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


-- child_goals
ALTER TABLE public.child_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "child_goals_parent_delete"
  ON public.child_goals
  FOR DELETE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children c
  WHERE ((c.id = child_goals.child_id) AND (c.parent_id = auth.uid()))));

CREATE POLICY "child_goals_parent_insert"
  ON public.child_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM children c
  WHERE ((c.id = child_goals.child_id) AND (c.parent_id = auth.uid()))));

CREATE POLICY "child_goals_parent_select"
  ON public.child_goals
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children c
  WHERE ((c.id = child_goals.child_id) AND (c.parent_id = auth.uid()))));

CREATE POLICY "child_goals_parent_update"
  ON public.child_goals
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children c
  WHERE ((c.id = child_goals.child_id) AND (c.parent_id = auth.uid()))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM children c
  WHERE ((c.id = child_goals.child_id) AND (c.parent_id = auth.uid()))));


-- child_mnemonic_usage
ALTER TABLE public.child_mnemonic_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can manage own mnemonic usage"
  ON public.child_mnemonic_usage
  FOR ALL
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Children can view own mnemonic usage"
  ON public.child_mnemonic_usage
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Parents can view children mnemonic usage"
  ON public.child_mnemonic_usage
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "cmu_insert_own"
  ON public.child_mnemonic_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (child_id = rpc_get_my_child_id());

CREATE POLICY "cmu_select_own"
  ON public.child_mnemonic_usage
  FOR SELECT
  TO authenticated
  USING (child_id = rpc_get_my_child_id());

CREATE POLICY "cmu_update_own"
  ON public.child_mnemonic_usage
  FOR UPDATE
  TO authenticated
  USING (child_id = rpc_get_my_child_id())
  WITH CHECK (child_id = rpc_get_my_child_id());


-- child_point_config
ALTER TABLE public.child_point_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their children's point config"
  ON public.child_point_config
  FOR ALL
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


-- child_rewards
ALTER TABLE public.child_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can read their own rewards"
  ON public.child_rewards
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.id = auth.uid())));

CREATE POLICY "Parents can manage their children's rewards"
  ON public.child_rewards
  FOR ALL
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


-- child_session_reflections
ALTER TABLE public.child_session_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can insert own reflections"
  ON public.child_session_reflections
  FOR INSERT
  TO authenticated
  WITH CHECK (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Children can view own reflections"
  ON public.child_session_reflections
  FOR SELECT
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Parents can view children reflections"
  ON public.child_session_reflections
  FOR SELECT
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


-- child_settings
ALTER TABLE public.child_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "child_settings_parent_delete"
  ON public.child_settings
  FOR DELETE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children c
  WHERE ((c.id = child_settings.child_id) AND (c.parent_id = auth.uid()))));

CREATE POLICY "child_settings_parent_insert"
  ON public.child_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM children c
  WHERE ((c.id = child_settings.child_id) AND (c.parent_id = auth.uid()))));

CREATE POLICY "child_settings_parent_select"
  ON public.child_settings
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children c
  WHERE ((c.id = child_settings.child_id) AND (c.parent_id = auth.uid()))));

CREATE POLICY "child_settings_parent_update"
  ON public.child_settings
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children c
  WHERE ((c.id = child_settings.child_id) AND (c.parent_id = auth.uid()))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM children c
  WHERE ((c.id = child_settings.child_id) AND (c.parent_id = auth.uid()))));


-- child_subjects
ALTER TABLE public.child_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own subjects"
  ON public.child_subjects
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = child_subjects.child_id) AND (children.auth_user_id = auth.uid()))));

CREATE POLICY "Parents can delete their children's subjects"
  ON public.child_subjects
  FOR DELETE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = child_subjects.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can manage their children's subjects"
  ON public.child_subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = child_subjects.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can update their children's subjects"
  ON public.child_subjects
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = child_subjects.child_id) AND (children.parent_id = auth.uid()))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = child_subjects.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can view their children's subjects"
  ON public.child_subjects
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = child_subjects.child_id) AND (children.parent_id = auth.uid()))));


-- children
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can accept invitation"
  ON public.children
  FOR UPDATE
  TO anon
  USING ((invitation_code IS NOT NULL) AND (auth_user_id IS NULL))
  WITH CHECK ((invitation_code IS NOT NULL) AND (auth_user_id IS NOT NULL));

CREATE POLICY "Anyone can view pending invitations by code"
  ON public.children
  FOR SELECT
  TO anon
  USING ((invitation_code IS NOT NULL) AND (auth_user_id IS NULL));

CREATE POLICY "Children can update own profile"
  ON public.children
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Children can view own profile"
  ON public.children
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Parents can delete own children"
  ON public.children
  FOR DELETE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = children.parent_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));

CREATE POLICY "Parents can insert own children"
  ON public.children
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = children.parent_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));

CREATE POLICY "Parents can update own children"
  ON public.children
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = children.parent_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = children.parent_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));

CREATE POLICY "Parents can view own children"
  ON public.children
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = children.parent_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));

CREATE POLICY "child can read own row"
  ON public.children
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "child can update own row"
  ON public.children
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "children_insert_parent"
  ON public.children
  FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "children_select_child_own"
  ON public.children
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "children_select_own_by_auth_user"
  ON public.children
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "children_select_parent_or_child"
  ON public.children
  FOR SELECT
  TO authenticated
  USING ((parent_id = auth.uid()) OR (auth_user_id = auth.uid()));

CREATE POLICY "children_select_parent_own"
  ON public.children
  FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "children_update_parent"
  ON public.children
  FOR UPDATE
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());


-- content_units
ALTER TABLE public.content_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_content_units_authed"
  ON public.content_units
  FOR SELECT
  TO authenticated
  USING (status = 'active'::content_status_enum);


-- exam_boards
ALTER TABLE public.exam_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exam boards"
  ON public.exam_boards
  FOR SELECT
  TO authenticated
  USING true;


-- goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals_select_authenticated"
  ON public.goals
  FOR SELECT
  TO authenticated
  USING true;


-- milestones
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own milestones"
  ON public.milestones
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = milestones.child_id) AND (children.auth_user_id = auth.uid()))));

CREATE POLICY "Parents can create milestones for their children"
  ON public.milestones
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = milestones.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can delete their children's milestones"
  ON public.milestones
  FOR DELETE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = milestones.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can update their children's milestones"
  ON public.milestones
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = milestones.child_id) AND (children.parent_id = auth.uid()))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = milestones.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can view their children's milestones"
  ON public.milestones
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = milestones.child_id) AND (children.parent_id = auth.uid()))));


-- mnemonic_favourites
ALTER TABLE public.mnemonic_favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can manage own favourites"
  ON public.mnemonic_favourites
  FOR ALL
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "mf_delete_own"
  ON public.mnemonic_favourites
  FOR DELETE
  TO authenticated
  USING (child_id = rpc_get_my_child_id());

CREATE POLICY "mf_insert_own"
  ON public.mnemonic_favourites
  FOR INSERT
  TO authenticated
  WITH CHECK (child_id = rpc_get_my_child_id());

CREATE POLICY "mf_select_own"
  ON public.mnemonic_favourites
  FOR SELECT
  TO authenticated
  USING (child_id = rpc_get_my_child_id());

CREATE POLICY "mnemonic_favourites_delete_own"
  ON public.mnemonic_favourites
  FOR DELETE
  TO authenticated
  USING (child_id = rpc_current_child_id());

CREATE POLICY "mnemonic_favourites_insert_own"
  ON public.mnemonic_favourites
  FOR INSERT
  TO authenticated
  WITH CHECK (child_id = rpc_current_child_id());

CREATE POLICY "mnemonic_favourites_select_own"
  ON public.mnemonic_favourites
  FOR SELECT
  TO authenticated
  USING (child_id = rpc_current_child_id());


-- mnemonic_plays
ALTER TABLE public.mnemonic_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can insert own plays"
  ON public.mnemonic_plays
  FOR INSERT
  TO public
  WITH CHECK (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can view children plays"
  ON public.mnemonic_plays
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "mnemonic_plays_insert_own"
  ON public.mnemonic_plays
  FOR INSERT
  TO authenticated
  WITH CHECK (child_id = rpc_current_child_id());

CREATE POLICY "mnemonic_plays_select_own"
  ON public.mnemonic_plays
  FOR SELECT
  TO authenticated
  USING (child_id = rpc_current_child_id());

CREATE POLICY "mnemonic_plays_update_own"
  ON public.mnemonic_plays
  FOR UPDATE
  TO authenticated
  USING (child_id = rpc_current_child_id())
  WITH CHECK (child_id = rpc_current_child_id());

CREATE POLICY "mp_insert_own"
  ON public.mnemonic_plays
  FOR INSERT
  TO authenticated
  WITH CHECK (child_id = rpc_get_my_child_id());

CREATE POLICY "mp_select_own"
  ON public.mnemonic_plays
  FOR SELECT
  TO authenticated
  USING (child_id = rpc_get_my_child_id());


-- mnemonic_requests
ALTER TABLE public.mnemonic_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own requests"
  ON public.mnemonic_requests
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can view children requests"
  ON public.mnemonic_requests
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Service can insert requests"
  ON public.mnemonic_requests
  FOR INSERT
  TO public
  WITH CHECK true;

CREATE POLICY "Service can update requests"
  ON public.mnemonic_requests
  FOR UPDATE
  TO public
  USING true;

CREATE POLICY "mr_insert_own"
  ON public.mnemonic_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (child_id = rpc_get_my_child_id());

CREATE POLICY "mr_select_own"
  ON public.mnemonic_requests
  FOR SELECT
  TO authenticated
  USING (child_id = rpc_get_my_child_id());

CREATE POLICY "mr_update_own"
  ON public.mnemonic_requests
  FOR UPDATE
  TO authenticated
  USING (child_id = rpc_get_my_child_id())
  WITH CHECK (child_id = rpc_get_my_child_id());


-- plan_config_multipliers
ALTER TABLE public.plan_config_multipliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Config readable by authenticated users"
  ON public.plan_config_multipliers
  FOR SELECT
  TO authenticated
  USING true;


-- planned_sessions
ALTER TABLE public.planned_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can update own planned sessions"
  ON public.planned_sessions
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = planned_sessions.child_id) AND (children.auth_user_id = auth.uid()))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = planned_sessions.child_id) AND (children.auth_user_id = auth.uid()))));

CREATE POLICY "Children can view own planned sessions"
  ON public.planned_sessions
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = planned_sessions.child_id) AND (children.auth_user_id = auth.uid()))));

CREATE POLICY "Parents can delete child planned sessions"
  ON public.planned_sessions
  FOR DELETE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM (children
     JOIN profiles ON ((profiles.id = children.parent_id)))
  WHERE ((children.id = planned_sessions.child_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));

CREATE POLICY "Parents can insert child planned sessions"
  ON public.planned_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM (children
     JOIN profiles ON ((profiles.id = children.parent_id)))
  WHERE ((children.id = planned_sessions.child_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));

CREATE POLICY "Parents can update child planned sessions"
  ON public.planned_sessions
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM (children
     JOIN profiles ON ((profiles.id = children.parent_id)))
  WHERE ((children.id = planned_sessions.child_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM (children
     JOIN profiles ON ((profiles.id = children.parent_id)))
  WHERE ((children.id = planned_sessions.child_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));

CREATE POLICY "Parents can view child planned sessions"
  ON public.planned_sessions
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM (children
     JOIN profiles ON ((profiles.id = children.parent_id)))
  WHERE ((children.id = planned_sessions.child_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));


-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- revision_periods
ALTER TABLE public.revision_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can delete own children revision periods"
  ON public.revision_periods
  FOR DELETE
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can insert own children revision periods"
  ON public.revision_periods
  FOR INSERT
  TO authenticated
  WITH CHECK (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can update own children revision periods"
  ON public.revision_periods
  FOR UPDATE
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())))
  WITH CHECK (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can view own children revision periods"
  ON public.revision_periods
  FOR SELECT
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


-- revision_plans
ALTER TABLE public.revision_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own plans"
  ON public.revision_plans
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_plans.child_id) AND (children.auth_user_id = auth.uid()))));

CREATE POLICY "Parents can delete child plans"
  ON public.revision_plans
  FOR DELETE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM (children
     JOIN profiles ON ((profiles.id = children.parent_id)))
  WHERE ((children.id = revision_plans.child_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));

CREATE POLICY "Parents can insert child plans"
  ON public.revision_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM (children
     JOIN profiles ON ((profiles.id = children.parent_id)))
  WHERE ((children.id = revision_plans.child_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));

CREATE POLICY "Parents can update child plans"
  ON public.revision_plans
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM (children
     JOIN profiles ON ((profiles.id = children.parent_id)))
  WHERE ((children.id = revision_plans.child_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM (children
     JOIN profiles ON ((profiles.id = children.parent_id)))
  WHERE ((children.id = revision_plans.child_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));

CREATE POLICY "Parents can view child plans"
  ON public.revision_plans
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM (children
     JOIN profiles ON ((profiles.id = children.parent_id)))
  WHERE ((children.id = revision_plans.child_id) AND (profiles.id = auth.uid()) AND (profiles.role = 'parent'::user_role))));


-- revision_schedules
ALTER TABLE public.revision_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own schedules"
  ON public.revision_schedules
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_schedules.child_id) AND (children.auth_user_id = auth.uid()))));

CREATE POLICY "Parents can create schedules for their children"
  ON public.revision_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_schedules.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can delete their children's schedules"
  ON public.revision_schedules
  FOR DELETE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_schedules.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can update their children's schedules"
  ON public.revision_schedules
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_schedules.child_id) AND (children.parent_id = auth.uid()))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_schedules.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can view their children's schedules"
  ON public.revision_schedules
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_schedules.child_id) AND (children.parent_id = auth.uid()))));


-- revision_session_steps
ALTER TABLE public.revision_session_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "child_can_select_revision_session_steps"
  ON public.revision_session_steps
  FOR SELECT
  TO public
  USING (EXISTS ( SELECT 1
   FROM ((revision_sessions rs
     JOIN planned_sessions ps ON ((ps.id = rs.planned_session_id)))
     JOIN children c ON ((c.id = ps.child_id)))
  WHERE ((rs.id = revision_session_steps.revision_session_id) AND (c.auth_user_id = auth.uid()))));

CREATE POLICY "child_can_update_revision_session_steps"
  ON public.revision_session_steps
  FOR UPDATE
  TO public
  USING (EXISTS ( SELECT 1
   FROM ((revision_sessions rs
     JOIN planned_sessions ps ON ((ps.id = rs.planned_session_id)))
     JOIN children c ON ((c.id = ps.child_id)))
  WHERE ((rs.id = revision_session_steps.revision_session_id) AND (c.auth_user_id = auth.uid()))));


-- revision_sessions
ALTER TABLE public.revision_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can create own sessions"
  ON public.revision_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_sessions.child_id) AND (children.auth_user_id = auth.uid()))));

CREATE POLICY "Children can update own sessions"
  ON public.revision_sessions
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_sessions.child_id) AND (children.auth_user_id = auth.uid()))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_sessions.child_id) AND (children.auth_user_id = auth.uid()))));

CREATE POLICY "Children can view own sessions"
  ON public.revision_sessions
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_sessions.child_id) AND (children.auth_user_id = auth.uid()))));

CREATE POLICY "Parents can create sessions for their children"
  ON public.revision_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_sessions.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can delete their children's sessions"
  ON public.revision_sessions
  FOR DELETE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_sessions.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can update their children's sessions"
  ON public.revision_sessions
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_sessions.child_id) AND (children.parent_id = auth.uid()))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_sessions.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can view their children's sessions"
  ON public.revision_sessions
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = revision_sessions.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "child_can_select_revision_sessions"
  ON public.revision_sessions
  FOR SELECT
  TO public
  USING (EXISTS ( SELECT 1
   FROM (planned_sessions ps
     JOIN children c ON ((c.id = ps.child_id)))
  WHERE ((ps.id = revision_sessions.planned_session_id) AND (c.auth_user_id = auth.uid()))));

CREATE POLICY "child_can_update_revision_sessions"
  ON public.revision_sessions
  FOR UPDATE
  TO public
  USING (EXISTS ( SELECT 1
   FROM (planned_sessions ps
     JOIN children c ON ((c.id = ps.child_id)))
  WHERE ((ps.id = revision_sessions.planned_session_id) AND (c.auth_user_id = auth.uid()))));


-- reward_addition_requests
ALTER TABLE public.reward_addition_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Can insert addition requests"
  ON public.reward_addition_requests
  FOR INSERT
  TO public
  WITH CHECK true;

CREATE POLICY "Children can view own addition requests"
  ON public.reward_addition_requests
  FOR SELECT
  TO public
  USING true;

CREATE POLICY "Parents can update addition requests"
  ON public.reward_addition_requests
  FOR UPDATE
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


-- reward_categories
ALTER TABLE public.reward_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reward categories"
  ON public.reward_categories
  FOR SELECT
  TO public
  USING true;


-- reward_redemptions
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can request redemptions"
  ON public.reward_redemptions
  FOR INSERT
  TO public
  WITH CHECK (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.id = auth.uid())));

CREATE POLICY "Children can view their own redemptions"
  ON public.reward_redemptions
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.id = auth.uid())));

CREATE POLICY "Parents can manage their children's redemptions"
  ON public.reward_redemptions
  FOR ALL
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


-- reward_templates
ALTER TABLE public.reward_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reward templates"
  ON public.reward_templates
  FOR SELECT
  TO public
  USING true;


-- study_buddy_learning_notes
ALTER TABLE public.study_buddy_learning_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can access own learning notes"
  ON public.study_buddy_learning_notes
  FOR ALL
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Parents can view children learning notes"
  ON public.study_buddy_learning_notes
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


-- study_buddy_messages
ALTER TABLE public.study_buddy_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can access own messages"
  ON public.study_buddy_messages
  FOR ALL
  TO public
  USING (thread_id IN ( SELECT study_buddy_threads.id
   FROM study_buddy_threads
  WHERE (study_buddy_threads.child_id IN ( SELECT children.id
           FROM children
          WHERE (children.auth_user_id = auth.uid())))));

CREATE POLICY "Parents can view children messages"
  ON public.study_buddy_messages
  FOR SELECT
  TO public
  USING (thread_id IN ( SELECT study_buddy_threads.id
   FROM study_buddy_threads
  WHERE (study_buddy_threads.child_id IN ( SELECT children.id
           FROM children
          WHERE (children.parent_id = auth.uid())))));


-- study_buddy_thread_summaries
ALTER TABLE public.study_buddy_thread_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can access own summaries"
  ON public.study_buddy_thread_summaries
  FOR ALL
  TO public
  USING (thread_id IN ( SELECT study_buddy_threads.id
   FROM study_buddy_threads
  WHERE (study_buddy_threads.child_id IN ( SELECT children.id
           FROM children
          WHERE (children.auth_user_id = auth.uid())))));

CREATE POLICY "Parents can view children summaries"
  ON public.study_buddy_thread_summaries
  FOR SELECT
  TO public
  USING (thread_id IN ( SELECT study_buddy_threads.id
   FROM study_buddy_threads
  WHERE (study_buddy_threads.child_id IN ( SELECT children.id
           FROM children
          WHERE (children.parent_id = auth.uid())))));


-- study_buddy_threads
ALTER TABLE public.study_buddy_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can access own threads"
  ON public.study_buddy_threads
  FOR ALL
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.auth_user_id = auth.uid())));

CREATE POLICY "Parents can view children threads"
  ON public.study_buddy_threads
  FOR SELECT
  TO public
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

ALTER TABLE public.study_buddy_voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can access own voice sessions"
  ON public.study_buddy_voice_sessions
  FOR ALL
  TO public
  USING (thread_id IN ( SELECT study_buddy_threads.id
   FROM study_buddy_threads
  WHERE (study_buddy_threads.child_id IN ( SELECT children.id
           FROM children
          WHERE (children.auth_user_id = auth.uid())))));

CREATE POLICY "Parents can view children voice sessions"
  ON public.study_buddy_voice_sessions
  FOR SELECT
  TO public
  USING (thread_id IN ( SELECT study_buddy_threads.id
   FROM study_buddy_threads
  WHERE (study_buddy_threads.child_id IN ( SELECT children.id
           FROM children
          WHERE (children.parent_id = auth.uid())))));


ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subjects"
  ON public.subjects
  FOR SELECT
  TO authenticated
  USING true;


ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topics"
  ON public.topics
  FOR SELECT
  TO authenticated
  USING true;


ALTER TABLE public.voice_quota_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read voice quota config"
  ON public.voice_quota_config
  FOR SELECT
  TO public
  USING true;


ALTER TABLE public.weekly_availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can delete own children slots"
  ON public.weekly_availability_slots
  FOR DELETE
  TO authenticated
  USING (template_id IN ( SELECT t.id
   FROM (weekly_availability_template t
     JOIN children c ON ((c.id = t.child_id)))
  WHERE (c.parent_id = auth.uid())));

CREATE POLICY "Parents can insert own children slots"
  ON public.weekly_availability_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (template_id IN ( SELECT t.id
   FROM (weekly_availability_template t
     JOIN children c ON ((c.id = t.child_id)))
  WHERE (c.parent_id = auth.uid())));

CREATE POLICY "Parents can update own children slots"
  ON public.weekly_availability_slots
  FOR UPDATE
  TO authenticated
  USING (template_id IN ( SELECT t.id
   FROM (weekly_availability_template t
     JOIN children c ON ((c.id = t.child_id)))
  WHERE (c.parent_id = auth.uid())))
  WITH CHECK (template_id IN ( SELECT t.id
   FROM (weekly_availability_template t
     JOIN children c ON ((c.id = t.child_id)))
  WHERE (c.parent_id = auth.uid())));

CREATE POLICY "Parents can view own children slots"
  ON public.weekly_availability_slots
  FOR SELECT
  TO authenticated
  USING (template_id IN ( SELECT t.id
   FROM (weekly_availability_template t
     JOIN children c ON ((c.id = t.child_id)))
  WHERE (c.parent_id = auth.uid())));


ALTER TABLE public.weekly_availability_template ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can delete own children templates"
  ON public.weekly_availability_template
  FOR DELETE
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can insert own children templates"
  ON public.weekly_availability_template
  FOR INSERT
  TO authenticated
  WITH CHECK (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can update own children templates"
  ON public.weekly_availability_template
  FOR UPDATE
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())))
  WITH CHECK (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));

CREATE POLICY "Parents can view own children templates"
  ON public.weekly_availability_template
  FOR SELECT
  TO authenticated
  USING (child_id IN ( SELECT children.id
   FROM children
  WHERE (children.parent_id = auth.uid())));


ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children can view own goals"
  ON public.weekly_goals
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = weekly_goals.child_id) AND (children.auth_user_id = auth.uid()))));

CREATE POLICY "Parents can create weekly goals for their children"
  ON public.weekly_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = weekly_goals.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can delete their children's weekly goals"
  ON public.weekly_goals
  FOR DELETE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = weekly_goals.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can update their children's weekly goals"
  ON public.weekly_goals
  FOR UPDATE
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = weekly_goals.child_id) AND (children.parent_id = auth.uid()))))
  WITH CHECK (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = weekly_goals.child_id) AND (children.parent_id = auth.uid()))));

CREATE POLICY "Parents can view their children's weekly goals"
  ON public.weekly_goals
  FOR SELECT
  TO authenticated
  USING (EXISTS ( SELECT 1
   FROM children
  WHERE ((children.id = weekly_goals.child_id) AND (children.parent_id = auth.uid()))));

