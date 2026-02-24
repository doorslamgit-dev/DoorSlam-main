# ai-tutor-api/src/services/taxonomy.py
# Load curriculum topic taxonomy from Supabase for LLM classification.

import logging
from dataclasses import dataclass
from functools import lru_cache

from supabase import create_client

from ..config import settings

logger = logging.getLogger(__name__)


@dataclass
class TopicEntry:
    """A single topic from the curriculum hierarchy."""

    topic_id: str
    topic_name: str
    canonical_code: str | None
    theme_name: str
    component_name: str


@dataclass
class SubjectTaxonomy:
    """Complete topic taxonomy for a subject."""

    subject_id: str
    subject_name: str
    topics: list[TopicEntry]


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


@lru_cache(maxsize=32)
def load_taxonomy(subject_id: str) -> SubjectTaxonomy:
    """Load complete topic taxonomy for a subject.

    Joins: subjects → components → themes → topics.
    Cached for the lifetime of the process (topics rarely change).
    """
    sb = _get_supabase()

    # Get subject name
    subject_result = sb.table("subjects").select("name").eq("id", subject_id).execute()
    subject_name = subject_result.data[0]["name"] if subject_result.data else "Unknown"

    # Get components for this subject
    components = (
        sb.table("components")
        .select("id, component_name, order_index")
        .eq("subject_id", subject_id)
        .order("order_index")
        .execute()
    )

    topics: list[TopicEntry] = []

    for comp in components.data or []:
        # Get themes for this component
        themes = (
            sb.table("themes")
            .select("id, theme_name, order_index")
            .eq("component_id", comp["id"])
            .order("order_index")
            .execute()
        )

        for theme in themes.data or []:
            # Get topics for this theme
            topic_rows = (
                sb.table("topics")
                .select("id, topic_name, canonical_code")
                .eq("theme_id", theme["id"])
                .order("order_index")
                .execute()
            )

            for topic in topic_rows.data or []:
                topics.append(
                    TopicEntry(
                        topic_id=topic["id"],
                        topic_name=topic["topic_name"],
                        canonical_code=topic.get("canonical_code"),
                        theme_name=theme["theme_name"],
                        component_name=comp["component_name"],
                    )
                )

    logger.info(
        "Loaded taxonomy for subject %s (%s): %d topics",
        subject_id, subject_name, len(topics),
    )
    return SubjectTaxonomy(
        subject_id=subject_id,
        subject_name=subject_name,
        topics=topics,
    )


def format_taxonomy_for_prompt(taxonomy: SubjectTaxonomy) -> str:
    """Format the topic list as a numbered list for LLM consumption.

    Example output:
        1. [4.1.1] Cell structure (Cell Biology > Biology Paper 1)
        2. [4.1.2] Cell division (Cell Biology > Biology Paper 1)
    """
    lines = []
    for i, t in enumerate(taxonomy.topics, 1):
        code = f"[{t.canonical_code}] " if t.canonical_code else ""
        lines.append(f"{i}. {code}{t.topic_name} ({t.theme_name} > {t.component_name})")
    return "\n".join(lines)
