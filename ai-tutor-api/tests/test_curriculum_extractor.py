# tests/test_curriculum_extractor.py
# Unit tests for the curriculum extraction service.

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.services.curriculum_extractor import (
    CurriculumExtraction,
    ExtractedComponent,
    ExtractedPathway,
    ExtractedPaper,
    ExtractedTheme,
    ExtractedTopic,
    _parse_extraction,
    extract_curriculum,
    extraction_to_dict,
)


# ---------------------------------------------------------------------------
# Sample LLM response data
# ---------------------------------------------------------------------------

SAMPLE_LLM_RESPONSE = {
    "subject_name": "Biology",
    "exam_board": "AQA",
    "spec_code": "8461",
    "qualification": "GCSE",
    "spec_version": "2016",
    "first_teaching": "September 2016",
    "components": [
        {
            "name": "Paper 1: Cell Biology, Organisation, Infection and Bioenergetics",
            "order": 1,
            "weighting": "50%",
            "duration_minutes": 105,
            "themes": [
                {
                    "name": "Cell Biology",
                    "order": 1,
                    "topics": [
                        {"name": "Cell structure", "order": 1, "canonical_code": "4.1.1"},
                        {"name": "Cell division", "order": 2, "canonical_code": "4.1.2"},
                        {"name": "Transport in cells", "order": 3, "canonical_code": "4.1.3"},
                    ],
                },
                {
                    "name": "Organisation",
                    "order": 2,
                    "topics": [
                        {"name": "Principles of organisation", "order": 1, "canonical_code": "4.2.1"},
                        {"name": "Animal tissues, organs and organ systems", "order": 2, "canonical_code": "4.2.2"},
                    ],
                },
            ],
        },
        {
            "name": "Paper 2: Homeostasis, Inheritance, Variation and Ecology",
            "order": 2,
            "weighting": "50%",
            "duration_minutes": 105,
            "themes": [
                {
                    "name": "Homeostasis and response",
                    "order": 1,
                    "topics": [
                        {"name": "Homeostasis", "order": 1, "canonical_code": "4.5.1"},
                        {"name": "The human nervous system", "order": 2, "canonical_code": "4.5.2"},
                    ],
                },
            ],
        },
    ],
    "pathways": [
        {"code": "foundation", "name": "Foundation"},
        {"code": "higher", "name": "Higher"},
    ],
    "papers": [
        {"paper_code": "8461/1F", "paper_name": "Paper 1 (Foundation)", "duration_minutes": 105, "weighting_percent": 50},
        {"paper_code": "8461/1H", "paper_name": "Paper 1 (Higher)", "duration_minutes": 105, "weighting_percent": 50},
    ],
}


# ---------------------------------------------------------------------------
# Tests: _parse_extraction
# ---------------------------------------------------------------------------

class TestParseExtraction:
    def test_parses_full_response(self):
        """Parses a complete LLM response into typed dataclasses."""
        result = _parse_extraction(SAMPLE_LLM_RESPONSE)

        assert isinstance(result, CurriculumExtraction)
        assert result.subject_name == "Biology"
        assert result.exam_board == "AQA"
        assert result.spec_code == "8461"
        assert result.qualification == "GCSE"
        assert result.spec_version == "2016"

    def test_parses_components(self):
        """Extracts components with correct ordering and weighting."""
        result = _parse_extraction(SAMPLE_LLM_RESPONSE)

        assert len(result.components) == 2
        assert result.components[0].name.startswith("Paper 1")
        assert result.components[0].order == 1
        assert result.components[0].weighting == "50%"
        assert result.components[0].duration_minutes == 105

    def test_parses_themes(self):
        """Extracts themes nested within components."""
        result = _parse_extraction(SAMPLE_LLM_RESPONSE)

        themes = result.components[0].themes
        assert len(themes) == 2
        assert themes[0].name == "Cell Biology"
        assert themes[0].order == 1
        assert themes[1].name == "Organisation"
        assert themes[1].order == 2

    def test_parses_topics(self):
        """Extracts topics nested within themes."""
        result = _parse_extraction(SAMPLE_LLM_RESPONSE)

        topics = result.components[0].themes[0].topics
        assert len(topics) == 3
        assert topics[0].name == "Cell structure"
        assert topics[0].order == 1
        assert topics[0].canonical_code == "4.1.1"

    def test_parses_pathways(self):
        """Extracts tier pathways."""
        result = _parse_extraction(SAMPLE_LLM_RESPONSE)

        assert len(result.pathways) == 2
        assert result.pathways[0].code == "foundation"
        assert result.pathways[1].name == "Higher"

    def test_parses_papers(self):
        """Extracts exam paper details."""
        result = _parse_extraction(SAMPLE_LLM_RESPONSE)

        assert len(result.papers) == 2
        assert result.papers[0].paper_code == "8461/1F"
        assert result.papers[0].weighting_percent == 50

    def test_handles_missing_fields(self):
        """Gracefully handles missing optional fields."""
        minimal = {
            "subject_name": "Maths",
            "exam_board": "Edexcel",
            "spec_code": "1MA1",
            "components": [],
        }
        result = _parse_extraction(minimal)

        assert result.subject_name == "Maths"
        assert result.qualification == "GCSE"  # default
        assert result.spec_version is None
        assert result.pathways == []
        assert result.papers == []

    def test_handles_missing_canonical_code(self):
        """Topics without canonical_code get None."""
        data = {
            "subject_name": "Maths",
            "exam_board": "Edexcel",
            "spec_code": "1MA1",
            "components": [{
                "name": "Paper 1",
                "order": 1,
                "themes": [{
                    "name": "Number",
                    "order": 1,
                    "topics": [
                        {"name": "Integers", "order": 1},
                    ],
                }],
            }],
        }
        result = _parse_extraction(data)
        assert result.components[0].themes[0].topics[0].canonical_code is None


# ---------------------------------------------------------------------------
# Tests: CurriculumExtraction methods
# ---------------------------------------------------------------------------

class TestCurriculumExtraction:
    def test_total_topics(self):
        """total_topics counts all topics across all components and themes."""
        result = _parse_extraction(SAMPLE_LLM_RESPONSE)
        # 3 topics in Cell Biology + 2 in Organisation + 2 in Homeostasis = 7
        assert result.total_topics == 7

    def test_to_staging_rows(self):
        """to_staging_rows produces flat rows for curriculum_staging."""
        result = _parse_extraction(SAMPLE_LLM_RESPONSE)
        rows = result.to_staging_rows("subject-uuid-123")

        assert len(rows) == 7
        first = rows[0]
        assert first["subject_id"] == "subject-uuid-123"
        assert first["component_name"].startswith("Paper 1")
        assert first["component_order"] == 1
        assert first["component_weighting"] == "50%"
        assert first["theme_name"] == "Cell Biology"
        assert first["theme_order"] == 1
        assert first["topic_name"] == "Cell structure"
        assert first["topic_order"] == 1
        assert first["canonical_code"] == "4.1.1"

    def test_extraction_to_dict(self):
        """extraction_to_dict produces a JSON-serializable dict."""
        result = _parse_extraction(SAMPLE_LLM_RESPONSE)
        d = extraction_to_dict(result)

        assert isinstance(d, dict)
        assert d["subject_name"] == "Biology"
        # Ensure it's JSON-serializable
        json.dumps(d)


# ---------------------------------------------------------------------------
# Tests: extract_curriculum (async, mocked LLM)
# ---------------------------------------------------------------------------

class TestExtractCurriculum:
    @pytest.mark.asyncio
    async def test_calls_llm_and_returns_extraction(self):
        """extract_curriculum calls the LLM and returns a CurriculumExtraction."""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = json.dumps(SAMPLE_LLM_RESPONSE)

        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

        with patch("src.services.curriculum_extractor.AsyncOpenAI", return_value=mock_client):
            result = await extract_curriculum("Some specification text...", spec_code="8461")

        assert isinstance(result, CurriculumExtraction)
        assert result.subject_name == "Biology"
        assert result.total_topics == 7

    @pytest.mark.asyncio
    async def test_empty_text_raises(self):
        """extract_curriculum raises ValueError for empty text."""
        with pytest.raises(ValueError, match="empty"):
            await extract_curriculum("", spec_code="8461")

    @pytest.mark.asyncio
    async def test_prepends_spec_code_hint(self):
        """When spec_code is provided, it's prepended to the text."""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = json.dumps(SAMPLE_LLM_RESPONSE)

        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

        with patch("src.services.curriculum_extractor.AsyncOpenAI", return_value=mock_client):
            await extract_curriculum("Spec text", spec_code="8461")

        # Check the text sent to the LLM includes the spec code hint
        call_args = mock_client.chat.completions.create.call_args
        messages = call_args.kwargs["messages"]
        user_message = messages[1]["content"]
        assert "[Specification code: 8461]" in user_message
