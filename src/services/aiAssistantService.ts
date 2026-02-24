// src/services/aiAssistantService.ts
// Frontend service for AI Tutor chat — SSE streaming from FastAPI backend.

import { supabase } from '../lib/supabase';

const AI_API = import.meta.env.VITE_AI_TUTOR_API_URL || '/api/ai-tutor';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SourceCitation {
  documentTitle: string;
  sourceType: string;
  similarity: number;
}

export interface ChatStreamOptions {
  message: string;
  conversationId?: string | null;
  role: 'parent' | 'child';
  childId?: string | null;
  subjectId?: string | null;
  topicId?: string | null;
  onToken: (content: string) => void;
  onDone: (data: { conversationId: string; messageId: string }) => void;
  onError: (error: string) => void;
  onSources?: (sources: SourceCitation[]) => void;
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  messageCount: number;
  lastActiveAt: string;
  createdAt: string;
  subjectId: string | null;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ConversationDetail {
  conversationId: string;
  title: string | null;
  messages: ConversationMessage[];
}

// ---------------------------------------------------------------------------
// Shared auth helper
// ---------------------------------------------------------------------------

async function getAuthToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return session.access_token;
}

// ---------------------------------------------------------------------------
// Chat streaming
// ---------------------------------------------------------------------------

export async function streamChat(options: ChatStreamOptions): Promise<void> {
  let token: string;
  try {
    token = await getAuthToken();
  } catch {
    options.onError('Not authenticated');
    return;
  }

  let response: Response;
  try {
    response = await fetch(`${AI_API}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: options.message,
        conversation_id: options.conversationId,
        role: options.role,
        child_id: options.childId,
        subject_id: options.subjectId,
        topic_id: options.topicId,
      }),
    });
  } catch {
    options.onError('Network error — is the AI Tutor API running?');
    return;
  }

  if (!response.ok) {
    options.onError(`Request failed: ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    options.onError('No response stream');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete last line in buffer

      let currentEvent = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);

          try {
            const data = JSON.parse(dataStr) as Record<string, unknown>;

            switch (currentEvent) {
              case 'token':
                if (typeof data.content === 'string') {
                  options.onToken(data.content);
                }
                break;

              case 'sources':
                if (options.onSources && Array.isArray(data.sources)) {
                  const citations = (data.sources as Array<Record<string, unknown>>).map(
                    (s) => ({
                      documentTitle: s.document_title as string,
                      sourceType: s.source_type as string,
                      similarity: s.similarity as number,
                    })
                  );
                  options.onSources(citations);
                }
                break;

              case 'done':
                options.onDone({
                  conversationId: data.conversation_id as string,
                  messageId: data.message_id as string,
                });
                return;

              case 'error':
                options.onError((data.error as string) || 'Unknown error');
                return;
            }
          } catch {
            // Skip malformed JSON lines
          }

          currentEvent = '';
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Conversation history
// ---------------------------------------------------------------------------

export async function fetchConversations(
  limit = 20,
  offset = 0
): Promise<{ conversations: ConversationSummary[]; hasMore: boolean }> {
  const token = await getAuthToken();
  const response = await fetch(
    `${AI_API}/conversations?limit=${limit}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) throw new Error(`Failed to fetch conversations: ${response.status}`);

  const data = (await response.json()) as Record<string, unknown>;
  const raw = data.conversations as Array<Record<string, unknown>>;

  return {
    conversations: raw.map((c) => ({
      id: c.id as string,
      title: (c.title as string) || null,
      messageCount: (c.message_count as number) || 0,
      lastActiveAt: c.last_active_at as string,
      createdAt: c.created_at as string,
      subjectId: (c.subject_id as string) || null,
    })),
    hasMore: data.has_more as boolean,
  };
}

export async function fetchConversationMessages(
  conversationId: string
): Promise<ConversationDetail> {
  const token = await getAuthToken();
  const response = await fetch(`${AI_API}/conversations/${conversationId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(`Failed to fetch messages: ${response.status}`);

  const data = (await response.json()) as Record<string, unknown>;
  const raw = data.messages as Array<Record<string, unknown>>;

  return {
    conversationId: data.conversation_id as string,
    title: (data.title as string) || null,
    messages: raw.map((m) => ({
      id: m.id as string,
      role: m.role as 'user' | 'assistant',
      content: m.content as string,
      createdAt: m.created_at as string,
    })),
  };
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${AI_API}/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(`Failed to delete conversation: ${response.status}`);
}
