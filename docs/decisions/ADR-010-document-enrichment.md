# ADR-010: Document Enrichment and Chunk-Type Classification

## Status
Accepted

## Date
2026-02-25

## Context
The AI Tutor's retrieval context was thin. The chat LLM received source labels like `[Source 1: AQA Biology Paper 1 (past_paper)]` with raw text content — it didn't know whether a chunk contained a question, marking criteria, or examiner feedback. There were no document-level summaries, so there was no way to understand a document's scope without reading all its chunks. This limited the quality of citations and made it harder for the LLM to contextualise its responses.

We needed:
1. Document-level metadata (summary, key_points) generated during ingestion
2. Per-chunk content type classification (question, marking_criteria, grade_table, etc.)
3. Richer retrieval labels so the chat LLM knows what it's citing

## Decision
Add two new enrichment layers to the ingestion pipeline:

### Document enrichment (`document_enricher.py`)
- LLM-based (GPT-4o-mini) document-level metadata extraction
- Doc-type-specific prompts: each document type (qp, ms, gt, er, spec, rev) gets a tailored prompt that extracts relevant structured data
- Returns `DocumentEnrichment(summary, key_points)` where key_points schema varies by doc_type
- Runs in parallel with text chunking (both need the full parsed text, but are independent)
- Feature flag: `ENRICHMENT_ENABLED=false` returns empty enrichment

### Chunk-type classification
- Extended the existing topic extraction LLM call (Module 4's `metadata_extractor.py`) to also classify chunk content type
- 12 valid types: question, answer, marking_criteria, grade_table, examiner_comment, definition, explanation, worked_example, learning_objective, practical, data_table, general
- Bundled with the existing topic extraction prompt — no additional LLM call needed
- Stored in `chunks.metadata` JSONB: `{"chunk_type": "question"}`

### Richer retrieval
- Source labels now include year, session, paper number, and chunk content type
- Frontend SSE sources include year, session, doc_type, file_key for download links

## Alternatives Considered
1. **Separate LLM call for chunk-type**: Would double LLM costs during ingestion. Bundling with topic extraction is free.
2. **Rule-based chunk-type detection**: Could handle some cases (e.g., "Q1." prefix → question) but would miss nuanced content like examiner comments embedded in paragraphs.
3. **Document summary from first chunk**: Too narrow — a 20-page paper's first chunk is often front matter or instructions.
4. **GPT-4o for enrichment**: Higher quality but 10x cost. GPT-4o-mini produces adequate summaries at ~$0.002 per document.

## Consequences

### Positive
- Chat LLM now knows what type of content it's citing (question vs marking criteria vs examiner advice)
- Document summaries enable future features: document browsing, search results preview, collection summaries
- Doc-type-specific key_points provide structured metadata (question breakdowns, grade boundaries, etc.)
- No additional LLM cost for chunk-type classification (bundled with existing topic extraction)
- Enrichment cost is minimal: ~$0.002 per document via GPT-4o-mini
- Feature flags allow independent rollback of enrichment without affecting parsing or topic extraction

### Negative
- Adds ~200ms latency per document during ingestion (enrichment LLM call) — mitigated by running in parallel with chunking
- key_points schema varies by doc_type — consumers must handle different structures
- Summary quality depends on first ~4000 tokens being representative of the document

### Follow-up work
- Frontend UI to display document summaries and key_points in a document browser
- Use key_points for structured search (e.g., "find questions on cell biology worth 6+ marks")
- Consider caching enrichment results to avoid re-processing during backfill
