// src/components/admin/curriculum/ActionPanel.tsx
// CTA buttons for pipeline actions + CLI command display.

import { CardRoot } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CliCommand from '@/components/admin/curriculum/CliCommand';
import type { NormalizationResult, StagingStatusCounts } from '@/types/curriculumAdmin';

interface ActionPanelProps {
  specCode: string | null;
  statusCounts: StagingStatusCounts | null;
  onApproveAll: () => Promise<boolean>;
  onNormalize: () => Promise<NormalizationResult | null>;
  approving: boolean;
  normalizing: boolean;
  lastNormalizationResult: NormalizationResult | null;
}

export default function ActionPanel({
  specCode,
  statusCounts,
  onApproveAll,
  onNormalize,
  approving,
  normalizing,
  lastNormalizationResult,
}: ActionPanelProps) {
  const pendingOrReview = (statusCounts?.pending ?? 0) + (statusCounts?.review ?? 0);
  const approvedCount = statusCounts?.approved ?? 0;

  return (
    <CardRoot className="p-6 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Pipeline Actions</h3>

      {/* CLI commands */}
      {specCode && (
        <div className="flex flex-wrap gap-2">
          <CliCommand
            label="Run Extraction"
            command={`cd ai-tutor-api && ./venv/bin/python -m scripts.extract_curriculum --spec-code ${specCode} --stage`}
          />
          <CliCommand
            label="Validate"
            command={`cd ai-tutor-api && ./venv/bin/python -m scripts.extract_curriculum --spec-code ${specCode} --validate`}
          />
        </div>
      )}

      {/* Direct actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        <Button
          variant="primary"
          size="sm"
          onClick={onApproveAll}
          loading={approving}
          disabled={pendingOrReview === 0}
          leftIcon="check"
        >
          Approve All ({pendingOrReview})
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onNormalize}
          loading={normalizing}
          disabled={approvedCount === 0}
          leftIcon="arrow-right"
        >
          Normalize to Production ({approvedCount})
        </Button>
      </div>

      {/* Normalization result */}
      {lastNormalizationResult && (
        <div className="text-sm text-success bg-success/10 rounded-lg p-3">
          Normalized: {lastNormalizationResult.components_created} components,{' '}
          {lastNormalizationResult.themes_created} themes,{' '}
          {lastNormalizationResult.topics_created} topics
        </div>
      )}
    </CardRoot>
  );
}
