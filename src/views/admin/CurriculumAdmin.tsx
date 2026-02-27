// src/views/admin/CurriculumAdmin.tsx
// Content pipeline dashboard — 6-phase view for managing the full
// content ingestion and curriculum creation pipeline.

import SubjectSelector from '@/components/admin/curriculum/SubjectSelector';
import ActionPanel from '@/components/admin/curriculum/ActionPanel';
import StagingTab from '@/components/admin/curriculum/StagingTab';
import ProductionTab from '@/components/admin/curriculum/ProductionTab';
import PipelineStatusStrip from '@/components/admin/pipeline/PipelineStatusStrip';
import PipelinePhaseCard from '@/components/admin/pipeline/PipelinePhaseCard';
import DocumentsPhase from '@/components/admin/pipeline/DocumentsPhase';
import ProcessingPhase from '@/components/admin/pipeline/ProcessingPhase';
import EnrichmentPhase from '@/components/admin/pipeline/EnrichmentPhase';
import ChunksPhase from '@/components/admin/pipeline/ChunksPhase';
import { useCurriculumAdmin } from '@/hooks/admin/useCurriculumAdmin';

export default function CurriculumAdmin() {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    stagingData,
    stagingHierarchy,
    statusCounts,
    productionData,
    documentStats,
    chunkStats,
    recentJobs,
    phaseStates,
    loading,
    subjectsLoading,
    error,
    approveAll,
    approveSelected,
    rejectSelected,
    normalize,
    approving,
    rejecting,
    normalizing,
    lastNormalizationResult,
  } = useCurriculumAdmin();

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const specCode = selectedSubject?.spec_code ?? null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the full content ingestion, enrichment, and curriculum creation pipeline.
        </p>
      </div>

      {/* Subject selector */}
      <SubjectSelector
        subjects={subjects}
        selectedId={selectedSubjectId}
        onSelect={setSelectedSubjectId}
        loading={subjectsLoading}
      />

      {/* Error display */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Loading pipeline data...
        </div>
      )}

      {/* Pipeline phases */}
      {selectedSubjectId && !loading && (
        <>
          <PipelineStatusStrip phases={phaseStates} />

          <div className="space-y-3">
            {/* Phase 1: Documents */}
            <PipelinePhaseCard phase={1} title="Documents" state={phaseStates[0]}>
              <DocumentsPhase stats={documentStats} specCode={specCode} />
            </PipelinePhaseCard>

            {/* Phase 2: Processing */}
            <PipelinePhaseCard phase={2} title="Processing" state={phaseStates[1]}>
              <ProcessingPhase stats={documentStats} jobs={recentJobs} specCode={specCode} />
            </PipelinePhaseCard>

            {/* Phase 3: Enrichment & Metadata */}
            <PipelinePhaseCard phase={3} title="Enrichment & Metadata" state={phaseStates[2]}>
              <EnrichmentPhase
                docStats={documentStats}
                chunkStats={chunkStats}
                specCode={specCode}
              />
            </PipelinePhaseCard>

            {/* Phase 4: Chunks & Embeddings */}
            <PipelinePhaseCard phase={4} title="Chunks & Embeddings" state={phaseStates[3]}>
              <ChunksPhase stats={chunkStats} specCode={specCode} />
            </PipelinePhaseCard>

            {/* Phase 5: Curriculum Staging */}
            <PipelinePhaseCard phase={5} title="Curriculum Staging" state={phaseStates[4]}>
              <div className="space-y-4">
                <ActionPanel
                  specCode={specCode}
                  statusCounts={statusCounts}
                  onApproveAll={approveAll}
                  onNormalize={normalize}
                  approving={approving}
                  normalizing={normalizing}
                  lastNormalizationResult={lastNormalizationResult}
                />
                <StagingTab
                  hierarchy={stagingHierarchy}
                  stagingData={stagingData}
                  onApproveSelected={approveSelected}
                  onRejectSelected={rejectSelected}
                  approving={approving}
                  rejecting={rejecting}
                  specCode={specCode}
                />
              </div>
            </PipelinePhaseCard>

            {/* Phase 6: Production Tables */}
            <PipelinePhaseCard phase={6} title="Production Tables" state={phaseStates[5]}>
              <ProductionTab productionData={productionData} stagingData={stagingData} />
            </PipelinePhaseCard>
          </div>
        </>
      )}
    </div>
  );
}
