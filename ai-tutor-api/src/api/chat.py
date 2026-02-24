# ai-tutor-api/src/api/chat.py

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse
from langsmith.wrappers import wrap_openai
from openai import AsyncOpenAI
from supabase import create_client

from ..auth import get_current_user
from ..config import settings
from ..models.chat import ChatRequest
from ..services.memory import trim_history
from ..services.retrieval import format_retrieval_context, retrieve_context

router = APIRouter()

PARENT_SYSTEM_PROMPT = """You are an AI revision tutor helping a GCSE parent understand their child's subjects and revision progress. You provide:
- Clear explanations of GCSE topics at a parent-friendly level
- Advice on how to support their child's revision
- Insight into exam techniques and what examiners look for
- Encouragement and practical suggestions

Keep responses concise, warm, and actionable. Use British English spelling conventions."""

CHILD_SYSTEM_PROMPT = """You are a friendly study buddy helping a GCSE student revise. You:
- Explain topics clearly with examples
- Ask questions to check understanding
- Use encouraging, age-appropriate language
- Break complex topics into manageable chunks
- Suggest memory techniques and revision strategies

Keep responses focused and not too long. Use British English spelling conventions."""


def _get_system_prompt(role: str) -> str:
    if role == "child":
        return CHILD_SYSTEM_PROMPT
    return PARENT_SYSTEM_PROMPT


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def _load_history(conversation_id: str | None) -> list[dict]:
    """Load previous messages for an existing conversation."""
    if not conversation_id:
        return []

    sb = _get_supabase()
    result = (
        sb.schema("rag")
        .table("messages")
        .select("role, content")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )
    return [{"role": m["role"], "content": m["content"]} for m in (result.data or [])]


async def _create_conversation(user_id: str, child_id: str | None, subject_id: str | None) -> str:
    """Create a new conversation row and return its ID."""
    sb = _get_supabase()
    conv_id = str(uuid.uuid4())
    sb.schema("rag").table("conversations").insert({
        "id": conv_id,
        "user_id": user_id,
        "child_id": child_id,
        "subject_id": subject_id,
        "message_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_active_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
    return conv_id


async def _save_message(
    conversation_id: str,
    role: str,
    content: str,
    model_name: str | None = None,
    token_count: int | None = None,
    latency_ms: int | None = None,
) -> str:
    """Save a message to the rag.messages table. Returns the message ID."""
    sb = _get_supabase()
    msg_id = str(uuid.uuid4())
    sb.schema("rag").table("messages").insert({
        "id": msg_id,
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "model_name": model_name,
        "token_count": token_count,
        "latency_ms": latency_ms,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    # Update conversation metadata
    sb.schema("rag").table("conversations").update({
        "last_active_at": datetime.now(timezone.utc).isoformat(),
        "message_count": sb.schema("rag")
        .table("messages")
        .select("id", count="exact")
        .eq("conversation_id", conversation_id)
        .execute()
        .count or 0,
    }).eq("id", conversation_id).execute()

    return msg_id


logger = logging.getLogger(__name__)


async def _generate_title(conversation_id: str, user_message: str) -> None:
    """Generate an AI title for a new conversation in the background.

    Fires after the first exchange completes. Uses the configured chat model.
    Falls back to truncated user message if the call fails.
    """
    try:
        client = AsyncOpenAI(
            api_key=settings.openrouter_api_key,
            base_url=settings.openrouter_base_url,
        )
        response = await client.chat.completions.create(
            model=settings.chat_model,
            messages=[
                {
                    "role": "system",
                    "content": "Generate a concise 3-5 word title for this conversation. "
                    "Return ONLY the title, no quotes, no punctuation at the end.",
                },
                {"role": "user", "content": user_message},
            ],
            max_tokens=20,
        )
        title = (response.choices[0].message.content or "").strip()
        if not title:
            raise ValueError("Empty title response")
    except Exception:
        # Fallback: truncate first user message
        title = user_message[:50].strip()
        if len(user_message) > 50:
            title = title.rsplit(" ", 1)[0] + "..."
        logger.warning("Title generation failed for %s, using fallback", conversation_id)

    sb = _get_supabase()
    sb.schema("rag").table("conversations").update({"title": title}).eq(
        "id", conversation_id
    ).execute()


@router.post("/stream")
async def chat_stream(req: ChatRequest, user: dict = Depends(get_current_user)):
    """Stream a chat response via SSE."""

    async def event_generator():
        import time

        start = time.monotonic()

        try:
            # Resolve or create conversation
            conversation_id = req.conversation_id
            if not conversation_id:
                conversation_id = await _create_conversation(
                    user["user_id"], req.child_id, req.subject_id
                )

            # Save user message
            await _save_message(conversation_id, "user", req.message)

            # Retrieve relevant context via RAG
            chunks = await retrieve_context(
                query=req.message,
                subject_id=req.subject_id,
                topic_id=req.topic_id,
            )

            # Send sources to frontend via SSE (before streaming response)
            sources_payload = [
                {
                    "document_title": c.document_title,
                    "source_type": c.source_type,
                    "similarity": round(c.similarity, 3),
                }
                for c in chunks
            ]
            if sources_payload:
                yield {
                    "event": "sources",
                    "data": json.dumps({"sources": sources_payload}),
                }

            # Build messages array with retrieval context + trimmed history
            system_prompt = _get_system_prompt(req.role)
            context_prompt = format_retrieval_context(chunks)
            raw_history = await _load_history(conversation_id)
            trimmed = trim_history(raw_history, max_tokens=settings.max_history_tokens)

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "system", "content": context_prompt},
                *[m for m in trimmed if m["role"] != "system"],
            ]
            # Ensure the latest user message is included
            # (it was just saved, so history might not have it yet)
            if not trimmed or trimmed[-1]["content"] != req.message:
                messages.append({"role": "user", "content": req.message})

            # Stream from OpenRouter
            client = wrap_openai(AsyncOpenAI(
                api_key=settings.openrouter_api_key,
                base_url=settings.openrouter_base_url,
            ))

            stream = await client.chat.completions.create(
                model=settings.chat_model,
                messages=messages,
                stream=True,
            )

            full_response = ""
            token_count = 0

            async for chunk in stream:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta and delta.content:
                    full_response += delta.content
                    token_count += 1
                    yield {
                        "event": "token",
                        "data": json.dumps({"content": delta.content}),
                    }

            # Save assistant response with sources metadata
            elapsed_ms = int((time.monotonic() - start) * 1000)
            msg_id = await _save_message(
                conversation_id,
                "assistant",
                full_response,
                model_name=settings.chat_model,
                token_count=token_count,
                latency_ms=elapsed_ms,
            )

            # Save sources to message metadata if available
            if sources_payload:
                sb = _get_supabase()
                sb.schema("rag").table("messages").update({
                    "sources": sources_payload,
                }).eq("id", msg_id).execute()

            yield {
                "event": "done",
                "data": json.dumps({
                    "conversation_id": conversation_id,
                    "message_id": msg_id,
                }),
            }

            # Generate title asynchronously for new conversations
            if not req.conversation_id:
                asyncio.create_task(_generate_title(conversation_id, req.message))

        except Exception as exc:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(exc)}),
            }

    return EventSourceResponse(event_generator())
