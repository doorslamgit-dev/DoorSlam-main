// src/views/admin/CurriculumAdmin.tsx
// Curriculum management page for Doorslam admins.

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubjectSelector from '@/components/admin/curriculum/SubjectSelector';
import OverviewTab from '@/components/admin/curriculum/OverviewTab';
import StagingTab from '@/components/admin/curriculum/StagingTab';
import ProductionTab from '@/components/admin/curriculum/ProductionTab';
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
        <h1 className="text-2xl font-bold text-foreground">Curriculum Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Extract, review, and approve curriculum data from specification PDFs.
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
          Loading curriculum data...
        </div>
      )}

      {/* Content tabs */}
      {selectedSubjectId && !loading && (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staging">
              Staging
              {statusCounts && statusCounts.total > 0 && (
                <span className="ml-1.5 text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                  {statusCounts.total}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              specCode={specCode}
              statusCounts={statusCounts}
              productionData={productionData}
              onApproveAll={approveAll}
              onNormalize={normalize}
              approving={approving}
              normalizing={normalizing}
              lastNormalizationResult={lastNormalizationResult}
            />
          </TabsContent>

          <TabsContent value="staging">
            <StagingTab
              hierarchy={stagingHierarchy}
              stagingData={stagingData}
              onApproveSelected={approveSelected}
              onRejectSelected={rejectSelected}
              approving={approving}
              rejecting={rejecting}
              specCode={specCode}
            />
          </TabsContent>

          <TabsContent value="production">
            <ProductionTab productionData={productionData} stagingData={stagingData} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
