// src/services/aiAssistantService.ts
// Frontend service for AI Tutor chat — SSE streaming from FastAPI backend.

import { supabase } from '../lib/supabase';

const AI_API = import.meta.env.VITE_AI_TUTOR_API_URL || '/api/ai-tutor';

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
}

export async function streamChat(options: ChatStreamOptions): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    options.onError('Not authenticated');
    return;
  }

  let response: Response;
  try {
    response = await fetch(`${AI_API}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
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
