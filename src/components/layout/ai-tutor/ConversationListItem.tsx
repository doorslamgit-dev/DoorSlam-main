// src/components/layout/ai-tutor/ConversationListItem.tsx
// Single row in the conversation history drawer.

import { useState } from 'react';
import AppIcon from '../../ui/AppIcon';

interface ConversationListItemProps {
  id: string;
  title: string | null;
  lastActiveAt: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function ConversationListItem({
  id,
  title,
  lastActiveAt,
  isActive,
  onSelect,
  onDelete,
}: ConversationListItemProps) {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirming) {
      onDelete(id);
      setConfirming(false);
    } else {
      setConfirming(true);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors group ${
        isActive
          ? 'bg-primary/5 text-primary/90'
          : 'hover:bg-muted text-foreground'
      }`}
    >
      <AppIcon
        name="message-circle"
        className={`w-3.5 h-3.5 flex-shrink-0 ${
          isActive ? 'text-primary' : 'text-muted-foreground'
        }`}
      />
      <span className="flex-1 text-sm truncate">{title || 'New conversation'}</span>
      <span className="text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
        {formatRelativeTime(lastActiveAt)}
      </span>
      <button
        type="button"
        onClick={handleDelete}
        className={`p-0.5 rounded transition-all flex-shrink-0 ${
          confirming
            ? 'text-destructive opacity-100'
            : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive'
        }`}
        aria-label={confirming ? 'Confirm delete' : 'Delete conversation'}
        title={confirming ? 'Click again to confirm' : 'Delete'}
      >
        <AppIcon name="trash" className="w-3 h-3" />
      </button>
    </button>
  );
}
