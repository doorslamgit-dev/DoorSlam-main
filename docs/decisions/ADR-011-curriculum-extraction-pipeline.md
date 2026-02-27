# ADR-011: LLM-Based Curriculum Extraction Pipeline

## Status
Accepted

## Date
2026-02-27

## Context
The `components`, `themes`, and `topics` tables are the backbone of Doorslam's curriculum data model. Session planning, timetabling, progress tracking, and AI Tutor topic-scoped retrieval all depend on these tables being populated with accurate, board-specific curriculum data.

GCSE specification PDFs are the authoritative source for curriculum structure — they define which papers exist (components), what topic areas each paper covers (themes), and what individual topics students must learn (topics). These specs vary significantly between exam boards (AQA uses numbered sections like 4.1.1, Edexcel uses content areas, OCR uses modules), making a rigid regex-based parser impractical.

With 30+ subjects across 5 exam boards, manual entry would be slow and error-prone. We need an automated, reusable pipeline that can process any spec PDF and produce structured curriculum data, with a human review step before production import.

## Decision

### 1. GPT-4o for curriculum extraction (not GPT-4o-mini)
Specification parsing requires deep reasoning — understanding document structure, distinguishing papers from topics from assessment objectives, and mapping the board's numbering scheme. GPT-4o handles this reliably where mini struggles with complex specs. Cost is low (~$0.10 per spec, run once per subject).

### 2. Staging table with status workflow
Extracted data goes to `curriculum_staging` (status: pending → review → approved → imported) rather than directly to production tables. This enables human review, re-extraction without corruption, and batch comparison. The normalization RPC (`rpc_normalize_curriculum_staging`) handles the staging → production move with ON CONFLICT idempotency.

### 3. Revision guide cross-validation
Save My Exams (SME) and Physics & Maths Tutor (PMT) revision guides are structured per-topic. Fuzzy-matching their filenames against extracted topics gives an automated confidence score. This doesn't replace human review but flags extraction errors early.

### 4. CLI pipeline (not API endpoint)
Curriculum extraction is an admin operation run per-subject during onboarding, not a runtime API call. A CLI script with clear workflow stages (--stage, --validate, --approve, --normalize) is more appropriate than an API endpoint.

### 5. Supporting tables populated alongside
The same spec PDF contains paper details (exam_papers), tier information (exam_pathways), and version metadata (exam_spec_versions). These are extracted and populated in the same pipeline run to avoid a separate process.

## Alternatives Considered

### Manual data entry from spec PDFs
Feasible for 5-10 subjects but does not scale to 30+ subjects across 5 boards. Error-prone for large specs (AQA Biology has ~100 topics).

### Regex-based PDF parsing per board
Each board uses a different format. Maintaining per-board regex parsers would be fragile and expensive to update when specs change. LLM generalises across formats.

### Direct production insert (no staging)
Risky — LLM output may contain errors. The staging table enables review and re-extraction without corrupting production data that sessions and timetables depend on.

## Consequences

### Positive
- Automated extraction: 30 seconds per spec (LLM call) instead of hours of manual entry
- Reusable: same pipeline works for any board/subject combination
- Quality assurance: staging review + revision guide cross-validation catch errors before production
- Idempotent: safe to re-run (ON CONFLICT upserts) — no duplicates
- Complete: also populates exam_spec_versions, exam_pathways, and exam_papers

### Negative
- LLM dependency: extraction quality depends on GPT-4o's understanding of spec document structure
- Cost: ~$0.10 per spec extraction (one-time cost per subject)
- Review overhead: human review of staging data is recommended (can be skipped for trusted extractions)

### Follow-up work
- Pilot with AQA Biology (8461) and AQA Maths (8300)
- Scale to all AQA subjects, then other boards
- Frontend admin UI for reviewing staging data (currently via Supabase dashboard)
- Cross-board canonical topic mapping (e.g., all boards' "Cell Structure" linked via canonical_topics table)
