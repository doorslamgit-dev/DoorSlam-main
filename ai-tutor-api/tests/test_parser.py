# tests/test_parser.py
# Unit tests for the document parser service.

import pytest

from src.services.parser import ParsedDocument, parse_document


class TestParseDocument:
    def test_plain_text(self):
        content = b"Hello, this is a test document."
        result = parse_document(content, "test.txt")
        assert isinstance(result, ParsedDocument)
        assert result.text == "Hello, this is a test document."
        assert result.page_count == 1
        assert result.metadata["format"] == "text"

    def test_markdown(self):
        content = b"# Heading\n\nSome **bold** text."
        result = parse_document(content, "notes.md")
        assert "# Heading" in result.text
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
