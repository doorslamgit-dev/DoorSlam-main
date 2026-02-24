# ai-tutor-api/src/services/filename_parser.py
# Parse structured exam document filenames into metadata.
#
# Handles all patterns from the naming conventions document:
#   Tiered paper:   8461_2024_jun_p1_higher_qp.pdf
#   Untiered paper: 8145_2024_jun_p1_qp.pdf
#   Per-spec ER:    8300_2024_jun_er.pdf
#   Tiered ER:      8461_2024_nov_p1_foundation_er.pdf
#   Grade thresh:   8300_2024_jun_gt.pdf
#   Sample:         8300_sample_p1_foundation_qp.pdf
#   Spec:           8461_specification.pdf
#   Revision SME:   8300_sme_01_number.pdf
#   Revision PMT:   8463_pmt_01_energy.pdf
#   Insert:         8462_2024_jun_p1-insert_higher_qp.pdf

import re
from dataclasses import dataclass, field


@dataclass
class FilenameMetadata:
    """Metadata extracted from a structured exam document filename."""

    spec_code: str
    year: int | None = None
    session: str | None = None        # jun, nov, mar, jan
    paper_number: str | None = None   # p1, p2, p3
    tier: str | None = None           # foundation, higher, core, extended
    doc_type: str | None = None       # qp, ms, er, gt, sp, spec, rev
    provider: str | None = None       # sme, pmt
    topic_slug: str | None = None     # for revision notes
    is_sample: bool = False


# Known token sets
_SESSIONS = {"jun", "nov", "mar", "jan"}
_TIERS = {"foundation", "higher", "core", "extended"}
_DOC_TYPES = {"qp", "ms", "er", "gt", "sp"}
_PROVIDERS = {"sme", "pmt"}
_YEAR_RE = re.compile(r"^(19|20)\d{2}$")
_PAPER_RE = re.compile(r"^p\d(-insert)?$")


def parse_filename(filename: str) -> FilenameMetadata:
    """Parse a structured exam document filename into metadata.

    Uses token-scanning (not positional) to handle variable-length patterns.

    Args:
        filename: e.g. "8461_2024_jun_p1_higher_qp.pdf"

    Returns:
        FilenameMetadata with extracted fields.

    Raises:
        ValueError: If the filename has no tokens after stripping extension.
    """
    # Strip extension and split on underscores
    stem = filename.rsplit(".", 1)[0] if "." in filename else filename
    tokens = stem.split("_")

    if not tokens or not tokens[0]:
        raise ValueError(f"Empty filename: {filename}")

    # Token 0 is always spec_code
    spec_code = tokens[0]
    result = FilenameMetadata(spec_code=spec_code)

    if len(tokens) < 2:
        return result

    # Handle "specification" — e.g. 8461_specification.pdf
    if tokens[1].lower() == "specification":
        result.doc_type = "spec"
        return result

    # Handle "sample" — e.g. 8300_sample_p1_foundation_qp.pdf
    start_idx = 1
    if tokens[1].lower() == "sample":
        result.is_sample = True
        start_idx = 2

    # Scan remaining tokens by matching against known sets
    unmatched: list[str] = []

    for token in tokens[start_idx:]:
        token_lower = token.lower()

        if _YEAR_RE.match(token_lower):
            result.year = int(token)
        elif token_lower in _SESSIONS:
            result.session = token_lower
        elif _PAPER_RE.match(token_lower):
            # Normalise p1-insert → p1
            result.paper_number = token_lower.split("-")[0]
        elif token_lower in _TIERS:
            result.tier = token_lower
        elif token_lower in _DOC_TYPES:
            result.doc_type = token_lower
        elif token_lower in _PROVIDERS:
            result.provider = token_lower
            result.doc_type = "rev"
        else:
            unmatched.append(token_lower)

    # Unmatched tokens form the topic_slug (for revision notes)
    if unmatched:
        result.topic_slug = "_".join(unmatched)

    # If is_sample and doc_type is qp, override to sp
    if result.is_sample and result.doc_type == "qp":
        result.doc_type = "sp"

    return result
