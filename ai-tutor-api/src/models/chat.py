# ai-tutor-api/src/models/chat.py

from typing import Literal

from pydantic import BaseModel


class ChatRequest(BaseModel):
    """Incoming chat request from the frontend."""

    message: str
    conversation_id: str | None = None
    role: Literal["parent", "child"] = "parent"
    child_id: str | None = None
    subject_id: str | None = None
    topic_id: str | None = None
    source_type: str | None = None
    year: int | None = None
    doc_type: str | None = None


class ChatMessage(BaseModel):
    """A single message in a conversation."""

    role: Literal["user", "assistant", "system"]
    content: str


class TokenEvent(BaseModel):
    """SSE token event — one chunk of streamed text."""

    content: str


class DoneEvent(BaseModel):
    """SSE done event — sent when streaming completes."""

    conversation_id: str
    message_id: str


# ---------------------------------------------------------------------------
# Conversation history models
# ---------------------------------------------------------------------------


class ConversationSummary(BaseModel):
    """A conversation in the list view."""

    id: str
    title: str | None = None
    message_count: int
    last_active_at: str
    created_at: str
    subject_id: str | None = None


class ConversationListResponse(BaseModel):
    """Response for GET /conversations."""

    conversations: list[ConversationSummary]
    has_more: bool


class MessageSummary(BaseModel):
    """A message returned when loading a conversation."""

    id: str
    role: Literal["user", "assistant", "system"]
    content: str
    created_at: str


class ConversationDetail(BaseModel):
    """Response for GET /conversations/{id}/messages."""

    conversation_id: str
    title: str | None = None
    messages: list[MessageSummary]
