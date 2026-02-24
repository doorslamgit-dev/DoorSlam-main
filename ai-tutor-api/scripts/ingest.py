#!/usr/bin/env python3
"""CLI for ingesting documents from Google Drive into the RAG pipeline.

Usage:
    # Ingest all files from the shared drive root
    ./venv/bin/python scripts/ingest.py --folder-id <ROOT_FOLDER_ID> --label "full-corpus"

    # Ingest from a subfolder (provide ancestor path for metadata)
    ./venv/bin/python scripts/ingest.py \
        --folder-id <SPEC_FOLDER_ID> \
        --root-path "AQA/GCSE/Biology(8461)/spec" \
        --label "test-biology-spec" --concurrency 1

    # Incremental sync (only process new/modified/deleted files)
    ./venv/bin/python scripts/ingest.py --sync --folder-id <ID> --label "nightly-sync"

    # Check job status
    ./venv/bin/python scripts/ingest.py --status <JOB_ID>

    # Clean up soft-deleted documents older than 30 days
    ./venv/bin/python scripts/ingest.py --cleanup --older-than 30
"""

import argparse
import asyncio
import sys
from pathlib import Path

# Add project root to path so imports work
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import settings  # noqa: E402
from supabase import create_client  # noqa: E402


def check_status(job_id: str) -> None:
    """Print the status of an ingestion job."""
    sb = create_client(settings.supabase_url, settings.supabase_service_role_key)
    result = (
        sb.schema("rag")
        .table("ingestion_jobs")
        .select("*")
        .eq("id", job_id)
        .execute()
    )

    if not result.data:
        print(f"Job not found: {job_id}")
        sys.exit(1)

    job = result.data[0]
    job_type = job.get("job_type", "batch")
    print(f"\nJob: {job['id']} ({job_type})")
    print(f"Label: {job.get('batch_label', 'N/A')}")
    print(f"Status: {job['status']}")
    print(f"Progress: {job.get('processed_documents', 0)}/{job.get('total_documents', 0)}")
    print(f"Failed: {job.get('failed_documents', 0)}")
    print(f"Total chunks: {job.get('total_chunks', 0)}")

    sync_stats = job.get("sync_stats")
    if sync_stats and isinstance(sync_stats, dict):
        print(f"\nSync stats:")
        print(f"  Added: {sync_stats.get('added', 0)}")
        print(f"  Updated: {sync_stats.get('updated', 0)}")
        print(f"  Deleted: {sync_stats.get('deleted', 0)}")
        print(f"  Unchanged: {sync_stats.get('unchanged', 0)}")

    errors = job.get("error_log", [])
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for err in errors[:10]:
            print(f"  - {err.get('file', '?')}: {err.get('error', '?')}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more")


async def run_ingestion(
    folder_id: str, label: str | None, concurrency: int, root_path: str
) -> None:
    """Run the batch ingestion pipeline."""
    from src.services.batch_ingestion import ingest_from_drive

    print(f"Starting ingestion from Drive folder: {folder_id}")
    if root_path:
        print(f"Root path prefix: {root_path}")
    print(f"Label: {label or 'N/A'}, Concurrency: {concurrency}")
    print()

    job_id = await ingest_from_drive(
        root_folder_id=folder_id,
        batch_label=label,
        concurrency=concurrency,
        root_path=root_path,
    )

    print(f"\nIngestion complete. Job ID: {job_id}")
    print(f"Check status: ./venv/bin/python scripts/ingest.py --status {job_id}")


async def run_sync(
    folder_id: str, label: str | None, concurrency: int, root_path: str
) -> None:
    """Run incremental sync — only process new/modified/deleted files."""
    from src.services.sync import sync_from_drive

    print(f"Starting incremental sync from Drive folder: {folder_id}")
    if root_path:
        print(f"Root path prefix: {root_path}")
    print(f"Label: {label or 'N/A'}, Concurrency: {concurrency}")
    print()

    job_id = await sync_from_drive(
        root_folder_id=folder_id,
        batch_label=label,
        concurrency=concurrency,
        root_path=root_path,
    )

    print(f"\nSync complete. Job ID: {job_id}")
    print(f"Check status: ./venv/bin/python scripts/ingest.py --status {job_id}")


def run_cleanup(older_than_days: int) -> None:
    """Hard-delete soft-deleted documents older than N days."""
    from src.services.ingestion import cleanup_deleted_documents

    print(f"Cleaning up soft-deleted documents older than {older_than_days} days...")
    count = cleanup_deleted_documents(older_than_days=older_than_days)
    print(f"Deleted {count} document(s) and their chunks.")


def main():
    parser = argparse.ArgumentParser(description="Doorslam RAG ingestion CLI")
    parser.add_argument("--folder-id", help="Google Drive folder ID to ingest from")
    parser.add_argument("--label", help="Batch label for this ingestion run")
    parser.add_argument("--concurrency", type=int, default=5, help="Max parallel tasks")
    parser.add_argument("--status", help="Check status of a job by ID")
    parser.add_argument("--sync", action="store_true", help="Incremental sync (not full batch)")
    parser.add_argument("--cleanup", action="store_true", help="Hard-delete stale soft-deleted docs")
    parser.add_argument("--older-than", type=int, default=30, help="Days threshold for cleanup")
    parser.add_argument(
        "--root-path",
        default="",
        help=(
            "Path prefix for ancestor folders above the start folder. "
            'e.g., "AQA/GCSE/Biology(8461)/spec" when starting from a spec subfolder. '
            "Required when --folder-id is not the root shared drive folder."
        ),
    )

    args = parser.parse_args()

    if args.status:
        check_status(args.status)
    elif args.cleanup:
        run_cleanup(args.older_than)
    elif args.folder_id and args.sync:
        asyncio.run(
            run_sync(args.folder_id, args.label, args.concurrency, args.root_path)
        )
    elif args.folder_id:
        asyncio.run(
            run_ingestion(args.folder_id, args.label, args.concurrency, args.root_path)
        )
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
