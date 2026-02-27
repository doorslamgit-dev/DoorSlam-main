# Changelog

All notable changes to Doorslam (RevisionHub) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Admin Dashboard — Curriculum Management**
  - New `admin` role added to `user_role` enum with dedicated RLS policies for curriculum staging, subjects, components, themes, topics, and exam boards
  - Admin layout with sidebar navigation (`/admin`, `/admin/curriculum`), role-gated access, separate from consumer app shell
  - Curriculum management page with three tabs: Overview (pipeline stats + CTAs), Staging (hierarchical review with bulk approve/reject), Production (read-only hierarchy + comparison)
  - Subject selector dropdown, pipeline status grid, action panel with CLI command display and copy-to-clipboard
  - `curriculumAdminService` with Supabase queries, mutations (bulk approve, update status, normalize, delete batch), and pure helper functions
  - `useCurriculumAdmin` hook combining data fetching and action dispatch
  - `AuthContext` updated with `isAdmin` boolean; `HomePage` auto-redirects admin users to `/admin`
  - 11 new tests for service pure functions (`groupStagingIntoHierarchy`, `computeStatusCounts`)
  - See ADR-011 for admin role architecture decision

- **AI Tutor Module 5: Multi-Format Support + Enhanced Metadata**
  - Docling parser: structured Markdown output preserving tables, headings, and formatting from PDFs (replaces plain-text PyMuPDF)
  - Multi-format support: PPTX, XLSX, CSV, HTML, LaTeX, and images via Docling, with per-file fallback to legacy parsers
  - Document enrichment: LLM-generated summaries and doc-type-specific key_points (question papers, mark schemes, grade boundaries, examiner reports, specifications, revision guides)
  - Chunk-type classification: 12 content types (question, answer, marking_criteria, grade_table, examiner_comment, etc.) classified alongside topic extraction
  - Richer retrieval context: source labels now include year, session, paper number, and chunk content type
  - Richer frontend sources: SSE sources event includes year, session, doc_type, and file_key for download links
  - Storage mirroring: original files stored at exact Drive path (browsable, downloadable) instead of normalised paths
  - Backfill script: `scripts/backfill_enrichment.py` re-enriches existing documents with summaries, key_points, and chunk_types
  - Database migration: `summary` and `key_points` columns on `rag.documents`, updated `search_chunks()` function
  - 22 new tests across parser, enricher, metadata extractor, and retrieval (156 total backend tests passing)
  - Feature flags: `DOCLING_ENABLED` and `ENRICHMENT_ENABLED` for safe rollback

---

## [0.4.0] - 2026-02-24

### Added
- **AI Tutor Module 4: Metadata Extraction — LLM-based topic classification**
  - Taxonomy loader: fetches curriculum hierarchy (subjects → components → themes → topics) from Supabase with LRU caching
  - LLM classifier: GPT-4o-mini assigns each chunk to its primary topic via JSON-mode structured output, batched in groups of 10
  - Ingestion integration: topic extraction runs in parallel with embedding generation (no added latency)
  - Per-chunk `topic_id`: each chunk maps to a curriculum topic (confidence ≥ 0.5) or falls back to document-level topic
  - Enhanced retrieval filters: `source_type`, `year`, `doc_type` now passed through to `rag.search_chunks()` Postgres function
  - Chat API accepts new optional filters: `source_type`, `year`, `doc_type`
  - Backfill script: `scripts/backfill_topics.py` classifies existing chunks with NULL topic_id (idempotent, supports `--dry-run`)
  - Feature flag: `EXTRACTION_ENABLED=false` disables classification without affecting ingestion
  - 16 new tests: taxonomy loading/formatting, LLM classification, batching, graceful degradation

- **AI Tutor Module 3: Record Manager — Change detection & incremental sync**
  - Drive identity tracking: `drive_file_id`, `drive_md5_checksum`, `drive_modified_time` on `rag.documents`
  - Incremental sync: `POST /ingestion/sync` compares Drive vs DB, processes only new/modified/deleted files
  - Document update flow: re-chunks and re-embeds modified content while preserving document UUID
  - Soft-delete with deferred cleanup: `POST /ingestion/cleanup` hard-deletes stale docs after N days
  - CLI extensions: `--sync` and `--cleanup` commands on `scripts/ingest.py`
  - 20 new tests: sync classification, API endpoints, retrieval service

- **AI Tutor — Markdown rendering in chat responses**
  - Assistant messages now render via `react-markdown`: bold, numbered lists, bullet points, headings all display correctly
  - User messages remain plain text
  - System prompts updated to request Markdown formatting and plain text equations (no LaTeX)

### Changed
- **AI Tutor — Performance optimisation + provider migration**
  - Parallelised pre-stream operations (embed, history load, message save) via `asyncio.gather` — TTFT reduced from 8.38s to 0.84s
  - Split API providers: chat LLM (OpenAI direct, gpt-4o-mini) and embeddings (OpenAI direct, text-embedding-3-large at 2000 dims)
  - Added `max_tokens=400` cap (~250 words) to prevent runaway response generation
  - Lowered similarity threshold from 0.7 to 0.2 (calibrated for OpenAI embedding cosine scores)
  - RAG always-on: removed subject_id gate so retrieval runs on every query
  - System prompts tightened: inline citations `(Source N)`, no generic study tips
  - Deferred post-stream saves (sources metadata, conversation count) to background tasks
  - New `scripts/reembed.py` script for re-embedding all chunks after model migration
  - Total latency reduced from 42s to ~3-4s end-to-end

---

## [0.2.0] - 2026-02-24

### Added
- **Dashboard header redesign — sidebar child selector, message banner** (FEAT-DASH)
  - Sidebar child selector now shows avatar (image or initials fallback) next to child name
  - `SelectedChildContext` extended with `selectedChildAvatarUrl`
  - `ChildOption` type and `fetchChildrenForParent()` now include `avatar_url`
  - New `DashboardMessageBanner` component — 4 variants (nudge, alert, achievement, reminder), dark themed
  - Dashboard header: removed `DashboardChildHeader` (redundant child selector), replaced with title + message banner
  - Sidebar child selector is now the single source of child switching for all parent pages
  - Switching child in sidebar stays on the current page (not redirected to dashboard)
  - Removed in-page child selectors from SubjectProgress and RewardManagement
  - InsightsDashboard hook refactored to accept `childId`/`childName` params from context
  - Dark site footer hidden on Subjects, Timetable, and Insights pages (persistent footer replaces it)
- **AI Tutor Platform — RAG-powered assistant** (FEAT-AI-TUTOR)
  - **Module 1 (App Shell) complete**: end-to-end chat pipeline operational
  - Architecture: Python/FastAPI backend in `ai-tutor-api/`, shared Supabase with `rag` schema, pgvector embeddings
  - Backend: FastAPI with Pydantic Settings, async OpenAI streaming, conversation persistence to `rag.conversations` + `rag.messages`
  - Frontend: `AiTutorSlot` rewritten with SSE streaming, `MessageBubble` + `ChatInput` sub-components
  - Service layer: `aiAssistantService.ts` with `streamChat()` function using EventSource-based SSE parser
  - Auth: FastAPI validates Supabase JWTs locally via PyJWT (no network round-trip)
  - Observability: LangSmith tracing via `wrap_openai` — all LLM calls traced automatically (validated 23 Feb 2026)
  - Fix: added `load_dotenv()` to `config.py` so `LANGSMITH_*` env vars are exported to `os.environ` (required by LangSmith SDK)
  - Role-aware system prompts: parent (tutor) vs child (study buddy) modes
  - Vite dev proxy: `/api/ai-tutor` → `localhost:8000`
  - Database: `rag` schema migration with conversations, messages tables, indexes, RLS policies
  - See ADR-007 for architectural decisions
  - **Conversation history (threaded conversations)**:
    - Backend: 3 new endpoints — `GET /conversations` (paginated list), `GET /conversations/{id}/messages` (load history), `DELETE /conversations/{id}` (with ownership checks)
    - Async AI title generation: GPT-4o-mini generates 3–5 word title after first response, stored permanently — zero user-facing latency
    - Frontend: collapsible history drawer in 320px panel (slides down from header, auto-collapses on send)
    - `ConversationList` + `ConversationListItem` components with delete, load-more pagination, relative timestamps
    - `SidebarContext` extended with `aiTutorConversationId` — persists active conversation across panel open/close
    - Backend tests: 4 new tests for conversations endpoints (`test_conversations.py`)
  - **Module 2 (BYO Retrieval + Memory) complete**: RAG pipeline with vector search and source citations
    - Database: `rag.documents`, `rag.chunks`, `rag.ingestion_jobs` tables with IVFFlat vector index and `search_chunks()` function
    - Ingestion pipeline: Google Drive walker, path parser (folder structure → metadata), batch processing with concurrency control
    - Backend services: document parser (PDF/DOCX/text via PyMuPDF), recursive text chunker with tiktoken, OpenAI batch embedder, conversation memory trimming
    - Retrieval: vector similarity search via pgvector, role-based scoping, context injection into chat prompts
    - Chat integration: retrieval context added as second system message, memory trimming (4000 token sliding window), SSE `sources` event
    - Frontend: `SourceChips` component renders document citations below assistant messages, expandable pill UI
    - Admin API: `POST /ingestion/batch`, `GET /ingestion/jobs/{id}`, `GET /ingestion/documents` (service_role auth)
    - CLI: `scripts/ingest.py` for command-line batch ingestion and job status monitoring
    - Tests: 39 new backend tests (chunker, memory, parser, path_parser), 7 new frontend tests (SourceChips)
    - **Provider migration**: switched from OpenAI to OpenRouter (unified API key for chat + embeddings)
    - Chat model: Z.AI GLM-4.7 (`z-ai/glm-4.7`) — 200K context, enhanced reasoning
    - Embedding model: Qwen3-Embedding-8B (`qwen/qwen3-embedding-8b`) — 4096 dimensions, MTEB #1
    - Chunking: reduced to 512 tokens / 64 overlap for more precise GCSE retrieval
    - Google Drive: switched from service account to OAuth2 refresh token auth
    - OAuth helper: `scripts/google_oauth.py` for one-time token acquisition
    - **Schema alignment + ingestion pipeline enhancement**:
      - Database: `rag.documents` extended with `exam_spec_version_id`, `exam_pathway_id`, `session`, `paper_number`, `doc_type`, `file_key` columns with FK constraints, CHECK constraints, and indexes
      - Storage: private `exam-documents` Supabase Storage bucket for original exam PDFs (signed URL access)
      - Filename parser: token-scanning parser for structured exam filenames (`{spec_code}_{year}_{session}_{paper}_{tier}_{type}.pdf`), handles board-prefixed names, 22 test cases
      - `search_chunks()` enhanced with `filter_source_type`, `filter_year`, `filter_exam_pathway_id`, `filter_doc_type` parameters and new return columns
      - Metadata resolver: added spec_version and pathway lookups from `exam_spec_versions` / `exam_pathways` tables
      - Path parser: `refine_source_type()` uses `doc_type` from filename for finer-grained source_type (e.g., mark schemes in papers/ folder get `marking_scheme` not `past_paper`)
      - Drive walker: added Shared Drive support (`supportsAllDrives`), `root_path` prefix parameter
      - Ingestion: uploads original PDF to Storage bucket before chunking, stores all new metadata columns
      - CLI: `--root-path` flag for ingesting from Drive subfolders with ancestor path context
      - Validated: AQA Biology 8461 specification ingested (110 chunks, Storage upload, vector search, dedup confirmed)

### Fixed
- **Subscription gate too aggressive** — trial users were redirected to pricing page on every load; now only `tier === "expired"` triggers redirect
- **Dashboard not updating on child change** — `useChildDashboardData` now syncs with URL `?child=` param changes via useEffect
- **Timetable redesign — time-slot grid with drag-and-drop topics** (FEAT-TBL)
  - WeekView rewritten as a time-slot grid (rows = early morning/morning/afternoon/after school/evening, columns = days)
  - Individual TopicCards per topic within each session, with delete X and colour-coded status dot (green=done, orange=pending, red=missed)
  - Drag-and-drop via @dnd-kit: move topics between any cell with capacity validation
  - Dropping on empty cells auto-creates a session on the fly
  - Entire topic card is draggable (not just a small grip icon)
  - TodayView grouped by time slot instead of flat list
  - `time_of_day` column added to `planned_sessions` table (migration)
  - New `after_school` time slot added to `TimeOfDay` type
  - `backfillTimeOfDay()` populates time_of_day after plan regeneration
  - AddSessionModal includes time slot selector dropdown
  - `TimetableHeroCard` removed from page layout
- **Timetable layout restructure** — matches updated page design
  - `SelectedChildContext` — global child selection shared across sidebar and all parent pages (ADR-006)
  - Child selector moved from timetable header into sidebar navigation
  - `NudgeBanner` component — dark card in top-right for plan status alerts (needs_attention/behind only)
  - Status badge (On Track / Needs Attention / Behind) positioned on action buttons row (right side)
  - Action buttons redesigned as compact button row using `Button` component
  - TimetableControls: date nav + view toggle inline (no card wrapper), subject legend right-aligned
  - PersistentFooter: Schedule / Add New Subject / Progress Report as bordered button pills with navigation
- **Parental Controls system** — generic per-child, per-feature access control
  - New `parental_controls` and `parental_control_requests` tables with RLS policies
  - Three access levels: Off / Requires Approval / Auto-Approved
  - Settings UI: `ParentalControlsSection` in ParentSettingsPage with 3-way toggle per feature
  - Approval queue: pending requests with approve/reject actions
  - Subscription gated: Family+ and Premium only (`canUseParentalControls()`)
  - Reusable for future features via `feature_key` pattern
- **Child timetable access** — `/child/timetable` route
  - Adapts based on parental controls: read-only, requires-approval, or auto-approved editing
  - Requires-approval mode submits move requests to parent approval queue
  - Access level banners for children

### Fixed
- **Timetable data pipeline** — `fetchWeekPlan` and `fetchTodaySessions` replaced with direct queries (bypassing RPCs that didn't return `time_of_day`), fixing empty "Unscheduled" grid rows
- **Drag-and-drop collision detection** — switched from `closestCenter` to `pointerWithin` for reliable grid cell targeting
- **Drop on empty cells** — drops no longer silently rejected when target cell has no session; a new session is auto-created
- **Move/remove topic operations** — replaced RPC-dependent `moveTopicBetweenSessions` and `removeTopicFromSession` with direct Supabase queries for reliability
- **Refresh flash eliminated** — background refreshes (after drag-drop) no longer trigger loading spinner; grid stays visible while data reloads
- **Onboarding `after_school` type** — added missing `after_school` to phase2 payload type cast in `ParentOnboardingPage`
- **Migration ordering** — `ALTER TABLE ADD COLUMN time_of_day` must run before the backfill `DO` block (Supabase SQL editor transaction limitation)

### Changed
- **Codebase cleanup — UI component consistency** (pre-design overhaul prep)
  - Deleted 7 dead code files: ParentDashboardV2, HelpfulNudgesCard, TimetableHeroCard, SubjectLegend, AvailabilityStep, ExamTimelineStep, InviteChildStep (-2046 lines)
  - Created 4 new shared UI components: Toggle, Select, Toast/ToastProvider, DropdownMenu
  - Replaced raw `<button>`, `<select>`, `<input>`, and toggle switch elements with shared components across 10 files
  - Fixed design token usage: replaced hardcoded Tailwind colours with semantic tokens in dateUtils.ts
  - Extracted `hexToRgba()` to shared `colorUtils.ts` utility
  - Fixed navigation: replaced `window.location.reload()` with state-based refetch in Today.tsx and SubjectProgress.tsx
- **Public pricing navigation** — added "Pricing" link to the public header (`AppHeader.tsx`) so unauthenticated visitors can reach the pricing page directly from the landing page navigation
- **Stripe sandbox integration** — complete payment flow wired up in Stripe test mode
  - 3 Stripe products (Family, Premium, Tokens) with 11 prices created in test mode
  - Price IDs populated in `src/types/subscription.ts` and `supabase/functions/stripe-webhook/index.ts`
  - Payment step inserted into onboarding: Phase 1 → Pricing → Dashboard
  - Subscription gate: parents without a Stripe customer redirected to `/pricing`
  - Post-checkout redirect: `?subscription=success` → refresh subscription → dashboard
  - Returning customer protection: 14-day trial skipped if user already has a `stripe_customer_id`
  - 4 edge functions deployed: `stripe-create-checkout`, `stripe-webhook`, `stripe-customer-portal`, `stripe-buy-tokens`
  - Stripe webhook endpoint registered for 6 events (checkout, subscription CRUD, invoice)
  - Database trial trigger removed — trial is now 100% Stripe-managed
- **Subscription trial gating & upgrade/downgrade flow** — enforces trial-only-on-Family policy with controlled plan switching
  - Free 14-day trial restricted to Family plan only; Premium requires payment upfront
  - New `stripe-update-subscription` edge function handles in-app upgrade/downgrade via Stripe Subscriptions API
  - Trial ends immediately on upgrade (`trial_end: 'now'`); proration applied for active subscribers
  - Pricing page buttons are context-aware: Current Plan / Upgrade / Downgrade / Resubscribe / Subscribe / Start Free Trial
  - "Manage Billing" link opens Stripe Customer Portal for payment methods, invoices, and cancellation
  - Returning customers (expired) cannot re-trial — checkout skips trial if `stripe_customer_id` exists
- **Upgrade/downgrade UX + billing interval lock** — polished plan-change experience with shared state
  - Confirmation modal before plan change shows target plan, price, and trial-end warning
  - Success/error alerts after plan change with dismissible feedback
  - `SubscriptionContext` replaces independent hook instances — sidebar badge, nav, and pricing page share state
  - `stripe_price_id` stored in profiles for frontend interval awareness
  - New migration: `stripe_price_id` column + updated `rpc_get_subscription_status` RPC
- **Subscription model refactor — plan length + billing method** — restructured pricing around commitment length and payment method
  - Products now defined by 3 dimensions: tier (Family/Premium), plan length (1/3/12 months), billing method (monthly/upfront)
  - 2 new Stripe prices: Family 3-month upfront (£29.99), Premium 3-month upfront (£39.99)
  - "Pay in full" toggle now available for both 3-month and 12-month plans (was 12-month only)
  - Tab labels renamed from "Monthly/Quarterly/Annual" to "1 Month / 3 Months / 12 Months"
  - Plan length upgrades (1→3, 1→12, 3→12) allowed in-app; downgrades require cancel + re-subscribe
  - Subscribers see shorter plan lengths disabled, current selected, longer clickable
  - Billing method locked for subscribers (toggle shown disabled)
  - Edge function accepts `target_plan_length` for combined tier + length changes
  - Type system refactored: `BillingInterval` replaced with `PlanLength` + `BillingMethod` types
- **Pricing page UX refinements** — cleaner subscriber experience with contextual guidance
  - Subscriber header: "You are on the 3 Month Premium plan" replaces generic title + banner
  - Dynamic upgrade guidance: "You can upgrade to a 12 Month plan" (adapts to current plan length)
  - Inline Manage Billing link replaces separate section
  - Tabs + toggle initialise from subscriber data on load (was defaulting to 12-month/monthly)
  - Tabs/toggle lock correctly even when `stripe_price_id` is not yet synced
  - Button labels include plan length: "Extend to 12 Months", "Upgrade to Premium 12 Months"
  - "Current" indicator on subscriber's plan length tab
  - Removed "Parent" role label from sidebar — now shows avatar, name, and tier badge only
- **Stripe branding & wallet payments** — configured via Stripe Dashboard (no code changes)
  - Business branding (logo, colours, name) applied to Checkout, Customer Portal, receipts, and emails
  - Customer Portal: payment methods, invoices, and cancellation enabled; subscription switching disabled (handled in-app)
  - Google Pay and Apple Pay enabled; domains registered (`app.doorslam.io`, `staging.doorslam.io`, `dev.doorslam.io`)
  - Wallet buttons appear automatically on Stripe-hosted Checkout — no client-side SDK needed

### Changed
- **Migrated from Next.js to Vite + React Router** — replaced Next.js 16 App Router with Vite 5 + React Router v7
  - App was already a fully client-rendered SPA (zero server components, zero API routes, zero middleware)
  - Dev server starts in ~200ms (was hanging indefinitely with Next.js)
  - New entry point: `index.html` + `src/main.tsx` + `src/router.tsx`
  - Replaced `next/navigation` hooks with `react-router-dom` equivalents across ~35 files
  - Replaced `next/link` `Link` with `react-router-dom` `Link` (12 files)
  - Replaced `next/image` `Image` with plain `<img>` (9 files, images were already unoptimized)
  - Replaced `next/dynamic` with `React.lazy` (1 file)
  - Replaced `process.env.NEXT_PUBLIC_*` with `import.meta.env.VITE_*` (4 files)
  - Removed `'use client'` directives from ~40 files
  - Deleted `app/` directory (22 files), `next.config.ts`, `next-env.d.ts`
  - Updated ESLint config to remove `@next/eslint-plugin-next`
  - See: [ADR-004](docs/decisions/ADR-004-vite-migration.md)


- **Streamlined Parent Onboarding — Two-Phase Flow**
  - Phase 1 (3 steps): Child Details → Exam Type → Subjects → Dashboard (parent reaches dashboard immediately)
  - Phase 2 (from dashboard CTA): Goal → Needs → Pathways → Grades → Revision Period → Availability → Confirm
  - Invite moved from onboarding wizard to dashboard modal
  - 4 new Supabase RPCs: `rpc_parent_create_child_basic`, `rpc_set_child_goal`, `rpc_update_child_subject_grades`, `rpc_init_child_revision_period`
  - 5 new service wrappers in `parentOnboardingService.ts`
  - `ParentOnboardingPage.tsx` refactored: reads `?phase=schedule&child=<id>` for Phase 2
  - `DashboardHeroCard.tsx`: conditional Next Best Action (Complete Schedule → Invite Child → Normal)
  - New `DashboardInviteModal.tsx` component for inviting child from dashboard
  - `ParentDashboardV3.tsx`: wired up schedule CTA + invite modal
  - See: [ADR-004](docs/decisions/ADR-004-two-phase-onboarding.md)

### Fixed
- **Eliminate all 192 ESLint warnings** — zero-warning codebase
  - Removed 5 unused `eslint-disable` directives
  - Replaced 13 `<img>` elements with Next.js `<Image>` / `next/image`
  - Fixed 14 `react-hooks/exhaustive-deps` missing dependency warnings
  - Replaced 160 `@typescript-eslint/no-explicit-any` usages with proper types
  - Fixed pre-existing `AvatarUpload.tsx` build error (Next.js `Image` import shadowing native `Image` constructor)
  - 69 files changed across components, hooks, services, types, and views

### Added
- **Parent Dashboard v3 — Child-Specific View** (PR #11 → develop)
  - Replaced family-aggregate dashboard with child-specific single-child view
  - New composite hook `useChildDashboardData` (family data + plan coverage + rewards)
  - DashboardHeroCard: weekly narrative, rhythm day-pills, 3 KPIs, Next Best Action
  - HealthScoreCard: RAG score/100 with SVG ring, 4 weighted sub-metrics
  - DashboardRevisionPlan: subject progress bars + coming-up sessions (replaces TimetableHeroCard)
  - DashboardRecentActivity, DashboardProgressMoments, DashboardActiveRewards (compact cards)
  - Child selector dropdown with URL param `?child=<id>` sync
  - `healthScore.ts` utility: pure function calculating composite health score
  - See: [ADR-003](docs/decisions/ADR-003-dashboard-v3-child-specific.md)

---

## [3.0.0] - 2026-02-09

v3.0 Layout Overhaul — sidebar navigation, persistent footer, AI panel slot.

### Added
- **Sidebar Navigation** — collapsible sidebar with expand/collapse toggle
  - `Sidebar.tsx`, `SidebarNav.tsx`, `SidebarNavItem.tsx`, `SidebarBottomSection.tsx`
  - `SidebarContext` manages expanded/collapsed state with localStorage persistence
  - Mobile: hamburger menu with slide-out overlay
  - Desktop: icon-only (collapsed) or full labels (expanded)
- **Persistent Footer** — `PersistentFooter.tsx` with quick actions always visible
- **AI Tutor Slot** — `AiTutorSlot.tsx` placeholder panel for future AI integration
- **AppShell** — `AppShell.tsx` wraps authenticated pages with sidebar + footer
- **Reusable Modal** — `Modal.tsx` shared component with backdrop, close button, size variants
- **Insights Data Hook** — `useInsightsDashboardData.ts` extracted from InsightsDashboard view
- **Account Service** — `accountService.ts` extracted from inline Supabase calls

### Changed
- **AppLayout** — conditional rendering: authenticated users → AppShell, unauthenticated → AppHeader
- **AppHeader** — simplified to unauthenticated-only header (removed nav items moved to sidebar)
- **Dark mode** — fixed neutral double-inversion bug across 25+ component files
  - All neutral colours now use CSS custom properties via `themes.css`
  - No more `dark:` Tailwind variants for neutral palette
- **Tailwind config** — extended with `neutral-0` through `neutral-900` CSS variable tokens, new accent colours, `shadow-card`, `max-w-content`
- **themes.css** — added `--color-neutral-0` and `--color-neutral-950` tokens

### Technical
- PR #7 merged to develop, promoted through staging (PR #9) to main (PR #10)
- 188 files changed, 2,881 insertions, 2,593 deletions

---

## [2.0.0] - 2026-02-08

Full codebase review — design tokens, component consolidation, service extraction.

### Changed
- **Design Token Migration** — replaced hardcoded Tailwind colours with CSS custom property tokens across all components
- **Component Consolidation** — merged duplicate components, extracted shared patterns
- **Service Extraction** — moved inline Supabase calls to dedicated service files
- **Timetable Modals** — refactored AddSessionModal, BlockDatesModal, EditScheduleModal (reduced complexity)
- **Form Components** — consolidated duplicate FormField components

### Fixed
- Session step components: consistent error handling and loading states
- Gamification service: type-safe API calls
- Parent onboarding: fixed coverage calculation edge cases

### Removed
- Duplicate `FormField` component from account module (uses shared `ui/FormField`)

### Technical
- PR #6 merged to develop
- Version bump from 1.x to 2.0.0

---

## [1.1.0] - 2026-02-06

Infrastructure and migration release — Next.js App Router, CI pipeline, Supabase CLI.

### Added
- **Next.js App Router Migration** — migrated from Vite + React Router to Next.js 16 App Router (PR #5)
  - All routes converted to `app/` directory structure
  - `'use client'` directives added to all interactive components
  - `@/` path alias configured via `tsconfig.json`
- **CI/CD Pipeline** — GitHub Actions workflow for lint, type-check, test, build (PR #3)
- **Testing Framework** — Vitest + Testing Library setup (PR #2)
- **Code Formatting** — Prettier + ESLint configuration (PR #1)
- **Supabase CLI** — initialised with baseline migration and edge function directory structure

### Fixed
- **ESLint Dependencies** — added missing parser and plugin packages (PR #4)

### Technical
- PRs #1–#5 established the engineering foundation per the Ops Playbook

---

## [1.0.0] - 2026-02-02

Initial release — complete GCSE revision platform.

### Added
- **FEAT-013: Reward System** — complete reward management for parents and children
  - 6 reward categories with templates, custom rewards, points system
  - Redemption flow with parent approval and auto-approve thresholds
  - Child addition requests
- **FEAT-012: Add Subject with Redistribution** — add subjects mid-plan with automatic schedule adjustment
- **FEAT-011: Study Buddy AI** — AI chat assistant with voice input during revision sessions
- **FEAT-010: Unified Status System** — consistent 4-level traffic-light indicators across dashboard
- **FEAT-009: Parent Dashboard v2** — multi-child support with HeroStatusBanner, weekly focus strip, rhythm chart
- **FEAT-008: Parent Insights Dashboard** — 7 RPCs powering 10 widgets, AI-powered tutor advice
- **FEAT-007: RecallStep Refactor** — component extraction pattern for session step architecture
- **FEAT-005: Payload Restructure** — flashcards → recall model, improved data structures
- **FEAT-004: Session System** — 6-step pedagogical session model (Preview → Reinforce → Recall → Practice → Summary → Complete)
- **FEAT-014: Personalized Hero Summaries** — per-child sentences on Parent Dashboard using `preferred_name`
- **Real-Time Dashboard Refresh** — Supabase real-time subscriptions, visibility API, 30s throttle
- **Header Branding** — dark/light logo variants, strapline "Revision without the drama"
- **Core Platform** — authentication, multi-child profiles, gamification, parent onboarding wizard

### Technical
- ErrorBoundary component for graceful error handling
- 54 type guards in `utils/typeGuards.ts`
- 3 reusable hooks: `useFormField`, `useStepNavigation`, `useAsyncData`
- Token-based design system with Tailwind CSS custom properties

---

## Document Conventions

### Change Types
- **Added** — new features
- **Changed** — changes in existing functionality
- **Deprecated** — soon-to-be removed features
- **Removed** — removed features
- **Fixed** — bug fixes
- **Security** — security fixes

### Version Policy (Playbook Section 11.3)
- **PATCH** (x.x.1) — bug fixes, no behaviour changes
- **MINOR** (x.1.0) — new features, backwards compatible
- **MAJOR** (x.0.0) — breaking changes, layout overhauls, major redesigns

### Feature Codes
Features are tracked with codes like `FEAT-014` which correspond to:
- `reference documents/RevisionHub_PRD_v9_0.md`
- `reference documents/RevisionHub_Feature_List.md`

### Cross-References
- Architecture decisions: `docs/decisions/ADR-*.md`
- Feature catalog: `docs/PRODUCT_EVOLUTION.md`
- Engineering playbook: `reference documents/Doorslam Engineering-Operations-Playbook .pdf`

---

*Last Updated: 2026-02-24*
