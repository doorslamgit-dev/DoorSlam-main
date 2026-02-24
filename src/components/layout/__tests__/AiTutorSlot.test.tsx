// src/components/layout/__tests__/AiTutorSlot.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultMockAuth, defaultMockSidebar } from '@/test/test-utils';
import type { MockAuthValues, MockSidebarValues } from '@/test/test-utils';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let mockAuth: MockAuthValues;
let mockSidebar: MockSidebarValues;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('@/contexts/SidebarContext', () => ({
  useSidebar: () => mockSidebar,
}));

vi.mock('@/services/aiAssistantService', () => ({
  streamChat: vi.fn(),
  fetchConversationMessages: vi.fn(),
  fetchConversations: vi.fn().mockResolvedValue({ conversations: [], hasMore: false }),
  deleteConversation: vi.fn(),
}));

vi.mock('@/components/ui/AppIcon', () => ({
  default: ({ name, className }: { name: string; className?: string }) => (
    <span data-testid={`icon-${name}`} className={className} />
  ),
}));

import AiTutorSlot from '../AiTutorSlot';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom doesn't implement scrollTo — stub it to prevent test errors
  Element.prototype.scrollTo = vi.fn();
  mockAuth = { ...defaultMockAuth };
  mockSidebar = {
    ...defaultMockSidebar,
    setAiPanelOpen: vi.fn(),
    setAiTutorConversationId: vi.fn(),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AiTutorSlot', () => {
  it('returns null when panel is closed', () => {
    mockSidebar.isAiPanelOpen = false;
    const { container } = render(<AiTutorSlot />);

    expect(container.innerHTML).toBe('');
  });

  it('renders panel when open', () => {
    mockSidebar.isAiPanelOpen = true;
    render(<AiTutorSlot />);

    expect(screen.getByText('AI Tutor')).toBeInTheDocument();
  });

  it('shows parent welcome message for parent role', () => {
    mockSidebar.isAiPanelOpen = true;
    mockAuth.isParent = true;
    mockAuth.isChild = false;
    render(<AiTutorSlot />);

    expect(screen.getByText(/child.s GCSE subjects/i)).toBeInTheDocument();
  });

  it('shows child welcome message for child role', () => {
    mockSidebar.isAiPanelOpen = true;
    mockAuth.isParent = false;
    mockAuth.isChild = true;
    render(<AiTutorSlot />);

    expect(screen.getByText(/any topic you.re revising/i)).toBeInTheDocument();
  });

  it('calls setAiPanelOpen(false) when close button clicked', async () => {
    const user = userEvent.setup();
    mockSidebar.isAiPanelOpen = true;
    render(<AiTutorSlot />);

    const closeButton = screen.getByRole('button', { name: /close ai tutor/i });
    await user.click(closeButton);

    expect(mockSidebar.setAiPanelOpen).toHaveBeenCalledWith(false);
  });

  it('resets state when new conversation button clicked', async () => {
    const user = userEvent.setup();
    mockSidebar.isAiPanelOpen = true;
    render(<AiTutorSlot />);

    const newButton = screen.getByRole('button', { name: /new conversation/i });
    await user.click(newButton);

    expect(mockSidebar.setAiTutorConversationId).toHaveBeenCalledWith(null);
  });

  it('shows history drawer toggle button', () => {
    mockSidebar.isAiPanelOpen = true;
    render(<AiTutorSlot />);

    expect(screen.getByRole('button', { name: /conversation history/i })).toBeInTheDocument();
  });

  it('shows chat input with role-based placeholder', () => {
    mockSidebar.isAiPanelOpen = true;
    mockAuth.isChild = true;
    mockAuth.isParent = false;
    render(<AiTutorSlot />);

    expect(screen.getByPlaceholderText('Ask as a student...')).toBeInTheDocument();
  });

  it('shows parent placeholder for parent role', () => {
    mockSidebar.isAiPanelOpen = true;
    mockAuth.isParent = true;
    mockAuth.isChild = false;
    render(<AiTutorSlot />);

    expect(screen.getByPlaceholderText('Ask as a parent...')).toBeInTheDocument();
  });

  it('shows "View past conversations" link in empty state', () => {
    mockSidebar.isAiPanelOpen = true;
    render(<AiTutorSlot />);

    expect(screen.getByText(/view past conversations/i)).toBeInTheDocument();
  });
});
