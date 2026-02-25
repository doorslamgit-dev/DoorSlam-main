# ai-tutor-api/src/services/document_enricher.py
# LLM-based document-level metadata extraction (summary + key_points).

import json
import logging
from dataclasses import dataclass, field

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from ..config import settings

logger = logging.getLogger(__name__)

# Truncate input text to ~4000 tokens worth of characters (rough estimate: 4 chars/token)
_MAX_INPUT_CHARS = 16000


@dataclass
class DocumentEnrichment:
    """Result of LLM-based document enrichment."""

    summary: str
    key_points: list[dict] = field(default_factory=list)


# --- Doc-type-specific prompts ---

_PROMPTS: dict[str | None, str] = {
    "qp": (
        "Analyse this past exam paper. Return JSON with:\n"
        '- "summary": 2-3 sentence overview (subject, year, tier, total marks)\n'
        '- "key_points": array of objects, one per question, each with:\n'
        '  {"question": "Q1a", "topic": "topic name", "marks": number, "command_word": "explain/describe/calculate/etc"}\n'
        "Only include questions you can identify. If marks aren't visible, omit the field."
    ),
    "ms": (
        "Analyse this mark scheme. Return JSON with:\n"
        '- "summary": 2-3 sentence overview (which paper this marks, total marks)\n'
        '- "key_points": array of objects, one per question, each with:\n'
        '  {"question": "Q1a", "key_criteria": "brief summary of marking criteria", '
        '"common_errors": "common mistakes if mentioned"}\n'
        "Only include questions you can identify."
    ),
    "gt": (
        "Analyse this grade boundary table. Return JSON with:\n"
        '- "summary": 2-3 sentence overview (exam, session, total marks)\n'
        '- "key_points": array of objects, one per grade boundary, each with:\n'
        '  {"grade": "9", "marks": number}\n'
        "Extract all grade boundaries visible in the document."
    ),
    "er": (
        "Analyse this examiner report. Return JSON with:\n"
        '- "summary": 2-3 sentence overview (which paper, key themes)\n'
        '- "key_points": array of objects, each with:\n'
        '  {"area": "topic or question area", "strength": "what students did well", '
        '"weakness": "common mistakes or gaps"}\n'
        "Focus on the most actionable feedback for students."
    ),
    "spec": (
        "Analyse this specification document. Return JSON with:\n"
        '- "summary": 2-3 sentence overview (board, qualification, subject)\n'
        '- "key_points": array of objects, one per major topic area, each with:\n'
        '  {"topic": "topic name", "subtopics": ["subtopic 1", "subtopic 2"], '
        '"practicals": ["required practical if any"]}\n'
        "Cover the main topic areas of the specification."
    ),
    "rev": (
        "Analyse this revision guide. Return JSON with:\n"
        '- "summary": 2-3 sentence overview (subject area, what it covers)\n'
        '- "key_points": array of objects, each with:\n'
        '  {"topic": "topic name", "key_concepts": ["concept 1", "concept 2"]}\n'
        "Focus on the main topics and key concepts covered."
    ),
    None: (
        "Analyse this educational document. Return JSON with:\n"
        '- "summary": 2-3 sentence overview of the document\n'
        '- "key_points": array of objects, each with:\n'
        '  {"topic": "topic name", "detail": "key information"}\n'
        "Extract the most important information from the document."
    ),
}


def _get_prompt(doc_type: str | None, title: str, source_type: str) -> str:
    """Build the enrichment prompt for a given document type."""
    type_prompt = _PROMPTS.get(doc_type, _PROMPTS[None])
    return (
        f"Document: {title}\n"
        f"Type: {source_type}\n\n"
        f"{type_prompt}\n\n"
        "IMPORTANT: Return ONLY valid JSON, no markdown fences, no extra text."
    )


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def _call_llm(prompt: str, text: str) -> dict:
    """Call the enrichment LLM and parse JSON response."""
    client = AsyncOpenAI(
        api_key=settings.chat_api_key,
        base_url=settings.chat_base_url,
    )

    truncated = text[:_MAX_INPUT_CHARS]
    response = await client.chat.completions.create(
        model=settings.enrichment_model,
        temperature=settings.enrichment_temperature,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": truncated},
        ],
        max_tokens=2000,
    )

    raw = (response.choices[0].message.content or "").strip()

    # Strip markdown fences if the model wraps them
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3].strip()

    return json.loads(raw)


async def enrich_document(
    text: str,
    title: str,
    doc_type: str | None,
    source_type: str,
) -> DocumentEnrichment:
    """Generate document-level summary and key_points using LLM.

    Args:
        text: Full parsed document text (will be truncated to ~4000 tokens).
        title: Document title.
        doc_type: Document type code (qp, ms, gt, er, spec, rev) or None.
        source_type: Source type string (past_paper, specification, etc.).

    Returns:
        DocumentEnrichment with summary and key_points.
    """
    if not settings.enrichment_enabled:
        return DocumentEnrichment(summary="", key_points=[])

    if not text.strip():
        return DocumentEnrichment(summary="Empty document", key_points=[])

    try:
        prompt = _get_prompt(doc_type, title, source_type)
        result = await _call_llm(prompt, text)

        summary = result.get("summary", "")
        key_points = result.get("key_points", [])

        if not isinstance(summary, str):
            summary = str(summary)
        if not isinstance(key_points, list):
            key_points = []

        return DocumentEnrichment(summary=summary, key_points=key_points)

    except Exception as exc:
        logger.warning("Document enrichment failed for '%s': %s", title, exc)
        return DocumentEnrichment(summary="", key_points=[])
