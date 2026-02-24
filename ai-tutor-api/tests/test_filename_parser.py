# ai-tutor-api/tests/test_filename_parser.py
# Tests for the filename parser — one test per pattern from the naming doc.

import pytest

from src.services.filename_parser import FilenameMetadata, parse_filename


class TestTieredPaper:
    """Tiered question paper: 8461_2024_jun_p1_higher_qp.pdf"""

    def test_tiered_paper(self):
        result = parse_filename("8461_2024_jun_p1_higher_qp.pdf")
        assert result.spec_code == "8461"
        assert result.year == 2024
        assert result.session == "jun"
        assert result.paper_number == "p1"
        assert result.tier == "higher"
        assert result.doc_type == "qp"
        assert result.is_sample is False

    def test_tiered_paper_foundation(self):
        result = parse_filename("8461_2024_jun_p2_foundation_qp.pdf")
        assert result.spec_code == "8461"
        assert result.paper_number == "p2"
        assert result.tier == "foundation"
        assert result.doc_type == "qp"


class TestUntieredPaper:
    """Untiered question paper: 8145_2024_jun_p1_qp.pdf"""

    def test_untiered_paper(self):
        result = parse_filename("8145_2024_jun_p1_qp.pdf")
        assert result.spec_code == "8145"
        assert result.year == 2024
        assert result.session == "jun"
        assert result.paper_number == "p1"
        assert result.tier is None
        assert result.doc_type == "qp"


class TestMarkScheme:
    """Marking scheme: 8461_2024_jun_p1_foundation_ms.pdf"""

    def test_tiered_ms(self):
        result = parse_filename("8461_2024_jun_p1_foundation_ms.pdf")
        assert result.doc_type == "ms"
        assert result.tier == "foundation"
        assert result.paper_number == "p1"

    def test_untiered_ms(self):
        result = parse_filename("8145_2024_jun_p1_ms.pdf")
        assert result.doc_type == "ms"
        assert result.tier is None


class TestExaminerReport:
    """Examiner report — per-spec and tiered variants."""

    def test_per_spec_er(self):
        """8300_2024_jun_er.pdf — whole-spec, no paper number."""
        result = parse_filename("8300_2024_jun_er.pdf")
        assert result.spec_code == "8300"
        assert result.year == 2024
        assert result.session == "jun"
        assert result.doc_type == "er"
        assert result.paper_number is None
        assert result.tier is None

    def test_tiered_er(self):
        """8461_2024_nov_p1_foundation_er.pdf"""
        result = parse_filename("8461_2024_nov_p1_foundation_er.pdf")
        assert result.session == "nov"
        assert result.paper_number == "p1"
        assert result.tier == "foundation"
        assert result.doc_type == "er"


class TestGradeThreshold:
    """Grade threshold: 8300_2024_jun_gt.pdf"""

    def test_grade_threshold(self):
        result = parse_filename("8300_2024_jun_gt.pdf")
        assert result.spec_code == "8300"
        assert result.year == 2024
        assert result.session == "jun"
        assert result.doc_type == "gt"
        assert result.paper_number is None


class TestSamplePaper:
    """Sample paper: 8300_sample_p1_foundation_qp.pdf"""

    def test_sample_paper_tiered(self):
        result = parse_filename("8300_sample_p1_foundation_qp.pdf")
        assert result.spec_code == "8300"
        assert result.is_sample is True
        assert result.paper_number == "p1"
        assert result.tier == "foundation"
        assert result.doc_type == "sp"  # sample qp → sp
        assert result.year is None

    def test_sample_paper_untiered(self):
        result = parse_filename("8145_sample_p1_qp.pdf")
        assert result.is_sample is True
        assert result.doc_type == "sp"
        assert result.tier is None


class TestSpecification:
    """Specification: 8461_specification.pdf"""

    def test_specification(self):
        result = parse_filename("8461_specification.pdf")
        assert result.spec_code == "8461"
        assert result.doc_type == "spec"
        assert result.year is None
        assert result.session is None


class TestRevisionNotes:
    """Revision notes from providers."""

    def test_revision_sme(self):
        """8300_sme_01_number.pdf"""
        result = parse_filename("8300_sme_01_number.pdf")
        assert result.spec_code == "8300"
        assert result.provider == "sme"
        assert result.doc_type == "rev"
        assert result.topic_slug == "01_number"

    def test_revision_pmt(self):
        """8463_pmt_01_energy.pdf"""
        result = parse_filename("8463_pmt_01_energy.pdf")
        assert result.spec_code == "8463"
        assert result.provider == "pmt"
        assert result.doc_type == "rev"
        assert result.topic_slug == "01_energy"


class TestInsert:
    """Insert paper: 8462_2024_jun_p1-insert_higher_qp.pdf"""

    def test_insert_paper(self):
        result = parse_filename("8462_2024_jun_p1-insert_higher_qp.pdf")
        assert result.spec_code == "8462"
        assert result.year == 2024
        assert result.session == "jun"
        assert result.paper_number == "p1"  # p1-insert normalised to p1
        assert result.tier == "higher"
        assert result.doc_type == "qp"


class TestEdgeCases:
    """Edge cases and error handling."""

    def test_no_extension(self):
        result = parse_filename("8461_2024_jun_p1_qp")
        assert result.spec_code == "8461"
        assert result.doc_type == "qp"

    def test_single_token(self):
        result = parse_filename("8461.pdf")
        assert result.spec_code == "8461"
        assert result.doc_type is None

    def test_empty_filename_raises(self):
        with pytest.raises(ValueError, match="Empty filename"):
            parse_filename("")

    def test_caie_tiers(self):
        """Cambridge tiers: core/extended."""
        result = parse_filename("0620_2024_jun_p1_core_qp.pdf")
        assert result.tier == "core"

        result = parse_filename("0620_2024_jun_p1_extended_qp.pdf")
        assert result.tier == "extended"

    def test_jan_session(self):
        result = parse_filename("8461_2019_jan_p1_higher_qp.pdf")
        assert result.session == "jan"
        assert result.year == 2019

    def test_sample_ms(self):
        """Sample marking scheme — is_sample=True, doc_type stays ms."""
        result = parse_filename("8300_sample_p1_ms.pdf")
        assert result.is_sample is True
        assert result.doc_type == "ms"  # not sp — only qp→sp conversion
