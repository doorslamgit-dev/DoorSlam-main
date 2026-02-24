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

    # Check job status
    ./venv/bin/python scripts/ingest.py --status <JOB_ID>
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
    print(f"\nJob: {job['id']}")
    print(f"Label: {job.get('batch_label', 'N/A')}")
    print(f"Status: {job['status']}")
    print(f"Progress: {job.get('processed_documents', 0)}/{job.get('total_documents', 0)}")
    print(f"Failed: {job.get('failed_documents', 0)}")
    print(f"Total chunks: {job.get('total_chunks', 0)}")

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


def main():
    parser = argparse.ArgumentParser(description="Doorslam RAG ingestion CLI")
    parser.add_argument("--folder-id", help="Google Drive folder ID to ingest from")
    parser.add_argument("--label", help="Batch label for this ingestion run")
    parser.add_argument("--concurrency", type=int, default=5, help="Max parallel tasks")
    parser.add_argument("--status", help="Check status of a job by ID")
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
    elif args.folder_id:
        asyncio.run(
            run_ingestion(args.folder_id, args.label, args.concurrency, args.root_path)
        )
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
