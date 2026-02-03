# RevisionHub Backend Developer Guide

**Version:** 1.0
**Last Updated:** 2 February 2026
**Audience:** Backend developers working with Supabase/PostgreSQL

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Getting Started](#2-getting-started)
3. [Database Schema](#3-database-schema)
4. [RPC Functions](#4-rpc-functions)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Edge Functions](#6-edge-functions)
7. [Data Flow Patterns](#7-data-flow-patterns)
8. [Testing](#8-testing)
9. [Common Tasks](#9-common-tasks)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Architecture Overview

### 1.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Backend Platform | Supabase |
| Database | PostgreSQL |
| Auth | Supabase Auth |
| Real-time | Supabase Realtime |
| Edge Functions | Deno (Supabase Edge) |
| Storage | Supabase Storage |

### 1.2 Backend Responsibilities

The backend handles:
- User authentication and session management
- Data storage and retrieval via RPC functions
- Business logic enforcement via PostgreSQL functions
- Real-time subscriptions for live updates
- Edge functions for AI integrations (Study Buddy)
- Row Level Security (RLS) for data isolation

### 1.3 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Client SDK                           │
│  - supabase.auth.*     (Authentication)                         │
│  - supabase.rpc()      (RPC calls)                              │
│  - supabase.from()     (Direct queries - minimal use)           │
│  - supabase.realtime() (Subscriptions)                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Platform                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Service │  │   PostgREST  │  │ Edge Runtime │          │
│  │              │  │   (RPC/API)  │  │  (Deno)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                    │  │
│  │  - Tables with RLS policies                              │  │
│  │  - RPC functions (business logic)                        │  │
│  │  - Triggers and constraints                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Getting Started

### 2.1 Prerequisites

- Supabase account with project access
- PostgreSQL client (pgAdmin, DBeaver, or CLI)
- Deno installed (for edge function development)
- Supabase CLI installed

### 2.2 Environment Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref <project-id>
```

### 2.3 Connecting to Database

```bash
# Via Supabase CLI
supabase db remote commit

# Direct connection string (from Supabase dashboard)
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 2.4 Project Structure (Supabase)

```
supabase/
├── functions/           # Edge functions
│   ├── study-buddy/
│   ├── study-buddy-transcription/
│   ├── study-buddy-sms/
│   └── tutor-advice/
├── migrations/          # Database migrations
└── seed.sql            # Seed data
```

---

## 3. Database Schema

### 3.1 Core Tables

#### Users & Relationships

```sql
-- Parent profiles (linked to auth.users)
parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Child profiles (linked to auth.users)
children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),  -- NULL until child signs up
  parent_id UUID REFERENCES parents(id),   -- Primary parent
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  year_group INTEGER,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Parent-child many-to-many (for multiple parents)
parent_child_links (
  parent_id UUID REFERENCES parents(id),
  child_id UUID REFERENCES children(id),
  relationship TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ,
  PRIMARY KEY (parent_id, child_id)
)
```

#### Content Structure

```sql
-- Subjects available in the system
subjects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)

-- Child's enrolled subjects
child_subjects (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  subject_id UUID REFERENCES subjects(id),
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)

-- Topics within subjects
topics (
  id UUID PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id),
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true
)

-- Revision content
content_units (
  id UUID PRIMARY KEY,
  topic_id UUID REFERENCES topics(id),
  title TEXT NOT NULL,
  language_level INTEGER CHECK (language_level IN (1, 2, 3)),
  preview_content JSONB,
  recall_items JSONB,
  reinforce_content JSONB,
  practice_questions JSONB,
  summary_content JSONB,
  created_at TIMESTAMPTZ
)
```

#### Session Management

```sql
-- Revision sessions
revision_sessions (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  content_unit_id UUID REFERENCES content_units(id),
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'paused', 'completed', 'abandoned')),
  scheduled_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ
)

-- Session step tracking
session_steps (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES revision_sessions(id),
  step_number INTEGER CHECK (step_number BETWEEN 1 AND 6),
  step_name TEXT,
  status TEXT CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)

-- Practice question responses
session_responses (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES revision_sessions(id),
  question_id TEXT NOT NULL,
  response JSONB,
  is_correct BOOLEAN,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ
)

-- Voice reflections
session_reflections (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES revision_sessions(id),
  audio_url TEXT,
  transcription TEXT,
  created_at TIMESTAMPTZ
)
```

#### Gamification

```sql
-- Points transaction ledger
points_ledger (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  session_id UUID REFERENCES revision_sessions(id),
  created_at TIMESTAMPTZ
)

-- Streak tracking
streaks (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  streak_type TEXT CHECK (streak_type IN ('daily', 'weekly')),
  current_count INTEGER DEFAULT 0,
  longest_count INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ
)

-- Achievement definitions
achievements (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB
)

-- Earned achievements
child_achievements (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT now()
)
```

#### Reward System

```sql
-- See PRD v9.0 Section 16.2 for complete reward table schemas:
-- reward_categories, reward_templates, child_rewards,
-- child_point_config, reward_redemptions, reward_addition_requests
```

### 3.2 Key Indexes

```sql
-- Performance indexes
CREATE INDEX idx_sessions_child_date ON revision_sessions(child_id, scheduled_date);
CREATE INDEX idx_sessions_status ON revision_sessions(status) WHERE status != 'completed';
CREATE INDEX idx_points_child ON points_ledger(child_id);
CREATE INDEX idx_children_invite ON children(invite_code) WHERE user_id IS NULL;
```

### 3.3 Row Level Security (RLS)

All tables have RLS enabled. Example policies:

```sql
-- Parents can only see their linked children
CREATE POLICY "Parents see own children" ON children
  FOR SELECT
  USING (
    parent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM parent_child_links
      WHERE parent_id = auth.uid() AND child_id = children.id
    )
  );

-- Children can only see their own data
CREATE POLICY "Children see own sessions" ON revision_sessions
  FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );
```

---

## 4. RPC Functions

### 4.1 Naming Convention

```
rpc_[action]_[entity]_[qualifier]

Actions: get, create, update, delete, start, complete, award, resolve
Entities: child, session, reward, points, etc.
Qualifier: optional specificity (e.g., _for_parent, _summary)
```

### 4.2 Response Format

All RPC functions return JSON with consistent structure:

```sql
-- Success response
RETURN jsonb_build_object(
  'success', true,
  'data', <result_data>
);

-- Error response
RETURN jsonb_build_object(
  'success', false,
  'error', 'error_code',
  'message', 'Human readable message'
);
```

### 4.3 RPC Function Categories

#### Session Management

| Function | Purpose | Parameters |
|----------|---------|------------|
| `rpc_get_child_today_data` | Get today's dashboard data | p_child_id |
| `rpc_start_revision_session` | Begin a session (atomic) | p_session_id |
| `rpc_advance_to_next_topic` | Move to next step | p_session_id, p_current_step |
| `rpc_complete_session` | Finish session | p_session_id, p_reflection |
| `rpc_abandon_session` | Cancel incomplete session | p_session_id |
| `rpc_get_session_data` | Get full session payload | p_session_id |

#### Parent Dashboard

| Function | Purpose | Parameters |
|----------|---------|------------|
| `rpc_get_parent_dashboard_data` | Dashboard overview | p_parent_id |
| `rpc_get_child_progress` | Detailed progress | p_child_id, p_date_range |
| `rpc_get_subject_breakdown` | Per-subject stats | p_child_id |
| `rpc_get_weekly_activity` | 7-day activity grid | p_child_id |

#### Gamification

| Function | Purpose | Parameters |
|----------|---------|------------|
| `rpc_award_session_points` | Award points for session | p_session_id |
| `rpc_get_gamification_summary` | Points/streak overview | p_child_id |
| `rpc_check_achievements` | Check and award achievements | p_child_id |
| `rpc_get_streak_data` | Current streak info | p_child_id |

#### Rewards (17 functions)

See PRD v9.0 Section 16.3 for complete list.

#### Onboarding

| Function | Purpose | Parameters |
|----------|---------|------------|
| `rpc_parent_create_child_and_plan` | Create child with initial setup | p_parent_id, p_child_data |
| `rpc_accept_child_invite` | Child accepts invite code | p_invite_code, p_user_id |
| `rpc_calculate_available_sessions` | Session distribution calc | p_availability, p_subjects |
| `rpc_generate_invite_code` | Create unique invite code | p_child_id |

### 4.4 Example RPC Implementation

```sql
CREATE OR REPLACE FUNCTION rpc_get_child_today_data(p_child_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_child RECORD;
  v_sessions JSONB;
  v_streak RECORD;
  v_points INTEGER;
BEGIN
  -- Verify access
  SELECT * INTO v_child FROM children WHERE id = p_child_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'child_not_found');
  END IF;

  -- Get today's sessions
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', rs.id,
      'title', cu.title,
      'subject', s.name,
      'status', rs.status,
      'scheduled_time', rs.scheduled_date
    )
  ) INTO v_sessions
  FROM revision_sessions rs
  JOIN content_units cu ON cu.id = rs.content_unit_id
  JOIN topics t ON t.id = cu.topic_id
  JOIN subjects s ON s.id = t.subject_id
  WHERE rs.child_id = p_child_id
    AND rs.scheduled_date = CURRENT_DATE;

  -- Get streak
  SELECT * INTO v_streak FROM streaks
  WHERE child_id = p_child_id AND streak_type = 'daily';

  -- Get points balance
  SELECT COALESCE(SUM(amount), 0) INTO v_points
  FROM points_ledger WHERE child_id = p_child_id;

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'child', jsonb_build_object(
        'id', v_child.id,
        'name', v_child.full_name
      ),
      'sessions', COALESCE(v_sessions, '[]'::jsonb),
      'streak', jsonb_build_object(
        'current', COALESCE(v_streak.current_count, 0),
        'longest', COALESCE(v_streak.longest_count, 0)
      ),
      'points_balance', v_points
    )
  );
END;
$$;
```

---

## 5. Authentication & Authorization

### 5.1 User Types

```sql
-- Determine user type
CREATE OR REPLACE FUNCTION get_user_type(p_user_id UUID)
RETURNS TEXT AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM parents WHERE id = p_user_id) THEN
    RETURN 'parent';
  ELSIF EXISTS (SELECT 1 FROM children WHERE user_id = p_user_id) THEN
    RETURN 'child';
  ELSE
    RETURN 'unknown';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.2 Access Control Patterns

```sql
-- Check if user is parent of child
CREATE OR REPLACE FUNCTION is_parent_of_child(p_parent_id UUID, p_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM children WHERE id = p_child_id AND parent_id = p_parent_id
    UNION
    SELECT 1 FROM parent_child_links WHERE parent_id = p_parent_id AND child_id = p_child_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.3 RLS Policy Patterns

```sql
-- Pattern: Parent access to child data
CREATE POLICY "parent_access_child_data" ON revision_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM children c
      WHERE c.id = revision_sessions.child_id
      AND (
        c.parent_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM parent_child_links pcl
          WHERE pcl.child_id = c.id AND pcl.parent_id = auth.uid()
        )
      )
    )
  );

-- Pattern: Child access to own data
CREATE POLICY "child_access_own_data" ON revision_sessions
  FOR ALL
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );
```

---

## 6. Edge Functions

### 6.1 Overview

Edge functions handle AI integrations and external services:

| Function | Purpose | Trigger |
|----------|---------|---------|
| `study-buddy` | AI chat responses | POST from frontend |
| `study-buddy-transcription` | Voice to text | POST with audio |
| `study-buddy-sms` | SMS notifications | Internal trigger |
| `tutor-advice` | AI-generated parent advice | POST from frontend |

### 6.2 Edge Function Structure

```typescript
// supabase/functions/study-buddy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization')!

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Parse request
    const { message, sessionId, childId } = await req.json()

    // Get session context
    const { data: session } = await supabase
      .rpc('rpc_get_session_context', { p_session_id: sessionId })

    // Call AI (OpenAI, Anthropic, etc.)
    const aiResponse = await callAI(message, session)

    // Log conversation
    await supabase.from('study_buddy_messages').insert({
      child_id: childId,
      session_id: sessionId,
      user_message: message,
      ai_response: aiResponse
    })

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})
```

### 6.3 Deploying Edge Functions

```bash
# Deploy single function
supabase functions deploy study-buddy

# Deploy all functions
supabase functions deploy

# Test locally
supabase functions serve study-buddy --env-file .env.local
```

---

## 7. Data Flow Patterns

### 7.1 Frontend → RPC → Database

```
Frontend Service Call
        │
        ▼
supabase.rpc('rpc_function_name', { params })
        │
        ▼
PostgreSQL Function Executes
        │
        ├── Validates input
        ├── Checks permissions
        ├── Performs business logic
        ├── Updates tables
        └── Returns JSON response
        │
        ▼
Frontend receives response
```

### 7.2 Session Start Flow (Example)

```sql
-- Atomic session start prevents race conditions
rpc_start_revision_session(p_session_id UUID)
  │
  ├── 1. SELECT FOR UPDATE (lock row)
  ├── 2. Verify session status = 'not_started'
  ├── 3. UPDATE status = 'in_progress', started_at = now()
  ├── 4. Create session_steps records
  ├── 5. Return session payload
  └── 6. COMMIT (release lock)
```

### 7.3 Points Award Flow

```sql
rpc_award_session_points(p_session_id UUID)
  │
  ├── 1. Get child_point_config (weightings)
  ├── 2. Calculate completion score
  ├── 3. Calculate accuracy score
  ├── 4. Calculate focus score
  ├── 5. Apply streak multiplier
  ├── 6. INSERT into points_ledger
  ├── 7. UPDATE revision_sessions.points_earned
  ├── 8. Check/award achievements
  └── 9. Return points breakdown
```

---

## 8. Testing

### 8.1 RPC Testing

```sql
-- Test in SQL editor
SELECT rpc_get_child_today_data('child-uuid-here');

-- Check response structure
SELECT jsonb_pretty(rpc_get_child_today_data('child-uuid-here'));
```

### 8.2 Test Users

Maintain test users for each scenario:

```sql
-- Insert test parent
INSERT INTO parents (id, email, full_name)
VALUES ('test-parent-uuid', 'test.parent@example.com', 'Test Parent');

-- Insert test child
INSERT INTO children (id, parent_id, full_name, year_group)
VALUES ('test-child-uuid', 'test-parent-uuid', 'Test Child', 7);
```

### 8.3 RLS Testing

```sql
-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-uuid-here';

-- Run query (should respect RLS)
SELECT * FROM revision_sessions;

-- Reset
RESET ROLE;
```

---

## 9. Common Tasks

### 9.1 Adding a New RPC Function

1. Write the function:
```sql
CREATE OR REPLACE FUNCTION rpc_new_function(p_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Implementation
END;
$$;
```

2. Grant execute permission:
```sql
GRANT EXECUTE ON FUNCTION rpc_new_function TO authenticated;
```

3. Add TypeScript types (frontend):
```typescript
// src/types/rpc.ts
interface RpcNewFunctionResponse {
  success: boolean;
  data?: {
    // response shape
  };
  error?: string;
}
```

### 9.2 Adding a New Table

1. Create migration:
```sql
-- migrations/20260202_create_new_table.sql
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "policy_name" ON new_table
  FOR SELECT USING (/* condition */);

-- Create indexes
CREATE INDEX idx_new_table_column ON new_table(column);
```

2. Run migration:
```bash
supabase db push
```

### 9.3 Debugging RPC Issues

```sql
-- Enable logging
SET log_statement = 'all';
SET log_min_messages = 'DEBUG';

-- Check function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'rpc_function_name';

-- Test with explicit error output
DO $$
BEGIN
  RAISE NOTICE 'Result: %', rpc_function_name('param');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error: %, %', SQLSTATE, SQLERRM;
END $$;
```

---

## 10. Troubleshooting

### 10.1 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `permission denied for function` | Missing GRANT | `GRANT EXECUTE ON FUNCTION ... TO authenticated` |
| `violates row-level security policy` | RLS blocking access | Check policy conditions match user context |
| `function does not exist` | Wrong function name or no GRANT | Verify function name and permissions |
| `could not serialize access` | Concurrent modification | Use `SELECT FOR UPDATE` for atomic operations |

### 10.2 Performance Issues

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Analyze query plan
EXPLAIN ANALYZE SELECT * FROM rpc_function_name('param');

-- Check missing indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### 10.3 RLS Debugging

```sql
-- Check current user
SELECT auth.uid();
SELECT auth.role();

-- Temporarily disable RLS (admin only!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- Run query
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

---

## Appendix A: Quick Reference

### Environment Variables

| Variable | Purpose |
|----------|---------|
| SUPABASE_URL | Project API URL |
| SUPABASE_ANON_KEY | Anonymous/public key |
| SUPABASE_SERVICE_ROLE_KEY | Admin key (backend only!) |

### Useful Supabase CLI Commands

```bash
supabase db push          # Apply migrations
supabase db reset         # Reset database
supabase db diff          # Generate migration from changes
supabase functions deploy # Deploy edge functions
supabase functions serve  # Local edge function dev
supabase gen types        # Generate TypeScript types
```

### RPC Quick Test Template

```sql
-- Replace values and run in Supabase SQL Editor
SELECT jsonb_pretty(
  rpc_function_name(
    p_param1 := 'value1'::uuid,
    p_param2 := 'value2'::text
  )
);
```

---

**Document End**

For feature specifications, see `RevisionHub_PRD_v9_0.md`.
For RPC function details, see `PUBLIC_RPC_FUNCTION_DEFINITIONS.md`.
