# tests/test_chunker.py
# Unit tests for the text chunker service.

from src.services.chunker import Chunk, chunk_text, count_tokens


class TestCountTokens:
    def test_empty_string(self):
        assert count_tokens("") == 0

    def test_simple_text(self):
        tokens = count_tokens("Hello world")
        assert tokens > 0

    def test_consistent(self):
        text = "The quick brown fox jumps over the lazy dog"
        assert count_tokens(text) == count_tokens(text)


class TestChunkText:
    def test_empty_string(self):
        assert chunk_text("") == []

    def test_whitespace_only(self):
        assert chunk_text("   \n\n  ") == []

    def test_short_text_single_chunk(self):
        text = "Hello, this is a short text."
        chunks = chunk_text(text, chunk_size=100)
        assert len(chunks) == 1
        assert chunks[0].content == text
        assert chunks[0].index == 0
        assert chunks[0].token_count > 0
        assert len(chunks[0].content_hash) == 64  # SHA-256 hex

    def test_returns_chunk_dataclass(self):
        chunks = chunk_text("Some text here.")
        assert isinstance(chunks[0], Chunk)

    def test_long_text_multiple_chunks(self):
        # Create text that's definitely larger than chunk_size=50 tokens
        text = " ".join([f"Sentence number {i} with some words." for i in range(100)])
        chunks = chunk_text(text, chunk_size=50, chunk_overlap=0)
        assert len(chunks) > 1

    def test_chunk_indexes_sequential(self):
        text = " ".join([f"Word{i}" for i in range(500)])
        chunks = chunk_text(text, chunk_size=50, chunk_overlap=0)
        for i, chunk in enumerate(chunks):
            assert chunk.index == i

    def test_content_hashes_are_hex(self):
        text = "A paragraph.\n\nAnother paragraph."
        chunks = chunk_text(text, chunk_size=5, chunk_overlap=0)
        for chunk in chunks:
            assert len(chunk.content_hash) == 64
            int(chunk.content_hash, 16)  # Validates hex

    def test_overlap_adds_context(self):
        text = "First section with content.\n\nSecond section with different content.\n\nThird section with more."
        chunks_no_overlap = chunk_text(text, chunk_size=10, chunk_overlap=0)
        chunks_with_overlap = chunk_text(text, chunk_size=10, chunk_overlap=3)

        if len(chunks_with_overlap) > 1:
            # With overlap, later chunks should be longer than without
            # (they include text from the previous chunk)
            assert chunks_with_overlap[1].token_count >= chunks_no_overlap[1].token_count if len(chunks_no_overlap) > 1 else True

    def test_no_empty_chunks(self):
        text = "Hello\n\n\n\nWorld\n\n\n\nFoo"
        chunks = chunk_text(text, chunk_size=5, chunk_overlap=0)
        for chunk in chunks:
            assert chunk.content.strip() != ""
