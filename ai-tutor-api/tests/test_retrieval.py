# tests/test_retrieval.py
# Unit tests for the retrieval service (search, format context).

import pytest
from unittest.mock import AsyncMock, MagicMock

from src.services.retrieval import (
    RetrievedChunk,
    format_retrieval_context,
    search_chunks,
)


def _make_chunk(
    idx: int = 1,
    content: str = "Test content",
    title: str = "AQA Biology Paper 1",
    source_type: str = "past_paper",
    similarity: float = 0.85,
) -> RetrievedChunk:
    return RetrievedChunk(
        id=f"chunk-{idx}",
        document_id=f"doc-{idx}",
        content=content,
        similarity=similarity,
        document_title=title,
        source_type=source_type,
        subject_id=None,
        topic_id=None,
        chunk_metadata={},
        doc_metadata={},
    )


class TestSearchChunks:
    @pytest.mark.anyio
    async def test_returns_retrieved_chunks(self, monkeypatch):
        """search_chunks calls RPC and returns RetrievedChunk list."""
        fake_data = [
            {
                "id": "c1",
                "document_id": "d1",
                "content": "Cell division occurs...",
                "similarity": 0.9,
                "document_title": "AQA Biology Spec",
                "source_type": "specification",
                "subject_id": None,
                "topic_id": None,
                "chunk_metadata": {},
                "doc_metadata": {},
            }
        ]

        mock_execute = MagicMock()
        mock_execute.execute.return_value = MagicMock(data=fake_data)

        mock_rpc = MagicMock(return_value=mock_execute)
        mock_schema = MagicMock()
        mock_schema.rpc = mock_rpc

        mock_sb = MagicMock()
        mock_sb.schema.return_value = mock_schema

        monkeypatch.setattr(
            "src.services.retrieval.create_client", lambda _u, _k: mock_sb,
        )

        results = await search_chunks([0.0] * 2000)

        assert len(results) == 1
        assert isinstance(results[0], RetrievedChunk)
        assert results[0].content == "Cell division occurs..."
        assert results[0].similarity == 0.9

    @pytest.mark.anyio
    async def test_empty_results(self, monkeypatch):
        """search_chunks returns empty list when no matches."""
        mock_execute = MagicMock()
        mock_execute.execute.return_value = MagicMock(data=[])

        mock_rpc = MagicMock(return_value=mock_execute)
        mock_schema = MagicMock()
        mock_schema.rpc = mock_rpc

        mock_sb = MagicMock()
        mock_sb.schema.return_value = mock_schema

        monkeypatch.setattr(
            "src.services.retrieval.create_client", lambda _u, _k: mock_sb,
        )

        results = await search_chunks([0.0] * 2000)
        assert results == []


class TestFormatRetrievalContext:
    def test_empty_chunks_fallback(self):
        """Empty chunks produce a fallback message."""
        result = format_retrieval_context([])
        assert "No relevant revision materials" in result
        assert "general knowledge" in result

    def test_single_chunk_formatted(self):
        """A single chunk produces source citation header and content."""
        chunks = [_make_chunk(idx=1, content="Mitosis is cell division.")]
        result = format_retrieval_context(chunks)

        assert "[Source 1: AQA Biology Paper 1 | past_paper]" in result
        assert "Mitosis is cell division." in result
        assert "Cite sources inline" in result

    def test_multiple_chunks_numbered(self):
        """Multiple chunks are numbered sequentially."""
        chunks = [
            _make_chunk(idx=1, content="First chunk."),
            _make_chunk(idx=2, content="Second chunk.", title="AQA Biology Paper 2"),
        ]
        result = format_retrieval_context(chunks)

        assert "[Source 1:" in result
        assert "[Source 2:" in result
        assert "First chunk." in result
        assert "Second chunk." in result

    def test_context_includes_source_type(self):
        """Source type is included in the citation."""
        chunks = [_make_chunk(source_type="specification")]
        result = format_retrieval_context(chunks)
        assert "specification" in result

    def test_rich_label_with_year_and_session(self):
        """Source label includes year, session, and paper number when available."""
        chunk = _make_chunk()
        chunk.year = 2024
        chunk.session = "June"
        chunk.paper_number = "1"
        result = format_retrieval_context([chunk])
        assert "June 2024" in result
        assert "Paper 1" in result

    def test_chunk_type_in_label(self):
        """Chunk type is shown in source label when not 'general'."""
        chunk = _make_chunk()
        chunk.chunk_metadata = {"chunk_type": "question"}
        result = format_retrieval_context([chunk])
        assert "Content type: question" in result

    def test_chunk_type_general_not_shown(self):
        """Chunk type 'general' is not explicitly shown in label."""
        chunk = _make_chunk()
        chunk.chunk_metadata = {"chunk_type": "general"}
        result = format_retrieval_context([chunk])
        assert "Content type" not in result
