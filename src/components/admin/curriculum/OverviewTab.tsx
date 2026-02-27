// src/components/admin/curriculum/OverviewTab.tsx
// Overview tab composing status grid and action panel.

import type { NormalizationResult, ProductionComponent, StagingStatusCounts } from '@/types/curriculumAdmin';
import PipelineStatusGrid from './PipelineStatusGrid';
import ActionPanel from './ActionPanel';

interface OverviewTabProps {
  specCode: string | null;
  statusCounts: StagingStatusCounts | null;
  productionData: ProductionComponent[];
  onApproveAll: () => Promise<boolean>;
  onNormalize: () => Promise<NormalizationResult | null>;
  approving: boolean;
  normalizing: boolean;
  lastNormalizationResult: NormalizationResult | null;
}

export default function OverviewTab({
  specCode,
  statusCounts,
  productionData,
  onApproveAll,
  onNormalize,
  approving,
  normalizing,
  lastNormalizationResult,
}: OverviewTabProps) {
  const productionSummary = {
    components: productionData.length,
    themes: productionData.reduce((sum, c) => sum + (c.themes?.length ?? 0), 0),
    topics: productionData.reduce(
      (sum, c) => sum + (c.themes?.reduce((tSum, t) => tSum + (t.topics?.length ?? 0), 0) ?? 0),
      0
    ),
  };

  return (
    <div className="space-y-6">
      <PipelineStatusGrid statusCounts={statusCounts} productionSummary={productionSummary} />
      <ActionPanel
        specCode={specCode}
        statusCounts={statusCounts}
        onApproveAll={onApproveAll}
        onNormalize={onNormalize}
        approving={approving}
        normalizing={normalizing}
        lastNormalizationResult={lastNormalizationResult}
      />
    </div>
  );
}
