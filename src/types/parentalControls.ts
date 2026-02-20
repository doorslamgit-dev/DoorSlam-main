// src/types/parentalControls.ts
// Types for the parental controls system — generic per-child, per-feature access control

export type AccessLevel = 'none' | 'requires_approval' | 'auto_approved';

export type FeatureKey = 'timetable_edit';

export type ApprovalRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ParentalControl {
  id: string;
  feature_key: FeatureKey;
  access_level: AccessLevel;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  child_id: string;
  child_name: string;
  feature_key: FeatureKey;
  request_type: string;
  request_data: Record<string, unknown>;
  created_at: string;
}

export interface MoveTopicRequestData {
  topic_id: string;
  topic_name: string;
  subject_name: string;
  source_session_id: string;
  target_session_id: string;
  source_label: string;
  target_label: string;
}

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  timetable_edit: 'Timetable Editing',
};

export const ACCESS_LEVEL_OPTIONS: { value: AccessLevel; label: string; description: string }[] = [
  { value: 'none', label: 'Off', description: 'Child cannot edit' },
  { value: 'requires_approval', label: 'Approval', description: 'Changes need parent approval' },
  { value: 'auto_approved', label: 'Auto', description: 'Changes apply immediately' },
];
