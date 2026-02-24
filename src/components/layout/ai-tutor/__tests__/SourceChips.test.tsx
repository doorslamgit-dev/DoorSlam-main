// src/components/layout/ai-tutor/__tests__/SourceChips.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import SourceChips from '../SourceChips';
import type { SourceCitation } from '@/services/aiAssistantService';

const mockSources: SourceCitation[] = [
  { documentTitle: 'June 2024 Paper 1', sourceType: 'past_paper', similarity: 0.92 },
  { documentTitle: 'AQA Maths Specification', sourceType: 'specification', similarity: 0.87 },
  { documentTitle: 'Seneca Algebra Notes', sourceType: 'revision', similarity: 0.81 },
  { documentTitle: 'Mark Scheme June 2024', sourceType: 'marking_scheme', similarity: 0.78 },
];

describe('SourceChips', () => {
  it('renders nothing when sources is empty', () => {
    const { container } = render(<SourceChips sources={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a single source chip', () => {
    render(<SourceChips sources={[mockSources[0]]} />);
    expect(screen.getByText('June 2024 Paper 1')).toBeInTheDocument();
  });

  it('shows first 2 sources by default', () => {
    render(<SourceChips sources={mockSources} />);
    expect(screen.getByText('June 2024 Paper 1')).toBeInTheDocument();
    expect(screen.getByText('AQA Maths Specification')).toBeInTheDocument();
    expect(screen.queryByText('Seneca Algebra Notes')).not.toBeInTheDocument();
  });

  it('shows "+N more" button when more than 2 sources', () => {
    render(<SourceChips sources={mockSources} />);
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('expands to show all sources on click', async () => {
    const user = userEvent.setup();
    render(<SourceChips sources={mockSources} />);

    await user.click(screen.getByText('+2 more'));

    expect(screen.getByText('Seneca Algebra Notes')).toBeInTheDocument();
    expect(screen.getByText('Mark Scheme June 2024')).toBeInTheDocument();
    expect(screen.getByText('show less')).toBeInTheDocument();
  });

  it('collapses back on "show less" click', async () => {
    const user = userEvent.setup();
    render(<SourceChips sources={mockSources} />);

    await user.click(screen.getByText('+2 more'));
    await user.click(screen.getByText('show less'));

    expect(screen.queryByText('Seneca Algebra Notes')).not.toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('does not show expand button with exactly 2 sources', () => {
    render(<SourceChips sources={mockSources.slice(0, 2)} />);
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });
});
