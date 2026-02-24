# ai-tutor-api/src/services/chunker.py
# Recursive character text splitting with token counting.

import hashlib
from dataclasses import dataclass

import tiktoken

_ENCODING = tiktoken.get_encoding("cl100k_base")

SEPARATORS = ["\n\n", "\n", ". ", " ", ""]


@dataclass
class Chunk:
    """A single text chunk with metadata."""

    content: str
    index: int
    token_count: int
    content_hash: str


def count_tokens(text: str) -> int:
    """Count tokens using cl100k_base encoding."""
    return len(_ENCODING.encode(text))


def _content_hash(text: str) -> str:
    """SHA-256 hash of chunk content."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def chunk_text(
    text: str,
    chunk_size: int = 800,
    chunk_overlap: int = 100,
) -> list[Chunk]:
    """Split text into chunks using recursive character splitting.

    Args:
        text: The full document text.
        chunk_size: Target token count per chunk.
        chunk_overlap: Token overlap between consecutive chunks.

    Returns:
        List of Chunk objects with content, index, token_count, and content_hash.
    """
    if not text.strip():
        return []

    raw_chunks = _recursive_split(text, chunk_size, SEPARATORS)
    result: list[Chunk] = []

    for i, raw in enumerate(raw_chunks):
        stripped = raw.strip()
        if not stripped:
            continue
        tokens = count_tokens(stripped)
        result.append(
            Chunk(
                content=stripped,
                index=i,
                token_count=tokens,
                content_hash=_content_hash(stripped),
            )
        )

    # Apply overlap: prepend tail of previous chunk to the start of each chunk
    if chunk_overlap > 0 and len(result) > 1:
        result = _apply_overlap(result, chunk_overlap)

    # Re-index after overlap
    for i, chunk in enumerate(result):
        chunk.index = i

    return result


def _recursive_split(text: str, chunk_size: int, separators: list[str]) -> list[str]:
    """Recursively split text using a list of separators."""
    if count_tokens(text) <= chunk_size:
        return [text]

    if not separators:
        # Last resort: split by character count (approximate)
        mid = len(text) // 2
        return _recursive_split(text[:mid], chunk_size, []) + _recursive_split(
            text[mid:], chunk_size, []
        )

    sep = separators[0]
    remaining_seps = separators[1:]

    parts = text.split(sep) if sep else list(text)
    chunks: list[str] = []
    current = ""

    for part in parts:
        candidate = current + sep + part if current else part
        if count_tokens(candidate) <= chunk_size:
            current = candidate
        else:
            if current:
                chunks.append(current)
            # If this single part is too large, split it further
            if count_tokens(part) > chunk_size:
                chunks.extend(_recursive_split(part, chunk_size, remaining_seps))
                current = ""
            else:
                current = part

    if current:
        chunks.append(current)

    return chunks


def _apply_overlap(chunks: list[Chunk], overlap_tokens: int) -> list[Chunk]:
    """Add overlap from the end of the previous chunk to the start of each chunk."""
    result = [chunks[0]]

    for i in range(1, len(chunks)):
        prev_text = chunks[i - 1].content
        prev_tokens = _ENCODING.encode(prev_text)
        overlap_text = _ENCODING.decode(prev_tokens[-overlap_tokens:]) if len(prev_tokens) > overlap_tokens else prev_text
        new_content = overlap_text + " " + chunks[i].content
        new_content = new_content.strip()

        result.append(
            Chunk(
                content=new_content,
                index=i,
                token_count=count_tokens(new_content),
                content_hash=_content_hash(new_content),
            )
        )

    return result
