// src/components/admin/curriculum/ActionPanel.tsx
// CTA buttons for pipeline actions + CLI command display.

import { useState } from 'react';
import { CardRoot } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AppIcon from '@/components/ui/AppIcon';
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

function CliCommand({ label, command }: { label: string; command: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded((v) => !v)}
        rightIcon={expanded ? 'chevron-up' : 'chevron-down'}
      >
        {label}
      </Button>
      {expanded && (
        <div className="mt-2 relative">
          <pre className="bg-muted rounded-lg p-3 text-xs text-foreground overflow-x-auto font-mono">
            {command}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-background border border-border hover:bg-accent transition-colors"
            title="Copy to clipboard"
          >
            <AppIcon name={copied ? 'check' : 'copy'} className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
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
