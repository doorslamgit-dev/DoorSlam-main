// src/components/admin/content/ContentReviewPanel.tsx
// Review panel for staged content items — approve, reject, or inspect.

import { useState } from 'react';
import { reviewStagingItems } from '@/services/contentGenerationService';
import type { StagingItem } from '@/types/contentGeneration';

interface ContentReviewPanelProps {
  items: StagingItem[];
  onReviewComplete: () => void;
}

export default function ContentReviewPanel({ items, onReviewComplete }: ContentReviewPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No staging items to review.
      </div>
    );
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.size === 0) return;
    setReviewing(true);

    const actions = [...selectedIds].map((id) => ({ id, action }));
    await reviewStagingItems(actions);

    setSelectedIds(new Set());
    setReviewing(false);
    onReviewComplete();
  };

  return (
    <div className="space-y-3">
      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => handleBulkAction('approve')}
            disabled={reviewing}
            className="px-3 py-1 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => handleBulkAction('reject')}
            disabled={reviewing}
            className="px-3 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {/* Item list */}
      <div className="border border-border rounded-lg divide-y divide-border">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/50">
          <input
            type="checkbox"
            checked={selectedIds.size === items.length}
            onChange={toggleAll}
            className="rounded border-border"
          />
          <span className="flex-1 text-xs font-medium text-muted-foreground">Content</span>
          <span className="w-20 text-xs font-medium text-muted-foreground text-center">Type</span>
          <span className="w-20 text-xs font-medium text-muted-foreground text-center">Source</span>
          <span className="w-20 text-xs font-medium text-muted-foreground text-center">Status</span>
        </div>

        {items.map((item) => {
          const isExpanded = expandedId === item.id;
          const body = item.content_body;
          const preview =
            item.content_type === 'flashcard'
              ? (body.front as string)
              : item.content_type === 'practice_question'
                ? (body.text as string)
                : (body.title as string) || '';

          return (
            <div key={item.id}>
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="rounded border-border"
                />
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex-1 text-left text-sm text-foreground truncate"
                >
                  {preview?.slice(0, 80) || '(empty)'}
                </button>
                <span className="w-20 text-xs text-muted-foreground text-center">
                  {item.content_type.replace('_', ' ')}
                </span>
                <span className="w-20 text-xs text-muted-foreground text-center">
                  {item.source}
                </span>
                <span className={`w-20 text-xs font-medium text-center px-2 py-0.5 rounded ${
                  item.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : item.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-12 py-3 bg-muted/20 border-t border-border/50">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                    {JSON.stringify(item.content_body, null, 2)}
                  </pre>
                  {item.validation_errors.length > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      Validation: {item.validation_errors.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
