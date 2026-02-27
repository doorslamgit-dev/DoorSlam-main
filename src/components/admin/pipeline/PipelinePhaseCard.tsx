// src/components/admin/pipeline/PipelinePhaseCard.tsx
// Collapsible card wrapper for each pipeline phase.

import { type ReactNode, useState } from 'react';
import { CardRoot } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import AppIcon from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';
import type { PipelinePhaseState, PhaseHealth } from '@/types/pipelineAdmin';
import type { BadgeVariant } from '@/components/ui/Badge';

interface PipelinePhaseCardProps {
  phase: number;
  title: string;
  state: PipelinePhaseState;
  defaultOpen?: boolean;
  children: ReactNode;
}

const HEALTH_TO_BADGE: Record<PhaseHealth, BadgeVariant> = {
  complete: 'success',
  partial: 'warning',
  error: 'danger',
  empty: 'default',
};

const HEALTH_LABEL: Record<PhaseHealth, string> = {
  complete: 'Complete',
  partial: 'Partial',
  error: 'Issues',
  empty: 'Empty',
};

export default function PipelinePhaseCard({
  phase,
  title,
  state,
  defaultOpen = false,
  children,
}: PipelinePhaseCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <CardRoot className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-accent/50 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
          {phase}
        </span>
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        <Badge variant={HEALTH_TO_BADGE[state.health]} size="sm" dot>
          {HEALTH_LABEL[state.health]}
        </Badge>
        <span className="text-xs text-muted-foreground hidden sm:inline">{state.detail}</span>
        <AppIcon
          name={open ? 'chevron-up' : 'chevron-down'}
          className="w-4 h-4 text-muted-foreground flex-shrink-0"
        />
      </button>
      <div
        className={cn(
          'border-t border-border transition-all',
          open ? 'px-5 py-4' : 'h-0 overflow-hidden border-t-0'
        )}
      >
        {open && children}
      </div>
    </CardRoot>
  );
}
