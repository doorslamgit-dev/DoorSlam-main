# tests/test_curriculum_validator.py
# Unit tests for the curriculum cross-validator.

import pytest

from src.services.curriculum_extractor import (
    CurriculumExtraction,
    ExtractedComponent,
    ExtractedTheme,
    ExtractedTopic,
)
from src.services.curriculum_validator import (
    TopicMatch,
    ValidationReport,
    _best_match,
    _normalise,
    extract_revision_slugs,
    validate_extraction,
)
from src.services.drive_walker import DriveFile


# ---------------------------------------------------------------------------
# Helper: build a minimal extraction
# ---------------------------------------------------------------------------

def _make_extraction(topic_names: list[str]) -> CurriculumExtraction:
    """Create a minimal CurriculumExtraction with given topic names."""
    topics = [
        ExtractedTopic(name=name, order=i + 1)
        for i, name in enumerate(topic_names)
    ]
    return CurriculumExtraction(
        subject_name="Biology",
        exam_board="AQA",
        spec_code="8461",
        qualification="GCSE",
        components=[
            ExtractedComponent(
                name="Paper 1",
                order=1,
                themes=[
                    ExtractedTheme(name="Theme 1", order=1, topics=topics),
                ],
            ),
        ],
    )


def _make_drive_file(name: str, path: str = "") -> DriveFile:
    """Create a minimal DriveFile for testing."""
    return DriveFile(
        file_id="fake-id",
        name=name,
        mime_type="application/pdf",
        size=1000,
        path=path or f"AQA/GCSE/Biology(8461)/revision/sme/{name}",
    )


# ---------------------------------------------------------------------------
# Tests: _normalise
# ---------------------------------------------------------------------------

class TestNormalise:
    def test_lowercase(self):
        assert _normalise("Cell Structure") == "cell structure"

    def test_underscores_to_spaces(self):
        assert _normalise("cell_structure") == "cell structure"

    def test_hyphens_to_spaces(self):
        assert _normalise("cell-structure") == "cell structure"

    def test_strips_punctuation(self):
        assert _normalise("(Transport) in 'cells'") == "transport in cells"


# ---------------------------------------------------------------------------
# Tests: extract_revision_slugs
# ---------------------------------------------------------------------------

class TestExtractRevisionSlugs:
    def test_extracts_matching_spec_code(self):
        """Only revision files matching the spec code are extracted."""
        files = [
            _make_drive_file("8461_sme_01_cell_structure.pdf"),
            _make_drive_file("8461_sme_02_cell_division.pdf"),
            _make_drive_file("8300_sme_01_number.pdf"),  # Different spec
        ]
        slugs = extract_revision_slugs(files, "8461")

        assert len(slugs) == 2
        assert slugs[0] == ("01_cell_structure", "sme")
        assert slugs[1] == ("02_cell_division", "sme")

    def test_skips_non_revision_files(self):
        """Non-revision files (papers, specs, etc.) are skipped."""
        files = [
            _make_drive_file("8461_specification.pdf"),
            _make_drive_file("8461_2024_jun_p1_higher_qp.pdf"),
            _make_drive_file("8461_sme_01_cell_structure.pdf"),
        ]
        slugs = extract_revision_slugs(files, "8461")

        assert len(slugs) == 1
        assert slugs[0][0] == "01_cell_structure"

    def test_case_insensitive_spec_code(self):
        """Spec code matching is case-insensitive."""
        files = [_make_drive_file("8461_sme_01_cell_structure.pdf")]
        slugs = extract_revision_slugs(files, "8461")
        assert len(slugs) == 1

    def test_empty_files(self):
        """Empty file list returns empty slugs."""
        assert extract_revision_slugs([], "8461") == []


# ---------------------------------------------------------------------------
# Tests: _best_match
# ---------------------------------------------------------------------------

class TestBestMatch:
    def test_exact_match(self):
        """Exact topic name match returns high similarity."""
        slugs = [("cell_structure", "sme")]
        result = _best_match("Cell structure", slugs)

        assert result is not None
        slug, provider, similarity = result
        assert slug == "cell_structure"
        assert similarity > 0.8

    def test_fuzzy_match(self):
        """Similar names match above threshold."""
        slugs = [("cell_biology_structure", "sme")]
        result = _best_match("Cell structure", slugs, threshold=0.4)

        assert result is not None

    def test_no_match_below_threshold(self):
        """Completely different names return None."""
        slugs = [("photosynthesis", "sme")]
        result = _best_match("Cell structure", slugs, threshold=0.8)

        assert result is None

    def test_best_of_multiple(self):
        """Returns the best match among multiple candidates."""
        slugs = [
            ("photosynthesis", "sme"),
            ("cell_structure", "sme"),
            ("cell_biology", "pmt"),
        ]
        result = _best_match("Cell structure", slugs)

        assert result is not None
        assert result[0] == "cell_structure"


# ---------------------------------------------------------------------------
# Tests: validate_extraction
# ---------------------------------------------------------------------------

class TestValidateExtraction:
    def test_perfect_match(self):
        """All extracted topics match revision slugs."""
        extraction = _make_extraction(["Cell structure", "Cell division"])
        slugs = [
            ("cell_structure", "sme"),
            ("cell_division", "sme"),
        ]

        report = validate_extraction(extraction, slugs)

        assert report.total_extracted_topics == 2
        assert report.total_revision_slugs == 2
        assert len(report.matched) == 2
        assert len(report.unmatched_extracted) == 0
        assert len(report.unmatched_revision) == 0
        assert report.match_rate == 100.0

    def test_partial_match(self):
        """Some topics match, some don't."""
        extraction = _make_extraction([
            "Cell structure", "Cell division", "DNA and the genome"
        ])
        slugs = [
            ("cell_structure", "sme"),
            ("cell_division", "sme"),
        ]

        report = validate_extraction(extraction, slugs)

        assert len(report.matched) == 2
        assert len(report.unmatched_extracted) == 1
        assert report.unmatched_extracted[0] == "DNA and the genome"

    def test_extra_revision_slugs(self):
        """Revision slugs without matching extracted topics appear in unmatched."""
        extraction = _make_extraction(["Cell structure"])
        slugs = [
            ("cell_structure", "sme"),
            ("mitosis", "sme"),
        ]

        report = validate_extraction(extraction, slugs)

        assert len(report.matched) == 1
        assert len(report.unmatched_revision) == 1
        assert report.unmatched_revision[0] == "mitosis"

    def test_empty_extraction(self):
        """Empty extraction returns zero match rate."""
        extraction = _make_extraction([])
        slugs = [("cell_structure", "sme")]

        report = validate_extraction(extraction, slugs)

        assert report.match_rate == 0.0
        assert report.coverage_rate == 0.0

    def test_empty_slugs(self):
        """Empty slugs still reports extracted topics."""
        extraction = _make_extraction(["Cell structure"])

        report = validate_extraction(extraction, [])

        assert report.total_extracted_topics == 1
        assert report.match_rate == 0.0

    def test_no_double_matching(self):
        """Each slug is matched at most once."""
        extraction = _make_extraction(["Cell structure", "Cell biology structure"])
        slugs = [("cell_structure", "sme")]

        report = validate_extraction(extraction, slugs)

        # Only one of the two similar topics should match the single slug
        assert len(report.matched) == 1
        assert len(report.unmatched_extracted) == 1


# ---------------------------------------------------------------------------
# Tests: ValidationReport
# ---------------------------------------------------------------------------

class TestValidationReport:
    def test_summary_format(self):
        """summary() produces readable output."""
        report = ValidationReport(
            spec_code="8461",
            subject_name="Biology",
            total_extracted_topics=50,
            total_revision_slugs=45,
            matched=[TopicMatch("Cell structure", "cell_structure", 0.95, "sme")],
            unmatched_extracted=["DNA structure"],
            unmatched_revision=["mitosis_details"],
        )

        summary = report.summary()
        assert "Biology" in summary
        assert "8461" in summary
        assert "50" in summary
        assert "DNA structure" in summary

    def test_match_rate_zero_division(self):
        """match_rate handles zero revision slugs gracefully."""
        report = ValidationReport(
            spec_code="8461",
            subject_name="Biology",
            total_extracted_topics=10,
            total_revision_slugs=0,
        )
        assert report.match_rate == 0.0

    def test_coverage_rate_zero_division(self):
        """coverage_rate handles zero extracted topics gracefully."""
        report = ValidationReport(
            spec_code="8461",
            subject_name="Biology",
            total_extracted_topics=0,
            total_revision_slugs=5,
        )
        assert report.coverage_rate == 0.0
