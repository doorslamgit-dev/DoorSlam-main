# tests/test_metadata_extractor.py
# Unit tests for LLM-based topic classification.

import json
from dataclasses import dataclass
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.services.metadata_extractor import (
    ChunkTopicResult,
    TopicAssignment,
    extract_topics_for_chunks,
    _classify_batch,
)
from src.services.taxonomy import SubjectTaxonomy, TopicEntry


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

SAMPLE_TAXONOMY = SubjectTaxonomy(
    subject_id="sub-001",
    subject_name="Biology",
    topics=[
        TopicEntry(
            topic_id="topic-001",
            topic_name="Cell structure",
            canonical_code="4.1.1",
            theme_name="Cell Biology",
            component_name="Biology Paper 1",
        ),
        TopicEntry(
            topic_id="topic-002",
            topic_name="Cell division",
            canonical_code="4.1.2",
            theme_name="Cell Biology",
            component_name="Biology Paper 1",
        ),
        TopicEntry(
            topic_id="topic-003",
            topic_name="Transport in cells",
            canonical_code="4.1.3",
            theme_name="Cell Biology",
            component_name="Biology Paper 1",
        ),
    ],
)


def _make_llm_response(classifications: list[dict]) -> MagicMock:
    """Build a fake OpenAI response with JSON content."""
    content = json.dumps({"classifications": classifications})
    message = MagicMock()
    message.content = content
    choice = MagicMock()
    choice.message = message
    response = MagicMock()
    response.choices = [choice]
    return response


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


class TestClassifyBatch:
    @pytest.mark.anyio
    async def test_single_chunk_classified(self, monkeypatch):
        """A single chunk gets classified with the correct topic_id."""
        response = _make_llm_response([
            {
                "chunk_index": 0,
                "primary_topic_number": 1,
                "confidence": 0.9,
                "secondary_topic_numbers": [],
            },
        ])

        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=response)

        monkeypatch.setattr(
            "src.services.metadata_extractor._get_client", lambda: mock_client,
        )

        results = await _classify_batch(
            client=mock_client,
            chunks=[(0, "Cells have a nucleus and cytoplasm.")],
            taxonomy=SAMPLE_TAXONOMY,
            source_type="specification",
            doc_title="AQA Biology Spec",
        )

        assert len(results) == 1
        assert results[0].chunk_index == 0
        assert results[0].primary_topic is not None
        assert results[0].primary_topic.topic_id == "topic-001"
        assert results[0].primary_topic.confidence == 0.9

    @pytest.mark.anyio
    async def test_secondary_topics(self, monkeypatch):
        """Secondary topics are mapped correctly."""
        response = _make_llm_response([
            {
                "chunk_index": 0,
                "primary_topic_number": 1,
                "confidence": 0.85,
                "secondary_topic_numbers": [2, 3],
            },
        ])

        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=response)

        results = await _classify_batch(
            client=mock_client,
            chunks=[(0, "Cell division and transport mechanisms.")],
            taxonomy=SAMPLE_TAXONOMY,
            source_type="past_paper",
            doc_title="Biology Paper 1 2024",
        )

        assert len(results[0].secondary_topics) == 2
        assert results[0].secondary_topics[0].topic_id == "topic-002"
        assert results[0].secondary_topics[1].topic_id == "topic-003"
        # Secondary confidence is 0.8 × primary
        assert results[0].secondary_topics[0].confidence == pytest.approx(0.68)

    @pytest.mark.anyio
    async def test_null_primary_topic(self, monkeypatch):
        """Chunk with null primary_topic_number (administrative content)."""
        response = _make_llm_response([
            {
                "chunk_index": 0,
                "primary_topic_number": None,
                "confidence": 0.0,
                "secondary_topic_numbers": [],
            },
        ])

        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=response)

        results = await _classify_batch(
            client=mock_client,
            chunks=[(0, "Instructions: Read all questions carefully.")],
            taxonomy=SAMPLE_TAXONOMY,
            source_type="past_paper",
            doc_title="Biology Paper 1 2024",
        )

        assert results[0].primary_topic is None

    @pytest.mark.anyio
    async def test_out_of_range_topic_number(self, monkeypatch):
        """Topic numbers outside the taxonomy range are ignored."""
        response = _make_llm_response([
            {
                "chunk_index": 0,
                "primary_topic_number": 99,  # No such topic
                "confidence": 0.9,
                "secondary_topic_numbers": [],
            },
        ])

        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=response)

        results = await _classify_batch(
            client=mock_client,
            chunks=[(0, "Some content.")],
            taxonomy=SAMPLE_TAXONOMY,
            source_type="specification",
            doc_title="AQA Biology Spec",
        )

        assert results[0].primary_topic is None

    @pytest.mark.anyio
    async def test_missing_chunks_filled(self, monkeypatch):
        """Chunks not returned by the LLM get empty ChunkTopicResult."""
        response = _make_llm_response([
            {
                "chunk_index": 0,
                "primary_topic_number": 1,
                "confidence": 0.9,
                "secondary_topic_numbers": [],
            },
            # chunk_index 1 is missing from LLM response
        ])

        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=response)

        results = await _classify_batch(
            client=mock_client,
            chunks=[(0, "Cell structure."), (1, "Some other content.")],
            taxonomy=SAMPLE_TAXONOMY,
            source_type="specification",
            doc_title="AQA Biology Spec",
        )

        assert len(results) == 2
        # chunk 1 should have empty result
        chunk_1_result = next(r for r in results if r.chunk_index == 1)
        assert chunk_1_result.primary_topic is None

    @pytest.mark.anyio
    async def test_invalid_json_raises(self, monkeypatch):
        """Invalid JSON from LLM raises an exception."""
        message = MagicMock()
        message.content = "not valid json!!!"
        choice = MagicMock()
        choice.message = message
        response = MagicMock()
        response.choices = [choice]

        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=response)

        with pytest.raises(Exception):
            await _classify_batch(
                client=mock_client,
                chunks=[(0, "Cell structure.")],
                taxonomy=SAMPLE_TAXONOMY,
                source_type="specification",
                doc_title="AQA Biology Spec",
            )


class TestExtractTopicsForChunks:
    @pytest.mark.anyio
    async def test_empty_chunks(self):
        """Empty chunk list returns empty results."""
        results = await extract_topics_for_chunks(
            chunks=[],
            taxonomy=SAMPLE_TAXONOMY,
            source_type="specification",
            doc_title="Test",
        )
        assert results == []

    @pytest.mark.anyio
    async def test_empty_taxonomy(self):
        """Empty taxonomy returns unclassified results for all chunks."""
        empty_taxonomy = SubjectTaxonomy(
            subject_id="s1", subject_name="Empty", topics=[],
        )
        results = await extract_topics_for_chunks(
            chunks=[(0, "Some content"), (1, "More content")],
            taxonomy=empty_taxonomy,
            source_type="specification",
            doc_title="Test",
        )
        assert len(results) == 2
        assert all(r.primary_topic is None for r in results)

    @pytest.mark.anyio
    async def test_batching(self, monkeypatch):
        """Chunks are processed in batches per extraction_max_chunks_per_call."""
        monkeypatch.setattr("src.services.metadata_extractor.settings.extraction_max_chunks_per_call", 2)

        call_count = 0

        async def mock_classify_batch(client, chunks, taxonomy, source_type, doc_title):
            nonlocal call_count
            call_count += 1
            return [ChunkTopicResult(chunk_index=idx) for idx, _ in chunks]

        monkeypatch.setattr(
            "src.services.metadata_extractor._classify_batch", mock_classify_batch,
        )

        chunks = [(i, f"Content {i}") for i in range(5)]
        results = await extract_topics_for_chunks(
            chunks=chunks,
            taxonomy=SAMPLE_TAXONOMY,
            source_type="specification",
            doc_title="Test",
        )

        assert call_count == 3  # 5 chunks / batch_size 2 = 3 batches
        assert len(results) == 5

    @pytest.mark.anyio
    async def test_batch_failure_graceful_degradation(self, monkeypatch):
        """Failed batch returns unclassified results without crashing."""
        monkeypatch.setattr("src.services.metadata_extractor.settings.extraction_max_chunks_per_call", 2)

        call_count = 0

        async def mock_classify_batch(client, chunks, taxonomy, source_type, doc_title):
            nonlocal call_count
            call_count += 1
            if call_count == 2:
                raise RuntimeError("LLM API error")
            return [
                ChunkTopicResult(
                    chunk_index=idx,
                    primary_topic=TopicAssignment(
                        topic_id="topic-001",
                        topic_name="Cell structure",
                        confidence=0.9,
                    ),
                )
                for idx, _ in chunks
            ]

        monkeypatch.setattr(
            "src.services.metadata_extractor._classify_batch", mock_classify_batch,
        )

        chunks = [(i, f"Content {i}") for i in range(4)]
        results = await extract_topics_for_chunks(
            chunks=chunks,
            taxonomy=SAMPLE_TAXONOMY,
            source_type="specification",
            doc_title="Test",
        )

        assert len(results) == 4
        # Batch 1 (chunks 0-1) succeeded
        assert results[0].primary_topic is not None
        assert results[1].primary_topic is not None
        # Batch 2 (chunks 2-3) failed — graceful degradation
        assert results[2].primary_topic is None
        assert results[3].primary_topic is None
