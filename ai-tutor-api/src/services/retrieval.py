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
    year: int | None = None
    session: str | None = None
    paper_number: str | None = None
    doc_type: str | None = None
    file_key: str | None = None
    exam_pathway_id: str | None = None
    summary: str | None = None
    key_points: list[dict] | None = None

    @property
    def chunk_type(self) -> str:
        """Extract chunk_type from chunk metadata."""
        return self.chunk_metadata.get("chunk_type", "general")


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def search_chunks(
    query_embedding: list[float],
    subject_id: str | None = None,
    topic_id: str | None = None,
    exam_board_id: str | None = None,
    source_type: str | None = None,
    year: int | None = None,
    exam_pathway_id: str | None = None,
    doc_type: str | None = None,
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
            "filter_source_type": source_type,
            "filter_year": year,
            "filter_exam_pathway_id": exam_pathway_id,
            "filter_doc_type": doc_type,
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
                year=row.get("doc_year"),
                session=row.get("doc_session"),
                paper_number=row.get("doc_paper_number"),
                doc_type=row.get("doc_type"),
                file_key=row.get("doc_file_key"),
                exam_pathway_id=row.get("doc_exam_pathway_id"),
                summary=row.get("doc_summary"),
                key_points=row.get("doc_key_points"),
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
    source_type: str | None = None,
    year: int | None = None,
    exam_pathway_id: str | None = None,
    doc_type: str | None = None,
) -> list[RetrievedChunk]:
    """Convenience wrapper: embed query then search. For parallel pipelines, use
    embed_query() + search_chunks() separately.
    """
    query_embedding = await embed_query(query)
    return await search_chunks(
        query_embedding, subject_id, topic_id, exam_board_id,
        source_type, year, exam_pathway_id, doc_type,
    )


def _format_source_label(index: int, chunk: RetrievedChunk) -> str:
    """Build a rich source label with available metadata."""
    parts = [chunk.document_title]

    # Source type + temporal context
    detail_parts = [chunk.source_type]
    if chunk.session and chunk.year:
        detail_parts.append(f"{chunk.session} {chunk.year}")
    elif chunk.year:
        detail_parts.append(str(chunk.year))
    if chunk.paper_number:
        detail_parts.append(f"Paper {chunk.paper_number}")
    parts.append(", ".join(detail_parts))

    # Chunk content type
    chunk_type = chunk.chunk_type
    if chunk_type != "general":
        parts.append(f"Content type: {chunk_type}")

    return f"[Source {index}: {' | '.join(parts)}]"


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

    lines = ["Relevant revision materials (cite as (Source N) when used):\n"]
    for i, chunk in enumerate(chunks, 1):
        lines.append(_format_source_label(i, chunk))
        lines.append(chunk.content)
        lines.append("")

    lines.append(
        "Cite sources inline when you use them, e.g. (Source 1). "
        "If the sources don't answer the question, say so and use general knowledge."
    )
    return "\n".join(lines)
