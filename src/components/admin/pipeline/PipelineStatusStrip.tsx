// src/components/admin/pipeline/PipelineStatusStrip.tsx
// Horizontal status strip showing all 6 pipeline phases with health indicators.

import { cn } from '@/lib/utils';
import type { PipelinePhaseState, PhaseHealth } from '@/types/pipelineAdmin';

interface PipelineStatusStripProps {
  phases: PipelinePhaseState[];
}

const HEALTH_COLORS: Record<PhaseHealth, string> = {
  complete: 'bg-success',
  partial: 'bg-warning',
  error: 'bg-destructive',
  empty: 'bg-muted-foreground/30',
};

const HEALTH_TEXT: Record<PhaseHealth, string> = {
  complete: 'text-success',
  partial: 'text-warning',
  error: 'text-destructive',
  empty: 'text-muted-foreground',
};

export default function PipelineStatusStrip({ phases }: PipelineStatusStripProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-3">
      {phases.map((phase, i) => (
        <div key={phase.label} className="flex items-center">
          {i > 0 && (
            <div className="w-4 h-px bg-border mx-1 flex-shrink-0" aria-hidden="true" />
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border flex-shrink-0">
            <span
              className={cn('w-2 h-2 rounded-full flex-shrink-0', HEALTH_COLORS[phase.health])}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              {phase.label}
            </span>
            <span
              className={cn(
                'text-[10px] whitespace-nowrap',
                HEALTH_TEXT[phase.health]
              )}
            >
              {phase.detail}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
