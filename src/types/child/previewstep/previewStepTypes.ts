// src/types/child/previewstep/previewStepTypes.ts

export type ConfidenceLevel = "very_confident" | "fairly_confident" | "bit_unsure" | "need_help";

export interface PreviewStepOverview {
  subject_name: string;
  subject_icon?: string;
  subject_color?: string;
  topic_name: string;
  session_duration_minutes: number | null;
  step_key: string;
  step_index: number;
  total_steps: number;
}

export interface PreviewPayload {
  preConfidence?: ConfidenceLevel;
  socialMediaOff?: boolean;
  started_at?: string;
}

export interface PreviewStepProps {
  overview: PreviewStepOverview;
  payload: {
    preview?: PreviewPayload;
  };
  saving: boolean;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
  onNext: () => Promise<void>;
  onExit: () => void;
}

export interface ConfidenceOption {
  id: ConfidenceLevel;
  label: string;
  description: string;
  icon: string;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
  selectedBorder: string;
}

export interface PreviewStepState {
  preConfidence: ConfidenceLevel | null;
  socialMediaOff: boolean;
}
