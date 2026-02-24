# ai-tutor-api/tests/conftest.py
# Shared fixtures for AI Tutor backend tests.

import json
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from src.auth import get_current_user
from src.main import app


# ---------------------------------------------------------------------------
# Mock user payloads
# ---------------------------------------------------------------------------

MOCK_USER = {
    "user_id": "00000000-0000-0000-0000-000000000001",
    "role": "authenticated",
    "email": "test@example.com",
}

MOCK_PARENT = {
    "user_id": "00000000-0000-0000-0000-000000000002",
    "role": "authenticated",
    "email": "jsmith@example.com",
}

MOCK_CHILD = {
    "user_id": "00000000-0000-0000-0000-000000000003",
    "role": "authenticated",
    "email": "hannah@example.com",
}

TEST_JWT_SECRET = "test-jwt-secret-for-unit-tests"


# ---------------------------------------------------------------------------
# Auth override fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
def override_auth():
    """Override JWT auth with the default mock user."""
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER
    yield MOCK_USER
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture()
def override_auth_parent():
    """Override JWT auth with a parent user."""
    app.dependency_overrides[get_current_user] = lambda: MOCK_PARENT
    yield MOCK_PARENT
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture()
def override_auth_child():
    """Override JWT auth with a child user."""
    app.dependency_overrides[get_current_user] = lambda: MOCK_CHILD
    yield MOCK_CHILD
    app.dependency_overrides.pop(get_current_user, None)


# ---------------------------------------------------------------------------
# Async HTTP client
# ---------------------------------------------------------------------------


@pytest.fixture()
def client():
    """Provide an httpx AsyncClient with ASGI transport."""

    async def _client():
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://test", follow_redirects=True
        ) as c:
            yield c

    return _client


# ---------------------------------------------------------------------------
# Mock OpenAI streaming
# ---------------------------------------------------------------------------


@dataclass
class FakeDelta:
    content: str | None = None


@dataclass
class FakeChoice:
    delta: FakeDelta


@dataclass
class FakeChunk:
    choices: list[FakeChoice]


async def _fake_stream(tokens: list[str]) -> AsyncIterator:
    """Yield fake OpenAI streaming chunks."""
    for token in tokens:
        yield FakeChunk(choices=[FakeChoice(delta=FakeDelta(content=token))])


class FakeStreamResponse:
    """Wraps an async generator to act like an OpenAI stream."""

    def __init__(self, tokens: list[str]):
        self._gen = _fake_stream(tokens)

    def __aiter__(self):
        return self._gen.__aiter__()

    async def __anext__(self):
        return await self._gen.__anext__()


@pytest.fixture()
def mock_openai(monkeypatch):
    """Patch OpenAI to return a fake streaming response.

    Returns a dict with 'set_tokens' to configure the stream tokens
    and 'create_mock' to inspect call args.
    """
    tokens = ["Hello", " world", "!"]
    create_mock = AsyncMock()

    async def fake_create(**kwargs):
        create_mock(**kwargs)
        return FakeStreamResponse(tokens)

    mock_client = MagicMock()
    mock_client.chat.completions.create = fake_create

    # Patch wrap_openai to return our mock client
    monkeypatch.setattr("src.api.chat.wrap_openai", lambda _client: mock_client)

    return {"set_tokens": lambda t: tokens.clear() or tokens.extend(t), "create_mock": create_mock}


# ---------------------------------------------------------------------------
# Mock Supabase client
# ---------------------------------------------------------------------------


class MockExecuteResult:
    """Fake Supabase execute() result."""

    def __init__(self, data: list[dict] | None = None, count: int | None = None):
        self.data = data or []
        self.count = count


class MockQueryBuilder:
    """Chainable mock that mimics the Supabase query builder."""

    def __init__(self, table_data: dict[str, list[dict]] | None = None):
        self._table_data = table_data or {}
        self._current_table: str | None = None
        self._schema: str | None = None

    def schema(self, name: str) -> "MockQueryBuilder":
        self._schema = name
        return self

    def table(self, name: str) -> "MockQueryBuilder":
        self._current_table = name
        return self

    def select(self, *_args: Any, **kwargs: Any) -> "MockQueryBuilder":
        return self

    def insert(self, _data: Any) -> "MockQueryBuilder":
        return self

    def update(self, _data: Any) -> "MockQueryBuilder":
        return self

    def delete(self) -> "MockQueryBuilder":
        return self

    def eq(self, _col: str, _val: Any) -> "MockQueryBuilder":
        return self

    def neq(self, _col: str, _val: Any) -> "MockQueryBuilder":
        return self

    def order(self, _col: str, **_kwargs: Any) -> "MockQueryBuilder":
        return self

    def limit(self, _n: int) -> "MockQueryBuilder":
        return self

    def range(self, _start: int, _end: int) -> "MockQueryBuilder":
        return self

    def execute(self) -> MockExecuteResult:
        data = self._table_data.get(self._current_table or "", [])
        return MockExecuteResult(data=data, count=len(data))


@pytest.fixture()
def mock_supabase(monkeypatch):
    """Patch supabase.create_client to return a MockQueryBuilder.

    Also mocks the retrieval service to return empty results (no chunks).
    Returns the builder so tests can set table_data.
    """
    builder = MockQueryBuilder()
    monkeypatch.setattr(
        "src.api.chat.create_client", lambda _url, _key: builder
    )

    # Mock embed_query + search_chunks (no RAG results in unit tests)
    async def _mock_embed_query(*_args, **_kwargs):
        return [0.0] * 2000

    async def _mock_search_chunks(*_args, **_kwargs):
        return []

    monkeypatch.setattr("src.api.chat.embed_query", _mock_embed_query)
    monkeypatch.setattr("src.api.chat.search_chunks", _mock_search_chunks)

    return builder


# ---------------------------------------------------------------------------
# SSE response parser helper
# ---------------------------------------------------------------------------


def parse_sse_events(body: str) -> list[dict]:
    """Parse an SSE response body into a list of {event, data} dicts."""
    events = []
    current_event = ""

    for line in body.split("\n"):
        line = line.strip()
        if line.startswith("event:"):
            current_event = line[len("event:"):].strip()
        elif line.startswith("data:"):
            data_str = line[len("data:"):].strip()
            try:
                data = json.loads(data_str)
            except json.JSONDecodeError:
                data = data_str
            events.append({"event": current_event, "data": data})
            current_event = ""

    return events
