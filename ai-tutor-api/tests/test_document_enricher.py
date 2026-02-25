# tests/test_document_enricher.py
# Unit tests for LLM-based document enrichment.

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.services.document_enricher import (
    DocumentEnrichment,
    enrich_document,
    _get_prompt,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_llm_response(content: str) -> MagicMock:
    """Build a fake OpenAI response with the given content string."""
    message = MagicMock()
    message.content = content
    choice = MagicMock()
    choice.message = message
    response = MagicMock()
    response.choices = [choice]
    return response


# ---------------------------------------------------------------------------
# Tests — prompt selection
# ---------------------------------------------------------------------------

class TestGetPrompt:
    def test_qp_prompt(self):
        prompt = _get_prompt("qp", "Biology P1 2024", "past_paper")
        assert "past exam paper" in prompt.lower() or "exam paper" in prompt.lower()
        assert "Biology P1 2024" in prompt

    def test_ms_prompt(self):
        prompt = _get_prompt("ms", "Biology P1 MS", "past_paper")
        assert "mark scheme" in prompt.lower()

    def test_gt_prompt(self):
        prompt = _get_prompt("gt", "Grade Boundaries 2024", "past_paper")
        assert "grade boundary" in prompt.lower() or "grade" in prompt.lower()

    def test_er_prompt(self):
        prompt = _get_prompt("er", "Examiner Report 2024", "past_paper")
        assert "examiner report" in prompt.lower()

    def test_spec_prompt(self):
        prompt = _get_prompt("spec", "AQA Biology Spec", "specification")
        assert "specification" in prompt.lower()

    def test_rev_prompt(self):
        prompt = _get_prompt("rev", "Cell Biology Revision", "revision_guide")
        assert "revision" in prompt.lower()

    def test_unknown_uses_default(self):
        prompt = _get_prompt(None, "Some Doc", "unknown")
        assert "educational document" in prompt.lower()

    def test_unknown_type_uses_default(self):
        prompt = _get_prompt("unknown_type", "Some Doc", "unknown")
        assert "educational document" in prompt.lower()


# ---------------------------------------------------------------------------
# Tests — enrich_document
# ---------------------------------------------------------------------------

class TestEnrichDocument:
    @pytest.mark.anyio
    async def test_successful_enrichment(self, monkeypatch):
        """Successful LLM call returns summary and key_points."""
        llm_output = json.dumps({
            "summary": "AQA GCSE Biology Paper 1, June 2024, Higher Tier. 100 marks total.",
            "key_points": [
                {"question": "Q1", "topic": "Cell biology", "marks": 6},
                {"question": "Q2", "topic": "Organisation", "marks": 9},
            ],
        })
        response = _make_llm_response(llm_output)

        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=response)

        monkeypatch.setattr(
            "src.services.document_enricher.AsyncOpenAI",
            lambda **kwargs: mock_client,
        )

        result = await enrich_document(
            text="Question 1: Describe the structure of a cell...",
            title="Biology P1 2024",
            doc_type="qp",
            source_type="past_paper",
        )

        assert isinstance(result, DocumentEnrichment)
        assert "AQA GCSE Biology" in result.summary
        assert len(result.key_points) == 2
        assert result.key_points[0]["question"] == "Q1"

    @pytest.mark.anyio
    async def test_enrichment_disabled(self, monkeypatch):
        """When enrichment is disabled, returns empty enrichment."""
        monkeypatch.setattr(
            "src.services.document_enricher.settings.enrichment_enabled", False,
        )

        result = await enrich_document(
            text="Some text",
            title="Test",
            doc_type="qp",
            source_type="past_paper",
        )

        assert result.summary == ""
        assert result.key_points == []

    @pytest.mark.anyio
    async def test_empty_text(self, monkeypatch):
        """Empty text returns 'Empty document' summary."""
        result = await enrich_document(
            text="   ",
            title="Empty Doc",
            doc_type=None,
            source_type="unknown",
        )

        assert result.summary == "Empty document"
        assert result.key_points == []

    @pytest.mark.anyio
    async def test_llm_failure_graceful(self, monkeypatch):
        """LLM failure returns empty enrichment (graceful degradation)."""
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(
            side_effect=RuntimeError("API error"),
        )

        monkeypatch.setattr(
            "src.services.document_enricher.AsyncOpenAI",
            lambda **kwargs: mock_client,
        )

        result = await enrich_document(
            text="Some content here",
            title="Test Doc",
            doc_type="qp",
            source_type="past_paper",
        )

        assert result.summary == ""
        assert result.key_points == []

    @pytest.mark.anyio
    async def test_markdown_fences_stripped(self, monkeypatch):
        """LLM response wrapped in markdown fences is handled correctly."""
        raw_json = json.dumps({
            "summary": "A biology paper.",
            "key_points": [],
        })
        wrapped = f"```json\n{raw_json}\n```"
        response = _make_llm_response(wrapped)

        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=response)

        monkeypatch.setattr(
            "src.services.document_enricher.AsyncOpenAI",
            lambda **kwargs: mock_client,
        )

        result = await enrich_document(
            text="Content",
            title="Test",
            doc_type="qp",
            source_type="past_paper",
        )

        assert result.summary == "A biology paper."

    @pytest.mark.anyio
    async def test_non_string_summary_coerced(self, monkeypatch):
        """Non-string summary is coerced to string."""
        llm_output = json.dumps({
            "summary": 12345,
            "key_points": [],
        })
        response = _make_llm_response(llm_output)

        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=response)

        monkeypatch.setattr(
            "src.services.document_enricher.AsyncOpenAI",
            lambda **kwargs: mock_client,
        )

        result = await enrich_document(
            text="Content",
            title="Test",
            doc_type=None,
            source_type="unknown",
        )

        assert result.summary == "12345"
