// src/components/admin/pipeline/ChunksPhase.tsx
// Phase 4: Chunks & Embeddings — vector DB state.

import { CardRoot } from '@/components/ui/Card';
import CliCommand from '@/components/admin/curriculum/CliCommand';
import type { ChunkStats } from '@/types/pipelineAdmin';

interface ChunksPhaseProps {
  stats: ChunkStats | null;
  specCode: string | null;
}

export default function ChunksPhase({ stats, specCode }: ChunksPhaseProps) {
  if (!stats || stats.total_chunks === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          No chunks in the vector database. Complete document processing first (Phase 2).
        </p>
      </div>
    );
  }

  const avgPerDoc =
    stats.by_document.length > 0
      ? Math.round(stats.total_chunks / stats.by_document.length)
      : 0;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <CardRoot className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{stats.total_chunks}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Total Chunks</div>
        </CardRoot>
        <CardRoot className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{stats.chunks_with_embedding}</div>
          <div className="text-[10px] text-muted-foreground uppercase">With Embedding</div>
        </CardRoot>
        <CardRoot className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{stats.by_document.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Documents</div>
        </CardRoot>
        <CardRoot className="p-3 text-center">
          <div className="text-lg font-bold text-foreground">{avgPerDoc}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Avg per Doc</div>
        </CardRoot>
      </div>

      {/* Embedding coverage */}
      {stats.chunks_with_embedding < stats.total_chunks && (
        <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm text-warning">
          {stats.total_chunks - stats.chunks_with_embedding} chunk(s) missing embeddings.
        </div>
      )}

      {/* Per-document distribution */}
      {stats.by_document.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Chunks by Document
          </h4>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                    Document
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                    Chunks
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.by_document.map((doc) => (
                  <tr key={doc.document_id} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground text-xs">
                      {doc.document_title}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground uppercase text-xs">
                      {doc.doc_type}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-foreground">
                      {doc.chunk_count}
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
        <div className="pt-2 border-t border-border">
          <CliCommand
            label="Re-embed Chunks"
            command={`cd ai-tutor-api && ./venv/bin/python -m scripts.embed --spec-code ${specCode}`}
          />
        </div>
      )}
    </div>
  );
}
