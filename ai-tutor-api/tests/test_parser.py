# tests/test_parser.py
# Unit tests for the document parser service.

import pytest
from unittest.mock import MagicMock, patch

from src.services.parser import ParsedDocument, parse_document, _reset_converter


@pytest.fixture(autouse=True)
def _disable_docling(monkeypatch):
    """Disable Docling for all tests by default — legacy tests run without it."""
    monkeypatch.setattr("src.services.parser.settings.docling_enabled", False)
    _reset_converter()
    yield
    _reset_converter()


class TestParseDocumentLegacy:
    """Tests for the legacy (non-Docling) parsing paths."""

    def test_plain_text(self):
        content = b"Hello, this is a test document."
        result = parse_document(content, "test.txt")
        assert isinstance(result, ParsedDocument)
        assert result.text == "Hello, this is a test document."
        assert result.page_count == 1
        assert result.metadata["parser"] == "legacy"
        assert result.metadata["format"] == "text"

    def test_markdown(self):
        content = b"# Heading\n\nSome **bold** text."
        result = parse_document(content, "notes.md")
        assert "# Heading" in result.text
        assert result.metadata["parser"] == "legacy"
        assert result.metadata["format"] == "text"

    def test_unsupported_format(self):
        with pytest.raises(ValueError, match="Unsupported file type"):
            parse_document(b"data", "file.xyz")

    def test_empty_text(self):
        result = parse_document(b"", "empty.txt")
        assert result.text == ""
        assert result.page_count == 1

    def test_utf8_with_special_chars(self):
        content = "Caf\u00e9 na\u00efve r\u00e9sum\u00e9".encode("utf-8")
        result = parse_document(content, "french.txt")
        assert "Caf\u00e9" in result.text

    def test_case_insensitive_extension(self):
        result = parse_document(b"test", "FILE.TXT")
        assert result.metadata["format"] == "text"

    def test_page_texts_populated(self):
        result = parse_document(b"Hello", "test.txt")
        assert len(result.page_texts) == 1
        assert result.page_texts[0] == "Hello"


class TestParseDocumentDocling:
    """Tests for the Docling parsing path (mocked — no PyTorch needed).

    We mock _parse_with_docling directly because docling may not be installed
    in the test environment (it has heavy PyTorch dependencies).
    """

    def test_docling_produces_markdown(self, monkeypatch):
        """When Docling is enabled, parse_document delegates to _parse_with_docling."""
        monkeypatch.setattr("src.services.parser.settings.docling_enabled", True)

        fake_result = ParsedDocument(
            text="# Title\n\nSome text with a | table |",
            page_texts=["# Title\n\nSome text with a | table |"],
            page_count=1,
            metadata={"parser": "docling", "format": "pdf"},
        )
        monkeypatch.setattr(
            "src.services.parser._parse_with_docling",
            lambda file_bytes, filename: fake_result,
        )

        result = parse_document(b"fake pdf bytes", "test.pdf")

        assert "# Title" in result.text
        assert "| table |" in result.text
        assert result.metadata["parser"] == "docling"
        assert result.metadata["format"] == "pdf"
        assert result.page_count == 1

    def test_docling_fallback_on_failure(self, monkeypatch):
        """When Docling fails for a supported legacy format, falls back to legacy."""
        monkeypatch.setattr("src.services.parser.settings.docling_enabled", True)
        monkeypatch.setattr("src.services.parser.settings.docling_fallback", True)

        monkeypatch.setattr(
            "src.services.parser._parse_with_docling",
            MagicMock(side_effect=RuntimeError("Docling crash")),
        )

        # .txt has a legacy fallback path
        result = parse_document(b"Plain text content", "fallback.txt")

        assert result.text == "Plain text content"
        assert result.metadata["parser"] == "legacy"
        assert result.metadata["format"] == "text"

    def test_docling_no_fallback_for_new_formats(self, monkeypatch):
        """When Docling fails for a format with no legacy parser, raises ValueError."""
        monkeypatch.setattr("src.services.parser.settings.docling_enabled", True)
        monkeypatch.setattr("src.services.parser.settings.docling_fallback", True)

        monkeypatch.setattr(
            "src.services.parser._parse_with_docling",
            MagicMock(side_effect=RuntimeError("Docling crash")),
        )

        # .pptx has no legacy fallback
        with pytest.raises(ValueError, match="Docling parsing failed"):
            parse_document(b"fake pptx bytes", "slides.pptx")
