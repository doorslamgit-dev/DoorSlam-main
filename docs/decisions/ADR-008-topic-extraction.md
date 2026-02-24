# ADR-008: LLM-Based Topic Extraction for RAG Chunks

## Status
Accepted

## Date
2026-02-24

## Context
The AI Tutor RAG pipeline ingests exam documents (past papers, specifications, revision notes) and stores them as vector-embedded chunks. Each chunk has a `topic_id` column intended to map to the curriculum hierarchy (`public.topics`), but all values were NULL. The Postgres `search_chunks()` function already supported `filter_topic_id`, but it had no data to filter on.

Without topic-level metadata, retrieval is limited to subject-scoped search — returning chunks from across the entire curriculum. For a GCSE revision platform, topic-precise retrieval is critical: a student asking about mitosis should get Cell Division content, not Ecology.

## Decision

### 1. Chunk-level extraction (not document-level)
Past papers and revision guides span many topics within a single document. Assigning one topic per document would be too coarse. Each chunk is independently classified against the taxonomy.

### 2. GPT-4o-mini for classification
Selected for the cost/speed tradeoff. Classification is a straightforward structured task (map text → numbered topic from a list). GPT-4o-mini handles this reliably at ~$0.01 per 100 chunks, compared to ~$0.30 for GPT-4o. JSON mode ensures parseable output.

### 3. Confidence threshold (0.5)
Chunks classified with confidence below 0.5 retain `topic_id = NULL` rather than receiving a potentially incorrect classification. This prevents mis-tagged chunks from polluting filtered searches. The threshold is configurable via `EXTRACTION_CONFIDENCE_THRESHOLD`.

### 4. Parallel embedding + extraction
Embedding and topic extraction are independent operations. Running them concurrently via `asyncio.create_task` means extraction adds zero wall-clock time to ingestion (both complete in ~1-2 seconds for typical batches).

### 5. Feature flag for safe rollback
`EXTRACTION_ENABLED=false` disables the extraction step entirely. Ingestion continues normally with `topic_id = NULL`, matching pre-Module 4 behaviour.

## Alternatives Considered

### Embedding-based classification (k-NN against topic embeddings)
Embed each topic name/description, then find the nearest topic for each chunk using cosine similarity. Rejected because: (a) topic names alone are often too short for good embeddings, (b) requires maintaining a separate topic embedding index, (c) LLM classification with the full taxonomy context is more accurate for ambiguous cases.

### Document-level topic assignment
Assign one topic to the entire document, propagate to all chunks. Rejected because past papers routinely span 5-15 topics per document. This would make topic filtering ineffective.

### Manual tagging during upload
Require the uploader to tag each document with its topic(s). Rejected because: (a) doesn't scale to hundreds of documents, (b) can't handle per-chunk granularity, (c) adds friction to the ingestion workflow.

## Consequences

### Positive
- Topic-scoped retrieval: students get chunks from the specific topic they're studying
- Automatic classification: no manual tagging required
- Low cost: ~$0.01 per 100 chunks with GPT-4o-mini
- No added latency: parallel execution with embedding
- Backfill capability: existing chunks can be classified via `scripts/backfill_topics.py`

### Negative
- LLM dependency: classification quality depends on GPT-4o-mini's understanding of GCSE curriculum
- Cost scales linearly: every new document incurs a small classification cost
- Confidence threshold may need tuning per subject/board

### Follow-up work
- Run backfill script on existing corpus to populate topic_id
- Frontend: expose topic, source_type, and year filters in the AI Tutor panel
- Monitor classification accuracy and adjust confidence threshold if needed
- Consider caching extraction results for re-ingested documents with unchanged content
