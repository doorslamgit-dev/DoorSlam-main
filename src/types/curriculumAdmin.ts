// src/types/curriculumAdmin.ts
// Types for the curriculum admin management page.

export type StagingStatus = 'pending' | 'review' | 'approved' | 'rejected' | 'imported';

export interface StagingRow {
  id: number;
  subject_id: string;
  component_name: string;
  component_order: number;
  component_weighting: string | null;
  theme_name: string;
  theme_order: number;
  topic_name: string;
  topic_order: number;
  canonical_code: string | null;
  extraction_batch_id: string;
  status: StagingStatus;
  created_at: string;
}

export interface StagingStatusCounts {
  pending: number;
  review: number;
  approved: number;
  rejected: number;
  imported: number;
  total: number;
}

export interface ProductionComponent {
  id: string;
  component_name: string;
  component_weighting: string | null;
  order_index: number;
  themes: ProductionTheme[];
}

export interface ProductionTheme {
  id: string;
  theme_name: string;
  order_index: number;
  topics: ProductionTopic[];
}

export interface ProductionTopic {
  id: string;
  topic_name: string;
  order_index: number;
  canonical_code: string | null;
}

export interface SubjectOption {
  id: string;
  subject_name: string;
  spec_code: string | null;
  exam_board_name: string;
  color: string;
}

export interface StagingHierarchy {
  components: StagingComponentGroup[];
}

export interface StagingComponentGroup {
  name: string;
  order: number;
  weighting: string | null;
  themes: StagingThemeGroup[];
}

export interface StagingThemeGroup {
  name: string;
  order: number;
  topics: StagingRow[];
}

export interface NormalizationResult {
  components_created: number;
  themes_created: number;
  topics_created: number;
}
