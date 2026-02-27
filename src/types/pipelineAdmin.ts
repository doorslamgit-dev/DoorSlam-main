// src/types/pipelineAdmin.ts
// Types for the content pipeline admin dashboard (phases 1-4).
// Phases 5-6 (staging + production) use types from curriculumAdmin.ts.

// ---------------------------------------------------------------------------
// Document types (from rag.documents)
// ---------------------------------------------------------------------------

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'deleted';

export type DocType = 'qp' | 'ms' | 'er' | 'gt' | 'sp' | 'spec' | 'rev';

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  qp: 'Question Papers',
  ms: 'Mark Schemes',
  er: 'Examiner Reports',
  gt: 'Grade Thresholds',
  sp: 'Sample Papers',
  spec: 'Specifications',
  rev: 'Revision Guides',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  deleted: 'Deleted',
};

// ---------------------------------------------------------------------------
// Chunk types (from rag.chunks metadata->chunk_type)
// ---------------------------------------------------------------------------

export type ChunkType =
  | 'question'
  | 'answer'
  | 'marking_criteria'
  | 'grade_table'
  | 'examiner_comment'
  | 'definition'
  | 'explanation'
  | 'worked_example'
  | 'learning_objective'
  | 'practical'
  | 'data_table'
  | 'general';

export const CHUNK_TYPE_LABELS: Record<ChunkType, string> = {
  question: 'Questions',
  answer: 'Answers',
  marking_criteria: 'Marking Criteria',
  grade_table: 'Grade Tables',
  examiner_comment: 'Examiner Comments',
  definition: 'Definitions',
  explanation: 'Explanations',
  worked_example: 'Worked Examples',
  learning_objective: 'Learning Objectives',
  practical: 'Practicals',
  data_table: 'Data Tables',
  general: 'General',
};

// ---------------------------------------------------------------------------
// RPC response types
// ---------------------------------------------------------------------------

/** Returned by rag.get_document_stats_for_subject() */
export interface DocumentStats {
  total: number;
  by_status: Partial<Record<DocumentStatus, number>>;
  by_doc_type: Partial<Record<DocType, number>>;
  by_year: Record<string, number>;
  enriched_count: number;
  missing_summary_count: number;
}

/** Returned by rag.get_chunk_stats_for_subject() */
export interface ChunkStats {
  total_chunks: number;
  chunks_with_embedding: number;
  chunks_with_topic: number;
  chunks_without_topic: number;
  unique_topics_covered: number;
  by_chunk_type: Partial<Record<ChunkType, number>>;
  by_document: Array<{
    document_id: string;
    document_title: string;
    doc_type: string;
    chunk_count: number;
  }>;
}

// ---------------------------------------------------------------------------
// Ingestion job (from rag.ingestion_jobs)
// ---------------------------------------------------------------------------

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface IngestionJob {
  id: string;
  batch_label: string | null;
  status: JobStatus;
  total_documents: number;
  processed_documents: number;
  failed_documents: number;
  total_chunks: number | null;
  job_type: 'batch' | 'sync';
  sync_stats: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

// ---------------------------------------------------------------------------
// Pipeline phase health
// ---------------------------------------------------------------------------

export type PhaseHealth = 'empty' | 'partial' | 'complete' | 'error';

export interface PipelinePhaseState {
  health: PhaseHealth;
  label: string;
  detail: string;
}
