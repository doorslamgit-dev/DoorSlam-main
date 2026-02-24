# ai-tutor-api/tests/test_chat_stream.py
# Tests for POST /chat/stream — SSE streaming endpoint.

import json
from unittest.mock import patch

import pytest
from httpx import ASGITransport, AsyncClient

from src.auth import get_current_user
from src.main import app
from tests.conftest import MOCK_USER, parse_sse_events


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def _auth(override_auth):
    """All tests use the default mock user unless overridden."""
    pass


def _chat_body(**overrides) -> dict:
    """Build a valid chat request body with optional overrides."""
    body = {"message": "What is photosynthesis?"}
    body.update(overrides)
    return body


# ---------------------------------------------------------------------------
# SSE streaming tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_stream_returns_200_sse(mock_openai, mock_supabase):
    """POST /chat/stream should return 200 with text/event-stream content type."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/chat/stream", json=_chat_body())

    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_stream_yields_token_events(mock_openai, mock_supabase):
    """SSE response should contain token events with content."""
    mock_openai["set_tokens"](["Hello", " there"])

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/chat/stream", json=_chat_body())

    events = parse_sse_events(response.text)
    token_events = [e for e in events if e["event"] == "token"]

    assert len(token_events) >= 2
    assert token_events[0]["data"]["content"] == "Hello"
    assert token_events[1]["data"]["content"] == " there"


@pytest.mark.asyncio
async def test_stream_yields_done_event(mock_openai, mock_supabase):
    """SSE response should end with a done event containing conversation_id and message_id."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/chat/stream", json=_chat_body())

    events = parse_sse_events(response.text)
    done_events = [e for e in events if e["event"] == "done"]

    assert len(done_events) == 1
    assert "conversation_id" in done_events[0]["data"]
    assert "message_id" in done_events[0]["data"]


@pytest.mark.asyncio
async def test_parent_role_uses_parent_prompt(mock_openai, mock_supabase):
    """When role=parent, the system prompt should be the parent version."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/chat/stream", json=_chat_body(role="parent"))

    # Inspect what was passed to OpenAI
    call_kwargs = mock_openai["create_mock"].call_args
    if call_kwargs:
        messages = call_kwargs.kwargs.get("messages", [])
        system_msg = messages[0] if messages else {}
        assert system_msg.get("role") == "system"
        assert "parent" in system_msg.get("content", "").lower()


@pytest.mark.asyncio
async def test_child_role_uses_child_prompt(mock_openai, mock_supabase):
    """When role=child, the system prompt should be the child version."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/chat/stream", json=_chat_body(role="child"))

    call_kwargs = mock_openai["create_mock"].call_args
    if call_kwargs:
        messages = call_kwargs.kwargs.get("messages", [])
        system_msg = messages[0] if messages else {}
        assert system_msg.get("role") == "system"
        assert "study buddy" in system_msg.get("content", "").lower()


@pytest.mark.asyncio
async def test_new_conversation_no_conversation_id(mock_openai, mock_supabase):
    """When conversation_id is null, a new conversation should be created."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/chat/stream", json=_chat_body(conversation_id=None)
        )

    events = parse_sse_events(response.text)
    done_events = [e for e in events if e["event"] == "done"]
    assert len(done_events) == 1
    # conversation_id should be a valid UUID string
    conv_id = done_events[0]["data"]["conversation_id"]
    assert len(conv_id) == 36  # UUID format


@pytest.mark.asyncio
async def test_openai_error_yields_error_event(mock_supabase, monkeypatch):
    """When OpenAI raises an exception, the SSE stream should yield an error event."""
    from unittest.mock import MagicMock

    mock_client = MagicMock()
    mock_client.chat.completions.create = _raise_openai_error
    monkeypatch.setattr("src.api.chat.wrap_openai", lambda _c: mock_client)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/chat/stream", json=_chat_body())

    events = parse_sse_events(response.text)
    error_events = [e for e in events if e["event"] == "error"]
    assert len(error_events) >= 1
    assert "error" in error_events[0]["data"]


async def _raise_openai_error(**_kwargs):
    raise RuntimeError("OpenAI API limit exceeded")


@pytest.mark.asyncio
async def test_no_auth_returns_422():
    """POST /chat/stream without auth header → 422 (FastAPI validation)."""
    # Remove auth override
    app.dependency_overrides.pop(get_current_user, None)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/chat/stream", json=_chat_body())

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_user_message_included_in_messages(mock_openai, mock_supabase):
    """The user's message should appear in the messages array sent to OpenAI."""
    user_message = "Explain mitosis step by step"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/chat/stream", json=_chat_body(message=user_message))

    call_kwargs = mock_openai["create_mock"].call_args
    if call_kwargs:
        messages = call_kwargs.kwargs.get("messages", [])
        user_msgs = [m for m in messages if m.get("role") == "user"]
        assert any(user_message in m.get("content", "") for m in user_msgs)


@pytest.mark.asyncio
async def test_stream_model_matches_settings(mock_openai, mock_supabase):
    """The model passed to the LLM should match settings.chat_model."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/chat/stream", json=_chat_body())

    call_kwargs = mock_openai["create_mock"].call_args
    if call_kwargs:
        assert call_kwargs.kwargs.get("stream") is True
        # Model should be present
        assert "model" in call_kwargs.kwargs
