// src/components/admin/pipeline/DocumentsPhase.tsx
// Phase 1: Document inventory — shows what source documents exist for the subject.

import { CardRoot } from '@/components/ui/Card';
import CliCommand from '@/components/admin/curriculum/CliCommand';
import { DOC_TYPE_LABELS } from '@/types/pipelineAdmin';
import type { DocType, DocumentStats } from '@/types/pipelineAdmin';

interface DocumentsPhaseProps {
  stats: DocumentStats | null;
  specCode: string | null;
}

const DOC_TYPE_ORDER: DocType[] = ['qp', 'ms', 'er', 'gt', 'sp', 'spec', 'rev'];

export default function DocumentsPhase({ stats, specCode }: DocumentsPhaseProps) {
  if (!stats || stats.total === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          No documents found for this subject. Sync documents from Google Drive to get started.
        </p>
        {specCode && (
          <CliCommand
            label="Sync from Google Drive"
            command={`cd ai-tutor-api && ./venv/bin/python -m scripts.ingest --sync --spec-code ${specCode}`}
          />
        )}
      </div>
    );
  }

  const years = Object.keys(stats.by_year)
    .sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-4">
      {/* Doc type summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {DOC_TYPE_ORDER.map((type) => {
          const count = stats.by_doc_type[type] ?? 0;
          return (
            <CardRoot key={type} className="p-3 text-center">
              <div className="text-lg font-bold text-foreground">{count}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {DOC_TYPE_LABELS[type]}
              </div>
            </CardRoot>
          );
        })}
      </div>

      {/* Year breakdown */}
      {years.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">By Year</h4>
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <span
                key={year}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs text-foreground"
              >
                {year}
                <span className="font-semibold">{stats.by_year[year]}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CLI action */}
      {specCode && (
        <div className="pt-2 border-t border-border">
          <CliCommand
            label="Sync from Google Drive"
            command={`cd ai-tutor-api && ./venv/bin/python -m scripts.ingest --sync --spec-code ${specCode}`}
          />
        </div>
      )}
    </div>
  );
}
