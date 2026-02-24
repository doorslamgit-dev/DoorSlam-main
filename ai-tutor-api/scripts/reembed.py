#!/usr/bin/env python3
"""Re-embed all existing chunks with the current embedding model.

Run this after switching embedding providers (e.g., Qwen → OpenAI).
The vector space changes, so all stored embeddings must be regenerated.

Usage:
    cd ai-tutor-api && ./venv/bin/python scripts/reembed.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import settings  # noqa: E402
from src.services.embedder import embed_chunks  # noqa: E402
from supabase import create_client  # noqa: E402


async def main():
    sb = create_client(settings.supabase_url, settings.supabase_service_role_key)

    # Fetch all chunks with content
    print("Fetching chunks...")
    result = (
        sb.schema("rag")
        .table("chunks")
        .select("id, content")
        .order("created_at")
        .execute()
    )

    chunks = result.data or []
    print(f"Found {len(chunks)} chunks to re-embed")

    if not chunks:
        print("Nothing to do.")
        return

    # Embed in batches
    texts = [c["content"] for c in chunks]
    print(f"Embedding with {settings.embedding_model} ({settings.embedding_dimensions} dims)...")
    embeddings = await embed_chunks(texts)
    print(f"Generated {len(embeddings)} embeddings")

    # Update each chunk
    updated = 0
    for chunk, embedding in zip(chunks, embeddings):
        sb.schema("rag").table("chunks").update({
            "embedding": embedding,
        }).eq("id", chunk["id"]).execute()
        updated += 1
        if updated % 20 == 0:
            print(f"  Updated {updated}/{len(chunks)}")

    print(f"\nDone — {updated} chunks re-embedded.")


if __name__ == "__main__":
    asyncio.run(main())
