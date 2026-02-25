// src/components/layout/ai-tutor/__tests__/MessageBubble.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageBubble from '../MessageBubble';

// Mock AppIcon
vi.mock('@/components/ui/AppIcon', () => ({
  default: ({ name, className }: { name: string; className?: string }) => (
    <span data-testid={`icon-${name}`} className={className} />
  ),
}));

describe('MessageBubble', () => {
  it('renders user message content', () => {
    render(<MessageBubble role="user" content="What is mitosis?" />);

    expect(screen.getByText('What is mitosis?')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(<MessageBubble role="assistant" content="Mitosis is cell division." />);

    expect(screen.getByText(/Mitosis is cell division/)).toBeInTheDocument();
  });

  it('shows user icon for user messages', () => {
    render(<MessageBubble role="user" content="Hello" />);

    expect(screen.getByTestId('icon-user')).toBeInTheDocument();
  });

  it('shows sparkles icon for assistant messages', () => {
    render(<MessageBubble role="assistant" content="Hi there" />);

    expect(screen.getByTestId('icon-sparkles')).toBeInTheDocument();
  });

  it('shows streaming indicator when isStreaming is true', () => {
    const { container } = render(
      <MessageBubble role="assistant" content="Streaming..." isStreaming />
    );

    // The streaming cursor is a span with animate-pulse class
    const pulsingElement = container.querySelector('.animate-pulse');
    expect(pulsingElement).toBeInTheDocument();
  });

  it('hides streaming indicator when isStreaming is false', () => {
    const { container } = render(
      <MessageBubble role="assistant" content="Done." isStreaming={false} />
    );

    const pulsingElement = container.querySelector('.animate-pulse');
    expect(pulsingElement).not.toBeInTheDocument();
  });

  it('applies user styling classes', () => {
    const { container } = render(<MessageBubble role="user" content="Test" />);

    // User messages use flex-row-reverse for right alignment
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex-row-reverse');
  });

  it('applies assistant styling classes', () => {
    const { container } = render(<MessageBubble role="assistant" content="Test" />);

    // Assistant messages use flex-row for left alignment
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex-row');
    expect(wrapper.className).not.toContain('flex-row-reverse');
  });
});
