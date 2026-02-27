# ai-tutor-api/src/services/curriculum_extractor.py
# LLM-based curriculum hierarchy extraction from specification PDFs.
#
# Parses a specification document into the component → theme → topic hierarchy
# expected by the public.curriculum_staging table.

import json
import logging
from dataclasses import asdict, dataclass, field

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from ..config import settings

logger = logging.getLogger(__name__)

# Spec PDFs are large (30-80 pages). We send significant text to get full coverage.
# GPT-4o supports 128k context; we cap at ~100k chars (~25k tokens).
_MAX_INPUT_CHARS = 100_000


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class ExtractedTopic:
    """A single topic extracted from a specification."""

    name: str
    order: int
    canonical_code: str | None = None


@dataclass
class ExtractedTheme:
    """A theme (topic area) containing multiple topics."""

    name: str
    order: int
    topics: list[ExtractedTopic] = field(default_factory=list)


@dataclass
class ExtractedComponent:
    """A component (paper/unit) containing themes."""

    name: str
    order: int
    weighting: str | None = None
    duration_minutes: int | None = None
    themes: list[ExtractedTheme] = field(default_factory=list)


@dataclass
class ExtractedPathway:
    """A tier/pathway (Foundation, Higher, etc.)."""

    code: str
    name: str


@dataclass
class ExtractedPaper:
    """An exam paper derived from a component."""

    paper_code: str
    paper_name: str
    duration_minutes: int | None = None
    weighting_percent: float | None = None


@dataclass
class CurriculumExtraction:
    """Complete extraction result from a specification PDF."""

    subject_name: str
    exam_board: str
    spec_code: str
    qualification: str  # GCSE, IGCSE
    spec_version: str | None = None  # e.g., "2016", "2018"
    first_teaching: str | None = None  # e.g., "September 2016"
    components: list[ExtractedComponent] = field(default_factory=list)
    pathways: list[ExtractedPathway] = field(default_factory=list)
    papers: list[ExtractedPaper] = field(default_factory=list)

    @property
    def total_topics(self) -> int:
        return sum(
            len(theme.topics)
            for comp in self.components
            for theme in comp.themes
        )

    def to_staging_rows(self, subject_id: str) -> list[dict]:
        """Flatten the hierarchy into rows suitable for curriculum_staging INSERT."""
        rows = []
        for comp in self.components:
            for theme in comp.themes:
                for topic in theme.topics:
                    rows.append({
                        "subject_id": subject_id,
                        "component_name": comp.name,
                        "component_order": comp.order,
                        "component_weighting": comp.weighting,
                        "theme_name": theme.name,
                        "theme_order": theme.order,
                        "topic_name": topic.name,
                        "topic_order": topic.order,
                        "canonical_code": topic.canonical_code,
                    })
        return rows


# ---------------------------------------------------------------------------
# LLM prompt
# ---------------------------------------------------------------------------

_EXTRACTION_PROMPT = """\
You are a curriculum data extraction expert. Analyse the following GCSE/IGCSE \
specification document and extract the COMPLETE curriculum hierarchy.

Return ONLY valid JSON with this exact structure:
{
  "subject_name": "Biology",
  "exam_board": "AQA",
  "spec_code": "8461",
  "qualification": "GCSE",
  "spec_version": "2016",
  "first_teaching": "September 2016",
  "components": [
    {
      "name": "Paper 1: Cell Biology, Organisation, Infection and Response, and Bioenergetics",
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
            {"name": "Transport in cells", "order": 3, "canonical_code": "4.1.3"}
          ]
        }
      ]
    }
  ],
  "pathways": [
    {"code": "foundation", "name": "Foundation"},
    {"code": "higher", "name": "Higher"}
  ],
  "papers": [
    {"paper_code": "8461/1F", "paper_name": "Paper 1 (Foundation)", "duration_minutes": 105, "weighting_percent": 50},
    {"paper_code": "8461/1H", "paper_name": "Paper 1 (Higher)", "duration_minutes": 105, "weighting_percent": 50}
  ]
}

RULES:
1. Components = exam papers or assessment units (Paper 1, Paper 2, etc.)
2. Themes = major topic areas within each component (these group related topics)
3. Topics = individual subtopics that students must learn. Be granular — each \
   numbered section or subsection in the spec should be a separate topic.
4. canonical_code = the specification's own numbering system (e.g., 4.1.1, 4.1.2). \
   Use null if the spec has no numbering.
5. Extract ALL topics — do not summarise or skip sections. Completeness is critical.
6. pathways: include Foundation/Higher if the subject is tiered, empty array if not.
7. papers: list all actual exam papers with their codes.
8. order fields must be sequential integers starting from 1.
9. If unsure which component a theme belongs to, check the spec's assessment info \
   — it typically states which topics are examined on which paper.
10. Return ONLY the JSON object. No markdown fences, no commentary."""


# ---------------------------------------------------------------------------
# LLM interaction
# ---------------------------------------------------------------------------

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=30))
async def _call_extraction_llm(text: str) -> dict:
    """Send spec text to the LLM and parse the structured JSON response."""
    client = AsyncOpenAI(
        api_key=settings.chat_api_key,
        base_url=settings.chat_base_url,
    )

    truncated = text[:_MAX_INPUT_CHARS]

    response = await client.chat.completions.create(
        model=settings.curriculum_extraction_model,
        temperature=0.0,
        messages=[
            {"role": "system", "content": _EXTRACTION_PROMPT},
            {"role": "user", "content": truncated},
        ],
        max_tokens=8000,
        response_format={"type": "json_object"},
    )

    raw = (response.choices[0].message.content or "").strip()

    # Strip markdown fences if model wraps them despite json_object mode
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3].strip()

    return json.loads(raw)


def _parse_extraction(data: dict) -> CurriculumExtraction:
    """Parse the raw LLM JSON into typed dataclasses."""
    components = []
    for comp_data in data.get("components", []):
        themes = []
        for theme_data in comp_data.get("themes", []):
            topics = [
                ExtractedTopic(
                    name=t["name"],
                    order=t.get("order", i + 1),
                    canonical_code=t.get("canonical_code"),
                )
                for i, t in enumerate(theme_data.get("topics", []))
            ]
            themes.append(ExtractedTheme(
                name=theme_data["name"],
                order=theme_data.get("order", len(themes) + 1),
                topics=topics,
            ))
        components.append(ExtractedComponent(
            name=comp_data["name"],
            order=comp_data.get("order", len(components) + 1),
            weighting=comp_data.get("weighting"),
            duration_minutes=comp_data.get("duration_minutes"),
            themes=themes,
        ))

    pathways = [
        ExtractedPathway(code=p["code"], name=p["name"])
        for p in data.get("pathways", [])
    ]

    papers = [
        ExtractedPaper(
            paper_code=p["paper_code"],
            paper_name=p["paper_name"],
            duration_minutes=p.get("duration_minutes"),
            weighting_percent=p.get("weighting_percent"),
        )
        for p in data.get("papers", [])
    ]

    return CurriculumExtraction(
        subject_name=data.get("subject_name", "Unknown"),
        exam_board=data.get("exam_board", "Unknown"),
        spec_code=data.get("spec_code", ""),
        qualification=data.get("qualification", "GCSE"),
        spec_version=data.get("spec_version"),
        first_teaching=data.get("first_teaching"),
        components=components,
        pathways=pathways,
        papers=papers,
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def extract_curriculum(
    spec_text: str,
    spec_code: str | None = None,
) -> CurriculumExtraction:
    """Extract the full curriculum hierarchy from specification document text.

    Args:
        spec_text: The full text of a specification PDF (parsed via Docling or PyMuPDF).
        spec_code: Optional spec code hint (e.g., "8461") to help the LLM.

    Returns:
        CurriculumExtraction with the complete component → theme → topic hierarchy,
        plus pathways and paper info.
    """
    if not spec_text.strip():
        raise ValueError("Specification text is empty — cannot extract curriculum.")

    # Optionally prepend the spec code as a hint
    text = spec_text
    if spec_code:
        text = f"[Specification code: {spec_code}]\n\n{text}"

    logger.info(
        "Extracting curriculum from spec (length=%d chars, spec_code=%s)...",
        len(text), spec_code,
    )

    raw = await _call_extraction_llm(text)
    extraction = _parse_extraction(raw)

    logger.info(
        "Extraction complete: %s %s %s — %d components, %d themes, %d topics",
        extraction.exam_board,
        extraction.qualification,
        extraction.subject_name,
        len(extraction.components),
        sum(len(c.themes) for c in extraction.components),
        extraction.total_topics,
    )

    return extraction


def extraction_to_dict(extraction: CurriculumExtraction) -> dict:
    """Convert a CurriculumExtraction to a plain dict for JSON serialisation."""
    return asdict(extraction)
