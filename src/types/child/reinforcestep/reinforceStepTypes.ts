// src/types/child/reinforcestep/reinforceStepTypes.ts

export type TeachingSlide = {
  id: string;
  title: string;
  content: string;
  key_points: string[];
  examiner_tip: string;
  slide_number: number;
};

export type WorkedExampleStep = {
  step_id: string;
  content: string;
  marks: number;
};

export type WorkedExample = {
  id: string;
  title: string;
  question_context: string;
  steps: WorkedExampleStep[];
  final_answer: string;
  common_mistake: string;
};

export type ReinforceStepOverview = {
  subject_name: string;
  subject_icon: string | null;
  subject_color: string | null;
  topic_name: string;
  topic_id: string;
  session_duration_minutes: number;
  step_key: string;
  step_index: number;
  total_steps: number;
  child_name: string;
  child_id: string;
  revision_session_id: string;
};

export type ReinforcePayload = {
  slides?: TeachingSlide[];
  worked_examples?: WorkedExample[];
  slides_viewed?: number;
  examples_viewed?: number;
  completed_at?: string;
};

export type ReinforceStepProps = {
  overview: ReinforceStepOverview;
  payload: Record<string, any>;
  saving: boolean;
  onPatch: (patch: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
};
