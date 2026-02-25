# tests/test_taxonomy.py
# Unit tests for the taxonomy loader.

from unittest.mock import MagicMock

import pytest

from src.services.taxonomy import (
    SubjectTaxonomy,
    TopicEntry,
    format_taxonomy_for_prompt,
    load_taxonomy,
)


def _mock_supabase(subject_data, components_data, themes_data, topics_data):
    """Build a mock Supabase client with nested table queries.

    Args:
        subject_data: list[dict] for subjects table
        components_data: list[dict] for components table
        themes_data: dict[str, list[dict]] mapping component_id → themes rows
        topics_data: dict[str, list[dict]] mapping theme_id → topics rows
    """
    mock_sb = MagicMock()

    def _table(name):
        mock_table = MagicMock()

        if name == "subjects":
            mock_chain = MagicMock()
            mock_chain.eq.return_value = mock_chain
            mock_chain.execute.return_value = MagicMock(data=subject_data)
            mock_table.select.return_value = mock_chain

        elif name == "components":
            mock_chain = MagicMock()

            def _eq(_col, val):
                # Store filter value for ordering
                mock_chain._subject_id = val
                return mock_chain

            mock_chain.eq = _eq
            mock_chain.order.return_value = mock_chain
            mock_chain.execute.return_value = MagicMock(data=components_data)
            mock_table.select.return_value = mock_chain

        elif name == "themes":
            mock_chain = MagicMock()

            def _eq(_col, comp_id):
                mock_chain._comp_id = comp_id
                return mock_chain

            def _order(*_a, **_k):
                return mock_chain

            def _execute():
                comp_id = getattr(mock_chain, "_comp_id", None)
                data = themes_data.get(comp_id, [])
                return MagicMock(data=data)

            mock_chain.eq = _eq
            mock_chain.order = _order
            mock_chain.execute = _execute
            mock_table.select.return_value = mock_chain

        elif name == "topics":
            mock_chain = MagicMock()

            def _eq(_col, theme_id):
                mock_chain._theme_id = theme_id
                return mock_chain

            def _order(*_a, **_k):
                return mock_chain

            def _execute():
                theme_id = getattr(mock_chain, "_theme_id", None)
                data = topics_data.get(theme_id, [])
                return MagicMock(data=data)

            mock_chain.eq = _eq
            mock_chain.order = _order
            mock_chain.execute = _execute
            mock_table.select.return_value = mock_chain

        return mock_table

    mock_sb.table = _table
    return mock_sb


SUBJECT_ID = "sub-001"
COMP_ID = "comp-001"
THEME_ID = "theme-001"
TOPIC_ID_1 = "topic-001"
TOPIC_ID_2 = "topic-002"


class TestLoadTaxonomy:
    def test_loads_full_hierarchy(self, monkeypatch):
        """load_taxonomy fetches subjects → components → themes → topics."""
        load_taxonomy.cache_clear()

        mock_sb = _mock_supabase(
            subject_data=[{"name": "Biology"}],
            components_data=[
                {"id": COMP_ID, "component_name": "Biology Paper 1", "order_index": 1},
            ],
            themes_data={
                COMP_ID: [
                    {"id": THEME_ID, "theme_name": "Cell Biology", "order_index": 1},
                ],
            },
            topics_data={
                THEME_ID: [
                    {"id": TOPIC_ID_1, "topic_name": "Cell structure", "canonical_code": "4.1.1"},
                    {"id": TOPIC_ID_2, "topic_name": "Cell division", "canonical_code": "4.1.2"},
                ],
            },
        )

        monkeypatch.setattr("src.services.taxonomy.create_client", lambda _u, _k: mock_sb)

        taxonomy = load_taxonomy(SUBJECT_ID)

        assert taxonomy.subject_id == SUBJECT_ID
        assert taxonomy.subject_name == "Biology"
        assert len(taxonomy.topics) == 2
        assert taxonomy.topics[0].topic_id == TOPIC_ID_1
        assert taxonomy.topics[0].topic_name == "Cell structure"
        assert taxonomy.topics[0].canonical_code == "4.1.1"
        assert taxonomy.topics[0].theme_name == "Cell Biology"
        assert taxonomy.topics[0].component_name == "Biology Paper 1"

    def test_empty_subject(self, monkeypatch):
        """load_taxonomy returns empty topics for unknown subject."""
        load_taxonomy.cache_clear()

        mock_sb = _mock_supabase(
            subject_data=[{"name": "Unknown"}],
            components_data=[],
            themes_data={},
            topics_data={},
        )

        monkeypatch.setattr("src.services.taxonomy.create_client", lambda _u, _k: mock_sb)

        taxonomy = load_taxonomy("nonexistent-id")
        assert taxonomy.topics == []
        assert taxonomy.subject_name == "Unknown"

    def test_caching(self, monkeypatch):
        """load_taxonomy caches results by subject_id."""
        load_taxonomy.cache_clear()

        call_count = 0

        def counting_client(_u, _k):
            nonlocal call_count
            call_count += 1
            return _mock_supabase(
                subject_data=[{"name": "Biology"}],
                components_data=[],
                themes_data={},
                topics_data={},
            )

        monkeypatch.setattr("src.services.taxonomy.create_client", counting_client)

        load_taxonomy("cache-test-id")
        load_taxonomy("cache-test-id")

        assert call_count == 1  # Second call hits cache


class TestFormatTaxonomyForPrompt:
    def test_numbered_list(self):
        """format_taxonomy_for_prompt produces a numbered list with codes."""
        taxonomy = SubjectTaxonomy(
            subject_id="s1",
            subject_name="Biology",
            topics=[
                TopicEntry(
                    topic_id="t1",
                    topic_name="Cell structure",
                    canonical_code="4.1.1",
                    theme_name="Cell Biology",
                    component_name="Biology Paper 1",
                ),
                TopicEntry(
                    topic_id="t2",
                    topic_name="Cell division",
                    canonical_code="4.1.2",
                    theme_name="Cell Biology",
                    component_name="Biology Paper 1",
                ),
            ],
        )

        result = format_taxonomy_for_prompt(taxonomy)

        assert "1. [4.1.1] Cell structure (Cell Biology > Biology Paper 1)" in result
        assert "2. [4.1.2] Cell division (Cell Biology > Biology Paper 1)" in result

    def test_no_canonical_code(self):
        """Topics without canonical_code omit the code prefix."""
        taxonomy = SubjectTaxonomy(
            subject_id="s1",
            subject_name="Biology",
            topics=[
                TopicEntry(
                    topic_id="t1",
                    topic_name="Cell structure",
                    canonical_code=None,
                    theme_name="Cell Biology",
                    component_name="Biology Paper 1",
                ),
            ],
        )

        result = format_taxonomy_for_prompt(taxonomy)
        assert "1. Cell structure (Cell Biology > Biology Paper 1)" in result
        assert "[" not in result

    def test_empty_topics(self):
        """Empty topic list returns empty string."""
        taxonomy = SubjectTaxonomy(
            subject_id="s1",
            subject_name="Biology",
            topics=[],
        )
        assert format_taxonomy_for_prompt(taxonomy) == ""
