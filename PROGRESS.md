# AI Tutor Platform — Module Progress

> Tracks the status of each module in the RAG-powered AI Tutor build.
> Updated after each module completes.

| # | Module | Status | Complexity | Notes |
|---|--------|--------|-----------|-------|
| 1 | App Shell — Auth, chat UI, SSE streaming | **Done** | Medium | FastAPI + JWT auth + SSE chat + Supabase persistence |
| 2 | BYO Retrieval + Memory — Ingestion, pgvector | **Done** | High | Drive walker, chunker, embedder, retrieval, source citations, memory trimming. E2E validated: AQA Biology 8461 (110 chunks), 3-4s latency, markdown rendering, inline citations |
| 3 | Record Manager — Change detection, incremental sync | **Done** | Medium | Drive identity tracking, sync orchestrator, soft-delete lifecycle, 20 new tests. 118 backend tests passing |
| 4 | Metadata Extraction — LLM-based topic classification | **Done** | Medium | GPT-4o-mini chunk-level classification, parallel with embedding, backfill script, enhanced retrieval filters. 134 backend tests passing |
| 5 | Multi-Format Support — PDF, DOCX, HTML, Markdown | Pending | TBD | Docling integration |
| 6 | Hybrid Search & Reranking — Keyword + vector, RRF | Pending | TBD | |
| 7 | Additional Tools — Text-to-SQL, web search | Pending | TBD | |
| 8 | Subagents — Isolated context, document analysis | Pending | TBD | |

## Development Cycle Per Module

```
Plan → Build → Validate → Iterate → Document → Commit
```

Each module plan lives in `.agent/plans/{N}.{name}.md`.

## Branch

`feature/ai-tutor-platform` (based off `develop`)

## Key Decisions

- Same Supabase project, `rag` schema (ADR-007)
- Python/FastAPI backend in `ai-tutor-api/` subdirectory
- Shared content corpus (not per-user uploads)
- StudyBuddy v1 stays as-is; migration is a separate future task
