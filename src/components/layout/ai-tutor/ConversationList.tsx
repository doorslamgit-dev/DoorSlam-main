// src/components/layout/ai-tutor/ConversationList.tsx
// Conversation history list for the collapsible drawer in the AI Tutor panel.

import { useCallback, useEffect, useState } from 'react';
import {
  fetchConversations,
  deleteConversation,
  type ConversationSummary,
} from '../../../services/aiAssistantService';
import ConversationListItem from './ConversationListItem';

interface ConversationListProps {
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

export default function ConversationList({
  activeConversationId,
  onSelect,
  onNewConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchConversations(20, offset);
      if (offset === 0) {
        setConversations(result.conversations);
      } else {
        setConversations((prev) => [...prev, ...result.conversations]);
      }
      setHasMore(result.hasMore);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        // If we deleted the active conversation, start fresh
        if (id === activeConversationId) {
          onNewConversation();
        }
      } catch {
        // Silently fail — conversation still visible, user can retry
      }
    },
    [activeConversationId, onNewConversation]
  );

  const handleLoadMore = useCallback(() => {
    loadConversations(conversations.length);
  }, [loadConversations, conversations.length]);

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="text-xs text-muted-foreground">Loading conversations...</span>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="text-xs text-destructive">{error}</span>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="text-xs text-muted-foreground">No past conversations</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 py-1">
      {conversations.map((conv) => (
        <ConversationListItem
          key={conv.id}
          id={conv.id}
          title={conv.title}
          lastActiveAt={conv.lastActiveAt}
          isActive={conv.id === activeConversationId}
          onSelect={onSelect}
          onDelete={handleDelete}
        />
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loading}
          className="text-xs text-primary hover:text-primary/90 py-2 text-center transition-colors"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
