// src/types/child/completestep/completeStepTypes.ts

import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export type ConfidenceLevel = "very_confident" | "fairly_confident" | "bit_unsure" | "need_help";

export type GamificationResult = {
  xpEarned: number;
  currentStreak: number;
  newBadge?: {
    id: string;
    name: string;
    icon: string;
  };
};

export type AudioNoteData = {
  blob: Blob | null;
  url: string | null;
  durationSeconds: number;
};

export type CompleteStepOverview = {
  subject_name: string;
  subject_icon?: string;
  subject_color?: string;
  topic_name: string;
  session_duration_minutes: number | null;
  step_key: string;
  step_index: number;
  total_steps: number;
  child_name?: string;
  child_id: string;
  revision_session_id: string;
};

export type CompletePayload = {
  gamification?: GamificationResult;
  postConfidence?: ConfidenceLevel;
  journalNote?: string;
  audioNoteUrl?: string;
  audioDurationSeconds?: number;
  completed_at?: string;
};

export type CompleteStepProps = {
  overview: CompleteStepOverview;
  payload: {
    complete?: CompletePayload;
  };
  saving: boolean;
  onPatch: (patch: Record<string, any>) => Promise<void>;
  onFinish: () => Promise<void>;
  onStartNextSession?: () => void;
  onUploadAudio?: (blob: Blob) => Promise<string>;
};

export interface ConfidenceOption {
  id: ConfidenceLevel;
  label: string;
  emoji: string;
  description: string;
  icon: IconDefinition;
  bgColor: string;
  selectedBg: string;
  selectedBorder: string;
}
