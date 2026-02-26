# ai-tutor-api/tests/test_models.py
# Tests for Pydantic request/response models.

import pytest
from pydantic import ValidationError

from src.models.chat import (
    ChatMessage,
    ChatRequest,
    ConversationDetail,
    ConversationListResponse,
    ConversationSummary,
    DoneEvent,
    MessageSummary,
    TokenEvent,
)


# ---------------------------------------------------------------------------
# ChatRequest
# ---------------------------------------------------------------------------


class TestChatRequest:
    def test_valid_with_defaults(self):
        """ChatRequest with only message should use defaults."""
        req = ChatRequest(message="Hello")
        assert req.message == "Hello"
        assert req.role == "parent"
        assert req.conversation_id is None
        assert req.child_id is None
        assert req.subject_id is None
        assert req.topic_id is None

    def test_valid_with_all_fields(self):
        """ChatRequest with all fields populated."""
        req = ChatRequest(
            message="What is X?",
            conversation_id="abc-123",
            role="child",
            child_id="child-1",
            subject_id="subj-1",
            topic_id="topic-1",
        )
        assert req.role == "child"
        assert req.conversation_id == "abc-123"

    def test_rejects_invalid_role(self):
        """ChatRequest with invalid role → ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            ChatRequest(message="Hello", role="admin")
        assert "role" in str(exc_info.value)

    def test_requires_message(self):
        """ChatRequest without message → ValidationError."""
        with pytest.raises(ValidationError):
            ChatRequest()  # type: ignore[call-arg]

    def test_empty_message_allowed(self):
        """Pydantic allows empty string — validation is at the endpoint level."""
        req = ChatRequest(message="")
        assert req.message == ""


# ---------------------------------------------------------------------------
# ChatMessage
# ---------------------------------------------------------------------------


class TestChatMessage:
    def test_valid_roles(self):
        """ChatMessage accepts user, assistant, system roles."""
        for role in ("user", "assistant", "system"):
            msg = ChatMessage(role=role, content="test")
            assert msg.role == role

    def test_rejects_invalid_role(self):
        with pytest.raises(ValidationError):
            ChatMessage(role="moderator", content="test")


# ---------------------------------------------------------------------------
# SSE event models
# ---------------------------------------------------------------------------


class TestTokenEvent:
    def test_round_trip(self):
        event = TokenEvent(content="Hello")
        dumped = event.model_dump()
        assert dumped == {"content": "Hello"}


class TestDoneEvent:
    def test_round_trip(self):
        event = DoneEvent(conversation_id="c-1", message_id="m-1")
        dumped = event.model_dump()
        assert dumped == {"conversation_id": "c-1", "message_id": "m-1"}

    def test_requires_both_fields(self):
        with pytest.raises(ValidationError):
            DoneEvent(conversation_id="c-1")  # type: ignore[call-arg]


# ---------------------------------------------------------------------------
# Conversation models
# ---------------------------------------------------------------------------


class TestConversationSummary:
    def test_round_trip(self):
        summary = ConversationSummary(
            id="conv-1",
            title="Test Chat",
            message_count=5,
            last_active_at="2026-02-24T10:00:00Z",
            created_at="2026-02-24T09:00:00Z",
        )
        dumped = summary.model_dump()
        assert dumped["id"] == "conv-1"
        assert dumped["title"] == "Test Chat"
        assert dumped["subject_id"] is None

    def test_optional_fields_default_none(self):
        summary = ConversationSummary(
            id="conv-1",
            message_count=0,
            last_active_at="2026-02-24T10:00:00Z",
            created_at="2026-02-24T09:00:00Z",
        )
        assert summary.title is None
        assert summary.subject_id is None


class TestConversationListResponse:
    def test_empty_list(self):
        resp = ConversationListResponse(conversations=[], has_more=False)
        assert len(resp.conversations) == 0
        assert resp.has_more is False


class TestMessageSummary:
    def test_valid(self):
        msg = MessageSummary(
            id="msg-1",
            role="assistant",
            content="Response text",
            created_at="2026-02-24T10:00:00Z",
        )
        assert msg.role == "assistant"


class TestConversationDetail:
    def test_with_messages(self):
        detail = ConversationDetail(
            conversation_id="conv-1",
            title="My Chat",
            messages=[
                MessageSummary(
                    id="m-1",
                    role="user",
                    content="Hello",
                    created_at="2026-02-24T10:00:00Z",
                ),
                MessageSummary(
                    id="m-2",
                    role="assistant",
                    content="Hi there!",
                    created_at="2026-02-24T10:00:01Z",
                ),
            ],
        )
        assert len(detail.messages) == 2
        assert detail.title == "My Chat"
