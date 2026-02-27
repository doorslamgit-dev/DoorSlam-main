// src/components/admin/pipeline/EnrichmentPhase.tsx
// Phase 3: Enrichment & Metadata — document summaries/key_points + chunk classification.

import { CardRoot } from '@/components/ui/Card';
import CliCommand from '@/components/admin/curriculum/CliCommand';
import { CHUNK_TYPE_LABELS } from '@/types/pipelineAdmin';
import type { ChunkStats, ChunkType, DocumentStats } from '@/types/pipelineAdmin';

interface EnrichmentPhaseProps {
  docStats: DocumentStats | null;
  chunkStats: ChunkStats | null;
  specCode: string | null;
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground">
          {value}/{max} ({pct}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function EnrichmentPhase({
  docStats,
  chunkStats,
  specCode,
}: EnrichmentPhaseProps) {
  const hasDocStats = docStats && docStats.total > 0;
  const hasChunkStats = chunkStats && chunkStats.total_chunks > 0;

  if (!hasDocStats && !hasChunkStats) {
    return (
      <p className="text-sm text-muted-foreground">
        No data to enrich. Complete document processing first (Phase 2).
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Document enrichment */}
      {hasDocStats && (
        <div>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
            Document Enrichment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <CardRoot className="p-3 text-center">
              <div className="text-lg font-bold text-foreground">{docStats.enriched_count}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Enriched</div>
            </CardRoot>
            <CardRoot className="p-3 text-center">
              <div className="text-lg font-bold text-foreground">
                {docStats.missing_summary_count}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">Missing Summary</div>
            </CardRoot>
            <CardRoot className="p-3 text-center">
              <div className="text-lg font-bold text-foreground">{docStats.total}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Total</div>
            </CardRoot>
          </div>
          <ProgressBar
            value={docStats.enriched_count}
            max={docStats.total}
            label="Documents with summary"
          />
        </div>
      )}

      {/* Chunk metadata */}
      {hasChunkStats && (
        <div>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
            Chunk Metadata
          </h4>

          {/* Topic assignment progress */}
          <div className="space-y-3 mb-4">
            <ProgressBar
              value={chunkStats.chunks_with_topic}
              max={chunkStats.total_chunks}
              label="Chunks with topic assignment"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <CardRoot className="p-3 text-center">
                <div className="text-lg font-bold text-foreground">
                  {chunkStats.unique_topics_covered}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  Topics Covered
                </div>
              </CardRoot>
              <CardRoot className="p-3 text-center">
                <div className="text-lg font-bold text-foreground">
                  {chunkStats.chunks_without_topic}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  Unclassified
                </div>
              </CardRoot>
              <CardRoot className="p-3 text-center">
                <div className="text-lg font-bold text-foreground">
                  {chunkStats.total_chunks}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">Total Chunks</div>
              </CardRoot>
            </div>
          </div>

          {/* Chunk type distribution */}
          {Object.keys(chunkStats.by_chunk_type).length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Chunk Type Distribution
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(chunkStats.by_chunk_type)
                  .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded bg-muted text-xs"
                    >
                      <span className="text-muted-foreground">
                        {CHUNK_TYPE_LABELS[type as ChunkType] ?? type}
                      </span>
                      <span className="font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLI actions */}
      {specCode && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <CliCommand
            label="Re-enrich Documents"
            command={`cd ai-tutor-api && ./venv/bin/python -m scripts.enrich --spec-code ${specCode}`}
          />
          <CliCommand
            label="Topic Backfill"
            command={`cd ai-tutor-api && ./venv/bin/python -m scripts.classify_chunks --spec-code ${specCode}`}
          />
        </div>
      )}
    </div>
  );
}
