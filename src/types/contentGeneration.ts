// src/types/contentGeneration.ts
// Types for content generation pipeline: staging, review, coverage.

export type ContentType = 'flashcard' | 'teaching_slide' | 'worked_example' | 'practice_question';

export type StagingStatus = 'pending_review' | 'approved' | 'rejected';

export const CONTENT_TYPE_SHORT: Record<ContentType, string> = {
  flashcard: 'FC',
  teaching_slide: 'TS',
  worked_example: 'WE',
  practice_question: 'PQ',
};

export const STAGING_STATUS_LABELS: Record<StagingStatus, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export interface StagingItem {
  id: string;
  subject_id: string;
  topic_id: string;
  content_type: ContentType;
  content_body: Record<string, unknown>;
  source: string;
  difficulty: number;
  estimated_seconds: number;
  status: StagingStatus;
  validation_errors: string[];
  reviewer_notes: string | null;
  reviewed_at: string | null;
  generation_batch_id: string | null;
  generation_model: string | null;
  created_at: string;
}

export interface StagingItemUpdate {
  status?: StagingStatus;
  content_body?: Record<string, unknown>;
  reviewer_notes?: string;
  reviewed_at?: string;
}

export interface ReviewAction {
  id: string;
  action: 'approve' | 'reject';
  reviewer_notes?: string;
}

export interface ReviewResponse {
  approved: number;
  rejected: number;
}

export interface TopicCoverage {
  topic_id: string;
  topic_name: string;
  canonical_code: string | null;
  flashcard_count: number;
  teaching_slide_count: number;
  worked_example_count: number;
  practice_question_count: number;
  total: number;
  staging_count: number;
}

export interface GenerateContentResponse {
  batch_id: string;
  topics_processed: number;
  items_created: number;
  items_with_errors: number;
  results: GenerateTopicResult[];
}

export interface GenerateTopicResult {
  topic_id: string;
  topic_name: string;
  items_created: number;
  errors: string[];
}

export interface ContentStatsResponse {
  subject_id: string;
  production: Record<string, number>;
  staging: Record<string, number>;
}
