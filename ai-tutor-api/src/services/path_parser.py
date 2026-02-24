# ai-tutor-api/src/services/path_parser.py
# Extract metadata from Google Drive folder paths.

import re
from dataclasses import dataclass


@dataclass
class DocumentMetadata:
    """Metadata extracted from a Google Drive folder path."""

    exam_board_code: str
    qualification_code: str
    subject_code: str
    source_type: str  # past_paper | specification | revision | marking_scheme | examiner_report
    provider: str | None  # seneca | pmt | None
    year: int | None
    filename: str


# Maps folder names to source types
SOURCE_TYPE_MAP: dict[str, str] = {
    "papers": "past_paper",
    "specs": "specification",
    "revision": "revision",
    "marking": "marking_scheme",
    "mark_schemes": "marking_scheme",
    "examiner": "examiner_report",
    "examiner_reports": "examiner_report",
    "grade_thresholds": "grade_threshold",
}

# Maps revision subfolder abbreviations to providers
PROVIDER_MAP: dict[str, str] = {
    "sne": "seneca",
    "seneca": "seneca",
    "pmt": "pmt",
    "physicsandmathstutor": "pmt",
}

# Regex to match a 4-digit year
_YEAR_RE = re.compile(r"^(19|20)\d{2}$")


def parse_drive_path(path: str) -> DocumentMetadata:
    """Parse a Google Drive folder path into structured metadata.

    Expected path format:
        <board>/<qualification>/<Subject + code>/papers/<year>/<file.pdf>
        <board>/<qualification>/<Subject + code>/specs/<file.pdf>
        <board>/<qualification>/<Subject + code>/revision/Sne/<file.pdf>

    Args:
        path: Forward-slash separated path from the Drive root folder.

    Returns:
        DocumentMetadata with extracted fields.

    Raises:
        ValueError: If the path doesn't match the expected structure.
    """
    parts = [p.strip() for p in path.split("/") if p.strip()]

    if len(parts) < 4:
        raise ValueError(
            f"Path too short — expected at least board/qual/subject/type: {path}"
        )

    exam_board_code = parts[0].upper()
    qualification_code = parts[1].upper()

    # Subject folder may contain the code (e.g., "Maths 1MA1" or just "1MA1")
    subject_code = _extract_subject_code(parts[2])

    # Filename is always the last part
    filename = parts[-1]

    # Determine source type from the folder after subject
    type_folder = parts[3].lower() if len(parts) > 3 else ""
    source_type = SOURCE_TYPE_MAP.get(type_folder, "revision")

    # Extract year and provider from remaining path segments
    year: int | None = None
    provider: str | None = None

    remaining = parts[4:-1] if len(parts) > 5 else parts[4:] if len(parts) > 4 else []

    for segment in remaining:
        seg_lower = segment.lower()

        if _YEAR_RE.match(segment):
            year = int(segment)
        elif seg_lower in PROVIDER_MAP:
            provider = PROVIDER_MAP[seg_lower]

    return DocumentMetadata(
        exam_board_code=exam_board_code,
        qualification_code=qualification_code,
        subject_code=subject_code,
        source_type=source_type,
        provider=provider,
        year=year,
        filename=filename,
    )


def _extract_subject_code(folder_name: str) -> str:
    """Extract a subject code from a folder name.

    Handles formats like:
        "1MA1" → "1MA1"
        "Maths 1MA1" → "1MA1"
        "English Literature 8702" → "8702"
    """
    # Try to find a code-like pattern (digits + letters or just digits)
    match = re.search(r"\b(\d+[A-Z]+\d*|\d{4,})\b", folder_name, re.IGNORECASE)
    if match:
        return match.group(1).upper()

    # Fallback: use the whole folder name
    return folder_name.strip()
