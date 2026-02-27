// src/components/admin/pipeline/ProcessingPhase.tsx
// Phase 2: Document processing status — ingestion and PDF parsing.

import { CardRoot } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CliCommand from '@/components/admin/curriculum/CliCommand';
import { DOCUMENT_STATUS_LABELS } from '@/types/pipelineAdmin';
import type { DocumentStats, IngestionJob, DocumentStatus } from '@/types/pipelineAdmin';
import type { BadgeVariant } from '@/components/ui/Badge';

interface ProcessingPhaseProps {
  stats: DocumentStats | null;
  jobs: IngestionJob[];
  specCode: string | null;
}

const STATUS_ORDER: DocumentStatus[] = ['completed', 'processing', 'pending', 'failed'];

const STATUS_VARIANT: Record<DocumentStatus, BadgeVariant> = {
  completed: 'success',
  processing: 'warning',
  pending: 'default',
  failed: 'danger',
  deleted: 'default',
};

const JOB_VARIANT: Record<string, BadgeVariant> = {
  completed: 'success',
  running: 'warning',
  queued: 'default',
  failed: 'danger',
  cancelled: 'default',
};

export default function ProcessingPhase({ stats, jobs, specCode }: ProcessingPhaseProps) {
  if (!stats || stats.total === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          No documents to process. Upload documents first (Phase 1).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STATUS_ORDER.map((status) => {
          const count = stats.by_status[status] ?? 0;
          return (
            <CardRoot key={status} className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {DOCUMENT_STATUS_LABELS[status]}
                </span>
                <Badge variant={STATUS_VARIANT[status]} size="sm">
                  {count}
                </Badge>
              </div>
              <div className="text-xl font-bold text-foreground">{count}</div>
            </CardRoot>
          );
        })}
      </div>

      {/* Failed alert */}
      {(stats.by_status.failed ?? 0) > 0 && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {stats.by_status.failed} document(s) failed processing. Check ingestion logs for details.
        </div>
      )}

      {/* Recent ingestion jobs */}
      {jobs.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Recent Ingestion Jobs</h4>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                    Job
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                    Docs
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground font-mono text-xs">
                      {job.batch_label ?? job.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground capitalize">{job.job_type}</td>
                    <td className="px-3 py-2">
                      <Badge variant={JOB_VARIANT[job.status] ?? 'default'} size="sm">
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right text-foreground">
                      {job.processed_documents}/{job.total_documents}
                      {job.failed_documents > 0 && (
                        <span className="text-destructive ml-1">
                          ({job.failed_documents} failed)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground text-xs">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLI actions */}
      {specCode && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <CliCommand
            label="Batch Ingestion"
            command={`cd ai-tutor-api && ./venv/bin/python -m scripts.ingest --batch --spec-code ${specCode}`}
          />
          <CliCommand
            label="Incremental Sync"
            command={`cd ai-tutor-api && ./venv/bin/python -m scripts.ingest --sync --spec-code ${specCode}`}
          />
        </div>
      )}
    </div>
  );
}
