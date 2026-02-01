// src/types/child/practicestep/practiceStepTypes.ts

export type MarkSchemeItem = {
  code: string;
  criterion: string;
};

export type QuestionOption = {
  id: string;
  label: string;
};

export type PracticeQuestion = {
  id: string;
  questionType: "numeric" | "multiple_choice" | "short_text";
  text: string;
  marks: number;
  difficulty?: number; // 1=Easy, 2=Medium, 3=Hard
  options: QuestionOption[];
  correct_value: string | null;
  correct_option_id: string | null;
  explanation: string;
  mark_scheme: MarkSchemeItem[];
  common_mistakes: string[];
};

export type SelfAssessment = "got_it" | "not_quite" | "unsure" | null;

export type QuestionAnswer = {
  questionId: string;
  userAnswer: string;
  selfAssessment: SelfAssessment;
};

export type DifficultyLevel = "easy" | "medium" | "hard" | "all";

export type PracticeStepOverview = {
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

export type PracticePayload = {
  questions?: PracticeQuestion[];
  total_questions_available?: number;
  questions_attempted?: number;
  got_it_count?: number;
  not_quite_count?: number;
  unsure_count?: number;
  answers?: QuestionAnswer[];
  difficulty_selected?: DifficultyLevel;
  completed_at?: string;
};

export type PracticeStepProps = {
  overview: PracticeStepOverview;
  payload: Record<string, any>;
  saving: boolean;
  onPatch: (patch: Record<string, any>) => void;
  onNext: () => void;
  onBack: () => void;
  onExit: () => void;
};

export type QuestionCounts = {
  easy: number;
  medium: number;
  hard: number;
  all: number;
};
