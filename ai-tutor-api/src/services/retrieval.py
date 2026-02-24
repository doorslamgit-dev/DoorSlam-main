# ai-tutor-api/src/services/retrieval.py
# Vector search with role-based scoping for RAG retrieval.

import logging
from dataclasses import dataclass

from supabase import create_client

from ..config import settings
from .embedder import embed_query

logger = logging.getLogger(__name__)


@dataclass
class RetrievedChunk:
    """A chunk retrieved from vector search."""

    id: str
    document_id: str
    content: str
    similarity: float
    document_title: str
    source_type: str
    subject_id: str | None
    topic_id: str | None
    chunk_metadata: dict
    doc_metadata: dict


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def search_chunks(
    query_embedding: list[float],
    subject_id: str | None = None,
    topic_id: str | None = None,
    exam_board_id: str | None = None,
) -> list[RetrievedChunk]:
    """Search for chunks using a pre-computed embedding vector.

    Use this when you already have the query embedding (e.g., from a parallel
    embed call). For the convenience wrapper that embeds + searches in one call,
    use retrieve_context().
    """
    sb = _get_supabase()
    result = sb.schema("rag").rpc(
        "search_chunks",
        {
            "query_embedding": query_embedding,
            "match_count": settings.retrieval_match_count,
            "similarity_threshold": settings.retrieval_similarity_threshold,
            "filter_subject_id": subject_id,
            "filter_topic_id": topic_id,
            "filter_exam_board_id": exam_board_id,
        },
    ).execute()

    chunks = []
    for row in result.data or []:
        chunks.append(
            RetrievedChunk(
                id=row["id"],
                document_id=row["document_id"],
                content=row["content"],
                similarity=row["similarity"],
                document_title=row["document_title"],
                source_type=row["source_type"],
                subject_id=row.get("subject_id"),
                topic_id=row.get("topic_id"),
                chunk_metadata=row.get("chunk_metadata", {}),
                doc_metadata=row.get("doc_metadata", {}),
            )
        )

    logger.info(
        "Retrieved %d chunks for query (subject=%s, topic=%s)",
        len(chunks), subject_id, topic_id,
    )
    return chunks


async def retrieve_context(
    query: str,
    subject_id: str | None = None,
    topic_id: str | None = None,
    exam_board_id: str | None = None,
) -> list[RetrievedChunk]:
    """Convenience wrapper: embed query then search. For parallel pipelines, use
    embed_query() + search_chunks() separately.
    """
    query_embedding = await embed_query(query)
    return await search_chunks(query_embedding, subject_id, topic_id, exam_board_id)


def format_retrieval_context(chunks: list[RetrievedChunk]) -> str:
    """Format retrieved chunks into a context string for the LLM system message.

    Returns a message suitable for injection as a second system message.
    """
    if not chunks:
        return (
            "No relevant revision materials were found for this question. "
            "Answer from your general knowledge, but let the student know "
            "you don't have specific materials on this topic yet."
        )

    lines = ["Here are relevant excerpts from revision materials:\n"]
    for i, chunk in enumerate(chunks, 1):
        lines.append(f"[Source {i}: {chunk.document_title} ({chunk.source_type})]")
        lines.append(chunk.content)
        lines.append("")

    lines.append(
        "Use these sources to inform your answer. Reference specific documents "
        "when appropriate. If the sources don't fully answer the question, "
        "supplement with your general knowledge."
    )
    return "\n".join(lines)
