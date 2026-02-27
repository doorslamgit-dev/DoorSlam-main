// src/components/admin/curriculum/StagingTab.tsx
// Hierarchical view of staging data with bulk selection and actions.

import { useCallback, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge, { STATUS_TO_BADGE_VARIANT } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StagingHierarchy, StagingRow, StagingStatus } from '@/types/curriculumAdmin';

interface StagingTabProps {
  hierarchy: StagingHierarchy | null;
  stagingData: StagingRow[];
  onApproveSelected: (rowIds: number[]) => Promise<boolean>;
  onRejectSelected: (rowIds: number[]) => Promise<boolean>;
  approving: boolean;
  rejecting: boolean;
  specCode: string | null;
}

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'imported', label: 'Imported' },
];

function getStatusVariant(status: StagingStatus): BadgeVariant {
  return STATUS_TO_BADGE_VARIANT[status] ?? 'default';
}

export default function StagingTab({
  hierarchy,
  stagingData,
  onApproveSelected,
  onRejectSelected,
  approving,
  rejecting,
  specCode,
}: StagingTabProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState('all');

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const filtered = getFilteredRows(stagingData, statusFilter);
    setSelectedIds(new Set(filtered.map((r) => r.id)));
  }, [stagingData, statusFilter]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleApprove = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const success = await onApproveSelected(ids);
    if (success) setSelectedIds(new Set());
  };

  const handleReject = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const success = await onRejectSelected(ids);
    if (success) setSelectedIds(new Set());
  };

  if (!hierarchy || stagingData.length === 0) {
    return (
      <EmptyState
        icon="clipboard-list"
        title="No staging data"
        description={
          specCode
            ? `Run the extraction pipeline to populate staging data for this subject.`
            : 'Select a subject to view staging data.'
        }
        action={
          specCode ? (
            <pre className="text-xs bg-muted rounded-lg p-3 text-left font-mono mt-2 max-w-lg mx-auto">
              cd ai-tutor-api && ./venv/bin/python -m scripts.extract_curriculum --spec-code{' '}
              {specCode} --stage
            </pre>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={selectAll}>
            Select all
          </Button>
          {selectedIds.size > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear ({selectedIds.size})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleApprove}
            loading={approving}
            disabled={selectedIds.size === 0}
            leftIcon="check"
          >
            Approve ({selectedIds.size})
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReject}
            loading={rejecting}
            disabled={selectedIds.size === 0}
            leftIcon="x"
          >
            Reject ({selectedIds.size})
          </Button>
        </div>
      </div>

      {/* Accordion hierarchy */}
      <Accordion type="multiple" className="rounded-lg border border-border">
        {hierarchy.components.map((comp) => {
          const filteredThemes = comp.themes
            .map((theme) => ({
              ...theme,
              topics: getFilteredRows(theme.topics, statusFilter),
            }))
            .filter((theme) => theme.topics.length > 0);

          if (filteredThemes.length === 0) return null;

          const topicCount = filteredThemes.reduce((sum, t) => sum + t.topics.length, 0);

          return (
            <AccordionItem key={comp.name} value={comp.name}>
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="font-semibold">{comp.name}</span>
                  {comp.weighting && (
                    <Badge variant="default" size="sm">
                      {comp.weighting}
                    </Badge>
                  )}
                  <Badge variant="info" size="sm">
                    {topicCount} topic{topicCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                {filteredThemes.map((theme) => (
                  <div key={theme.name} className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {theme.name}
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10" />
                          <TableHead>Topic</TableHead>
                          <TableHead className="w-20">Order</TableHead>
                          <TableHead className="w-24">Code</TableHead>
                          <TableHead className="w-24">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {theme.topics.map((topic) => (
                          <TableRow key={topic.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedIds.has(topic.id)}
                                onChange={() => toggleSelection(topic.id)}
                                className="rounded border-border"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{topic.topic_name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {topic.topic_order}
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">
                              {topic.canonical_code ?? '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(topic.status)} size="sm">
                                {topic.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function getFilteredRows(rows: StagingRow[], statusFilter: string): StagingRow[] {
  if (statusFilter === 'all') return rows;
  return rows.filter((r) => r.status === statusFilter);
}
