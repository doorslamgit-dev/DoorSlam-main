# Doorslam — Product Evolution Catalog

A plain-English record of how Doorslam has evolved from its baseline through each release. This document is designed for developers joining the project to understand **what each feature does**, **why it exists**, and **how it was built**.

For the technical changelog (version numbers, file lists, breaking changes), see [CHANGELOG.md](../CHANGELOG.md).
For architecture decisions, see [docs/decisions/](decisions/).

---

## AI Tutor Module 5 — Multi-Format Support + Enhanced Metadata (25 Feb 2026)

**Why this change is happening**: The RAG pipeline had three compounding problems. First, PyMuPDF extracted plain text only — tables in PDFs (grade boundaries, mark allocations) were silently destroyed, and DOCX table content was dropped. Second, metadata was thin: only `topic_id` per chunk, no document-level summaries, and the chat LLM saw only basic source labels without knowing the year, session, document type, or what kind of content it was citing. Third, Storage paths were normalised by `_build_file_key()`, losing the original Drive folder structure needed for browsing and downloading original documents.

**What it does**: Documents are now parsed through Docling, producing structured Markdown that preserves tables, headings, and formatting. The system supports 15+ file formats including PPTX, XLSX, CSV, HTML, LaTeX, and images. Each document gets an LLM-generated summary and doc-type-specific key_points (e.g., question-by-topic breakdowns for past papers, grade boundaries for grade tables). Each chunk is classified with a content type (question, marking_criteria, grade_table, etc.) so the AI tutor knows exactly what it's citing. Original files are stored at their exact Drive path for future download functionality.

**How it was developed**:
- Parser rewrite (`parser.py`): Docling `DocumentConverter` as a lazy thread-safe singleton. `DocumentStream` for bytes input, `export_to_markdown()` for structured output. Per-file fallback to legacy parsers (PyMuPDF, python-docx, UTF-8) if Docling fails. Feature flag: `DOCLING_ENABLED`.
- Document enricher (`document_enricher.py`): new service with doc-type-specific LLM prompts (qp, ms, gt, er, spec, rev). GPT-4o-mini generates summary + key_points. Runs in parallel with chunking during ingestion. Feature flag: `ENRICHMENT_ENABLED`.
- Chunk-type classification: extended existing `metadata_extractor.py` to classify 12 content types alongside topic extraction — no additional LLM call needed.
- Ingestion pipeline: enrichment + chunking run in parallel; embedding + topic/chunk_type extraction run in parallel. Document row updated with summary and key_points. Chunk metadata stores `{"chunk_type": "..."}`.
- Storage mirroring: replaced `_build_file_key()` with `drive_file.path` — original files stored at exact Drive path. `upload_to_storage()` now accepts correct MIME content-type.
- Retrieval context: source labels now include year, session, paper number, and chunk content type. Frontend SSE sources include year, session, doc_type, file_key.
- Chunker separators updated for Markdown heading boundaries (`## `, `### `).
- Database migration adds `summary` and `key_points` columns to `rag.documents`.
- See ADR-009 (Docling parser) and ADR-010 (document enrichment) for architectural decisions.

---

## AI Tutor Module 4 — Metadata Extraction: LLM-Based Topic Classification (24 Feb 2026)

**Why this change is happening**: All 110+ chunks in the RAG store had `topic_id = NULL`. The Postgres search function already supported topic filtering, and the chat API accepted `topic_id`, but there was nothing to filter on. Without per-chunk topic mapping, retrieval could only scope by subject — returning chunks from across the entire curriculum instead of the specific topic a student is asking about.

**What it does**: During document ingestion, each chunk is now classified against the curriculum taxonomy using GPT-4o-mini. The LLM maps chunks to specific topics (e.g., "Cell structure", "Atomic structure") from the existing `public.topics` hierarchy. This enables topic-scoped retrieval: when a student asks about mitosis, the system can return only chunks tagged with the Cell Division topic rather than the entire Biology corpus. Additional filters (source type, year, document type) are also now exposed through to retrieval.

**How it was developed**:
- Taxonomy loader (`taxonomy.py`): walks the `subjects → components → themes → topics` hierarchy via Supabase queries, cached with `@lru_cache` for the process lifetime. Formats the topic list as a numbered taxonomy for LLM consumption.
- Metadata extractor (`metadata_extractor.py`): sends batches of ~10 chunks plus the numbered taxonomy to GPT-4o-mini in JSON mode. The LLM returns a classification per chunk (topic number + confidence score). Results are mapped from topic numbers back to UUIDs. Retry with tenacity on failure.
- Ingestion pipeline modified to run extraction in parallel with embedding via `asyncio.create_task` — no added latency. Per-chunk `topic_id` is set from the extraction result if confidence ≥ 0.5, otherwise falls back to the document-level `topic_id`.
- Retrieval enhanced: `search_chunks()` and `retrieve_context()` now accept and forward `source_type`, `year`, `exam_pathway_id`, and `doc_type` filters. `RetrievedChunk` includes year, session, paper number, doc type, file key, and exam pathway from the Postgres function.
- Chat API extended: `ChatRequest` accepts optional `source_type`, `year`, `doc_type` filters for future frontend use.
- Backfill script (`scripts/backfill_topics.py`): processes existing chunks grouped by document, supports `--subject-id` filter and `--dry-run` mode.
- Feature flag: `EXTRACTION_ENABLED` env var (default `true`) for safe rollback.
- See ADR-008 for architectural decisions (chunk-level extraction, GPT-4o-mini, confidence threshold, parallel execution).

---

## AI Tutor Module 3 — Record Manager: Change Detection & Incremental Sync (24 Feb 2026)

**Why this change is happening**: Module 2 could only do full batch ingestion — every sync re-processed all files. When a file was modified on Drive, the system either skipped it (if content was identical) or created a duplicate document row. There was no mechanism to detect changes, update existing documents, or clean up removed content. As the corpus grows, re-embedding unchanged documents wastes time and API costs.

**What it does**: Adds incremental sync so only new, modified, or deleted files are processed. Documents maintain stable UUIDs so chat message history references remain valid even after content updates. Files removed from Drive are soft-deleted and excluded from search immediately, with deferred hard-delete after a configurable retention period.

**How it was developed**:
- Database migration adds Drive identity columns (`drive_file_id`, `drive_md5_checksum`, `drive_modified_time`, `deleted_at`) to `rag.documents` with UNIQUE constraint on `drive_file_id`. Status CHECK expanded to include `'deleted'`. `ingestion_jobs` extended with `job_type`, `sync_stats`, and `root_folder_id`.
- `DriveFile` dataclass extended with `md5_checksum` and `modified_time` fields; Drive API now requests `md5Checksum` and `modifiedTime`.
- New `update_document()` function: deletes old chunks, re-parses/chunks/embeds from new content, updates the document row while preserving the same UUID.
- New `soft_delete_document()` and `cleanup_deleted_documents()` functions for the soft-delete lifecycle.
- Sync orchestrator (`sync.py`): walks Drive, loads existing DB docs, classifies each file as new/modified/deleted/unchanged using `drive_file_id` and `md5_checksum`, then processes only the changes.
- New API endpoints: `POST /ingestion/sync` and `POST /ingestion/cleanup`.
- CLI extended with `--sync` and `--cleanup` commands.
- Batch ingestion updated to store Drive identity on all new documents.
- 20 new tests covering sync classification, API endpoints, and retrieval service.

---

## AI Tutor Module 2b — Schema Alignment + Ingestion Enhancement (25 Feb 2026)

**Why this change is happening**: Module 2 built the RAG pipeline but without awareness of the existing database schema (exam_spec_versions, exam_pathways, exam_papers) or the structured naming conventions used in the Google Drive document collection. Documents were chunked and embedded but original PDFs were discarded, and metadata like exam session, paper number, and tier weren't captured.

**What it does**: Extends the ingestion pipeline so that every uploaded document is (a) stored as an original downloadable PDF in Supabase Storage, and (b) enriched with structured metadata extracted from both the Drive folder path and the filename. The vector search function now supports filtering by source type, year, exam pathway, and document type.

**How it was developed**:
- Database migration adds 6 new columns to `rag.documents` with FK constraints to `exam_spec_versions` and `exam_pathways`, CHECK constraints for session/doc_type, and 7 new indexes
- Private `exam-documents` Storage bucket created for original PDFs (signed URL access, 50MB limit)
- Token-scanning filename parser handles all naming patterns from the document collection guide: tiered/untiered papers, mark schemes, examiner reports, specifications, revision notes, sample papers
- Metadata resolver extended with `_lookup_current_spec_version()` and `_lookup_pathway()` functions
- Ingestion pipeline uploads to Storage before chunking, stores all metadata columns
- Drive walker fixed for Shared Drives, CLI accepts `--root-path` for subfolder ingestion
- Validated with AQA Biology 8461 specification: 110 chunks, Storage upload, vector search, deduplication all confirmed working

**Subsequent changes — Performance optimisation + provider migration (24 Feb 2026)**:
Initial testing revealed severe latency: 21.46s total with 8.38s to first token, caused by sequential pre-stream operations and slow API round-trips through OpenRouter. Responses were also too long (42s) and contained no RAG citations.

Fixes applied in three rounds:
1. **Parallelisation**: Embed query, load history, and save user message now run concurrently via `asyncio.gather`. Post-stream metadata saves (sources, conversation count) deferred to background tasks. TTFT dropped to 0.84s.
2. **Provider migration**: Switched from OpenRouter to OpenAI direct for both chat (gpt-4o-mini) and embeddings (text-embedding-3-large, 2000 dimensions). Eliminates the middleman latency. All 110 existing chunks re-embedded via new `scripts/reembed.py` script.
3. **Threshold calibration**: OpenAI embeddings produce cosine similarities of 0.25-0.38 for relevant content (vs 0.7+ with Qwen). Lowered `retrieval_similarity_threshold` from 0.7 to 0.2. RAG gate removed — retrieval runs on every query regardless of subject_id.

Additional changes: `max_tokens=400` hard cap on LLM responses, system prompts tightened with 250-word limit, inline `(Source N)` citation instructions, and explicit "Do NOT add generic study tips" rule. End-to-end latency reduced from 42s to ~3-4s.

**Subsequent changes — Markdown rendering in chat (24 Feb 2026)**:
Assistant responses were rendering as raw text — bold markers, numbered lists, and LaTeX equations all displayed literally. Added `react-markdown` to `MessageBubble` so assistant messages render formatted Markdown (bold, lists, headings). User messages remain plain text. System prompts updated to request Markdown formatting and plain text equations with arrows (e.g., "carbon dioxide + water -> glucose + oxygen") instead of LaTeX notation.

---

## AI Tutor Module 2 — BYO Retrieval + Memory (24 Feb 2026)

**Why this change is happening**: Module 1 gave the AI Tutor a working chat pipeline, but it answered purely from GPT's general knowledge — it had no access to actual GCSE revision materials. Students asking about specific exam topics got generic answers rather than responses grounded in past papers, specifications, and revision notes. Additionally, long conversations could exceed the model's context window.

**What it does**: The AI Tutor now searches a corpus of ingested revision materials (past papers, specifications, revision notes) before answering every question. Relevant excerpts appear as source citation chips below assistant messages, so students can see which documents informed the response. The system also manages conversation memory with a sliding window, keeping recent context while trimming older messages to stay within token budgets.

**How it was developed**:
- **Ingestion pipeline**: Documents are ingested from a structured Google Drive folder hierarchy where folder names encode exam board, qualification, subject, and document type. A path parser extracts metadata automatically. Documents are parsed (PDF via PyMuPDF, DOCX via python-docx), split into ~800 token chunks with 100 token overlap using recursive character splitting, then embedded via OpenAI `text-embedding-3-small`. Chunks are stored in `rag.chunks` with vector embeddings alongside denormalised metadata for fast pre-filtering.
- **Vector search**: A Postgres function `rag.search_chunks()` performs cosine similarity search with IVFFlat indexing, supporting filters by subject, topic, and exam board. Every student question triggers an embed+search (~50ms), which is cheaper and more reliable than LLM tool calling.
- **Chat integration**: Retrieved chunks are formatted as a second system message injected between the role prompt and conversation history. The SSE stream emits a `sources` event before tokens start flowing, allowing the frontend to display citations immediately.
- **Memory management**: Conversation history is trimmed using a token-counting sliding window (4000 tokens by default), always preserving the most recent messages.
- **Frontend**: `SourceChips` component shows document titles as compact pills below assistant messages, with the first 2 visible and an expand button for more.
- **Admin tooling**: Batch ingestion API (`POST /ingestion/batch`) and CLI script (`scripts/ingest.py`) for processing thousands of PDFs from Google Drive with configurable concurrency.
- **Key files**: `ai-tutor-api/src/services/` (parser, chunker, embedder, memory, retrieval, ingestion, drive_walker, path_parser), `src/components/layout/ai-tutor/SourceChips.tsx`, `supabase/migrations/20260224120000_rag_module2_documents.sql`

---

## Dashboard Header Redesign — Sidebar Child Selector & Message Banner (23 Feb 2026)

**Why this change is happening**: The parent dashboard had two child selectors — one in the sidebar and one in the dashboard header — and they were completely disconnected (sidebar used `SelectedChildContext`, dashboard used URL-based state). Changing child in the sidebar didn't update the dashboard. Additionally, each parent page (Subjects, Rewards, Insights) maintained its own child list fetching, creating duplicate API calls and inconsistent selection state across pages.

**What it does**: The sidebar child selector is now the single source of child switching across all parent pages. It shows an avatar (uploaded image or initials fallback) next to the child's name. Switching child stays on the current page rather than redirecting to the dashboard. The redundant child selector has been removed from the dashboard header, the Subjects page, and the Rewards page. In its place, the dashboard header now has a message banner component for nudges, alerts, achievements, and reminders. The dark site footer is also hidden on Subjects, Timetable, and Insights pages since the persistent footer bar now provides navigation.

**How it was developed**:
- **Avatar support**: Added `avatar_url` to `ChildOption` type and `fetchChildrenForParent()` query in `timetableService.ts`. Extended `SelectedChildContext` with `selectedChildAvatarUrl`. Sidebar renders `<img>` if URL exists, initials `<div>` if not.
- **Navigation fix**: Sidebar `handleChildChange` now navigates to `${pathname}?child=${childId}` (stays on current page). `useChildDashboardData` gained a `useEffect` to sync from URL param changes.
- **Subscription gate fix**: `AppLayout.tsx` subscription gate changed from `!has_stripe_customer` (blocked trial users) to `tier === "expired"` only.
- **Child selector consolidation**: Removed local child fetching from `useSubjectProgressData`, `RewardManagement`, and `useInsightsDashboardData`. All now receive `childId` from `useSelectedChild()` context. Removed child selector UI from `SubjectProgressHeader` and `RewardHeroHeader`.
- **Message banner**: New `DashboardMessageBanner` component with 4 variants (nudge/alert/achievement/reminder). Currently derives messages from `childReminders` data.
- **Key files modified**: `SidebarNav.tsx`, `SelectedChildContext.tsx`, `ParentDashboardV3.tsx`, `SubjectProgressHeader.tsx`, `RewardHeroHeader.tsx`, `InsightsDashboard.tsx`, `useChildDashboardData.ts`, `useSubjectProgressData.ts`, `useInsightsDashboardData.ts`, `AppLayout.tsx`
- **New file**: `src/components/parent/dashboard/DashboardMessageBanner.tsx`

---

## AI Tutor Platform — RAG-Powered Revision Assistant (23 Feb 2026)

**Why this change is happening**: Parents and children need intelligent, contextual help with GCSE revision — not generic AI chat, but answers grounded in the actual revision materials, exam board content, and teacher guidance that Doorslam uses. The existing Study Buddy (v1) is a simple chatbot without access to this content. The AI Tutor platform creates a shared RAG (Retrieval-Augmented Generation) pipeline that both parents and children can query against the full corpus of educational content.

**What it does**: A shared knowledge base of teacher-created revision content (guides, flashcards, diagrams, past papers, marking schemes, grade thresholds, examiner reports, sample papers) is ingested from a structured Google Drive into a vector database. Parents access the **AI Tutor** via the existing fly-in/fly-out panel to ask questions about subjects, exam strategies, and their child's revision. Children will later access **StudyBuddy v2** via the same panel, with responses scoped to their current study topic, exam board, and subject. Both query the same corpus but receive role-appropriate, context-filtered answers.

**How it was developed**:
- **Architecture**: Same Supabase project with a dedicated `rag` schema for all RAG tables (documents, chunks, embeddings, conversations, messages). The `public` schema is untouched. Python/FastAPI backend in `ai-tutor-api/` subdirectory handles ingestion, retrieval, and chat. Frontend communicates via Vite dev proxy (`/api/ai-tutor`) in development, environment variable URL in production.
- **Auth**: FastAPI validates Supabase JWTs locally using the shared JWT secret — no network round-trip to Supabase Auth per request. The `sub` claim in the JWT is `auth.uid()`, used to resolve parent/child identity.
- **Content model**: Shared corpus, not per-user uploads. All authenticated users can read documents. Only the service role (Python backend) writes content during ingestion. Conversations and messages are per-user with standard RLS.
- **Retrieval scoping**: Children's queries filtered by their current `subject_id`, `topic_id`, and exam board (looked up from `public.child_subjects`). Parents get broader access across all subjects their children study.
- **8-module build plan**: App Shell, BYO Retrieval, Record Manager, Metadata Extraction, Multi-Format Support, Hybrid Search, Additional Tools, Subagents. Each module follows Plan, Build, Validate, Iterate cycle with full documentation.
- **Key decisions**: ADR-007 (RAG architecture). No LangChain framework — raw SDK calls with Pydantic structured outputs. LangSmith used for observability/tracing only (`wrap_openai` patches the OpenAI client). SSE streaming for chat. Supabase Realtime for ingestion status. Docling for multi-format document processing.
- **Key files**: `ai-tutor-api/` (Python backend), `src/components/layout/AiTutorSlot.tsx` (chat panel), `src/services/aiAssistantService.ts` (frontend service), `supabase/migrations/*_rag_schema.sql` (database)

**Subsequent changes — LangSmith tracing validation (23 Feb 2026)**:
End-to-end validation confirmed LangSmith tracing is operational. A bug was found and fixed: Pydantic Settings reads `.env` for its own fields only, but does not export extra variables (like `LANGSMITH_*`) to `os.environ`. The LangSmith SDK reads directly from `os.environ`, so traces were silently not being sent. Fix: added `load_dotenv()` call in `ai-tutor-api/src/config.py` before Settings initialisation. Validated by sending a test OpenAI call through `wrap_openai` and confirming the trace appeared in the LangSmith EU dashboard under the "Doorslam" project (1 run, `ChatOpenAI`, status: success, 58 tokens).

**Subsequent changes — Conversation history / threaded conversations (23 Feb 2026)**:
Module 1 (App Shell) saved conversations and messages to the database but had no UI for listing, loading, or revisiting past chats — every panel close lost the conversation. This change adds the full conversation history experience.

**Backend**: Three new endpoints in `ai-tutor-api/src/api/conversations.py`: `GET /conversations` returns a paginated list of the user's conversations (most recent first, with `limit`/`offset` query params); `GET /conversations/{id}/messages` loads full message history with ownership verification; `DELETE /conversations/{id}` removes a conversation and its messages with ownership checks. All endpoints validate the JWT via the existing `get_current_user` dependency.

**Async title generation**: After the first assistant response in a new conversation, a background `asyncio.create_task()` calls GPT-4o-mini to generate a concise 3–5 word title from the user's message. The `done` SSE event fires immediately — title generation happens asynchronously with zero user-facing delay. Titles are generated once and stored permanently in `rag.conversations.title`. Fallback: if the GPT call fails, the title is set to the first 50 characters of the user message (truncated at a word boundary).

**Frontend — collapsible history drawer**: The 320px AI Tutor panel is too narrow for a persistent sidebar, so the history is a collapsible drawer that slides down from below the header (~200px max-height, CSS `transition-all`). A history icon button in the header toggles the drawer. Clicking a conversation collapses the drawer and loads its messages. The drawer auto-collapses when sending a new message. The empty state includes a "View past conversations" link that opens the drawer.

**Frontend — conversation persistence**: `SidebarContext` was extended with `aiTutorConversationId` and `setAiTutorConversationId`. The active conversation ID persists across panel open/close within the same page session. When the panel reopens with an existing conversation ID and no messages loaded, it automatically reloads from the backend.

**New files**: `ai-tutor-api/src/api/conversations.py` (backend router), `src/components/layout/ai-tutor/ConversationList.tsx` (history list), `src/components/layout/ai-tutor/ConversationListItem.tsx` (compact row with relative timestamps, delete with double-click confirmation), `ai-tutor-api/tests/test_conversations.py` (4 backend tests).
**Modified files**: `ai-tutor-api/src/models/chat.py` (4 new Pydantic models), `ai-tutor-api/src/main.py` (registered router), `ai-tutor-api/src/api/chat.py` (title generation), `src/services/aiAssistantService.ts` (3 new service functions), `src/contexts/SidebarContext.tsx` (conversation ID state), `src/components/layout/AiTutorSlot.tsx` (collapsible drawer, history loading).

---

## Timetable Redesign — Time-Slot Grid + Drag-and-Drop Topics (20 Feb 2026)

**Why this change is happening**: The original timetable showed sessions as flat cards stacked under each day in an "All day" row. This didn't communicate when during the day each session happens, and parents couldn't rearrange topics between sessions. The redesign gives parents visual control over their child's revision schedule.

**What it does**: The week view is now a proper time-slot grid — rows are time slots (Early Morning, Morning, Afternoon, After School, Evening) and columns are days. Each cell shows individual topic cards (not session cards), so a 45-minute session displays 2 topic cards. Parents can drag topics between any cells using drag-and-drop, with capacity validation (can't exceed session pattern limits). Topic cards show a coloured status dot (green=completed, orange=pending, red=missed) and a small X for deletion. The "Revision Plan Card" has been removed, with its status label ("On Track", etc.) moved into the page header as a compact badge. Action buttons are now a slim button row instead of large cards. The subject legend is integrated into the controls bar.

Children can also access the timetable at `/child/timetable`. Their editing access is controlled by a new Parental Controls system in Settings — parents can set each feature to Off, Requires Approval, or Auto-Approved per child. In "Requires Approval" mode, drag-and-drop actions create approval requests that the parent can approve or reject.

**How it was developed**:
- **Data model**: Added `time_of_day TEXT` column to `planned_sessions` via migration. Created `parental_controls` and `parental_control_requests` tables with RLS policies. Added RPCs for topic moves, topic removal, and all parental controls CRUD.
- **TypeScript types**: Added `time_of_day: string | null` to `TimetableSession`. Added `after_school` to `TimeOfDay` type. Created `src/types/parentalControls.ts` and `src/services/parentalControlsService.ts`.
- **UI components**: New `TopicCard` (draggable via `useDraggable`, delete X, status dot), `TimeSlotRow` (droppable cells via `useDroppable`), and complete `WeekView` rewrite with `DndContext` wrapper. `TodayView` now groups sessions by time slot.
- **Parental controls UI**: `ParentalControlsSection` in `ParentSettingsPage` with 3-way toggle per feature, pending approval queue with approve/reject actions. Subscription-gated via `canUseParentalControls()`.
- **Child access**: `ChildTimetable` view at `/child/timetable` adapts based on access level. `useChildAccess()` hook checks permissions.
- **Key files**: `src/components/timetable/WeekView.tsx`, `TopicCard.tsx`, `TimeSlotRow.tsx`, `TodayView.tsx`, `TimetableHeader.tsx`, `TimetableActionCards.tsx`, `TimetableControls.tsx`, `src/utils/timetableUtils.ts`, `src/views/child/ChildTimetable.tsx`, `src/components/parent/settings/ParentalControlsSection.tsx`, `src/hooks/useParentalControls.ts`

**Subsequent changes (20 Feb 2026) — Data pipeline fixes + Layout restructure:**

The initial implementation had several data pipeline issues and the page layout needed restructuring to match the updated design:

- **Data pipeline**: The Supabase RPCs (`rpc_get_week_plan`, `rpc_get_todays_sessions`) didn't return the new `time_of_day` column, causing all sessions to display in an "Unscheduled" row. Fixed by replacing RPC calls with direct Supabase table queries. The `AddSessionModal` was also missing a time slot selector. A `backfillTimeOfDay()` function now runs after plan regeneration to populate `time_of_day` from the weekly template.
- **Drag-and-drop**: Collision detection switched from `closestCenter` to `pointerWithin` for reliable grid targeting. The entire topic card is now draggable (not just a tiny grip icon). Drops on empty cells auto-create a session on the fly. Move/remove operations replaced with direct Supabase queries (no RPC dependency). Background refreshes no longer flash a loading spinner.
- **Layout restructure**: Child selector moved from timetable header into the sidebar via a new `SelectedChildContext` (ADR-006). Timetable header simplified to title + status subtitle. New `NudgeBanner` component for plan alerts (dark card, top-right). Status badge repositioned to the action buttons row. `TimetableControls` made more compact (no card wrapper, date nav + view toggle inline). `PersistentFooter` links restyled as bordered button pills with navigation.
- **New key files**: `src/contexts/SelectedChildContext.tsx`, `src/components/timetable/NudgeBanner.tsx`

---

## Subscription Trial Gating & Upgrade/Downgrade (19 Feb 2026)

**Why this change is happening**: The initial Stripe integration offered a 14-day free trial on both Family and Premium plans, and upgrade/downgrade actions opened the Stripe Customer Portal which gave limited control over trial behaviour. Specifically, upgrading mid-trial through the portal would continue the trial on the new plan — meaning users could get 14 days of Premium for free. Business rules require: trial only on Family, immediate trial end on upgrade, no re-trialing, and proper proration on plan changes.

**What it does**: Restricts the free trial to Family plan only. When a trialing Family user upgrades to Premium, the trial ends immediately and billing starts. Downgrades apply prorated credit. Expired users who return cannot re-trial. The pricing page buttons adapt to the user's current state (Current Plan, Upgrade, Downgrade, Resubscribe, Subscribe, or Start Free Trial). A "Manage Billing" link gives access to Stripe's portal for payment methods and cancellation.

**How it was developed**:
- New `stripe-update-subscription` edge function uses the Stripe Subscriptions API to change plans in-app, setting `trial_end: 'now'` for trialing users and `proration_behavior: 'always_invoice'` for immediate billing
- `stripe-create-checkout` updated: `trial_period_days: 14` only applied when the price is a Family price AND the user is new (no `stripe_customer_id`)
- `useSubscription` hook now exposes `hasStripeCustomer` so the UI can distinguish new users from expired returning users
- `Pricing.tsx` button logic rebuilt with a state matrix covering all user states
- Customer Portal kept for billing admin (payment methods, invoices, cancellation) but no longer used for plan changes
- Key files: `supabase/functions/stripe-update-subscription/index.ts`, `supabase/functions/stripe-create-checkout/index.ts`, `src/views/parent/Pricing.tsx`, `src/services/subscriptionService.ts`, `src/hooks/useSubscription.ts`

**Subsequent changes — Upgrade/Downgrade UX & Billing Interval Lock (19 Feb 2026)**:
Testing revealed three issues: (1) no confirmation before plan change, (2) no success feedback, (3) sidebar badge didn't update because each `useSubscription()` hook maintained independent state. Additionally, the monthly/quarterly/annual selector represented commitment lengths, not just billing frequency — allowing users to switch interval during upgrade would let them game discount rates.

Fixes applied:
- Created `SubscriptionContext` so all components (sidebar, nav, pricing page) share subscription state — calling `refresh()` anywhere updates every consumer
- Added a confirmation modal before plan changes showing target plan, price, and a warning that trial ends immediately if upgrading from trial
- Added dismissible success/error alerts after plan change completion
- Duration selector is now hidden for existing subscribers — their billing interval is locked
- `stripe_price_id` stored in the profiles table (new migration + updated RPC) so the frontend knows the user's current billing interval
- Edge function rewritten to accept `target_tier` instead of `price_id` — it reads the subscription's current price, determines the billing interval, and maps to the target tier's equivalent price
- New files: `src/contexts/SubscriptionContext.tsx`, migration `20260219120000_add_stripe_price_id.sql`
- Modified files: `src/hooks/useSubscription.ts` (re-export from context), `src/providers.tsx` (wire provider), `src/types/subscription.ts` (interval mapping helpers), `src/services/subscriptionService.ts` (target_tier API), `src/views/parent/Pricing.tsx` (modal + alerts + interval lock), `supabase/functions/stripe-update-subscription/index.ts` (interval mapping), `supabase/functions/stripe-webhook/index.ts` (store price ID)

**Subsequent changes — Subscription Model Refactor: Plan Length + Billing Method (19 Feb 2026)**:
Testing revealed the pricing model was incorrectly treating "Monthly/Quarterly/Annual" tabs as billing frequency. They actually represent **plan length** — the commitment period (1-month, 3-month, or 12-month). The "pay monthly / pay in full" toggle is the **billing method** within that commitment. Both dimensions are locked once a user subscribes. Subscribers can upgrade to a longer plan length in-app (1→3, 1→12, 3→12), but downgrading plan length requires cancel + re-subscribe.

Changes applied:
- **Type system refactored**: Replaced `BillingInterval` with two new types: `PlanLength` (`1_month | 3_months | 12_months`) and `BillingMethod` (`monthly | upfront`). Products now defined by 3 dimensions: tier × plan length × billing method (10 unique Stripe prices)
- **2 new Stripe prices created**: Family 3-month upfront (£29.99, saves 33%) and Premium 3-month upfront (£39.99, saves 33%). "Pay in full" toggle now available for both 3-month and 12-month plans (was 12-month only)
- **Tab labels renamed**: "Monthly / Quarterly / Annual" → "1 Month / 3 Months / 12 Months" to correctly communicate commitment length
- **Subscriber plan length control**: Shorter plan lengths shown disabled in tabs, current plan selected, longer plan lengths clickable. Clicking a longer tab updates prices and enables "Extend Plan" buttons
- **Billing method locked**: Upfront toggle shown disabled for subscribers, reflecting their current billing method
- **Button logic expanded**: 5 states — Current Plan, Extend Plan, Upgrade, Downgrade, Subscribe/Start Free Trial
- **Edge function rewritten**: `stripe-update-subscription` accepts optional `target_plan_length` alongside `target_tier`. Validates plan length can only go up. Resolves new price via 3-key lookup (`tier:planLength:billingMethod`), always preserving the subscriber's billing method
- **Polling for UI sync**: After plan change, pricing page polls `getSubscriptionStatus()` (up to 10 attempts × 500ms) to wait for webhook sync before refreshing UI — eliminates the manual refresh requirement
- Key files: `src/types/subscription.ts` (complete type rewrite), `src/views/parent/Pricing.tsx` (full UI rewrite), `src/contexts/SubscriptionContext.tsx` (planLength + billingMethod), `supabase/functions/stripe-update-subscription/index.ts` (3-key model), `supabase/functions/stripe-webhook/index.ts` (+2 prices), `supabase/functions/stripe-create-checkout/index.ts` (+1 Family trial price)

**Subsequent changes — Pricing Page UX Refinements (19 Feb 2026)**:
User testing revealed the subscriber pricing page was cluttered and unintuitive: generic "Your Plan" title, tabs and toggle appeared clickable when they should be locked, buttons like "Extend Plan" lacked context, and the sidebar showed a pointless "Parent" role label.

Fixes applied:
- Subscriber header replaced with a direct statement: "You are on the 3 Month Premium plan" with dynamic upgrade guidance ("You can upgrade to a 12 Month plan") and inline Manage Billing link
- Tabs and toggle now initialise from subscriber data on page load, and lock correctly even when `stripe_price_id` hasn't synced yet (null-safe guards)
- Button labels include the target plan length: "Extend to 12 Months", "Upgrade to Premium 12 Months"
- Sidebar "Parent" role label removed — now shows avatar, name, and tier badge only
- Modified files: `src/views/parent/Pricing.tsx`, `src/components/layout/sidebar/SidebarBottomSection.tsx`

**Subsequent changes — Stripe Branding, Customer Portal & Wallet Payments (19 Feb 2026)**:
Before going live, we reviewed the Stripe integration to ensure we weren't over-engineering. The review confirmed we're using Stripe's recommended approach for SaaS subscription apps: hosted Checkout (redirect), hosted Customer Portal (redirect), and in-app plan changes via edge function. No Stripe.js, no embedded forms, no custom payment UI.

Configuration applied (all Stripe Dashboard, no code changes):
- **Branding**: Business name, logo, brand colour, and accent colour set in Settings → Branding. Automatically applies to Checkout, Customer Portal, receipts, invoices, and email notifications
- **Customer Portal**: Payment methods, invoice history, and subscription cancellation enabled. Subscription switching disabled (plan changes handled in-app via `stripe-update-subscription` edge function)
- **Google Pay**: Enabled in Settings → Payment Methods. Domains registered: `app.doorslam.io`, `staging.doorslam.io`, `dev.doorslam.io`. Button appears automatically on hosted Checkout when the customer has Google Pay available
- **Apple Pay**: Enabled in Settings → Payment Methods. Same domains registered. Stripe handles Apple merchant validation automatically for hosted Checkout — no domain verification file needed on our end
- **No code changes required**: All wallet payment buttons appear automatically on Stripe's hosted Checkout page when enabled in the Dashboard. Our redirect-based integration means we don't need Stripe.js, PaymentElement, or any client-side payment SDK

---

## Vite Migration (18 Feb 2026)

**Why this change is happening**: The Next.js dev server was repeatedly hanging during development, causing significant productivity loss. An audit revealed that the app was a fully client-rendered SPA — every page had `'use client'`, there were zero server components, zero API routes, and zero middleware. Next.js was providing nothing beyond a routing layer and a dev server that didn't work reliably.

**What it does**: Replaces the Next.js framework with Vite (bundler/dev server) and React Router (client-side routing). The app now starts in ~200ms instead of hanging. All existing routes, authentication flows, and UI remain identical — this is a developer experience improvement with zero user-facing changes.

**How it was developed**: The migration was entirely mechanical with no business logic changes:
- Created new entry point (`index.html` + `src/main.tsx`) and route definitions (`src/router.tsx`)
- Replaced Next.js navigation hooks with React Router equivalents (`useNavigate`, `useSearchParams`, `useLocation`, `useParams`)
- Replaced `next/link` `Link` with `react-router-dom` `Link` (changed `href` to `to` prop)
- Replaced `next/image` `Image` with plain `<img>` elements (images were already unoptimized)
- Replaced `next/dynamic` with `React.lazy`
- Changed environment variables from `NEXT_PUBLIC_*` to `VITE_*` prefix
- Removed all `'use client'` directives (no longer meaningful outside Next.js)
- Deleted the entire `app/` directory, `next.config.ts`, and Next.js ESLint plugin
- Updated build toolchain: `vite` for dev/build, merged Vitest config into `vite.config.ts`
- Key files: `src/router.tsx`, `src/main.tsx`, `src/providers.tsx`, `vite.config.ts`, `index.html`
- Architecture decision: [ADR-004](decisions/ADR-004-vite-migration.md)

---

## Baseline — v1.0.0 (2 Feb 2026)

### What the product is

Doorslam is a GCSE revision platform. Parents set up their child's subjects, exam boards, and revision schedule. The platform generates a personalised timetable of revision sessions. Children work through sessions that follow a 6-step learning model. Parents monitor progress through a dashboard.

### Core user journeys

1. **Parent onboarding**: Parent signs up → adds child → selects subjects and exam boards → sets availability → platform generates a revision timetable.
2. **Child daily revision**: Child logs in → sees today's sessions → works through each session's 6 steps (Preview → Reinforce → Recall → Practice → Summary → Complete) → earns points.
3. **Parent monitoring**: Parent views dashboard → sees which subjects are on track → checks child's activity and streaks → adjusts plan if needed.

### Features delivered at v1.0.0

| Feature | What it does | Key files |
|---------|-------------|-----------|
| **Session System** (FEAT-004) | 6-step pedagogical model. Each session walks the child through Preview (what they'll learn), Reinforce (teaching slides/worked examples), Recall (flashcards with spaced repetition ratings), Practice (exam-style questions with difficulty selector), Summary (AI mnemonic), and Complete (celebration + points). | `src/views/child/sessionSteps/`, `src/components/child/` |
| **Payload Restructure** (FEAT-005) | Reorganised session data from flat "flashcards" to structured Recall/Practice/Reinforce payloads. Made each step independent with its own data contract. | `src/services/child/` |
| **RecallStep Refactor** (FEAT-007) | Established the component extraction pattern: large monolithic step components broken into focused sub-components (IntroScreen, FlashcardViewer, CompleteScreen, etc.). This pattern was then applied to all other steps. | `src/components/child/recallStep/` |
| **Parent Insights** (FEAT-008) | Dashboard with 10 widgets showing revision analytics: confidence heatmap, trend charts, subject balance, momentum, focus mode usage, and AI tutor advice. Powered by 7 Supabase RPCs. | `src/views/parent/InsightsDashboard.tsx`, `src/components/parent/insights/` |
| **Parent Dashboard v2** (FEAT-009) | Multi-child family view. HeroStatusBanner with family stats, child health card grid, weekly focus strip, rhythm chart, support tips. Each child shown as a card with traffic-light status. | `src/views/parent/ParentDashboardV2.tsx`, `src/components/parent/dashboard/` |
| **Unified Status System** (FEAT-010) | Consistent 4-level traffic-light indicators (On Track / Keep Going / Needs Attention / Behind) used across dashboard, subjects, and timetable. Replaced inconsistent ad-hoc status logic. | `src/utils/statusStyles.ts` |
| **Study Buddy AI** (FEAT-011) | AI chat panel during sessions. Child can ask questions about the topic. Supports voice input via browser speech recognition. Streamed responses from backend AI. | `src/components/child/studyBuddy/` |
| **Add Subject with Redistribution** (FEAT-012) | Parents can add new subjects mid-plan. The platform automatically redistributes the existing timetable to accommodate the new subject, preserving balance across all subjects. | `src/components/subjects/AddSubjectModal.tsx` |
| **Reward System** (FEAT-013) | Parents configure rewards (screen time, treats, activities, pocket money, privileges, custom). Children earn points through sessions and redeem them. Supports parent approval thresholds and child addition requests. | `src/components/parent/rewards/`, `src/views/child/ChildRewardsCatalog.tsx` |
| **Personalised Hero Summaries** (FEAT-014) | Dashboard hero card shows per-child personalised sentences (e.g., "Olivia completed 8 sessions this week and is on track in Maths"). Uses child's preferred_name if set. | `src/components/parent/dashboard/HeroStatusBanner.tsx` |
| **Real-Time Dashboard** | Parent dashboard auto-refreshes when sessions are completed in another tab. Uses Supabase real-time subscriptions on `revision_sessions` and `planned_sessions` tables, plus Page Visibility API refresh. 30-second throttle prevents API spam. | `src/hooks/parent/useParentDashboardData.ts` |
| **Gamification** | Points, streaks, and celebration moments. Children earn points per completed session. Streak counter tracks consecutive days. Progress moments celebrate milestones (first session, 5-day streak, etc.). | `src/services/gamificationService.ts`, `src/components/gamification/` |

---

## v1.1.0 — Infrastructure & Migration (6 Feb 2026)

### Why this release happened

The v1.0.0 codebase used Vite with React Router. To prepare for production deployment on Vercel with proper SSR support, SEO, and the App Router pattern, the entire application was migrated to Next.js 16. At the same time, the engineering foundation (CI pipeline, testing, linting) was established per the Engineering Ops Playbook.

### What changed

| Change | What it does | PR |
|--------|-------------|-----|
| **Next.js Migration** | Converted all routes from React Router to Next.js App Router (`app/` directory). Added `'use client'` directives to all interactive components. Configured `@/` path alias. | PR #5 |
| **CI/CD Pipeline** | GitHub Actions workflow runs lint, type-check, test, and build on every PR to develop/staging/main. Quality gate — nothing merges without passing. | PR #3 |
| **Testing Framework** | Vitest + React Testing Library configured. `npm run test` runs unit tests. | PR #2 |
| **Code Formatting** | Prettier + ESLint with TypeScript parser. Standardised code style across the team. | PR #1 |
| **ESLint Fix** | Added missing parser and plugin dependencies that caused CI failures. | PR #4 |
| **Supabase CLI** | Initialised `supabase/` directory with baseline migration and edge function structure. | Pre-PR |

### How it was developed

Each infrastructure change was a separate PR to develop, following the playbook for the first time. The CI pipeline was established first (PR #1-#4), then the Next.js migration (PR #5) was the first feature to go through the full lint → type-check → test → build gate.

---

## v2.0.0 — Codebase Review (8 Feb 2026)

### Why this release happened

Before adding new features, the entire codebase was audited for code quality. Priorities were: replace hardcoded colours with design tokens, consolidate duplicate components, extract services from views, and fix TypeScript errors.

### What changed

| Change | What it does | Impact |
|--------|-------------|--------|
| **Design Token Migration** | Replaced ~200 hardcoded Tailwind colour classes (e.g., `bg-blue-600`) with CSS custom property tokens (e.g., `bg-primary-600`). Enables theming and dark mode. | All component files |
| **Component Consolidation** | Removed duplicate components (e.g., two `FormField` implementations). Established single sources of truth. | ~30 files |
| **Service Extraction** | Moved inline Supabase `rpc()` and `from()` calls out of views into dedicated service files. Views now call service functions instead of database directly. | `src/services/` |
| **Timetable Modal Refactor** | The three timetable modals (AddSession, BlockDates, EditSchedule) were each 300+ lines of mixed concerns. Refactored to separate form state, validation, and UI. | `src/components/timetable/` |

### How it was developed

A single large PR (#6) with changes grouped by priority (P0 design tokens → P1 consolidation → P2 extraction → P3 cleanup). Reviewed file-by-file. Version bumped to 2.0.0 because the design token migration touched nearly every component.

---

## v3.0.0 — Layout Overhaul (9 Feb 2026)

### Why this release happened

The v2 layout had a horizontal top navigation bar, no persistent actions, and no designated space for the planned AI tutor panel. The v3 overhaul introduced a professional sidebar navigation pattern that scales better for the growing number of parent pages (Dashboard, Subjects, Timetable, Insights, Rewards, Settings).

### What changed

| Change | What it does | Key files |
|--------|-------------|-----------|
| **Sidebar** | Left-side navigation panel. Desktop: expands (labels) or collapses (icons only). Mobile: hamburger button opens a slide-out overlay. Remembers state in localStorage. | `src/components/layout/Sidebar.tsx`, `sidebar/` |
| **Persistent Footer** | Always-visible footer with quick action buttons. Previously, quick actions were embedded in the dashboard — now they're accessible from every page. | `src/components/layout/PersistentFooter.tsx` |
| **AI Tutor Slot** | Empty panel slot in the layout for the future AI tutor. Positioned as a right-side panel that can expand/collapse. No AI functionality yet — just the layout placeholder. | `src/components/layout/AiTutorSlot.tsx` |
| **AppShell** | New wrapper component for authenticated pages. Composes Sidebar + main content area + PersistentFooter + AiTutorSlot. Unauthenticated pages (Login, SignUp, Landing) use the simpler AppHeader instead. | `src/components/layout/AppShell.tsx` |
| **Dark Mode Fix** | The design token migration in v2.0.0 introduced a double-inversion bug: `themes.css` inverts neutral colours in dark mode, but many components still had `dark:bg-neutral-*` Tailwind classes that inverted again. Fixed by removing all `dark:` neutral variants from 25+ files. | Across all component directories |

### How it was developed

Single feature branch `feat/v3-layout-overhaul` (PR #7 to develop). The sidebar was built first as an isolated component, then integrated into AppShell. Dark mode fixes were done file-by-file with visual testing. Promoted through staging (PR #9) to main (PR #10).

---

## Unreleased — Zero-Warning Codebase (10 Feb 2026)

### Why this change happened

The codebase accumulated 192 ESLint warnings over the v1.0–v3.0 development cycle. Most were `@typescript-eslint/no-explicit-any` — meaning TypeScript's type safety was being bypassed in 165 places. The rest were missing React hook dependencies, raw `<img>` tags instead of Next.js `<Image>`, and stale `eslint-disable` comments. While none caused runtime bugs, they masked real issues and made the CI output noisy.

### What changed

Every ESLint warning was eliminated across 69 files:

| Category | Count | What was done |
|----------|-------|---------------|
| `no-explicit-any` | 160 | Replaced `any` with `unknown`, `Record<string, unknown>`, or specific interfaces |
| `react-hooks/exhaustive-deps` | 14 | Added missing dependencies to `useEffect` / `useCallback` arrays |
| `@next/next/no-img-element` | 13 | Replaced `<img>` with Next.js `<Image>` for automatic optimisation |
| Unused `eslint-disable` | 5 | Removed stale suppression comments |

A pre-existing build error in `AvatarUpload.tsx` was also fixed — `import Image from "next/image"` was shadowing the browser's native `Image` constructor used by `new Image()`.

### How it was developed

Single feature branch `chore/fix-lint-warnings` from develop. Files were fixed in priority order: type definitions first (to stop `any` propagating), then services, then hooks, then components. `npm run lint`, `npx tsc --noEmit`, and `npx next build` all verified passing before merge. PR #15 to develop, squash-merged.

The tracking document `docs/ANY_TYPE_BACKLOG.md` (created during the v2.0 codebase review) has been updated to mark all items as resolved.

---

## Unreleased — Parent Dashboard v3 (In Progress)

### Why this change is happening

The v2 Parent Dashboard (FEAT-009) shows a **family-aggregate** view: all children summarised on one page with a grid of health cards. User testing showed that parents primarily care about one child at a time and want deeper detail without navigating to separate pages. The v3 redesign replaces the family overview with a **child-specific** view focused on one selected child.

### What the new dashboard does

The parent navigates to `/parent` and sees a dashboard focused on their selected child:

1. **Header row**: "Dashboard" title on the left. On the right: child's avatar, name, year group, and exam type. If the parent has multiple children, a dropdown lets them switch.

2. **Row 1 — Hero + Health Score** (side by side):
   - **This Week's Story** (2/3 width): A narrative sentence like "Olivia completed 8 of 12 sessions this week." Below it: a compact day-pill strip showing which days had activity, three KPI cards (Sessions Completed, Confidence Change, Focus Mode Usage), and a "Next Best Action" recommendation with action buttons.
   - **Health Score** (1/3 width): A 0–100 composite score displayed in an SVG ring. RAG status capsule (On Track / Keep an Eye / Needs Attention). Four sub-metrics: subjects on track, subjects needing attention, average coverage percentage, and weeks until exams.

3. **Row 2 — Revision Plan** (full width): Left side shows progress-by-subject with coloured bars and completion percentages. Right side shows the next 4 upcoming sessions with subject icons and day labels. A status banner shows scheduled vs needed sessions per week.

4. **Row 3 — Three compact cards**:
   - **Recent Activity**: upcoming sessions and coverage milestones
   - **Progress Moments**: recent celebration events (streaks, milestones)
   - **Active Rewards**: the child's configured rewards with points costs

### How it was developed

- **Data layer**: New composite hook `useChildDashboardData` wraps the existing `useParentDashboardData` (unchanged) and adds child-specific fetches for plan coverage and reward data. Client-side filtering by `child_id` for coming-up sessions, subject coverage, and progress moments.
- **Health score**: Pure utility function `calculateHealthScore()` in `src/utils/healthScore.ts`. Four sub-metrics (0–25 each) summed to 0–100: subjects on track, attention penalty, average coverage, time score.
- **V3 alongside V2**: `ParentDashboardV3.tsx` created as a new file. The route swap in `app/parent/page.tsx` is a single import change. V2 remains untouched as fallback.
- **Iterative design**: Initial layout was refined through 3 rounds of feedback — adjusting grid proportions, compacting vertical spacing to fit one screen, and creating a dashboard-specific revision plan component.

### Architecture decision

See [ADR-003: Dashboard v3 — Child-Specific View](decisions/ADR-003-dashboard-v3-child-specific.md)

---

## Unreleased — Streamlined Onboarding (12 Feb 2026)

### Why this change is happening

The original onboarding flow required parents to complete 11 steps before seeing the dashboard. This created friction — parents had to configure goals, learning needs, grades, availability, and the full revision schedule before they could land on their home base. Feedback showed parents wanted to see the dashboard sooner, then complete the schedule at their own pace.

### What the new flow does

The onboarding is now split into two phases:

**Phase 1 (3 steps) — Get to the dashboard fast:**
1. Add child details (name, year group)
2. Select exam type (GCSE, iGCSE, etc.)
3. Choose subjects

The child is created in the database immediately. The parent lands on the dashboard. No revision period, no plan, no sessions yet.

**Phase 2 (from the dashboard) — Set up the schedule:**
A "Complete Schedule" CTA appears in the dashboard's Next Best Action area. Clicking it opens a 7-step wizard (Goal → Needs → Pathways → Grades → Revision Period → Availability → Confirm). On completion, the revision period, plan, and sessions are generated.

**Invite (from the dashboard) — Separate concern:**
Once the schedule is set up, the Next Best Action switches to "Invite [child]". Clicking it opens a modal with copy-link, copy-code, and email options. Previously this was the last step of onboarding.

### How it was developed

- **Backend**: 4 new Supabase SQL functions deployed via Supabase CLI (`supabase db push`). `rpc_parent_create_child_basic` creates a child with subjects only (no plan). Three helper RPCs fill the gaps for Phase 2: `rpc_set_child_goal`, `rpc_update_child_subject_grades`, `rpc_init_child_revision_period`.
- **Frontend orchestration**: `ParentOnboardingPage.tsx` reads a `?phase=schedule&child=<id>` query parameter to determine which step sequence to show. All 11 existing step components remain untouched — only the parent page's orchestration changed.
- **Dashboard integration**: `DashboardHeroCard.tsx` detects three states based on `planOverview` and `auth_user_id`: (A) schedule needed, (B) invite pending, (C) fully set up. Each shows different action buttons.
- **Invite modal**: New `DashboardInviteModal.tsx` extracted from the existing `InviteChildStep.tsx` UI, wrapped in a modal overlay. Generates an invitation code on mount if one doesn't exist.

### Architecture decision

See [ADR-004: Two-Phase Onboarding](decisions/ADR-004-two-phase-onboarding.md)

---

## Unreleased — Public Pricing Navigation (18 Feb 2026)

### Why this change is happening

The pricing page (`/pricing`) already existed and handled both logged-in and logged-out visitors, but there was no way to reach it from the public header. The `AppHeader` only showed "Log in" and "Sign up" — the only link to pricing was buried in the footer. Visitors comparing plans had no obvious path to find pricing information.

### What it does

A "Pricing" text link now appears in the public header navigation, between the logo and the Log in / Sign up buttons. Clicking it takes visitors to the existing pricing page showing Family and Premium plans with duration options and "Start Free Trial" CTAs.

### How it was developed

Single-line addition to `src/components/layout/AppHeader.tsx`. The link uses the same styling as the existing "Log in" link for visual consistency. No new components, services, or routes were needed — the pricing page and its logged-out behaviour already existed.

---

## Unreleased — Stripe Sandbox Integration (18 Feb 2026)

### Why this change is happening

Doorslam needs a payment system before launch. Parents must choose a plan (Family or Premium) to access the platform beyond onboarding. The 14-day free trial is managed by Stripe — no separate database trial. This change wires up the complete payment flow in Stripe's test environment so the signup-to-subscription journey can be tested end-to-end.

### What it does

After completing Phase 1 onboarding (child details → exam type → subjects), parents are redirected to the pricing page where they must choose a plan. Clicking "Start Free Trial" opens Stripe's hosted checkout page with a 14-day trial. On successful checkout, the parent is redirected to the dashboard. The webhook updates the database with subscription tier, status, and trial end date. Parents who cancel or never subscribe are redirected back to pricing from any protected route.

Returning customers (those who previously had a Stripe customer ID) do not get another free trial — they are billed immediately.

### How it was developed

- **Stripe setup**: 3 products and 11 prices created via Stripe API in test mode (Family: 4 billing options, Premium: 4 billing options, Tokens: 3 one-time bundles)
- **Price ID wiring**: All `stripePriceId` fields in `src/types/subscription.ts` and `PRICE_TO_TIER` / `TOKEN_BUNDLES` maps in the webhook handler populated with real Stripe price IDs
- **Onboarding flow change**: `ParentOnboardingPage.tsx` redirects to `/pricing` after Phase 1 (was `/parent`)
- **Subscription gate**: `AppLayout.tsx` checks `has_stripe_customer` for parent users and redirects to `/pricing` if false. Exempt routes: `/pricing`, `/parent/onboarding`, `/account`, `/login`, `/signup`, `/child`
- **Post-checkout handling**: `Pricing.tsx` detects `?subscription=success`, refreshes subscription data, and redirects to `/parent`
- **Returning customer protection**: `stripe-create-checkout/index.ts` only sets `trial_period_days: 14` for first-time customers
- **Database cleanup**: Removed `trigger_set_trial_end_date` and `set_trial_end_date()` — trial is now 100% Stripe-managed via webhook
- **Edge functions deployed**: `stripe-create-checkout`, `stripe-webhook` (--no-verify-jwt), `stripe-customer-portal`, `stripe-buy-tokens`
- **Webhook**: Registered for `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
- **Environment**: Stripe secret key and all redirect URLs set as Supabase secrets; publishable key in `.env`

---

## How to Document Future Changes

When adding a new feature, bug fix, or change:

1. **CHANGELOG.md** — add an entry under `[Unreleased]` with the technical summary (files changed, what was added/modified/removed).

2. **This file (PRODUCT_EVOLUTION.md)** — add a new section with:
   - **Why this change is happening** — the problem or user need
   - **What it does** — plain English description a non-developer could understand
   - **How it was developed** — technical approach, key decisions, files involved
   - **Subsequent changes** — if the feature is later modified, add notes here

3. **ADR (if applicable)** — for significant architectural decisions, create `docs/decisions/ADR-NNN-description.md` following the template in the first ADR.

4. **PR description** — every PR should include Summary, New/Modified files table, and Test Plan (per Playbook Section 2.4).
