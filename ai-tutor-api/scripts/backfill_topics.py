#!/usr/bin/env python3
"""Backfill topic_id on existing chunks using LLM classification.

Finds chunks where topic_id IS NULL, groups them by document, loads the
subject taxonomy, runs extraction, and updates each chunk in place.
Idempotent — skips chunks that already have a topic_id.

Usage:
    cd ai-tutor-api && ./venv/bin/python scripts/backfill_topics.py
    cd ai-tutor-api && ./venv/bin/python scripts/backfill_topics.py --subject-id <UUID>
    cd ai-tutor-api && ./venv/bin/python scripts/backfill_topics.py --dry-run
"""

import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from supabase import create_client  # noqa: E402

from src.config import settings  # noqa: E402
from src.services.metadata_extractor import extract_topics_for_chunks  # noqa: E402
from src.services.taxonomy import load_taxonomy  # noqa: E402


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def main():
    parser = argparse.ArgumentParser(description="Backfill topic_id on RAG chunks")
    parser.add_argument("--subject-id", help="Only process chunks for this subject")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without updating")
    args = parser.parse_args()

    sb = _get_supabase()

    # 1. Find chunks with NULL topic_id, grouped by document
    print("Querying chunks with NULL topic_id...")
    query = (
        sb.schema("rag")
        .table("chunks")
        .select("id, chunk_index, content, document_id, subject_id")
        .is_("topic_id", "null")
        .order("document_id")
    )
    if args.subject_id:
        query = query.eq("subject_id", args.subject_id)

    result = query.execute()
    chunks = result.data or []
    print(f"Found {len(chunks)} chunks with NULL topic_id")

    if not chunks:
        print("Nothing to backfill.")
        return

    # 2. Group by document_id
    doc_chunks: dict[str, list[dict]] = {}
    for chunk in chunks:
        doc_id = chunk["document_id"]
        doc_chunks.setdefault(doc_id, []).append(chunk)

    print(f"Spread across {len(doc_chunks)} documents")

    # 3. Process each document
    total_classified = 0
    total_skipped = 0

    for doc_id, doc_chunk_list in doc_chunks.items():
        subject_id = doc_chunk_list[0].get("subject_id")
        if not subject_id:
            print(f"  Skipping doc {doc_id[:8]}... — no subject_id")
            total_skipped += len(doc_chunk_list)
            continue

        # Load taxonomy
        try:
            taxonomy = load_taxonomy(subject_id)
        except Exception as exc:
            print(f"  Skipping doc {doc_id[:8]}... — taxonomy load failed: {exc}")
            total_skipped += len(doc_chunk_list)
            continue

        if not taxonomy.topics:
            print(f"  Skipping doc {doc_id[:8]}... — no topics for subject {taxonomy.subject_name}")
            total_skipped += len(doc_chunk_list)
            continue

        # Get document metadata for extraction context
        doc_result = (
            sb.schema("rag")
            .table("documents")
            .select("title, source_type")
            .eq("id", doc_id)
            .execute()
        )
        if not doc_result.data:
            print(f"  Skipping doc {doc_id[:8]}... — document row not found")
            total_skipped += len(doc_chunk_list)
            continue

        doc_title = doc_result.data[0]["title"]
        source_type = doc_result.data[0]["source_type"]

        # Extract topics
        chunk_tuples = [(c["chunk_index"], c["content"]) for c in doc_chunk_list]
        try:
            results = await extract_topics_for_chunks(
                chunks=chunk_tuples,
                taxonomy=taxonomy,
                source_type=source_type,
                doc_title=doc_title,
            )
        except Exception as exc:
            print(f"  Extraction failed for doc {doc_id[:8]}... ({doc_title}): {exc}")
            total_skipped += len(doc_chunk_list)
            continue

        # Build topic map
        threshold = settings.extraction_confidence_threshold
        topic_map: dict[int, str] = {}
        for r in results:
            if r.primary_topic and r.primary_topic.confidence >= threshold:
                topic_map[r.chunk_index] = r.primary_topic.topic_id

        classified = len(topic_map)
        total_classified += classified
        print(
            f"  Doc {doc_id[:8]}... ({doc_title}): "
            f"{classified}/{len(doc_chunk_list)} chunks classified"
        )

        if args.dry_run:
            continue

        # Update chunks in DB
        chunk_id_by_index = {c["chunk_index"]: c["id"] for c in doc_chunk_list}
        for chunk_index, topic_id in topic_map.items():
            chunk_id = chunk_id_by_index.get(chunk_index)
            if chunk_id:
                sb.schema("rag").table("chunks").update({
                    "topic_id": topic_id,
                }).eq("id", chunk_id).execute()

    print(f"\nDone — {total_classified} chunks classified, {total_skipped} skipped")
    if args.dry_run:
        print("(dry run — no database changes made)")


if __name__ == "__main__":
    asyncio.run(main())
