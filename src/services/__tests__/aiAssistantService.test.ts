// src/services/__tests__/aiAssistantService.test.ts
// Tests for the AI Tutor frontend service layer.

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createMockSSEResponse,
  createMockJsonResponse,
} from '@/test/test-utils';

// Mock supabase before importing the service
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase';
import {
  streamChat,
  fetchConversations,
  fetchConversationMessages,
  deleteConversation,
} from '@/services/aiAssistantService';

const mockGetSession = vi.mocked(supabase.auth.getSession);

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

const originalFetch = global.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  // Default: authenticated session
  mockGetSession.mockResolvedValue({
    data: { session: { access_token: 'test-jwt-token' } },
    error: null,
  } as ReturnType<typeof supabase.auth.getSession> extends Promise<infer T> ? T : never);
});

afterEach(() => {
  global.fetch = originalFetch;
});

// ---------------------------------------------------------------------------
// streamChat
// ---------------------------------------------------------------------------

describe('streamChat', () => {
  it('sends correct request body and headers', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      createMockSSEResponse([
        { event: 'token', data: '{"content":"Hi"}' },
        { event: 'done', data: '{"conversation_id":"c1","message_id":"m1"}' },
      ])
    );
    global.fetch = fetchSpy;

    await streamChat({
      message: 'Hello',
      conversationId: 'conv-123',
      role: 'parent',
      childId: 'child-1',
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain('/chat/stream');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Authorization']).toBe('Bearer test-jwt-token');

    const body = JSON.parse(opts.body);
    expect(body.message).toBe('Hello');
    expect(body.conversation_id).toBe('conv-123');
    expect(body.role).toBe('parent');
    expect(body.child_id).toBe('child-1');
  });

  it('parses token events and calls onToken', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      createMockSSEResponse([
        { event: 'token', data: '{"content":"Hello"}' },
        { event: 'token', data: '{"content":" world"}' },
        { event: 'done', data: '{"conversation_id":"c1","message_id":"m1"}' },
      ])
    );

    const onToken = vi.fn();
    await streamChat({
      message: 'Test',
      role: 'parent',
      onToken,
      onDone: vi.fn(),
      onError: vi.fn(),
    });

    expect(onToken).toHaveBeenCalledWith('Hello');
    expect(onToken).toHaveBeenCalledWith(' world');
    expect(onToken).toHaveBeenCalledTimes(2);
  });

  it('parses done event and calls onDone', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      createMockSSEResponse([
        { event: 'token', data: '{"content":"Hi"}' },
        { event: 'done', data: '{"conversation_id":"conv-99","message_id":"msg-42"}' },
      ])
    );

    const onDone = vi.fn();
    await streamChat({
      message: 'Test',
      role: 'parent',
      onToken: vi.fn(),
      onDone,
      onError: vi.fn(),
    });

    expect(onDone).toHaveBeenCalledWith({
      conversationId: 'conv-99',
      messageId: 'msg-42',
    });
  });

  it('parses error event and calls onError', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      createMockSSEResponse([
        { event: 'error', data: '{"error":"Something broke"}' },
      ])
    );

    const onError = vi.fn();
    await streamChat({
      message: 'Test',
      role: 'parent',
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledWith('Something broke');
  });

  it('calls onError when not authenticated', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as ReturnType<typeof supabase.auth.getSession> extends Promise<infer T> ? T : never);

    const onError = vi.fn();
    await streamChat({
      message: 'Test',
      role: 'parent',
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledWith('Not authenticated');
  });

  it('calls onError on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const onError = vi.fn();
    await streamChat({
      message: 'Test',
      role: 'parent',
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledWith('Network error — is the AI Tutor API running?');
  });

  it('calls onError on non-200 response', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('', { status: 500 }));

    const onError = vi.fn();
    await streamChat({
      message: 'Test',
      role: 'parent',
      onToken: vi.fn(),
      onDone: vi.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledWith('Request failed: 500');
  });
});

// ---------------------------------------------------------------------------
// fetchConversations
// ---------------------------------------------------------------------------

describe('fetchConversations', () => {
  it('maps snake_case response to camelCase', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      createMockJsonResponse({
        conversations: [
          {
            id: 'conv-1',
            title: 'Test Chat',
            message_count: 5,
            last_active_at: '2026-02-24T10:00:00Z',
            created_at: '2026-02-24T09:00:00Z',
            subject_id: null,
          },
        ],
        has_more: false,
      })
    );

    const result = await fetchConversations(20, 0);

    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].messageCount).toBe(5);
    expect(result.conversations[0].lastActiveAt).toBe('2026-02-24T10:00:00Z');
    expect(result.hasMore).toBe(false);
  });

  it('throws on non-200 response', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('', { status: 401 }));

    await expect(fetchConversations()).rejects.toThrow('Failed to fetch conversations: 401');
  });
});

// ---------------------------------------------------------------------------
// fetchConversationMessages
// ---------------------------------------------------------------------------

describe('fetchConversationMessages', () => {
  it('maps response to ConversationDetail', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      createMockJsonResponse({
        conversation_id: 'conv-1',
        title: 'My Chat',
        messages: [
          { id: 'm-1', role: 'user', content: 'Hello', created_at: '2026-02-24T10:00:00Z' },
          { id: 'm-2', role: 'assistant', content: 'Hi!', created_at: '2026-02-24T10:00:01Z' },
        ],
      })
    );

    const result = await fetchConversationMessages('conv-1');

    expect(result.conversationId).toBe('conv-1');
    expect(result.title).toBe('My Chat');
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[1].createdAt).toBe('2026-02-24T10:00:01Z');
  });

  it('throws on non-200 response', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('', { status: 404 }));

    await expect(fetchConversationMessages('bad-id')).rejects.toThrow('Failed to fetch messages: 404');
  });
});

// ---------------------------------------------------------------------------
// deleteConversation
// ---------------------------------------------------------------------------

describe('deleteConversation', () => {
  it('sends DELETE request with correct URL', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      createMockJsonResponse({ deleted: true })
    );
    global.fetch = fetchSpy;

    await deleteConversation('conv-1');

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toContain('/conversations/conv-1');
    expect(opts.method).toBe('DELETE');
  });

  it('throws on non-200 response', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('', { status: 403 }));

    await expect(deleteConversation('conv-1')).rejects.toThrow('Failed to delete conversation: 403');
  });
});
