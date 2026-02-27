// src/components/admin/curriculum/PipelineStatusGrid.tsx
// Stats grid showing staging status counts and production totals.

import { CardRoot } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import type { StagingStatusCounts } from '@/types/curriculumAdmin';

interface ProductionSummary {
  components: number;
  themes: number;
  topics: number;
}

interface PipelineStatusGridProps {
  statusCounts: StagingStatusCounts | null;
  productionSummary: ProductionSummary;
}

const STAGING_STATS: {
  key: keyof Omit<StagingStatusCounts, 'total'>;
  label: string;
  variant: BadgeVariant;
}[] = [
  { key: 'pending', label: 'Pending', variant: 'warning' },
  { key: 'review', label: 'In Review', variant: 'info' },
  { key: 'approved', label: 'Approved', variant: 'success' },
  { key: 'rejected', label: 'Rejected', variant: 'danger' },
  { key: 'imported', label: 'Imported', variant: 'primary' },
];

export default function PipelineStatusGrid({
  statusCounts,
  productionSummary,
}: PipelineStatusGridProps) {
  return (
    <div className="space-y-4">
      {/* Staging status */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Staging Pipeline</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAGING_STATS.map(({ key, label, variant }) => (
            <CardRoot key={key} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Badge variant={variant} size="sm">
                  {statusCounts?.[key] ?? 0}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {statusCounts?.[key] ?? 0}
              </div>
            </CardRoot>
          ))}
        </div>
      </div>

      {/* Production totals */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Production Tables</h3>
        <div className="grid grid-cols-3 gap-3">
          <CardRoot className="p-4">
            <span className="text-sm text-muted-foreground">Components</span>
            <div className="text-2xl font-bold text-foreground">{productionSummary.components}</div>
          </CardRoot>
          <CardRoot className="p-4">
            <span className="text-sm text-muted-foreground">Themes</span>
            <div className="text-2xl font-bold text-foreground">{productionSummary.themes}</div>
          </CardRoot>
          <CardRoot className="p-4">
            <span className="text-sm text-muted-foreground">Topics</span>
            <div className="text-2xl font-bold text-foreground">{productionSummary.topics}</div>
          </CardRoot>
        </div>
      </div>
    </div>
  );
}
