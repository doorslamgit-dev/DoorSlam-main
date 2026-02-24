# tests/test_memory.py
# Unit tests for conversation memory trimming.

from src.services.memory import count_tokens, trim_history


class TestCountTokens:
    def test_empty(self):
        assert count_tokens("") == 0

    def test_simple(self):
        assert count_tokens("hello") > 0


class TestTrimHistory:
    def test_empty_messages(self):
        assert trim_history([]) == []

    def test_single_message_within_budget(self):
        msgs = [{"role": "user", "content": "Hi"}]
        result = trim_history(msgs, max_tokens=100)
        assert len(result) == 1
        assert result[0]["content"] == "Hi"

    def test_preserves_last_message_even_if_over_budget(self):
        msgs = [{"role": "user", "content": "A " * 500}]
        result = trim_history(msgs, max_tokens=10)
        assert len(result) == 1
        assert result[0] == msgs[0]

    def test_trims_old_messages(self):
        msgs = [
            {"role": "user", "content": "First message " * 50},
            {"role": "assistant", "content": "Second message " * 50},
            {"role": "user", "content": "Third message " * 50},
            {"role": "assistant", "content": "Fourth message " * 50},
            {"role": "user", "content": "Last message"},
        ]
        result = trim_history(msgs, max_tokens=50)
        # Should include at least the last message
        assert result[-1]["content"] == "Last message"
        # Should have fewer messages than original
        assert len(result) < len(msgs)

    def test_preserves_chronological_order(self):
        msgs = [
            {"role": "user", "content": "First"},
            {"role": "assistant", "content": "Second"},
            {"role": "user", "content": "Third"},
        ]
        result = trim_history(msgs, max_tokens=1000)
        assert [m["content"] for m in result] == ["First", "Second", "Third"]

    def test_all_messages_fit(self):
        msgs = [
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello!"},
            {"role": "user", "content": "How are you?"},
        ]
        result = trim_history(msgs, max_tokens=1000)
        assert len(result) == 3

    def test_missing_content_key(self):
        msgs = [{"role": "user"}]
        result = trim_history(msgs, max_tokens=100)
        assert len(result) == 1
