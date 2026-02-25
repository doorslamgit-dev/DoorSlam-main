// src/components/layout/ai-tutor/__tests__/ConversationList.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ConversationList from '../ConversationList';

// Mock the service module
vi.mock('@/services/aiAssistantService', () => ({
  fetchConversations: vi.fn(),
  deleteConversation: vi.fn(),
}));

// Mock AppIcon
vi.mock('@/components/ui/AppIcon', () => ({
  default: ({ name, className }: { name: string; className?: string }) => (
    <span data-testid={`icon-${name}`} className={className} />
  ),
}));

import { fetchConversations, deleteConversation } from '@/services/aiAssistantService';

const mockFetch = vi.mocked(fetchConversations);
const _mockDelete = vi.mocked(deleteConversation);

const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    title: 'Photosynthesis chat',
    messageCount: 4,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    subjectId: null,
  },
  {
    id: 'conv-2',
    title: 'Maths revision',
    messageCount: 8,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    subjectId: null,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ConversationList', () => {
  it('shows loading state initially', () => {
    // Never resolve the fetch to keep loading state
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(
      <ConversationList
        activeConversationId={null}
        onSelect={vi.fn()}
        onNewConversation={vi.fn()}
      />
    );

    expect(screen.getByText(/loading conversations/i)).toBeInTheDocument();
  });

  it('renders conversation items after fetch', async () => {
    mockFetch.mockResolvedValue({
      conversations: MOCK_CONVERSATIONS,
      hasMore: false,
    });

    render(
      <ConversationList
        activeConversationId={null}
        onSelect={vi.fn()}
        onNewConversation={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Photosynthesis chat')).toBeInTheDocument();
      expect(screen.getByText('Maths revision')).toBeInTheDocument();
    });
  });

  it('shows empty state when no conversations', async () => {
    mockFetch.mockResolvedValue({
      conversations: [],
      hasMore: false,
    });

    render(
      <ConversationList
        activeConversationId={null}
        onSelect={vi.fn()}
        onNewConversation={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/no past conversations/i)).toBeInTheDocument();
    });
  });

  it('shows error state when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(
      <ConversationList
        activeConversationId={null}
        onSelect={vi.fn()}
        onNewConversation={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('shows "Load more" button when hasMore is true', async () => {
    mockFetch.mockResolvedValue({
      conversations: MOCK_CONVERSATIONS,
      hasMore: true,
    });

    render(
      <ConversationList
        activeConversationId={null}
        onSelect={vi.fn()}
        onNewConversation={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/load more/i)).toBeInTheDocument();
    });
  });

  it('does not show "Load more" when hasMore is false', async () => {
    mockFetch.mockResolvedValue({
      conversations: MOCK_CONVERSATIONS,
      hasMore: false,
    });

    render(
      <ConversationList
        activeConversationId={null}
        onSelect={vi.fn()}
        onNewConversation={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Photosynthesis chat')).toBeInTheDocument();
    });
    expect(screen.queryByText(/load more/i)).not.toBeInTheDocument();
  });
});
