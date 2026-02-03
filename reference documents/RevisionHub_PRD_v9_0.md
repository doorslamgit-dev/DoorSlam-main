# RevisionHub Product Requirements Document v9.0

## Document Control

| Property | Value |
|----------|-------|
| Version | 9.1 |
| Date | 3 February 2026 |
| Status | Active Development |
| Owner | Product & Engineering |

## Version History

| Version | Date | Summary |
|---------|------|---------|
| v6.0 | 13 Jan 2026 | 7-step session model, pre/post confidence, flashcard persistence |
| v6.1 | 13 Jan 2026 | 6-step model (merged reflection+complete), schema corrections |
| v7.0 | 15 Jan 2026 | Complete consolidation: needs assessment, payload restructure, content schemas, frontend patterns, voice transcription |
| v8.0 | 21 Jan 2026 | Parent Dashboard v2, Unified Status System, Study Buddy AI, Add Subject with Redistribution, Content Pipeline |
| v8.1 | 24 Jan 2026 | FEAT-013 Reward System: 7 tables, 17 RPCs, parent config, child catalog, addition requests |
| v9.0 | 2 Feb 2026 | Full document consolidation: complete PRD reconstruction from codebase, technical audit integration |
| v9.1 | 3 Feb 2026 | FEAT-014 Personalized Hero Summaries, TypeScript strict compilation cleanup |

---

## Section 1: Executive Summary

### 1.1 Product Vision

RevisionHub is an AI-powered educational platform designed to help students (primarily ages 8-16) consolidate and revise classroom learning through structured, gamified revision sessions. The platform bridges the gap between classroom instruction and independent study by providing personalized, evidence-based revision activities.

### 1.2 Core Value Proposition

- **For Students**: Engaging, bite-sized revision sessions that make studying fun through gamification
- **For Parents**: Visibility into their child's learning progress and control over study schedules and rewards
- **For Educators**: A supplement to classroom learning that reinforces key concepts

### 1.3 Key Differentiators

1. **6-Step Pedagogical Session Model**: Evidence-based learning flow (Preview → Recall → Reinforce → Practice → Summary → Complete)
2. **Study Buddy AI**: AI-powered chatbot for contextual help during sessions
3. **Gamification System**: Points, streaks, achievements, and real-world rewards
4. **Parent Dashboard**: Multi-child support with comprehensive insights
5. **Adaptive Content**: Content matched to student's language level and curriculum

---

## Section 2: Target Users

### 2.1 Primary Users

#### 2.1.1 Students (Child Users)
- **Age Range**: 8-16 years
- **Characteristics**:
  - Enrolled in school with homework/revision needs
  - May struggle with self-directed study
  - Motivated by games and rewards
- **Goals**:
  - Complete revision efficiently
  - Earn points and rewards
  - Track progress and achievements

#### 2.1.2 Parents
- **Characteristics**:
  - Want to support child's education
  - Limited time for hands-on tutoring
  - Need visibility into study habits
- **Goals**:
  - Monitor child's revision progress
  - Configure study schedules
  - Manage reward incentives
  - Receive actionable insights

### 2.2 User Relationships

```
Parent Account
├── Child 1 (linked via invite code)
├── Child 2 (linked via invite code)
└── Child N...
```

- Parents create accounts and invite children via unique codes
- Children can have one or more parents linked
- Parents have full visibility and control over their linked children

---

## Section 3: Technical Architecture

### 3.1 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 18.2.0 |
| Language | TypeScript | 5.3.3 |
| Build Tool | Vite | 5.0.11 |
| Styling | Tailwind CSS | 3.4.1 |
| Backend | Supabase | Latest |
| Database | PostgreSQL | Via Supabase |
| Auth | Supabase Auth | Built-in |
| Edge Functions | Deno | Via Supabase |

### 3.2 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── child/          # Child-specific components
│   │   ├── rewards/    # Reward system components
│   │   ├── session/    # Session step components
│   │   └── today/      # Today dashboard components
│   ├── parent/         # Parent-specific components
│   │   ├── dashboard/  # Dashboard widgets
│   │   ├── insights/   # Insights components
│   │   ├── onboarding/ # Onboarding flow
│   │   └── rewards/    # Reward management
│   └── ui/             # Shared UI primitives
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Route components
│   ├── child/          # Child pages
│   ├── parent/         # Parent pages
│   └── session/        # Session step pages
├── services/           # API/RPC service layer
│   ├── parentOnboarding/ # Onboarding services
│   └── ...             # Domain services
└── types/              # TypeScript definitions
```

### 3.3 Design System

- **Design Tokens**: Centralized in `DESIGN_TOKENS.md`
- **Theme Support**: Light and dark mode via CSS variables
- **Color Palette**:
  - Primary: Blue (#3B82F6)
  - Success: Green (#22C55E)
  - Warning: Amber (#F59E0B)
  - Error: Red (#EF4444)
- **Typography**: System font stack with consistent scale

### 3.4 Environment Variables

| Variable | Purpose |
|----------|---------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous key |

---

## Section 4: Authentication & Authorization

### 4.1 Authentication Flow

1. **Email/Password**: Standard Supabase auth
2. **Session Management**: JWT-based with automatic refresh
3. **Role Detection**: User type (parent/child) determined at login from `parents`/`children` tables

### 4.2 Authorization Model

| Role | Access |
|------|--------|
| Parent | Own profile, all linked children data, settings |
| Child | Own profile, own sessions, own progress |
| Unauthenticated | Landing page, login, signup only |

### 4.3 Child Account Linking

```
1. Parent creates child profile → generates invite code
2. Child signs up with invite code
3. System links auth.users to children table
4. Parent-child relationship established
```

---

## Section 5: Core Features Overview

### 5.1 Feature Matrix

| Feature | Parent | Child | Status |
|---------|--------|-------|--------|
| Dashboard | ✓ | ✓ | Complete |
| Session Management | View | Execute | Complete |
| Progress Tracking | ✓ | ✓ | Complete |
| Gamification | Configure | Earn/View | Complete |
| Rewards | Manage | Redeem | Complete |
| Study Buddy AI | - | ✓ | Complete |
| Insights | ✓ | - | Complete |
| Scheduling | ✓ | View | Complete |

---

## Section 6: Session Model

### 6.1 6-Step Session Architecture

RevisionHub uses a pedagogically-grounded 6-step session model:

```
┌─────────────────────────────────────────────────────────────┐
│  1. PREVIEW    →  2. RECALL    →  3. REINFORCE             │
│  (Context)        (Retrieval)     (Explanation)            │
│                                                             │
│  4. PRACTICE   →  5. SUMMARY   →  6. COMPLETE              │
│  (Application)    (Review)        (Reflection)             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Step Details

#### Step 1: Preview
- **Purpose**: Activate prior knowledge, set context
- **Content**: Topic overview, key concepts introduction
- **UI**: Read-only content display
- **Route**: `/child/session/:sessionId/preview`

#### Step 2: Recall
- **Purpose**: Active retrieval practice
- **Content**: Flashcard-style Q&A
- **UI**: Card flip interaction, self-assessment
- **Route**: `/child/session/:sessionId/recall`
- **Data**: Pre/post confidence ratings

#### Step 3: Reinforce
- **Purpose**: Deepen understanding
- **Content**: Detailed explanations, examples
- **UI**: Rich text with visuals
- **Route**: `/child/session/:sessionId/reinforce`

#### Step 4: Practice
- **Purpose**: Apply knowledge
- **Content**: Multiple choice questions, short answers
- **UI**: Interactive quiz format
- **Route**: `/child/session/:sessionId/practice`
- **Data**: Accuracy tracking, response times

#### Step 5: Summary
- **Purpose**: Consolidate learning
- **Content**: Key takeaways, performance summary
- **UI**: Summary cards, stats display
- **Route**: `/child/session/:sessionId/summary`

#### Step 6: Complete
- **Purpose**: Session wrap-up, reflection
- **Content**: Points earned, streak update, Study Buddy chat
- **UI**: Celebration animation, Study Buddy access
- **Route**: `/child/session/:sessionId/complete`

### 6.3 Session States

```typescript
type SessionStatus =
  | 'not_started'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'abandoned';

type StepStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'completed';
```

### 6.4 Session Data Model

Key tables:
- `revision_sessions`: Session records
- `session_steps`: Step completion tracking
- `session_responses`: Quiz/practice responses
- `session_reflections`: Voice notes and transcriptions

---

## Section 7: Parent Features

### 7.1 Parent Dashboard

**Route**: `/parent`

#### 7.1.1 Multi-Child Support
- Tab-based child selector
- Per-child data isolation
- Quick switch between children

#### 7.1.2 Dashboard Components

| Component | Purpose |
|-----------|---------|
| HeroStatusBanner | Today's summary with per-child personalized sentences (FEAT-014) |
| SessionsOverviewCard | Recent sessions, completion status |
| WeeklyProgressCard | 7-day activity grid |
| SubjectBreakdownCard | Performance by subject |
| InsightsPreviewCard | AI-generated advice snippet |
| QuickActionsCard | Common tasks shortcuts |

#### 7.1.3 Personalized Hero Summaries (FEAT-014)

For families with multiple children, the HeroStatusBanner displays personalized one-sentence summaries for each child:

**Example Output:**
> "Emma completed 5 sessions and is on track. Tom missed a few sessions — a gentle nudge might help."

**Key Features:**
- Uses `preferred_name` (nickname) if set, otherwise `first_name`
- One sentence per child tailored to their individual status
- Zero-latency frontend template generation
- Architecture ready for future AI-generated summaries via backend

**Status-Based Templates:**
| Status | Example Sentence |
|--------|------------------|
| on_track | "{Name} completed {N} sessions and is on track." |
| keep_an_eye | "{Name}'s activity dipped slightly this week." |
| needs_attention | "{Name} missed a few sessions — a gentle nudge might help." |
| getting_started | "{Name} is just getting started — great first steps!" |

### 7.2 Parent Insights

**Route**: `/parent/insights`

AI-powered insights including:
- Performance trends
- Suggested focus areas
- Optimal study times
- Comparative analysis (child vs. benchmarks)

### 7.3 Child Management

**Route**: `/parent/children`

- Add new children
- Edit child profiles
- Manage subjects and plans
- Configure availability templates

### 7.4 Scheduling System

**Route**: `/parent/schedule`

#### 7.4.1 Weekly Availability Template
- 7-day grid interface
- Time slot configuration
- Session allocation based on availability

#### 7.4.2 Session Distribution
- Algorithm distributes sessions across available slots
- Respects per-day and per-week limits
- Handles subject prioritization

### 7.5 Subject Management

**Route**: `/parent/subjects` (via child management)

#### 7.5.1 Add Subject with Redistribution (FEAT-012)
- Add new subjects mid-plan
- Automatic session redistribution
- Priority ordering
- Impact assessment preview

---

## Section 8: Child Features

### 8.1 Today Dashboard

**Route**: `/child/today`

#### 8.1.1 Component Architecture

```
Today.tsx (orchestrator)
├── TodayHeader.tsx        - Greeting + streak badge
├── SessionList.tsx        - Today's sessions card
├── TodayProgressCard.tsx  - Week progress grid
├── UpcomingSection.tsx    - Coming up timeline
├── StreakMomentumCard.tsx - Streak card (half-width)
├── RewardsMiniCard.tsx    - Rewards summary (half-width)
├── TodayTipCard.tsx       - Daily tip rotation
└── EmptyState.tsx         - Loading/Error/Empty states
```

#### 8.1.2 Session Cards
- Shows today's scheduled sessions
- Status indicators (not started, in progress, completed)
- Tap to start/continue session

### 8.2 Session Execution

**Route**: `/child/session/:sessionId`

- Guided navigation through 6 steps
- Progress indicator
- Exit/pause functionality
- Study Buddy AI access

### 8.3 Progress & Achievements

**Route**: `/child/progress`

- Historical session data
- Subject performance breakdown
- Achievement gallery
- Points history

### 8.4 Rewards Catalog

**Route**: `/child/rewards`

See Section 16 for full details.

---

## Section 9: Gamification System

### 9.1 Points System

#### 9.1.1 Point Earning
Points awarded for:
- Session completion (base points)
- Accuracy bonus
- Focus/engagement bonus
- Streak multipliers

#### 9.1.2 Point Configuration
Parents can configure weighting:
- Completion weight (default 40%)
- Accuracy weight (default 35%)
- Focus weight (default 25%)

### 9.2 Streaks

- **Daily Streak**: Consecutive days with completed sessions
- **Weekly Streak**: Consecutive weeks meeting targets
- **Streak Protection**: Grace period for missed days (configurable)

### 9.3 Achievements

Categories:
- Session milestones (first session, 10 sessions, etc.)
- Subject mastery
- Streak achievements
- Special events

### 9.4 Leaderboards (Future)

- Family leaderboard
- Class leaderboard (with school integration)

---

## Section 10: Study Buddy AI (FEAT-011)

### 10.1 Overview

Study Buddy is an AI-powered chatbot available during revision sessions to provide contextual help and encouragement.

### 10.2 Features

| Feature | Description |
|---------|-------------|
| Text Chat | Real-time messaging with AI |
| Voice Input | Speech-to-text for questions |
| Context Awareness | Knows current session/topic |
| Encouragement | Positive reinforcement |
| Hint System | Progressive hints without giving answers |

### 10.3 Implementation

- **Edge Function**: `study-buddy` (Deno/Supabase)
- **Transcription**: `study-buddy-transcription` edge function
- **SMS Notifications**: `study-buddy-sms` for parent alerts

### 10.4 Safety Controls

- Content filtering
- Session transcript logging
- Parent visibility into conversations

---

## Section 11: Content Management

### 11.1 Content Structure

```
Subject
└── Topic
    └── Content Unit
        ├── Preview content
        ├── Recall items (flashcards)
        ├── Reinforce content
        ├── Practice questions
        └── Summary content
```

### 11.2 Content Pipeline

- **Board Document Capture**: Scan/photograph board notes
- **AI Processing**: Extract and structure content
- **Review Workflow**: Teacher/parent review
- **Publication**: Push to student's content library

### 11.3 Language Levels

Content tagged with language complexity:
- Level 1: Simple (ages 8-10)
- Level 2: Intermediate (ages 11-13)
- Level 3: Advanced (ages 14-16)

Language level extracted from policy and matched to child's profile.

---

## Section 12: Unified Status System (FEAT-010)

### 12.1 Status Levels

```typescript
type StatusLevel = 'not_started' | 'in_progress' | 'needs_attention' | 'complete';
```

### 12.2 Status Applications

| Entity | Statuses Used |
|--------|---------------|
| Session | all 4 |
| Session Step | all 4 |
| Weekly Progress | all 4 |
| Subject | all 4 |

### 12.3 Helper Function

```typescript
function getStatusLevel(metrics: StatusMetrics): StatusLevel;
```

Centralized status calculation for consistency across UI.

---

## Section 13: Parent Onboarding Flow

### 13.1 Onboarding Steps

```
1. Account Creation
   └── Email, password, name

2. Add First Child
   └── Name, age, year group

3. Select Subjects
   └── Choose from curriculum-aligned subjects

4. Configure Schedule
   └── Set weekly availability template

5. Review Plan
   └── See generated session schedule

6. Invite Child
   └── Generate and share invite code
```

### 13.2 Onboarding Services

Located in `src/services/parentOnboarding/`:

| Service | Purpose |
|---------|---------|
| parentAccountService.ts | Account CRUD |
| childProfileService.ts | Child profile management |
| subjectSelectionService.ts | Subject configuration |
| scheduleService.ts | Availability setup |
| planGenerationService.ts | Session plan creation |
| inviteCodeService.ts | Code generation/validation |

---

## Section 14: Data Flow Architecture

### 14.1 Service Layer Pattern

```
Page Component
    ↓ calls
Service Function
    ↓ calls
Supabase RPC
    ↓ executes
PostgreSQL Function
    ↓ returns
JSON Response
    ↓ transforms
Service Function
    ↓ returns
Page Component (state update)
```

### 14.2 Key Services

| Service | Domain | Key Functions |
|---------|--------|---------------|
| todayService.ts | Child Today | getTodayData, startSession |
| revisionSessionApi.ts | Session Execution | getSessionData, submitStep |
| parentDashboardService.ts | Parent Dashboard | getDashboardData |
| childRewardService.ts | Child Rewards | getCatalog, requestRedemption |
| parentRewardService.ts | Parent Rewards | getConfig, resolveRedemption |
| gamificationService.ts | Points/Streaks | getGamificationSummary |
| insightsService.ts | Parent Insights | getInsights, getAdvice |

### 14.3 Real-time Subscriptions

Supabase real-time used for:
- Session state updates
- Notification delivery
- Reward request alerts

---

## Section 15: API/RPC Layer

### 15.1 RPC Naming Convention

```
rpc_[action]_[entity]_[qualifier]

Examples:
- rpc_get_child_today_data
- rpc_start_revision_session
- rpc_award_session_points
```

### 15.2 Response Format

All RPCs return JSON with consistent structure:
```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: "error_code", message: "Human readable" }
```

### 15.3 RPC Categories

| Category | Count | Examples |
|----------|-------|----------|
| Session Management | ~15 | start, advance, complete, abandon |
| Parent Dashboard | ~10 | get_dashboard_data, get_child_progress |
| Child Today | ~8 | get_today_data, get_upcoming_sessions |
| Gamification | ~6 | award_points, get_streak, get_achievements |
| Rewards | 17 | See Section 16.3 |
| Onboarding | ~12 | create_child, accept_invite, setup_schedule |
| Insights | ~7 | get_insights, get_tutor_advice |

---

## Section 16: Reward Configuration System (FEAT-013)

### 16.1 Overview

The reward system connects revision points to real-world rewards, creating a collaborative incentive system between parents and children.

**Design Principle**: "A conversation, not a transaction" - The UI encourages parents to set up rewards together with their child.

#### 16.1.1 Key Features

| Feature | Description |
|---------|-------------|
| Point Weighting | Parents configure how points are calculated (completion, accuracy, focus) |
| Reward Categories | 6 predefined categories with suggested rewards |
| Custom Rewards | Parents can create custom rewards beyond templates |
| Redemption Approval | Parent approval flow with auto-approve threshold |
| Addition Requests | Children can request rewards from the catalog |
| Reward Limits | Per-day, per-week, per-month limits on rewards |

### 16.2 Database Schema

#### 16.2.1 reward_categories

Reference table for reward category types.

```sql
CREATE TABLE reward_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Seed Data:**

| code | name | icon |
|------|------|------|
| screen_time | Screen Time | 📱 |
| treats | Treats | 🍦 |
| activities | Activities | 🎯 |
| pocket_money | Pocket Money | 💰 |
| privileges | Privileges | ⭐ |
| custom | Custom | 🎁 |

#### 16.2.2 reward_templates

Suggested rewards per category that parents can enable.

```sql
CREATE TABLE reward_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES reward_categories(id),
  name TEXT NOT NULL,
  suggested_points INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Example Seed Data:**

| category | name | suggested_points |
|----------|------|------------------|
| screen_time | 15 minutes extra gaming | 100 |
| screen_time | 30 minutes extra gaming | 200 |
| screen_time | 1 hour extra screen time | 350 |
| treats | Small treat | 150 |
| treats | Medium treat | 300 |
| activities | Cinema trip | 800 |
| pocket_money | £5 | 500 |
| privileges | Stay up 30 mins late | 200 |

#### 16.2.3 child_rewards

Parent-enabled rewards for a specific child.

```sql
CREATE TABLE child_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES reward_categories(id),
  template_id UUID REFERENCES reward_templates(id),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🎁',
  points_cost INTEGER NOT NULL,
  limit_type TEXT CHECK (limit_type IN ('per_day', 'per_week', 'per_month', 'unlimited')),
  limit_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 16.2.4 child_point_config

Point weighting configuration per child.

```sql
CREATE TABLE child_point_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID UNIQUE NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  mode TEXT DEFAULT 'auto' CHECK (mode IN ('auto', 'manual')),
  completion_weight INTEGER DEFAULT 40,
  accuracy_weight INTEGER DEFAULT 35,
  focus_weight INTEGER DEFAULT 25,
  auto_approve_threshold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT weights_sum_100 CHECK (
    mode = 'auto' OR (completion_weight + accuracy_weight + focus_weight = 100)
  ),
  CONSTRAINT weights_min_10 CHECK (
    mode = 'auto' OR (
      completion_weight >= 10 AND accuracy_weight >= 10 AND focus_weight >= 10
    )
  )
);
```

#### 16.2.5 reward_redemptions

Child requests to redeem rewards.

```sql
CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES child_rewards(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'declined', 'cancelled', 'expired')
  ),
  points_spent INTEGER NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  decline_reason TEXT,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);
```

#### 16.2.6 reward_addition_requests

Child requests for parents to add new rewards from the catalog.

```sql
CREATE TABLE reward_addition_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES reward_templates(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'declined')
  ),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  parent_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate pending requests
CREATE UNIQUE INDEX idx_unique_pending_addition
  ON reward_addition_requests(child_id, template_id)
  WHERE status = 'pending';
```

### 16.3 RPC Functions

#### 16.3.1 Configuration RPCs

**rpc_get_child_reward_config**

Returns complete reward configuration for a child.

```sql
rpc_get_child_reward_config(p_child_id UUID)
RETURNS JSON {
  point_config: {
    mode: 'auto' | 'manual',
    completion_weight: INTEGER,
    accuracy_weight: INTEGER,
    focus_weight: INTEGER,
    auto_approve_threshold: INTEGER
  },
  categories: [{
    id: UUID,
    code: TEXT,
    name: TEXT,
    icon: TEXT
  }],
  rewards: [{
    id: UUID,
    category_code: TEXT,
    name: TEXT,
    emoji: TEXT,
    points_cost: INTEGER,
    limit_type: TEXT,
    limit_count: INTEGER,
    is_active: BOOLEAN
  }],
  points_balance: INTEGER,
  pending_count: INTEGER
}
```

**rpc_save_point_config**

Saves point weighting configuration.

```sql
rpc_save_point_config(
  p_child_id UUID,
  p_mode TEXT,
  p_completion_weight INTEGER,
  p_accuracy_weight INTEGER,
  p_focus_weight INTEGER,
  p_auto_approve INTEGER
)
RETURNS JSON { success: BOOLEAN, error?: TEXT }
```

**rpc_upsert_child_reward**

Creates or updates a reward for a child.

```sql
rpc_upsert_child_reward(
  p_child_id UUID,
  p_reward_id UUID,        -- NULL for new
  p_category_id UUID,
  p_name TEXT,
  p_points_cost INTEGER,
  p_emoji TEXT,
  p_limit_type TEXT,
  p_limit_count INTEGER
)
RETURNS JSON { success: BOOLEAN, reward_id: UUID }
```

**rpc_remove_child_reward**

Deletes a reward (soft delete via is_active = false).

```sql
rpc_remove_child_reward(p_reward_id UUID)
RETURNS JSON { success: BOOLEAN }
```

**rpc_enable_template_rewards**

Bulk-enables rewards from templates.

```sql
rpc_enable_template_rewards(
  p_child_id UUID,
  p_template_ids UUID[]
)
RETURNS JSON { success: BOOLEAN, created_count: INTEGER }
```

#### 16.3.2 Redemption RPCs

**rpc_request_reward_redemption**

Child requests to redeem a reward.

```sql
rpc_request_reward_redemption(
  p_child_id UUID,
  p_reward_id UUID
)
RETURNS JSON {
  success: BOOLEAN,
  redemption_id?: UUID,
  auto_approved?: BOOLEAN,
  error?: TEXT -- 'insufficient_points' | 'limit_reached' | 'reward_inactive'
}
```

**Logic:**
1. Check points balance
2. Check reward limits for period
3. If auto_approve_threshold met → approve immediately
4. Else → create pending request

**rpc_resolve_redemption**

Parent approves or declines a redemption request.

```sql
rpc_resolve_redemption(
  p_redemption_id UUID,
  p_action TEXT,     -- 'approve' | 'decline'
  p_reason TEXT      -- optional decline reason
)
RETURNS JSON { success: BOOLEAN }
```

**rpc_get_pending_redemptions**

Returns pending redemptions for parent approval.

```sql
rpc_get_pending_redemptions(p_parent_id UUID)
RETURNS JSON [{
  id: UUID,
  child_id: UUID,
  child_name: TEXT,
  reward_name: TEXT,
  emoji: TEXT,
  points_cost: INTEGER,
  requested_at: TIMESTAMPTZ,
  expires_at: TIMESTAMPTZ,
  child_current_balance: INTEGER
}]
```

**rpc_cancel_redemption_request**

Child cancels their own pending request.

```sql
rpc_cancel_redemption_request(p_redemption_id UUID)
RETURNS JSON { success: BOOLEAN }
```

#### 16.3.3 Child Catalog RPCs

**rpc_get_child_rewards_catalog**

Returns rewards with availability status.

```sql
rpc_get_child_rewards_catalog(p_child_id UUID)
RETURNS JSON {
  points_balance: INTEGER,
  rewards: [{
    id: UUID,
    name: TEXT,
    emoji: TEXT,
    category_code: TEXT,
    category_name: TEXT,
    points_cost: INTEGER,
    can_afford: BOOLEAN,
    is_available: BOOLEAN,
    limit_type: TEXT,
    times_used_in_period: INTEGER
  }]
}
```

**rpc_get_child_rewards_summary**

Returns summary for mini dashboard card.

```sql
rpc_get_child_rewards_summary(p_child_id UUID)
RETURNS JSON {
  points_balance: INTEGER,
  unlocked_count: INTEGER,
  next_reward_name: TEXT,
  next_reward_points: INTEGER,
  points_needed: INTEGER
}
```

**rpc_get_child_rewards_dashboard**

Returns full dashboard stats for hero card.

```sql
rpc_get_child_rewards_dashboard(p_child_id UUID)
RETURNS JSON {
  points_balance: INTEGER,
  total_earned: INTEGER,
  total_spent: INTEGER,
  available_rewards: INTEGER,
  unlocked_count: INTEGER,
  pending_redemptions: INTEGER,
  pending_additions: INTEGER,
  total_redeemed: INTEGER
}
```

#### 16.3.4 Addition Request RPCs

**rpc_request_reward_addition**

Child requests a reward be added from the catalog.

```sql
rpc_request_reward_addition(
  p_child_id UUID,
  p_template_id UUID
)
RETURNS JSON {
  success: BOOLEAN,
  request_id?: UUID,
  error?: TEXT -- 'already_have' | 'already_requested'
}
```

**rpc_resolve_addition_request**

Parent approves or declines an addition request.

```sql
rpc_resolve_addition_request(
  p_request_id UUID,
  p_action TEXT,           -- 'approve' | 'decline'
  p_parent_note TEXT,
  p_points_cost INTEGER    -- override suggested points
)
RETURNS JSON { success: BOOLEAN, reward_id?: UUID }
```

**On Approve:**
1. Creates child_reward from template
2. Uses p_points_cost or template.suggested_points
3. Marks request as approved

**rpc_get_pending_addition_requests**

Returns pending addition requests for parent.

```sql
rpc_get_pending_addition_requests(p_parent_id UUID)
RETURNS JSON [{
  id: UUID,
  child_id: UUID,
  child_name: TEXT,
  template_id: UUID,
  template_name: TEXT,
  category_name: TEXT,
  suggested_points: INTEGER,
  requested_at: TIMESTAMPTZ
}]
```

**rpc_get_reward_catalog_for_child**

Returns full template catalog with status.

```sql
rpc_get_reward_catalog_for_child(p_child_id UUID)
RETURNS JSON [{
  id: UUID,
  name: TEXT,
  suggested_points: INTEGER,
  category_code: TEXT,
  category_name: TEXT,
  category_icon: TEXT,
  is_added: BOOLEAN,
  child_reward_id: UUID,
  request_pending: BOOLEAN,
  pending_request_id: UUID
}]
```

### 16.4 User Interface

#### 16.4.1 Parent: RewardManagement Page

**Route:** `/parent/rewards`

```
┌─────────────────────────────────────────────────────────────────┐
│ [Child Tabs: Hannah | Toby]                                     │
├─────────────────────────────────────────────────────────────────┤
│ Hero Card                                                       │
│ Points: 245  │ Rewards: 8  │ Pending: 2  │ Redeemed: 5         │
├─────────────────────────────────────────────────────────────────┤
│ 🔔 Pending Redemptions (2)                    [Approve/Decline] │
├─────────────────────────────────────────────────────────────────┤
│ 📩 Reward Requests (1)                            [Add/Decline] │
├─────────────────────────────────────────────────────────────────┤
│ Point Weighting                                          [Edit] │
│ Mode: Manual │ Completion: 50% │ Accuracy: 30% │ Focus: 20%    │
├─────────────────────────────────────────────────────────────────┤
│ Active Rewards                                                  │
│ 📱 Screen Time (3)                                     [Manage] │
│ 🍦 Treats (2)                                          [Manage] │
│ 🎯 Activities (4)                                      [Manage] │
│                                                                 │
│ [+ Add Custom Reward]                                           │
└─────────────────────────────────────────────────────────────────┘
```

#### 16.4.2 Child: ChildRewardsCatalog Page

**Route:** `/child/rewards`

```
┌─────────────────────────────────────────────────────────────────┐
│ My Rewards 🎁                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Hero Card (gradient)                                            │
│ ⭐ 245 Points  │ Earned: 1,240 │ Unlocked: 3 │ Redeemed: 5     │
├─────────────────────────────────────────────────────────────────┤
│ ┌─ Pending Redemptions ─┐  ┌─ Requests Sent ─────┐             │
│ │ 🍦 Ice cream - 50pts  │  │ 📺 Extra TV time    │             │
│ │ [Cancel]              │  │ Waiting for parent  │             │
│ └───────────────────────┘  └─────────────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│ [ My Rewards (6) ] [ Browse Catalog (24) ] [ History (5) ]     │
├─────────────────────────────────────────────────────────────────┤
│ Ready to Claim! ✓                                               │
│ ┌────────┐  ┌────────┐  ┌────────┐                             │
│ │   🎮   │  │   🍿   │  │   💰   │                             │
│ │ Gaming │  │ Movie  │  │   £5   │                             │
│ │ 100pts │  │  75pts │  │ 200pts │                             │
│ └────────┘  └────────┘  └────────┘                             │
├─────────────────────────────────────────────────────────────────┤
│ Keep Working Towards                                            │
│ ┌────────┐  ┌────────┐                                         │
│ │   🎬   │  │   🎉   │  Progress bars showing                  │
│ │ Cinema │  │ Party  │  points needed                          │
│ │ 800pts │  │ 1500pt │                                         │
│ └────────┘  └────────┘                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 16.5 Business Rules

| Rule | Implementation |
|------|----------------|
| Points held during pending redemption | Not yet implemented |
| 7-day expiry on pending redemptions | Requires cron job |
| Auto-approve threshold | If points_cost ≤ threshold, approve immediately |
| Reward limits | Checked before allowing redemption |
| Duplicate addition requests | Prevented by unique index |
| Deleted reward with pending redemption | Auto-decline with system message |

### 16.6 UI Components

#### 16.6.1 Parent Components

| Component | Location | Purpose |
|-----------|----------|---------|
| RewardManagement | pages/parent/ | Main management page |
| PointWeightingConfig | components/parent/rewards/ | Slider configuration |
| RewardEditor | components/parent/rewards/ | Add/edit modal |
| PendingRedemptions | components/parent/rewards/ | Redemption approval queue |
| PendingAdditionRequests | components/parent/rewards/ | Addition request queue |

#### 16.6.2 Child Components

| Component | Location | Purpose |
|-----------|----------|---------|
| ChildRewardsCatalog | pages/child/ | Full rewards page with tabs |
| RewardsMiniCard | components/child/today/ | Dashboard mini card |
| RedemptionModal | components/child/rewards/ | Request confirmation |
| RewardToast | components/child/rewards/ | Success notification |

#### 16.6.3 Navigation Updates

| Location | Change |
|----------|--------|
| ChildNav.tsx | Added "Rewards" link |
| AppHeader.tsx | Added points badge for child users |
| App.tsx | Added /child/rewards route |

---

## Section 17: Notifications System

### 17.1 Notification Types

| Type | Trigger | Recipient |
|------|---------|-----------|
| Session Reminder | Scheduled session upcoming | Child |
| Session Complete | Child completes session | Parent |
| Streak Alert | Streak at risk | Child |
| Reward Request | Child requests redemption | Parent |
| Reward Approved | Parent approves reward | Child |
| Weekly Summary | End of week | Parent |

### 17.2 Delivery Channels

- **In-App**: Real-time via Supabase subscriptions
- **Push**: Browser notifications (PWA)
- **SMS**: Via Study Buddy SMS edge function (critical alerts)
- **Email**: Digest and important notifications

### 17.3 Notification Preferences

Parents can configure:
- Which notifications to receive
- Delivery channel preferences
- Quiet hours

---

## Section 18: Feature Completion Status

### 18.1 Completed Features

| Feature | ID | Date | Notes |
|---------|-----|------|-------|
| 6-Step Session Model | v6.1 | 13 Jan 2026 | Merged reflection into complete |
| Session Reflections | FEAT-001 | 14 Jan 2026 | Voice notes + transcription |
| Atomic Session Start | FEAT-002 | 14 Jan 2026 | Race condition fix |
| Pilot Seed Content | FEAT-003 | 14 Jan 2026 | 68 content units, 4 topics |
| Language Level Extraction | FEAT-004 | 14 Jan 2026 | Policy → content level |
| Payload Restructure | FEAT-005 | 15 Jan 2026 | Flashcards → Recall, arrays |
| RecallStep Refactor | FEAT-007 | 15 Jan 2026 | Component extraction pattern |
| Parent Insights Dashboard | FEAT-008 | 15 Jan 2026 | 7 RPCs, 10 widgets, AI advice |
| Parent Dashboard Redesign | FEAT-009 | 15 Jan 2026 | Multi-child support, HeroStatusBanner |
| Unified Status System | FEAT-010 | 16 Jan 2026 | 4 status levels, helper function |
| Study Buddy AI | FEAT-011 | 16 Jan 2026 | Text + voice, 6 phases complete |
| Add Subject Redistribution | FEAT-012 | 16 Jan 2026 | Priority reordering, impact assessment |
| Reward System Phase 1-3 | FEAT-013 | 24 Jan 2026 | 7 tables, 17 RPCs, parent+child UI, addition requests |
| Type Guards Library | Phase 3.1 | 28 Jan 2026 | Comprehensive type guards |
| ErrorBoundary Component | Phase 3.2 | 29 Jan 2026 | React error boundary |
| Unsafe Assertion Removal | Phase 3.3 | 30 Jan 2026 | Type safety improvements |
| Custom Hooks Library | Phase 2 | 27 Jan 2026 | Reusable hooks patterns |
| Personalized Hero Summaries | FEAT-014 | 3 Feb 2026 | Per-child hero card sentences using nickname/first name |
| TypeScript Strict Cleanup | Maintenance | 3 Feb 2026 | Resolved all 29 TypeScript errors for clean builds |

### 18.2 In Progress Features

| Feature | ID | Status | Blockers |
|---------|-----|--------|----------|
| Content Pipeline | FEAT-015 | 60% | AI processing refinement |

### 18.3 Planned Features

| Feature | Priority | Dependencies |
|---------|----------|--------------|
| Push Notifications | High | PWA setup |
| Class Integration | Medium | School partnerships |
| Adaptive Difficulty | Medium | ML model training |
| Offline Support | Low | Service worker |

---

## Section 19: Security & Privacy

### 19.1 Data Protection

- **GDPR Compliance**: Right to deletion, data export
- **COPPA Compliance**: Parental consent for users under 13
- **Data Encryption**: At rest and in transit via Supabase

### 19.2 Access Control

- **Row Level Security (RLS)**: All tables protected
- **Parent-Child Isolation**: Parents only see their linked children
- **API Rate Limiting**: Via Supabase built-in limits

### 19.3 Content Safety

- **AI Content Filtering**: Study Buddy responses filtered
- **Chat Logging**: All Study Buddy conversations logged
- **Parent Visibility**: Parents can review chat history

---

## Section 20: Performance Requirements

### 20.1 Response Time Targets

| Operation | Target |
|-----------|--------|
| Page Load | < 2s |
| RPC Call | < 500ms |
| Session Start | < 1s |
| AI Response | < 3s |

### 20.2 Availability

- **Uptime Target**: 99.5%
- **Backup Frequency**: Daily
- **Recovery Point Objective**: 24 hours

### 20.3 Scalability

- **Concurrent Users**: 1,000+ (pilot phase)
- **Database**: Auto-scaling via Supabase
- **CDN**: Static assets via Vite build

---

## Section 21: Related Documents

| Document | Purpose |
|----------|---------|
| BOARD_DOCUMENT_CAPTURE_STRATEGY_v2_0.md | Content ingestion pipeline |
| FEAT-010_Unified_Status_System_v2.0.md | Status system specification |
| FEAT-011_Study_Buddy_AI_Chatbot.md | Study Buddy full specification |
| FEAT-012_Add_Subject_With_Redistribution.md | Subject management specification |
| FEAT-013_Reward_Configuration_v2.md | Reward system specification |
| RevisionHub_Production_Backlog.md | Technical debt tracking |
| RevisionHub_Pilot_Seed_Content_Blueprint.md | Content scaling blueprint |
| DESIGN_TOKENS.md | UI design system tokens |
| TECHNICAL_AUDIT.md | Code quality audit results |

---

## Section 22: Appendix - Database Schema Summary

### 22.1 Core Tables (App Database)

| Table | Purpose |
|-------|---------|
| parents | Parent user profiles |
| children | Child user profiles |
| parent_child_links | Many-to-many parent-child relationships |
| subjects | Available subjects |
| child_subjects | Child subject enrollments |
| topics | Topics within subjects |
| content_units | Revision content |

### 22.2 Session Tables

| Table | Purpose |
|-------|---------|
| revision_sessions | Session records |
| session_steps | Step completion tracking |
| session_responses | Quiz/practice responses |
| session_reflections | Voice notes and transcriptions |

### 22.3 Reward Tables

| Table | Purpose |
|-------|---------|
| reward_categories | 6 predefined reward category types |
| reward_templates | Suggested rewards per category |
| child_rewards | Parent-enabled rewards per child |
| child_point_config | Point weighting configuration |
| reward_redemptions | Child redemption requests |
| reward_addition_requests | Child requests for new rewards |

### 22.4 Gamification Tables

| Table | Purpose |
|-------|---------|
| points_ledger | Point transaction history |
| streaks | Streak tracking |
| achievements | Achievement definitions |
| child_achievements | Earned achievements |

### 22.5 Scheduling Tables

| Table | Purpose |
|-------|---------|
| availability_templates | Weekly availability patterns |
| scheduled_sessions | Session schedule |

---

## Section 23: Glossary

| Term | Definition |
|------|------------|
| Content Unit | Smallest piece of revisable content |
| Payload | Generated session content package |
| Recall Item | Flashcard-style Q&A pair |
| RPC | Remote Procedure Call (Supabase function) |
| Session | Single revision activity (6 steps) |
| Streak | Consecutive days/weeks of revision |
| Study Buddy | AI chatbot assistant |
| Topic | Subject subdivision containing content |

---

**Document End**

PRD v9.0 - 2 February 2026

Complete document consolidation including all sections reconstructed from codebase analysis. Supersedes v8.1 delta document.
