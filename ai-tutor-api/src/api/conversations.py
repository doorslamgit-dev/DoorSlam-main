# ai-tutor-api/src/api/conversations.py
# CRUD endpoints for conversation history.

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import create_client

from ..auth import get_current_user
from ..config import settings
from ..models.chat import (
    ConversationDetail,
    ConversationListResponse,
    ConversationSummary,
    MessageSummary,
)

router = APIRouter()
logger = logging.getLogger(__name__)

def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = Query(default=20, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    user: dict = Depends(get_current_user),
):
    """List the current user's conversations, most recent first."""
    try:
        sb = _get_supabase()
        result = (
            sb.schema("rag")
            .table("conversations")
            .select("id, title, message_count, last_active_at, created_at, subject_id")
            .eq("user_id", user["user_id"])
            .order("last_active_at", desc=True)
            .range(offset, offset + limit)
            .execute()
        )
    except Exception as exc:
        logger.exception("Failed to list conversations for user %s", user["user_id"])
        raise HTTPException(status_code=502, detail=f"Database error: {exc}") from exc

    conversations = [
        ConversationSummary(
            id=c["id"],
            title=c.get("title"),
            message_count=c.get("message_count", 0),
            last_active_at=c["last_active_at"],
            created_at=c["created_at"],
            subject_id=c.get("subject_id"),
        )
        for c in (result.data or [])
    ]

    has_more = len(conversations) > limit
    if has_more:
        conversations = conversations[:limit]

    return ConversationListResponse(conversations=conversations, has_more=has_more)


@router.get("/{conversation_id}/messages", response_model=ConversationDetail)
async def get_conversation_messages(
    conversation_id: str,
    user: dict = Depends(get_current_user),
):
    """Load full message history for a conversation."""
    sb = _get_supabase()

    # Verify the user owns this conversation
    conv_result = (
        sb.schema("rag")
        .table("conversations")
        .select("id, user_id, title")
        .eq("id", conversation_id)
        .execute()
    )

    if not conv_result.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv = conv_result.data[0]
    if conv["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Not your conversation")

    # Fetch messages ordered chronologically
    messages_result = (
        sb.schema("rag")
        .table("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversation_id)
        .neq("role", "system")
        .order("created_at")
        .execute()
    )

    messages = [
        MessageSummary(
            id=m["id"],
            role=m["role"],
            content=m["content"],
            created_at=m["created_at"],
        )
        for m in (messages_result.data or [])
    ]

    return ConversationDetail(
        conversation_id=conversation_id,
        title=conv.get("title"),
        messages=messages,
    )


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a conversation and all its messages."""
    sb = _get_supabase()

    # Verify ownership
    conv_result = (
        sb.schema("rag")
        .table("conversations")
        .select("id, user_id")
        .eq("id", conversation_id)
        .execute()
    )

    if not conv_result.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv_result.data[0]["user_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Not your conversation")

    # Delete messages first (FK constraint), then conversation
    sb.schema("rag").table("messages").delete().eq(
        "conversation_id", conversation_id
    ).execute()
    sb.schema("rag").table("conversations").delete().eq(
        "id", conversation_id
    ).execute()

    return {"deleted": True}
