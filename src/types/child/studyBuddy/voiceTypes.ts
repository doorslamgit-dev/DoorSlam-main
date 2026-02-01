// src/types/child/studyBuddy/voiceTypes.ts
// FEAT-011 Phase 3: Voice input types

// =============================================================================
// Quota Types
// =============================================================================

export interface VoiceQuotaLimits {
  max_session_minutes: number;
  max_session_interactions: number;
  max_daily_minutes: number;
}

export interface VoiceQuotaUsage {
  session_minutes_used: number;
  session_interactions_used: number;
  daily_minutes_used: number;
  daily_interactions_used: number;
}

export interface VoiceQuotaRemaining {
  session_minutes: number;
  session_interactions: number;
  daily_minutes: number;
}

export interface VoiceQuotaStatus {
  success: boolean;
  voice_enabled: boolean;
  tier_code: string;
  limits: VoiceQuotaLimits;
  usage: VoiceQuotaUsage;
  remaining: VoiceQuotaRemaining;
  can_use_voice: boolean;
  error?: string;
}

// =============================================================================
// Transcription Types
// =============================================================================

export interface TranscriptionQuota {
  session_minutes_remaining: number;
  daily_minutes_remaining: number;
  session_interactions_remaining: number;
  can_continue: boolean;
}

export interface TranscriptionSuccessResult {
  success: true;
  transcript: string;
  duration_seconds: number;
  quota: TranscriptionQuota;
}

export interface TranscriptionErrorResult {
  success: false;
  error: string;
  message?: string;
  quota?: TranscriptionQuota;
}

export type TranscriptionResult = TranscriptionSuccessResult | TranscriptionErrorResult;

// =============================================================================
// Voice Message Types
// =============================================================================

export interface VoiceMessageRequest {
  revision_session_id: string;
  audio_blob: Blob;
  duration_seconds: number;
  child_id: string;
  step_context?: {
    step_key: string;
    content_type: string;
    content_unit_id: string;
    content_preview: string;
  };
}

// =============================================================================
// Recording Types (shared with VoiceRecorder component)
// =============================================================================

export interface RecordingData {
  blob: Blob;
  url: string;
  durationSeconds: number;
  mimeType: string;
}

// =============================================================================
// Error Codes
// =============================================================================

export type VoiceErrorCode =
  | "voice_not_enabled"
  | "voice_quota_exceeded"
  | "empty_transcript"
  | "transcription_failed"
  | "not_authenticated"
  | "not_authorized"
  | "invalid_audio";

export function isVoiceQuotaError(error: string): boolean {
  return error === "voice_quota_exceeded" || error === "voice_not_enabled";
}

export function isEmptyTranscriptError(error: string): boolean {
  return error === "empty_transcript";
}