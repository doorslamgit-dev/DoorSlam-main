# ai-tutor-api/src/services/metadata_extractor.py
# LLM-based topic classification for RAG chunks.

import json
import logging
from dataclasses import dataclass, field

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from ..config import settings
from .taxonomy import SubjectTaxonomy, format_taxonomy_for_prompt

logger = logging.getLogger(__name__)


@dataclass
class TopicAssignment:
    """A topic assigned to a chunk by the LLM."""

    topic_id: str
    topic_name: str
    confidence: float


# Valid chunk content types
CHUNK_TYPES = frozenset({
    "question", "answer", "marking_criteria", "grade_table",
    "examiner_comment", "definition", "explanation", "worked_example",
    "learning_objective", "practical", "data_table", "general",
})


@dataclass
class ChunkTopicResult:
    """Extraction result for a single chunk."""

    chunk_index: int
    primary_topic: TopicAssignment | None = None
    secondary_topics: list[TopicAssignment] = field(default_factory=list)
    chunk_type: str = "general"


SYSTEM_PROMPT = """You are a GCSE curriculum classifier. Given text from a {source_type} document \
and a numbered topic taxonomy, assign each text chunk to the most relevant topic \
and classify the content type.

RULES:
- Each chunk must be assigned exactly ONE primary topic from the taxonomy.
- You may assign up to 2 secondary topics if the content clearly spans them.
- Use the topic NUMBER from the taxonomy list (1-based index), not free text.
- Rate your confidence from 0.0 to 1.0.
- If the chunk is purely administrative (front matter, instructions, headers), \
respond with primary_topic_number: null.
- Do NOT invent topics — only use topics from the provided taxonomy.
- Classify each chunk's content type as ONE of: question, answer, marking_criteria, \
grade_table, examiner_comment, definition, explanation, worked_example, \
learning_objective, practical, data_table, general.

TAXONOMY for {subject_name}:
{taxonomy}"""

USER_PROMPT_TEMPLATE = """Classify these chunks from "{doc_title}":

{chunks_text}

Respond in JSON:
{{
  "classifications": [
    {{
      "chunk_index": 0,
      "primary_topic_number": 3,
      "confidence": 0.85,
      "secondary_topic_numbers": [7],
      "chunk_type": "explanation"
    }}
  ]
}}"""


def _get_client() -> AsyncOpenAI:
    """Create an async OpenAI client for extraction."""
    api_key = settings.chat_api_key or settings.embedding_api_key
    return AsyncOpenAI(api_key=api_key, base_url="https://api.openai.com/v1")


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
)
async def _classify_batch(
    client: AsyncOpenAI,
    chunks: list[tuple[int, str]],
    taxonomy: SubjectTaxonomy,
    source_type: str,
    doc_title: str,
) -> list[ChunkTopicResult]:
    """Classify a batch of chunks via LLM. Returns results for each chunk."""
    formatted_taxonomy = format_taxonomy_for_prompt(taxonomy)

    system_msg = SYSTEM_PROMPT.format(
        source_type=source_type,
        subject_name=taxonomy.subject_name,
        taxonomy=formatted_taxonomy,
    )

    chunks_text = "\n\n".join(
        f"CHUNK {idx}:\n{content[:1000]}" for idx, content in chunks
    )

    user_msg = USER_PROMPT_TEMPLATE.format(
        doc_title=doc_title,
        chunks_text=chunks_text,
    )

    response = await client.chat.completions.create(
        model=settings.extraction_model,
        temperature=settings.extraction_temperature,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
        timeout=30,
    )

    raw = response.choices[0].message.content or "{}"
    data = json.loads(raw)
    classifications = data.get("classifications", [])

    # Build lookup from topic number (1-based) to TopicEntry
    topic_lookup = {i + 1: t for i, t in enumerate(taxonomy.topics)}
    chunk_index_set = {idx for idx, _ in chunks}

    results: list[ChunkTopicResult] = []
    for cls in classifications:
        chunk_idx = cls.get("chunk_index")
        if chunk_idx not in chunk_index_set:
            continue

        primary_num = cls.get("primary_topic_number")
        confidence = float(cls.get("confidence", 0.0))
        secondary_nums = cls.get("secondary_topic_numbers", [])
        raw_chunk_type = cls.get("chunk_type", "general")
        chunk_type = raw_chunk_type if raw_chunk_type in CHUNK_TYPES else "general"

        primary = None
        if primary_num and primary_num in topic_lookup:
            t = topic_lookup[primary_num]
            primary = TopicAssignment(
                topic_id=t.topic_id,
                topic_name=t.topic_name,
                confidence=confidence,
            )

        secondaries = []
        for sn in secondary_nums[:2]:
            if sn in topic_lookup:
                st = topic_lookup[sn]
                secondaries.append(
                    TopicAssignment(
                        topic_id=st.topic_id,
                        topic_name=st.topic_name,
                        confidence=confidence * 0.8,
                    )
                )

        results.append(
            ChunkTopicResult(
                chunk_index=chunk_idx,
                primary_topic=primary,
                secondary_topics=secondaries,
                chunk_type=chunk_type,
            )
        )

    # Fill in any chunks not returned by the LLM
    returned_indices = {r.chunk_index for r in results}
    for idx, _ in chunks:
        if idx not in returned_indices:
            results.append(ChunkTopicResult(chunk_index=idx))

    return results


async def extract_topics_for_chunks(
    chunks: list[tuple[int, str]],
    taxonomy: SubjectTaxonomy,
    source_type: str,
    doc_title: str,
) -> list[ChunkTopicResult]:
    """Classify chunks against the subject taxonomy using the LLM.

    Processes in batches sized by extraction_max_chunks_per_call.
    Returns a ChunkTopicResult for every input chunk.
    """
    if not chunks or not taxonomy.topics:
        return [ChunkTopicResult(chunk_index=idx) for idx, _ in chunks]

    client = _get_client()
    batch_size = settings.extraction_max_chunks_per_call
    all_results: list[ChunkTopicResult] = []

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        try:
            batch_results = await _classify_batch(
                client, batch, taxonomy, source_type, doc_title,
            )
            all_results.extend(batch_results)
            logger.info(
                "Classified chunks %d-%d of %d for '%s'",
                i, i + len(batch), len(chunks), doc_title,
            )
        except Exception as exc:
            logger.warning(
                "Extraction failed for batch %d-%d of '%s': %s",
                i, i + len(batch), doc_title, exc,
            )
            # Graceful degradation: return None for all chunks in this batch
            for idx, _ in batch:
                all_results.append(ChunkTopicResult(chunk_index=idx))

    return all_results
