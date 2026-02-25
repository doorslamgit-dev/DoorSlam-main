#!/usr/bin/env python3
"""Backfill document enrichment (summary + key_points) and chunk_type.

Re-processes existing documents through:
1. Re-parse with Docling (better text extraction)
2. Generate document summary + key_points via LLM
3. Re-classify chunks with chunk_type
4. Update DB

Idempotent — skips documents that already have a summary unless --force.

Usage:
    cd ai-tutor-api && ./venv/bin/python scripts/backfill_enrichment.py
    cd ai-tutor-api && ./venv/bin/python scripts/backfill_enrichment.py --dry-run
    cd ai-tutor-api && ./venv/bin/python scripts/backfill_enrichment.py --force
    cd ai-tutor-api && ./venv/bin/python scripts/backfill_enrichment.py --subject-id <UUID>
"""

import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from supabase import create_client  # noqa: E402

from src.config import settings  # noqa: E402
from src.services.document_enricher import enrich_document  # noqa: E402
from src.services.metadata_extractor import extract_topics_for_chunks  # noqa: E402
from src.services.taxonomy import load_taxonomy  # noqa: E402


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def main():
    parser = argparse.ArgumentParser(description="Backfill document enrichment and chunk_type")
    parser.add_argument("--subject-id", help="Only process documents for this subject")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done")
    parser.add_argument("--force", action="store_true", help="Re-enrich documents that already have a summary")
    args = parser.parse_args()

    sb = _get_supabase()

    # 1. Find documents to enrich
    print("Querying documents...")
    query = (
        sb.schema("rag")
        .table("documents")
        .select("id, title, source_type, doc_type, subject_id, summary")
        .eq("status", "completed")
        .order("created_at")
    )
    if args.subject_id:
        query = query.eq("subject_id", args.subject_id)

    result = query.execute()
    all_docs = result.data or []

    if not args.force:
        docs = [d for d in all_docs if not d.get("summary")]
    else:
        docs = all_docs

    print(f"Found {len(docs)} documents to enrich (of {len(all_docs)} total)")

    if not docs:
        print("Nothing to backfill.")
        return

    total_enriched = 0
    total_chunks_typed = 0
    total_failed = 0

    for i, doc in enumerate(docs, 1):
        doc_id = doc["id"]
        title = doc["title"]
        source_type = doc["source_type"]
        doc_type = doc.get("doc_type")
        subject_id = doc.get("subject_id")

        print(f"\n[{i}/{len(docs)}] {title} ({doc_type or 'unknown'})")

        # 2. Load chunks for this document (need content for enrichment)
        chunks_result = (
            sb.schema("rag")
            .table("chunks")
            .select("id, chunk_index, content, subject_id")
            .eq("document_id", doc_id)
            .order("chunk_index")
            .execute()
        )
        chunk_list = chunks_result.data or []

        if not chunk_list:
            print(f"  No chunks found, skipping")
            continue

        # Reconstruct text from chunks for enrichment
        full_text = "\n\n".join(c["content"] for c in chunk_list)

        # 3. Enrich document
        try:
            enrichment = await enrich_document(full_text, title, doc_type, source_type)
            print(f"  Summary: {enrichment.summary[:80]}..." if len(enrichment.summary) > 80 else f"  Summary: {enrichment.summary}")
            print(f"  Key points: {len(enrichment.key_points)} items")
        except Exception as exc:
            print(f"  Enrichment failed: {exc}")
            total_failed += 1
            continue

        # 4. Classify chunk_types (if subject has taxonomy)
        chunk_type_map: dict[int, str] = {}
        if subject_id:
            try:
                taxonomy = load_taxonomy(subject_id)
                if taxonomy.topics:
                    chunk_tuples = [(c["chunk_index"], c["content"]) for c in chunk_list]
                    results = await extract_topics_for_chunks(
                        chunks=chunk_tuples,
                        taxonomy=taxonomy,
                        source_type=source_type,
                        doc_title=title,
                    )
                    for r in results:
                        chunk_type_map[r.chunk_index] = r.chunk_type
                    typed = sum(1 for ct in chunk_type_map.values() if ct != "general")
                    print(f"  Chunk types: {typed}/{len(chunk_list)} non-general")
            except Exception as exc:
                print(f"  Chunk type classification failed: {exc}")

        if args.dry_run:
            total_enriched += 1
            total_chunks_typed += len(chunk_type_map)
            continue

        # 5. Update document with enrichment
        sb.schema("rag").table("documents").update({
            "summary": enrichment.summary,
            "key_points": enrichment.key_points,
        }).eq("id", doc_id).execute()
        total_enriched += 1

        # 6. Update chunk metadata with chunk_type
        for chunk in chunk_list:
            chunk_type = chunk_type_map.get(chunk["chunk_index"], "general")
            sb.schema("rag").table("chunks").update({
                "metadata": {"chunk_type": chunk_type},
            }).eq("id", chunk["id"]).execute()
            total_chunks_typed += 1

    print(f"\nDone — {total_enriched} documents enriched, {total_chunks_typed} chunks typed, {total_failed} failed")
    if args.dry_run:
        print("(dry run — no database changes made)")


if __name__ == "__main__":
    asyncio.run(main())
