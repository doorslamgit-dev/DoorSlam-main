# ai-tutor-api/src/services/memory.py
# Conversation memory management — sliding window token trimming.

import tiktoken

_ENCODING = tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str) -> int:
    """Count tokens using cl100k_base encoding."""
    return len(_ENCODING.encode(text))


def trim_history(
    messages: list[dict],
    max_tokens: int = 4000,
) -> list[dict]:
    """Trim conversation history to fit within a token budget.

    Walks backwards from the most recent message, accumulating messages
    that fit within max_tokens. Always preserves at least the last user message.

    Args:
        messages: List of message dicts with 'role' and 'content' keys.
        max_tokens: Maximum total token count for the returned history.

    Returns:
        Trimmed list of messages (oldest first) within the token budget.
    """
    if not messages:
        return []

    # Always include the last message
    result: list[dict] = []
    total_tokens = 0

    for msg in reversed(messages):
        msg_tokens = count_tokens(msg.get("content", ""))
        if total_tokens + msg_tokens > max_tokens and result:
            # Over budget and we already have at least one message
            break
        result.append(msg)
        total_tokens += msg_tokens

    # Reverse to restore chronological order
    result.reverse()
    return result
