// src/components/admin/curriculum/ProductionTab.tsx
// Read-only view of production curriculum hierarchy.

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
import Badge from '@/components/ui/Badge';
import { CardRoot } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import type { ProductionComponent, StagingRow } from '@/types/curriculumAdmin';

interface ProductionTabProps {
  productionData: ProductionComponent[];
  stagingData: StagingRow[];
}

export default function ProductionTab({
  productionData,
  stagingData,
}: ProductionTabProps) {
  const totalThemes = productionData.reduce((s, c) => s + (c.themes?.length ?? 0), 0);
  const totalTopics = productionData.reduce(
    (s, c) => s + (c.themes?.reduce((ts, t) => ts + (t.topics?.length ?? 0), 0) ?? 0),
    0
  );

  const stagingApproved = stagingData.filter((r) => r.status === 'approved').length;
  const stagingPending = stagingData.filter(
    (r) => r.status === 'pending' || r.status === 'review'
  ).length;

  if (productionData.length === 0) {
    return (
      <EmptyState
        icon="book-open"
        title="No production data"
        description="No components, themes, or topics have been imported for this subject yet. Use the staging pipeline to extract and normalize curriculum data."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Comparison summary */}
      <CardRoot className="p-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Production: </span>
            <span className="font-medium">
              {productionData.length} components, {totalThemes} themes, {totalTopics} topics
            </span>
          </div>
          {stagingApproved > 0 && (
            <div>
              <Badge variant="success" size="sm">
                {stagingApproved} approved
              </Badge>
              <span className="text-muted-foreground ml-1">ready to normalize</span>
            </div>
          )}
          {stagingPending > 0 && (
            <div>
              <Badge variant="warning" size="sm">
                {stagingPending} pending
              </Badge>
              <span className="text-muted-foreground ml-1">in staging</span>
            </div>
          )}
        </div>
      </CardRoot>

      {/* Production hierarchy */}
      <Accordion type="multiple" className="rounded-lg border border-border">
        {productionData.map((comp) => {
          const themeCount = comp.themes?.length ?? 0;
          const topicCount =
            comp.themes?.reduce((s, t) => s + (t.topics?.length ?? 0), 0) ?? 0;

          return (
            <AccordionItem key={comp.id} value={comp.id}>
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="font-semibold">{comp.component_name}</span>
                  {comp.component_weighting && (
                    <Badge variant="default" size="sm">
                      {comp.component_weighting}
                    </Badge>
                  )}
                  <Badge variant="info" size="sm">
                    {themeCount} theme{themeCount !== 1 ? 's' : ''}, {topicCount} topic
                    {topicCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                {comp.themes?.map((theme) => (
                  <div key={theme.id} className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {theme.theme_name}
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Topic</TableHead>
                          <TableHead className="w-20">Order</TableHead>
                          <TableHead className="w-24">Code</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {theme.topics?.map((topic) => (
                          <TableRow key={topic.id}>
                            <TableCell className="font-medium">{topic.topic_name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {topic.order_index}
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">
                              {topic.canonical_code ?? '-'}
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
