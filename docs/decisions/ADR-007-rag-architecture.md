# ADR-007: RAG Architecture for AI Tutor Platform

## Status
Accepted

## Date
2026-02-23

## Context
Doorslam needs an AI-powered assistant that can answer questions grounded in the actual revision content used by the platform: teacher-created revision guides, flashcards, diagrams, exam board past papers, marking schemes, grade thresholds, examiner reports, and sample papers. This content currently lives in a structured Google Drive.

Two consumer interfaces will share the same corpus:
- **AI Tutor** (parent-facing) — general revision guidance, exam strategies, subject-specific help
- **StudyBuddy v2** (child-facing, future migration) — topic-scoped answers tailored to the child's current study context

The existing StudyBuddy v1 is a simple chatbot (Supabase edge functions calling Claude) with no access to the content corpus. It remains as-is; migration is a separate future task.

Five architectural decisions were needed:
1. Same or separate Supabase project for the RAG database?
2. Same or separate frontend project?
3. Where does the Python backend live?
4. How does the backend authenticate requests?
5. How is the shared content corpus modelled differently from per-user documents?

## Decision

### 1. Same Supabase project, `rag` schema

All RAG tables live in a `rag` schema within the existing Supabase project (`hpdoircrqgoqabhnsuav`, eu-west-3). The `public` schema is untouched.

Cross-schema foreign keys link RAG tables to existing data:
- `rag.documents.subject_id` → `public.subjects(id)`
- `rag.documents.topic_id` → `public.topics(id)`
- `rag.conversations.child_id` → `public.children(id)`

This preserves shared auth (`auth.uid()`) and allows the AI to scope retrieval using existing child/subject data without duplication.

### 2. Same frontend (Doorslam repo)

The AI Tutor chat UI replaces the existing `AiTutorSlot.tsx` placeholder — a 320px right panel already wired into `AppShell.tsx` with sidebar auto-collapse via `SidebarContext.isAiPanelOpen`. Auth context (`session.access_token`, `activeChildId`, `isParent`) is already available to all components inside AppShell.

### 3. Python/FastAPI backend in `ai-tutor-api/` subdirectory

The backend is a Python/FastAPI application in an `ai-tutor-api/` directory within the Doorslam monorepo. It has its own `venv`, `pyproject.toml`, and test suite. The frontend communicates via:
- **Dev**: Vite proxy (`/api/ai-tutor` → `localhost:8000`)
- **Prod**: Environment variable (`VITE_AI_TUTOR_API_URL`)

### 4. Local JWT validation

The FastAPI backend validates Supabase JWTs locally using `PyJWT` and the `SUPABASE_JWT_SECRET`. The JWT's `sub` claim is `auth.uid()`, used to resolve parent/child identity by querying the existing `profiles` and `children` tables. No network round-trip to Supabase Auth per request.

### 5. Shared content corpus with role-scoped retrieval

The content is a shared educational corpus — not per-user uploads. `rag.documents` has no `owner_id`. All authenticated users can read documents (RLS: `auth.role() = 'authenticated'`). Only the service role (Python backend) writes content during ingestion.

Retrieval is scoped by role:
- **Children**: filtered by their current `subject_id`, `topic_id`, and exam board
- **Parents**: broader search across all subjects their children study

Conversations and messages are per-user with standard parent/child RLS patterns.

## Alternatives Considered

### Separate Supabase project for RAG
Rejected — would require duplicating auth (JWT sync or cross-project trust), lose access to child context (`children.language_level`, `child_needs`), require two Supabase clients in the frontend, and double ops burden (billing, migrations, secrets).

### Separate frontend project
Rejected — would lose the pre-built AiTutorSlot, require duplicate provider hierarchy (Auth, Subscription, Theme, Sidebar), and need iframe or micro-frontend stitching. The panel is a UI component within the existing app, not a standalone application.

### Multi-repo (separate repo for Python backend)
Rejected — atomic changes (migration + API endpoint + frontend component) would span multiple repos and PRs. The monorepo allows one PR to touch all three layers.

### LangChain / LangGraph for RAG orchestration
Rejected per project rules — raw SDK calls with Pydantic structured outputs. This avoids framework lock-in and keeps the retrieval pipeline transparent and debuggable.

### Per-user document uploads
Not applicable — the content is teacher-created and exam-board-sourced, ingested from a structured Google Drive. Parents and children query but don't contribute content.

## Consequences

### Positive
- Shared auth eliminates user sync complexity
- Cross-schema FKs enable subject/topic-scoped retrieval without data duplication
- AiTutorSlot placeholder means zero layout work for Module 1
- Monorepo enables atomic cross-stack PRs
- Local JWT validation eliminates per-request auth latency
- Shared corpus model simplifies RLS (read-all for docs, per-user for conversations)

### Negative
- Python backend adds a new runtime to the project (was JavaScript-only with edge functions)
- `ai-tutor-api/` needs its own CI pipeline (pytest) alongside the existing npm pipeline
- Supabase Realtime on the `rag` schema requires explicit publication config (`ALTER PUBLICATION supabase_realtime ADD TABLE rag.ingestion_jobs`)
- pgvector extension must be enabled manually in the Supabase dashboard before the migration runs

### Follow-up work
- Enable pgvector extension in Supabase dashboard
- Create `rag` schema migration with all tables, indexes, and RLS policies
- Add `ai-tutor-api/` to `.gitignore` for `venv/`, `__pycache__/`, `.env`
- Add pytest step to GitHub Actions CI pipeline
- Plan and execute Module 1 (App Shell)
