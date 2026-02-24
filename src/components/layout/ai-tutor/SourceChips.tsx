// src/components/layout/ai-tutor/SourceChips.tsx
// Compact citation chips below assistant messages showing retrieved document sources.

import { useState } from 'react';
import AppIcon from '../../ui/AppIcon';
import type { SourceCitation } from '../../../services/aiAssistantService';

interface SourceChipsProps {
  sources: SourceCitation[];
}

const SOURCE_ICONS: Record<string, string> = {
  past_paper: 'file-text',
  specification: 'book-open',
  revision: 'notebook',
  marking_scheme: 'check-circle',
  examiner_report: 'clipboard',
  grade_threshold: 'bar-chart',
};

export default function SourceChips({ sources }: SourceChipsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!sources.length) return null;

  const visible = expanded ? sources : sources.slice(0, 2);
  const hiddenCount = sources.length - 2;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {visible.map((source, i) => (
        <span
          key={`${source.documentTitle}-${i}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-50 border border-neutral-200/60 text-[11px] text-neutral-500 max-w-[200px]"
          title={`${source.documentTitle} (${Math.round(source.similarity * 100)}% match)`}
        >
          <AppIcon
            name={SOURCE_ICONS[source.sourceType] || 'file-text'}
            className="w-3 h-3 flex-shrink-0"
          />
          <span className="truncate">{source.documentTitle}</span>
        </span>
      ))}

      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-[11px] text-primary-600 hover:text-primary-700 hover:underline"
        >
          +{hiddenCount} more
        </button>
      )}

      {expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[11px] text-primary-600 hover:text-primary-700 hover:underline"
        >
          show less
        </button>
      )}
    </div>
  );
}
