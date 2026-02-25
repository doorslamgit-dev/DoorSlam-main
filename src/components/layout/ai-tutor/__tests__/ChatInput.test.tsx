// src/components/layout/ai-tutor/__tests__/ChatInput.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '../ChatInput';

// Mock AppIcon to avoid Lucide icon resolution issues in tests
vi.mock('@/components/ui/AppIcon', () => ({
  default: ({ name, className }: { name: string; className?: string }) => (
    <span data-testid={`icon-${name}`} className={className} />
  ),
}));

describe('ChatInput', () => {
  it('renders textarea and send button', () => {
    render(<ChatInput onSend={vi.fn()} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('submits on Enter key with non-empty text', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'What is photosynthesis?');
    await user.keyboard('{Enter}');

    expect(onSend).toHaveBeenCalledWith('What is photosynthesis?');
  });

  it('clears input after submit', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={vi.fn()} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hello');
    await user.keyboard('{Enter}');

    expect(textarea).toHaveValue('');
  });

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Line one');
    await user.keyboard('{Shift>}{Enter}{/Shift}');

    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not submit empty message', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    await user.keyboard('{Enter}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not submit whitespace-only message', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, '   ');
    await user.keyboard('{Enter}');

    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables textarea and button when disabled', () => {
    render(<ChatInput onSend={vi.fn()} disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  it('shows placeholder text', () => {
    render(<ChatInput onSend={vi.fn()} placeholder="Ask as a student..." />);

    expect(screen.getByPlaceholderText('Ask as a student...')).toBeInTheDocument();
  });

  it('shows default placeholder when none provided', () => {
    render(<ChatInput onSend={vi.fn()} />);

    expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument();
  });
});
