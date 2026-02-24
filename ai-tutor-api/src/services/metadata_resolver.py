# ai-tutor-api/src/services/metadata_resolver.py
# Resolve path metadata codes (AQA, GCSE, 1MA1) to database UUIDs.

import logging
from dataclasses import dataclass
from functools import lru_cache

from supabase import create_client

from ..config import settings

logger = logging.getLogger(__name__)


@dataclass
class ResolvedMetadata:
    """Metadata with database IDs resolved from codes."""

    exam_board_id: str
    qualification_id: str
    subject_id: str
    topic_id: str | None
    source_type: str
    provider: str | None
    year: int | None
    title: str
    source_path: str


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


@lru_cache(maxsize=128)
def _lookup_exam_board(code: str) -> str:
    """Look up exam_board_id from code (e.g., 'AQA')."""
    sb = _get_supabase()
    result = sb.table("exam_boards").select("id").ilike("code", code).execute()
    if not result.data:
        raise ValueError(f"Exam board not found: {code}")
    return result.data[0]["id"]


@lru_cache(maxsize=128)
def _lookup_qualification(code: str) -> str:
    """Look up qualification_id from code (e.g., 'GCSE')."""
    sb = _get_supabase()
    result = sb.table("qualifications").select("id").ilike("code", code).execute()
    if not result.data:
        raise ValueError(f"Qualification not found: {code}")
    return result.data[0]["id"]


@lru_cache(maxsize=256)
def _lookup_subject(code: str, exam_board_id: str, qualification_id: str) -> str:
    """Look up subject_id from code + board + qualification."""
    sb = _get_supabase()
    result = (
        sb.table("subjects")
        .select("id")
        .ilike("code", code)
        .eq("exam_board_id", exam_board_id)
        .eq("qualification_id", qualification_id)
        .execute()
    )
    if not result.data:
        raise ValueError(
            f"Subject not found: code={code}, board={exam_board_id}, qual={qualification_id}"
        )
    return result.data[0]["id"]


def resolve_metadata(
    exam_board_code: str,
    qualification_code: str,
    subject_code: str,
    source_type: str,
    provider: str | None,
    year: int | None,
    filename: str,
    source_path: str,
) -> ResolvedMetadata:
    """Resolve path metadata codes to database UUIDs.

    Args:
        exam_board_code: e.g., "AQA"
        qualification_code: e.g., "GCSE"
        subject_code: e.g., "1MA1"
        source_type: e.g., "past_paper"
        provider: e.g., "seneca" or None
        year: e.g., 2024 or None
        filename: e.g., "June_Paper1.pdf"
        source_path: Full Drive path for reference

    Returns:
        ResolvedMetadata with database IDs.
    """
    exam_board_id = _lookup_exam_board(exam_board_code)
    qualification_id = _lookup_qualification(qualification_code)
    subject_id = _lookup_subject(subject_code, exam_board_id, qualification_id)

    # Build a human-readable title
    title_parts = [filename.rsplit(".", 1)[0].replace("_", " ")]
    if year:
        title_parts.append(f"({year})")

    return ResolvedMetadata(
        exam_board_id=exam_board_id,
        qualification_id=qualification_id,
        subject_id=subject_id,
        topic_id=None,  # Topic extraction is Module 4
        source_type=source_type,
        provider=provider,
        year=year,
        title=" ".join(title_parts),
        source_path=source_path,
    )
