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
