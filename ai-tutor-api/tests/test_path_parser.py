# tests/test_path_parser.py
# Unit tests for the Drive path parser.

import pytest

from src.services.path_parser import DocumentMetadata, parse_drive_path


class TestParseDrivePath:
    def test_past_paper_with_year(self):
        path = "AQA/GCSE/1MA1/papers/2024/June_Paper1.pdf"
        result = parse_drive_path(path)
        assert result.exam_board_code == "AQA"
        assert result.qualification_code == "GCSE"
        assert result.subject_code == "1MA1"
        assert result.source_type == "past_paper"
        assert result.year == 2024
        assert result.provider is None
        assert result.filename == "June_Paper1.pdf"

    def test_specification(self):
        path = "Edexcel/GCSE/1EN0/specs/English_Language_Spec.pdf"
        result = parse_drive_path(path)
        assert result.exam_board_code == "EDEXCEL"
        assert result.source_type == "specification"
        assert result.year is None

    def test_revision_seneca(self):
        path = "AQA/GCSE/8461/revision/Sne/Biology_Topic1.pdf"
        result = parse_drive_path(path)
        assert result.source_type == "revision"
        assert result.provider == "seneca"
        assert result.subject_code == "8461"

    def test_revision_pmt(self):
        path = "OCR/GCSE/J560/revision/Pmt/Algebra_Notes.pdf"
        result = parse_drive_path(path)
        assert result.source_type == "revision"
        assert result.provider == "pmt"

    def test_subject_with_name_and_code(self):
        path = "AQA/GCSE/Maths 1MA1/papers/2023/Paper2.pdf"
        result = parse_drive_path(path)
        assert result.subject_code == "1MA1"

    def test_igcse_qualification(self):
        path = "Edexcel/IGCSE/4MA1/papers/2023/May_Paper1.pdf"
        result = parse_drive_path(path)
        assert result.qualification_code == "IGCSE"

    def test_too_short_path(self):
        with pytest.raises(ValueError, match="Path too short"):
            parse_drive_path("AQA/GCSE")

    def test_returns_dataclass(self):
        path = "AQA/GCSE/1MA1/papers/2024/File.pdf"
        result = parse_drive_path(path)
        assert isinstance(result, DocumentMetadata)

    def test_case_normalisation(self):
        path = "aqa/gcse/1ma1/papers/2024/File.pdf"
        result = parse_drive_path(path)
        assert result.exam_board_code == "AQA"
        assert result.qualification_code == "GCSE"
        assert result.subject_code == "1MA1"

    def test_numeric_only_subject_code(self):
        path = "AQA/GCSE/8702/specs/Spec.pdf"
        result = parse_drive_path(path)
        assert result.subject_code == "8702"

    def test_marking_scheme(self):
        path = "AQA/GCSE/1MA1/marking/2024/June_MS.pdf"
        result = parse_drive_path(path)
        assert result.source_type == "marking_scheme"
