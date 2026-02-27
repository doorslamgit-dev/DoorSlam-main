#!/usr/bin/env python3
"""CLI for extracting curriculum hierarchy from specification PDFs.

Usage:
    # Dry run — extract and print without writing to database
    ./venv/bin/python scripts/extract_curriculum.py --spec-code 8461 --dry-run

    # Stage — extract and write to curriculum_staging
    ./venv/bin/python scripts/extract_curriculum.py --spec-code 8461 --stage

    # Stage from local file instead of Drive
    ./venv/bin/python scripts/extract_curriculum.py --spec-code 8461 --stage --file path/to/spec.pdf

    # Validate — cross-reference staged data against revision guides
    ./venv/bin/python scripts/extract_curriculum.py --spec-code 8461 --validate --drive-folder-id <ID>

    # Approve — mark all staged rows as approved
    ./venv/bin/python scripts/extract_curriculum.py --spec-code 8461 --approve

    # Normalize — move approved staging rows into production tables
    ./venv/bin/python scripts/extract_curriculum.py --spec-code 8461 --normalize

    # Check — show current state of staging data for a spec
    ./venv/bin/python scripts/extract_curriculum.py --spec-code 8461 --check
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path
from uuid import uuid4

# Add project root to path so imports work
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from supabase import create_client  # noqa: E402

from src.config import settings  # noqa: E402
from src.services.curriculum_extractor import (  # noqa: E402
    CurriculumExtraction,
    extract_curriculum,
    extraction_to_dict,
)
from src.services.parser import parse_document  # noqa: E402


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


# ---------------------------------------------------------------------------
# Prerequisite checks
# ---------------------------------------------------------------------------

def check_prerequisites(spec_code: str) -> dict:
    """Verify the subject exists in the database and return its metadata.

    Returns dict with subject_id, subject_name, exam_board_name, qualification_code.
    Raises SystemExit if prerequisites are not met.
    """
    sb = _get_supabase()

    # Look up subject by spec_code
    result = (
        sb.table("subjects")
        .select("id, subject_name, exam_board_id, qualification_id, spec_code, code")
        .or_(f"spec_code.eq.{spec_code},code.ilike.{spec_code}")
        .execute()
    )

    if not result.data:
        print(f"\nERROR: No subject found with spec_code or code = '{spec_code}'")
        print("Prerequisites:")
        print("  1. A row must exist in 'qualifications' (GCSE, IGCSE, etc.)")
        print("  2. A row must exist in 'exam_boards' (AQA, Edexcel, etc.)")
        print("  3. A row must exist in 'subjects' with the matching spec_code")
        print("\nCheck: SELECT * FROM subjects WHERE spec_code = '...' OR code ILIKE '...';")
        sys.exit(1)

    subject = result.data[0]

    # Look up exam board name
    board = sb.table("exam_boards").select("name, code").eq("id", subject["exam_board_id"]).execute()
    board_name = board.data[0]["name"] if board.data else "Unknown"
    board_code = board.data[0]["code"] if board.data else "Unknown"

    # Look up qualification
    qual = sb.table("qualifications").select("code, name").eq("id", subject["qualification_id"]).execute()
    qual_code = qual.data[0]["code"] if qual.data else "Unknown"

    info = {
        "subject_id": subject["id"],
        "subject_name": subject["subject_name"],
        "exam_board_name": board_name,
        "exam_board_code": board_code,
        "qualification_code": qual_code,
        "spec_code": subject.get("spec_code") or subject.get("code"),
    }

    print(f"\nSubject: {info['exam_board_name']} {info['qualification_code']} "
          f"{info['subject_name']} ({info['spec_code']})")
    print(f"Subject ID: {info['subject_id']}")

    return info


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

async def cmd_extract(spec_code: str, file_path: str | None, dry_run: bool) -> None:
    """Extract curriculum from a specification PDF and optionally stage it."""
    info = check_prerequisites(spec_code)

    # Get spec text
    if file_path:
        print(f"\nReading spec from local file: {file_path}")
        with open(file_path, "rb") as f:
            file_bytes = f.read()
        parsed = parse_document(file_bytes, Path(file_path).name)
    else:
        # Look for spec in rag.documents
        sb = _get_supabase()
        result = (
            sb.schema("rag")
            .table("documents")
            .select("id, title, status")
            .eq("subject_id", info["subject_id"])
            .eq("source_type", "specification")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not result.data:
            print("\nERROR: No specification document found in rag.documents for this subject.")
            print("Options:")
            print("  1. Ingest the spec via: python scripts/ingest.py --folder-id <SPEC_FOLDER>")
            print("  2. Use --file flag to provide a local PDF path")
            sys.exit(1)

        doc = result.data[0]
        print(f"\nFound spec document: {doc['title']} (status: {doc['status']})")

        # Get the full text from chunks
        chunks = (
            sb.schema("rag")
            .table("chunks")
            .select("content, chunk_index")
            .eq("document_id", doc["id"])
            .order("chunk_index")
            .execute()
        )

        if not chunks.data:
            print("ERROR: No chunks found for this document. Has it been ingested?")
            sys.exit(1)

        spec_text = "\n\n".join(c["content"] for c in chunks.data)
        print(f"Assembled spec text from {len(chunks.data)} chunks ({len(spec_text)} chars)")

        class FakeDoc:
            text = spec_text
        parsed = FakeDoc()

    # Run extraction
    print(f"\nExtracting curriculum using model: {settings.curriculum_extraction_model}...")
    extraction = await extract_curriculum(parsed.text, spec_code=spec_code)

    # Print summary
    print(f"\n{'=' * 60}")
    print(f"Extraction Result: {extraction.exam_board} {extraction.qualification} "
          f"{extraction.subject_name}")
    print(f"{'=' * 60}")
    print(f"Spec version: {extraction.spec_version or 'N/A'}")
    print(f"First teaching: {extraction.first_teaching or 'N/A'}")
    print(f"Components: {len(extraction.components)}")
    for comp in extraction.components:
        theme_count = len(comp.themes)
        topic_count = sum(len(t.topics) for t in comp.themes)
        print(f"  {comp.order}. {comp.name} ({comp.weighting or 'N/A'}) "
              f"— {theme_count} themes, {topic_count} topics")
        for theme in comp.themes:
            print(f"    {theme.order}. {theme.name} ({len(theme.topics)} topics)")
    print(f"Pathways: {[p.name for p in extraction.pathways] or 'None (untiered)'}")
    print(f"Papers: {len(extraction.papers)}")
    print(f"Total topics: {extraction.total_topics}")

    if dry_run:
        print(f"\n{'─' * 60}")
        print("DRY RUN — no data written to database.")
        print("Use --stage instead of --dry-run to write to curriculum_staging.")
        # Optionally dump JSON
        print(f"\nJSON output:")
        print(json.dumps(extraction_to_dict(extraction), indent=2))
        return

    # Stage to database
    batch_id = str(uuid4())
    rows = extraction.to_staging_rows(info["subject_id"])

    # Add batch_id and status to each row
    for row in rows:
        row["extraction_batch_id"] = batch_id
        row["status"] = "pending"

    sb = _get_supabase()
    sb.table("curriculum_staging").insert(rows).execute()

    print(f"\n{'─' * 60}")
    print(f"Staged {len(rows)} rows to curriculum_staging")
    print(f"Batch ID: {batch_id}")
    print(f"Status: pending (run --validate or --approve next)")

    # Also populate supporting tables
    await _populate_supporting_tables(info, extraction)


async def _populate_supporting_tables(info: dict, extraction: CurriculumExtraction) -> None:
    """Insert exam_spec_versions, exam_pathways, and exam_papers from extraction."""
    sb = _get_supabase()
    subject_id = info["subject_id"]

    # 1. exam_spec_versions
    if extraction.spec_version:
        existing = (
            sb.table("exam_spec_versions")
            .select("id")
            .eq("subject_id", subject_id)
            .eq("is_current", True)
            .execute()
        )
        if not existing.data:
            sb.table("exam_spec_versions").insert({
                "subject_id": subject_id,
                "spec_version": extraction.spec_version,
                "effective_from": f"{extraction.spec_version}-09-01" if extraction.spec_version.isdigit() else None,
                "is_current": True,
            }).execute()
            print(f"  Created exam_spec_version: {extraction.spec_version}")
        else:
            print(f"  exam_spec_version already exists (id: {existing.data[0]['id']})")

    # 2. exam_pathways
    for pathway in extraction.pathways:
        existing = (
            sb.table("exam_pathways")
            .select("id")
            .eq("subject_id", subject_id)
            .ilike("pathway_code", pathway.code)
            .execute()
        )
        if not existing.data:
            sb.table("exam_pathways").insert({
                "subject_id": subject_id,
                "pathway_code": pathway.code,
                "pathway_name": pathway.name,
                "is_required_choice": True,
            }).execute()
            print(f"  Created exam_pathway: {pathway.name}")
        else:
            print(f"  exam_pathway '{pathway.name}' already exists")

    # 3. exam_papers (requires spec_version)
    spec_version_result = (
        sb.table("exam_spec_versions")
        .select("id")
        .eq("subject_id", subject_id)
        .eq("is_current", True)
        .limit(1)
        .execute()
    )
    if spec_version_result.data and extraction.papers:
        spec_version_id = spec_version_result.data[0]["id"]
        for paper in extraction.papers:
            existing = (
                sb.table("exam_papers")
                .select("id")
                .eq("exam_spec_version_id", spec_version_id)
                .eq("paper_name", paper.paper_name)
                .execute()
            )
            if not existing.data:
                row = {
                    "exam_spec_version_id": spec_version_id,
                    "paper_code": paper.paper_code,
                    "paper_name": paper.paper_name,
                }
                if paper.duration_minutes:
                    row["duration_minutes"] = paper.duration_minutes
                if paper.weighting_percent:
                    row["weighting_percent"] = paper.weighting_percent
                sb.table("exam_papers").insert(row).execute()
                print(f"  Created exam_paper: {paper.paper_name}")
            else:
                print(f"  exam_paper '{paper.paper_name}' already exists")


def cmd_validate(spec_code: str, drive_folder_id: str | None) -> None:
    """Cross-validate staged extraction against revision guide filenames."""
    from src.services.curriculum_validator import (
        ValidationReport,
        extract_revision_slugs_from_drive,
        validate_extraction,
    )

    info = check_prerequisites(spec_code)
    sb = _get_supabase()

    # Load staged data
    result = (
        sb.table("curriculum_staging")
        .select("*")
        .eq("subject_id", info["subject_id"])
        .in_("status", ["pending", "review"])
        .order("component_order")
        .order("theme_order")
        .order("topic_order")
        .execute()
    )

    if not result.data:
        print("\nNo staged data found for this subject. Run --stage first.")
        sys.exit(1)

    print(f"\nLoaded {len(result.data)} staging rows")

    # Reconstruct extraction from staging rows for validation
    extraction = _staging_to_extraction(result.data, info)

    if not drive_folder_id:
        print("\nWARNING: No --drive-folder-id provided.")
        print("Skipping revision guide cross-validation.")
        print("Validation will only check data integrity.")
        _validate_integrity(result.data)
        return

    # Get revision guide slugs from Drive
    print(f"\nWalking Drive folder for revision guides...")
    slugs = extract_revision_slugs_from_drive(drive_folder_id, spec_code)
    print(f"Found {len(slugs)} revision guide topic slugs")

    if not slugs:
        print("No revision guides found — skipping cross-validation.")
        _validate_integrity(result.data)
        return

    # Run validation
    report = validate_extraction(extraction, slugs)
    print(f"\n{report.summary()}")

    # Update status to 'review'
    batch_ids = {row["extraction_batch_id"] for row in result.data}
    for batch_id in batch_ids:
        sb.table("curriculum_staging").update(
            {"status": "review"}
        ).eq("extraction_batch_id", batch_id).eq("status", "pending").execute()

    print(f"\nStaging rows updated to status='review'")


def _staging_to_extraction(rows: list[dict], info: dict) -> CurriculumExtraction:
    """Reconstruct a CurriculumExtraction from staging rows (for validation)."""
    from src.services.curriculum_extractor import (
        CurriculumExtraction,
        ExtractedComponent,
        ExtractedTheme,
        ExtractedTopic,
    )

    components: dict[str, ExtractedComponent] = {}

    for row in rows:
        comp_name = row["component_name"]
        if comp_name not in components:
            components[comp_name] = ExtractedComponent(
                name=comp_name,
                order=row["component_order"],
                weighting=row.get("component_weighting"),
            )

        comp = components[comp_name]
        theme_name = row["theme_name"]
        existing_theme = next((t for t in comp.themes if t.name == theme_name), None)

        if not existing_theme:
            existing_theme = ExtractedTheme(name=theme_name, order=row["theme_order"])
            comp.themes.append(existing_theme)

        existing_theme.topics.append(ExtractedTopic(
            name=row["topic_name"],
            order=row["topic_order"],
            canonical_code=row.get("canonical_code"),
        ))

    return CurriculumExtraction(
        subject_name=info["subject_name"],
        exam_board=info["exam_board_name"],
        spec_code=info["spec_code"],
        qualification=info["qualification_code"],
        components=sorted(components.values(), key=lambda c: c.order),
    )


def _validate_integrity(rows: list[dict]) -> None:
    """Basic data integrity checks on staging rows."""
    issues = []

    # Check for empty names
    for i, row in enumerate(rows):
        for field in ["component_name", "theme_name", "topic_name"]:
            if not row.get(field, "").strip():
                issues.append(f"Row {i}: empty {field}")

    # Check for duplicate topics within same theme
    seen: dict[str, set] = {}
    for row in rows:
        key = f"{row['component_name']}|{row['theme_name']}"
        if key not in seen:
            seen[key] = set()
        if row["topic_name"] in seen[key]:
            issues.append(f"Duplicate topic: '{row['topic_name']}' in {key}")
        seen[key].add(row["topic_name"])

    # Check ordering
    components = {}
    for row in rows:
        cn = row["component_name"]
        if cn not in components:
            components[cn] = set()
        components[cn].add(row["theme_name"])

    topic_count = len(rows)
    theme_count = sum(len(themes) for themes in components.values())
    comp_count = len(components)

    print(f"\nIntegrity Check:")
    print(f"  Components: {comp_count}")
    print(f"  Themes: {theme_count}")
    print(f"  Topics: {topic_count}")
    print(f"  Issues: {len(issues)}")

    if issues:
        for issue in issues[:20]:
            print(f"    - {issue}")
        if len(issues) > 20:
            print(f"    ... and {len(issues) - 20} more")
    else:
        print("  All checks passed!")

    # Sanity checks
    if comp_count < 1 or comp_count > 10:
        print(f"  WARNING: Unusual component count ({comp_count}) — expected 1-10")
    if theme_count < 3 or theme_count > 50:
        print(f"  WARNING: Unusual theme count ({theme_count}) — expected 3-50")
    if topic_count < 10 or topic_count > 300:
        print(f"  WARNING: Unusual topic count ({topic_count}) — expected 10-300")


def cmd_approve(spec_code: str) -> None:
    """Approve all pending/review staging rows for a subject."""
    info = check_prerequisites(spec_code)
    sb = _get_supabase()

    result = (
        sb.table("curriculum_staging")
        .update({"status": "approved"})
        .eq("subject_id", info["subject_id"])
        .in_("status", ["pending", "review"])
        .execute()
    )

    count = len(result.data) if result.data else 0
    print(f"\nApproved {count} staging rows for {info['subject_name']}")
    print("Run --normalize next to import into production tables.")


def cmd_normalize(spec_code: str) -> None:
    """Move approved staging rows into production tables via RPC."""
    info = check_prerequisites(spec_code)
    sb = _get_supabase()

    # Check there are approved rows
    check = (
        sb.table("curriculum_staging")
        .select("id", count="exact")
        .eq("subject_id", info["subject_id"])
        .eq("status", "approved")
        .execute()
    )

    approved_count = check.count if check.count is not None else len(check.data or [])
    if approved_count == 0:
        print("\nNo approved staging rows found. Run --approve first.")
        sys.exit(1)

    print(f"\nNormalizing {approved_count} approved rows into production tables...")

    result = sb.rpc("rpc_normalize_curriculum_staging", {
        "p_subject_id": info["subject_id"],
    }).execute()

    summary = result.data if result.data else {}
    print(f"\nNormalization complete:")
    print(f"  Components created: {summary.get('components_created', '?')}")
    print(f"  Themes created: {summary.get('themes_created', '?')}")
    print(f"  Topics created: {summary.get('topics_created', '?')}")
    print(f"  Staging rows imported: {summary.get('staging_rows_imported', '?')}")


def cmd_check(spec_code: str) -> None:
    """Show current state of staging and production data for a subject."""
    info = check_prerequisites(spec_code)
    sb = _get_supabase()

    # Staging data
    staging = (
        sb.table("curriculum_staging")
        .select("status", count="exact")
        .eq("subject_id", info["subject_id"])
        .execute()
    )

    if staging.data:
        status_counts: dict[str, int] = {}
        for row in staging.data:
            s = row["status"]
            status_counts[s] = status_counts.get(s, 0) + 1
        print(f"\nStaging data:")
        for status, count in sorted(status_counts.items()):
            print(f"  {status}: {count} rows")
    else:
        print("\nNo staging data found.")

    # Production data
    components = (
        sb.table("components")
        .select("id, component_name, order_index, component_weighting")
        .eq("subject_id", info["subject_id"])
        .order("order_index")
        .execute()
    )

    if components.data:
        print(f"\nProduction data:")
        total_themes = 0
        total_topics = 0
        for comp in components.data:
            themes = (
                sb.table("themes")
                .select("id, theme_name, order_index")
                .eq("component_id", comp["id"])
                .order("order_index")
                .execute()
            )
            theme_count = len(themes.data or [])
            topic_count = 0
            for theme in (themes.data or []):
                topics = (
                    sb.table("topics")
                    .select("id", count="exact")
                    .eq("theme_id", theme["id"])
                    .execute()
                )
                tc = topics.count if topics.count is not None else len(topics.data or [])
                topic_count += tc
            total_themes += theme_count
            total_topics += topic_count
            print(f"  {comp['order_index']}. {comp['component_name']} "
                  f"({comp.get('component_weighting', 'N/A')}) "
                  f"— {theme_count} themes, {topic_count} topics")
        print(f"  Total: {len(components.data)} components, {total_themes} themes, "
              f"{total_topics} topics")
    else:
        print("\nNo production data found (components/themes/topics tables are empty).")

    # Supporting tables
    spec_versions = (
        sb.table("exam_spec_versions")
        .select("id, spec_version, is_current")
        .eq("subject_id", info["subject_id"])
        .execute()
    )
    if spec_versions.data:
        print(f"\nSpec versions: {[v['spec_version'] + (' (current)' if v['is_current'] else '') for v in spec_versions.data]}")

    pathways = (
        sb.table("exam_pathways")
        .select("pathway_name")
        .eq("subject_id", info["subject_id"])
        .execute()
    )
    if pathways.data:
        print(f"Pathways: {[p['pathway_name'] for p in pathways.data]}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Extract curriculum hierarchy from GCSE specification PDFs.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--spec-code", required=True,
        help="Specification code (e.g., 8461 for AQA Biology, 1MA1 for Edexcel Maths)",
    )

    # Command group
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--dry-run", action="store_true", help="Extract and print — don't write to DB")
    group.add_argument("--stage", action="store_true", help="Extract and write to curriculum_staging")
    group.add_argument("--validate", action="store_true", help="Cross-validate staged data")
    group.add_argument("--approve", action="store_true", help="Approve staged data for normalization")
    group.add_argument("--normalize", action="store_true", help="Import approved data into production tables")
    group.add_argument("--check", action="store_true", help="Show current state of data for this subject")

    # Options
    parser.add_argument("--file", help="Local file path to specification PDF (instead of fetching from DB)")
    parser.add_argument("--drive-folder-id", help="Google Drive folder ID for revision guide validation")

    args = parser.parse_args()

    if args.dry_run or args.stage:
        asyncio.run(cmd_extract(args.spec_code, args.file, dry_run=args.dry_run))
    elif args.validate:
        cmd_validate(args.spec_code, args.drive_folder_id)
    elif args.approve:
        cmd_approve(args.spec_code)
    elif args.normalize:
        cmd_normalize(args.spec_code)
    elif args.check:
        cmd_check(args.spec_code)


if __name__ == "__main__":
    main()
