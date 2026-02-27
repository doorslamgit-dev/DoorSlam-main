# ai-tutor-api/src/services/curriculum_validator.py
# Cross-validate extracted curriculum topics against revision guide filenames.
#
# Revision guides from providers like Save My Exams (SME) and Physics & Maths Tutor
# (PMT) are organised per-topic. Their filenames contain topic slugs that can be
# fuzzy-matched against the extracted curriculum to assess extraction quality.

import logging
from dataclasses import dataclass, field
from difflib import SequenceMatcher

from .curriculum_extractor import CurriculumExtraction
from .drive_walker import DriveFile, walk_drive
from .filename_parser import parse_filename

logger = logging.getLogger(__name__)

# Minimum similarity ratio for fuzzy matching (0.0 to 1.0)
_FUZZY_THRESHOLD = 0.55


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class TopicMatch:
    """A matched pair of extracted topic and revision guide topic."""

    extracted_topic: str
    revision_slug: str
    similarity: float
    provider: str | None = None


@dataclass
class ValidationReport:
    """Result of cross-validating extracted topics against revision guides."""

    spec_code: str
    subject_name: str
    total_extracted_topics: int
    total_revision_slugs: int
    matched: list[TopicMatch] = field(default_factory=list)
    unmatched_extracted: list[str] = field(default_factory=list)
    unmatched_revision: list[str] = field(default_factory=list)

    @property
    def match_rate(self) -> float:
        """Percentage of revision guide topics matched to extracted topics."""
        if self.total_revision_slugs == 0:
            return 0.0
        return len(self.matched) / self.total_revision_slugs * 100

    @property
    def coverage_rate(self) -> float:
        """Percentage of extracted topics that have a matching revision guide."""
        if self.total_extracted_topics == 0:
            return 0.0
        matched_extracted = {m.extracted_topic for m in self.matched}
        return len(matched_extracted) / self.total_extracted_topics * 100

    def summary(self) -> str:
        """Human-readable summary of the validation report."""
        lines = [
            f"Validation Report: {self.subject_name} ({self.spec_code})",
            f"{'─' * 60}",
            f"Extracted topics:     {self.total_extracted_topics}",
            f"Revision guide slugs: {self.total_revision_slugs}",
            f"Matched:              {len(self.matched)}",
            f"Match rate:           {self.match_rate:.1f}%",
            f"Coverage rate:        {self.coverage_rate:.1f}%",
        ]

        if self.unmatched_extracted:
            lines.append(f"\nUnmatched extracted topics ({len(self.unmatched_extracted)}):")
            for t in self.unmatched_extracted[:20]:
                lines.append(f"  - {t}")
            if len(self.unmatched_extracted) > 20:
                lines.append(f"  ... and {len(self.unmatched_extracted) - 20} more")

        if self.unmatched_revision:
            lines.append(f"\nUnmatched revision slugs ({len(self.unmatched_revision)}):")
            for s in self.unmatched_revision[:20]:
                lines.append(f"  - {s}")
            if len(self.unmatched_revision) > 20:
                lines.append(f"  ... and {len(self.unmatched_revision) - 20} more")

        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Slug extraction from Drive files
# ---------------------------------------------------------------------------

def _normalise(text: str) -> str:
    """Normalise text for fuzzy matching — lowercase, strip numbers/punctuation."""
    return (
        text.lower()
        .replace("_", " ")
        .replace("-", " ")
        .replace("'", "")
        .replace("(", "")
        .replace(")", "")
        .strip()
    )


def extract_revision_slugs(
    drive_files: list[DriveFile],
    spec_code: str,
) -> list[tuple[str, str | None]]:
    """Extract topic slugs from revision guide filenames for a specific spec_code.

    Args:
        drive_files: List of DriveFile objects from a Drive walk.
        spec_code: The specification code to filter by (e.g., "8461").

    Returns:
        List of (topic_slug, provider) tuples.
    """
    slugs: list[tuple[str, str | None]] = []

    for df in drive_files:
        try:
            meta = parse_filename(df.name)
        except ValueError:
            continue

        # Only include revision notes for this spec
        if meta.spec_code.upper() != spec_code.upper():
            continue
        if meta.doc_type != "rev" or not meta.topic_slug:
            continue

        slugs.append((meta.topic_slug, meta.provider))

    return slugs


def extract_revision_slugs_from_drive(
    folder_id: str,
    spec_code: str,
    root_path: str = "",
) -> list[tuple[str, str | None]]:
    """Walk a Drive folder and extract revision guide topic slugs for a spec.

    Convenience wrapper that combines walk_drive + extract_revision_slugs.

    Args:
        folder_id: Google Drive folder ID to walk.
        spec_code: Specification code to filter for.
        root_path: Path prefix for the Drive walk.

    Returns:
        List of (topic_slug, provider) tuples.
    """
    files = walk_drive(folder_id, root_path=root_path)
    return extract_revision_slugs(files, spec_code)


# ---------------------------------------------------------------------------
# Fuzzy matching
# ---------------------------------------------------------------------------

def _best_match(
    topic_name: str,
    slugs: list[tuple[str, str | None]],
    threshold: float = _FUZZY_THRESHOLD,
) -> tuple[str, str | None, float] | None:
    """Find the best fuzzy match for a topic name among revision slugs.

    Returns (slug, provider, similarity) or None if no match above threshold.
    """
    normalised_topic = _normalise(topic_name)
    best: tuple[str, str | None, float] | None = None

    for slug, provider in slugs:
        normalised_slug = _normalise(slug)
        ratio = SequenceMatcher(None, normalised_topic, normalised_slug).ratio()

        if ratio >= threshold:
            if best is None or ratio > best[2]:
                best = (slug, provider, ratio)

    return best


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def validate_extraction(
    extraction: CurriculumExtraction,
    revision_slugs: list[tuple[str, str | None]],
) -> ValidationReport:
    """Cross-validate an extraction against revision guide topic slugs.

    Args:
        extraction: The LLM-extracted curriculum hierarchy.
        revision_slugs: List of (topic_slug, provider) from revision guide filenames.

    Returns:
        ValidationReport with match/mismatch details.
    """
    # Collect all extracted topic names
    extracted_topics = [
        topic.name
        for comp in extraction.components
        for theme in comp.themes
        for topic in theme.topics
    ]

    matched: list[TopicMatch] = []
    unmatched_extracted: list[str] = []
    remaining_slugs = list(revision_slugs)

    # For each extracted topic, find the best matching slug
    for topic_name in extracted_topics:
        match = _best_match(topic_name, remaining_slugs)
        if match:
            slug, provider, similarity = match
            matched.append(TopicMatch(
                extracted_topic=topic_name,
                revision_slug=slug,
                similarity=similarity,
                provider=provider,
            ))
            # Remove matched slug to prevent double-matching
            remaining_slugs = [
                (s, p) for s, p in remaining_slugs if s != slug
            ]
        else:
            unmatched_extracted.append(topic_name)

    # Remaining slugs are unmatched revision topics
    unmatched_revision = [slug for slug, _ in remaining_slugs]

    return ValidationReport(
        spec_code=extraction.spec_code,
        subject_name=extraction.subject_name,
        total_extracted_topics=len(extracted_topics),
        total_revision_slugs=len(revision_slugs),
        matched=matched,
        unmatched_extracted=unmatched_extracted,
        unmatched_revision=unmatched_revision,
    )
