# ADR-009: Docling Multi-Format Parser

## Status
Accepted

## Date
2026-02-25

## Context
The existing parser used PyMuPDF for PDFs (plain text extraction, no table support) and python-docx for DOCX (paragraphs only, no tables). Tables in grade boundary documents and mark schemes were silently destroyed during parsing, producing chunks with meaningless fragments. The system also lacked support for PPTX, XLSX, CSV, HTML, LaTeX, and image formats that may appear in the content corpus.

We needed a parser that could:
1. Preserve table structure in PDFs (grade boundaries, mark allocations)
2. Support a wide range of document formats from a single library
3. Output structured text suitable for chunking and LLM consumption
4. Degrade gracefully if the new parser fails on a specific file

## Decision
Replace the primary parsing path with IBM's Docling library (v2.x), outputting structured Markdown. Docling converts documents to an internal representation and exports to Markdown with tables preserved as `| col | col |` pipe syntax. This feeds naturally into the existing text chunker (with updated Markdown-aware separators).

Key design choices:
- **Lazy singleton with double-checked locking**: Docling's `DocumentConverter` loads ML models on first use. A thread-safe singleton avoids repeated initialisation across concurrent requests.
- **Per-file fallback**: If Docling fails on a specific file, the system falls back to legacy parsers (PyMuPDF, python-docx, UTF-8) for formats that have them. One file failing doesn't disable Docling globally.
- **Feature flag**: `DOCLING_ENABLED=false` bypasses Docling entirely, reverting to legacy parsers for all files.
- **Markdown output**: Docling's Markdown export preserves tables, headings, and structure. The chunker's separators were updated to split on Markdown headings (`## `, `### `) before paragraph breaks.

## Alternatives Considered
1. **Unstructured.io**: More mature ecosystem but heavier dependencies, commercial licensing for advanced features, and less control over output format.
2. **LlamaParse**: Cloud-based, adds external dependency and latency. Not suitable for self-hosted deployments.
3. **Custom table extraction (Camelot/Tabula)**: PDF-only, requires separate integration per format. Docling handles all formats uniformly.
4. **Keep PyMuPDF + add table extraction**: Would only solve PDF tables, not multi-format support.

## Consequences

### Positive
- Tables in PDFs are preserved as Markdown — grade boundaries, mark allocations, and data tables are now searchable and citable
- Single library handles 15+ file formats (PDF, DOCX, PPTX, XLSX, CSV, HTML, LaTeX, images)
- Markdown output improves chunking quality (headings as natural split points)
- Per-file fallback ensures resilience — legacy parsers remain available
- Feature flag allows instant rollback without code changes

### Negative
- Docling adds ~500MB to the deployment (PyTorch dependency for table structure models)
- First parse is slow (~5s) due to model loading; subsequent parses are fast via singleton
- Docling is relatively new (v2.x) — API may change between minor versions
- OCR and "accurate" table mode require additional configuration and compute

### Follow-up work
- Monitor Docling updates for API stability
- Consider enabling OCR (`DOCLING_DO_OCR=true`) for scanned exam papers
- Evaluate "accurate" table mode for grade boundary documents where precision matters
