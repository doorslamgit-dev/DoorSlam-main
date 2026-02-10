// src/types/child/summarystep/summaryStepTypes.ts

export type KeyTakeaway = {
  id: string;
  title: string;
  description: string;
};

export type TeachingSlide = {
  id: string;
  title: string;
  content: string;
  key_points?: string[];
  examiner_tip?: string;
  slide_number?: number;
};

export type MnemonicStyle = "hip-hop" | "pop" | "rock";

export type MnemonicData = {
  mnemonicId: string | null;
  style: MnemonicStyle;
  styleReference: string;
  lyrics: string;
  audioUrl: string | null;
  durationSeconds: number | null;
  status: "pending" | "generating" | "ready" | "failed";
};

export type SummaryStepOverview = {
  subject_name: string;
  subject_icon?: string;
  subject_color?: string;
  topic_name: string;
  topic_id?: string;
  session_duration_minutes: number | null;
  step_key: string;
  step_index: number;
  total_steps: number;
  child_id: string;
  revision_session_id: string;
};

export type SummaryPayload = {
  keyTakeaways?: KeyTakeaway[];
  mnemonic?: MnemonicData;
  selectedStyle?: MnemonicStyle;
  completed_at?: string;
};

export type SummaryStepProps = {
  overview: SummaryStepOverview;
  payload: {
    reinforce?: {
      slides?: TeachingSlide[];
    };
    summary?: SummaryPayload;
  };
  saving: boolean;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
  onNext: () => Promise<void>;
  onBack: () => void;
  onExit: () => void;
  onRequestMnemonic?: (style: MnemonicStyle) => Promise<MnemonicData>;
};
