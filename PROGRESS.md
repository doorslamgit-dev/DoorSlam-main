# AI Tutor Platform — Module Progress

> Tracks the status of each module in the RAG-powered AI Tutor build.
> Updated after each module completes.

| # | Module | Status | Complexity | Notes |
|---|--------|--------|-----------|-------|
| 1 | App Shell — Auth, chat UI, SSE streaming | Pending | TBD | FastAPI scaffold, JWT auth, AiTutorSlot replacement |
| 2 | BYO Retrieval + Memory — Ingestion, pgvector | Pending | TBD | Google Drive loader, chunking, embedding, retriever |
| 3 | Record Manager — Content hashing, deduplication | Pending | TBD | |
| 4 | Metadata Extraction — LLM-extracted metadata | Pending | TBD | Subject/topic/exam board from Drive path + content |
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
