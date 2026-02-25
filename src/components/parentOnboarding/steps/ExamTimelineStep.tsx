// src/components/parentOnboarding/steps/ExamTimelineStep.tsx

import { useState } from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

/* ============================
   Types
============================ */

export type ExamTimeline = {
  exam_date: string | null;
  feeling_code:
    | "feeling_on_track"
    | "feeling_behind"
    | "feeling_overwhelmed"
    | "feeling_crisis"
    | null;
  history_code:
    | "history_good"
    | "history_mixed"
    | "history_struggled"
    | "history_first"
    | null;
};

type Props = {
  childName?: string;
  value: ExamTimeline;
  onChange: (next: ExamTimeline) => void;
};

type Step = "when" | "feeling" | "history";

/* ============================
   Constants
============================ */

const FEELING_OPTIONS: Array<{
  code: ExamTimeline["feeling_code"] & string;
  label: string;
  description: string;
  icon: IconKey;
}> = [
  {
    code: "feeling_on_track",
    label: "We're on track",
    description: "Revision is going well, we want to stay organised",
    icon: "check-circle",
  },
  {
    code: "feeling_behind",
    label: "A bit behind",
    description: "We've started but need to catch up",
    icon: "clock",
  },
  {
    code: "feeling_overwhelmed",
    label: "Not sure where to start",
    description: "It feels overwhelming and we need a clear plan",
    icon: "triangle-alert",
  },
  {
    code: "feeling_crisis",
    label: "In crisis mode",
    description: "Exams are soon and we're really behind",
    icon: "alert-circle",
  },
];

const HISTORY_OPTIONS: Array<{
  code: ExamTimeline["history_code"] & string;
  label: string;
  description: string;
  icon: IconKey;
}> = [
  {
    code: "history_good",
    label: "Really well",
    description: "Previous revision went smoothly",
    icon: "star",
  },
  {
    code: "history_mixed",
    label: "OK but could be better",
    description: "Some things worked, others didn't",
    icon: "circle-help",
  },
  {
    code: "history_struggled",
    label: "It was a struggle",
    description: "We found it difficult last time",
    icon: "alert-circle",
  },
  {
    code: "history_first",
    label: "This is our first time",
    description: "No previous revision experience",
    icon: "plus-circle",
  },
];

function getExamDate(period: "may" | "january" | "next_year"): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  switch (period) {
    case "may":
      // If we're past May, use next year
      if (month >= 5) return `${year + 1}-05-15`;
      return `${year}-05-15`;
    case "january":
      // If we're past January, use next year
      if (month >= 1) return `${year + 1}-01-15`;
      return `${year}-01-15`;
    case "next_year":
      return `${year + 1}-05-15`;
    default:
      return `${year}-05-15`;
  }
}

const FUZZY_DATE_OPTIONS: Array<{ label: string; value: string | "custom" | null }> = [
  { label: "This May/June", value: getExamDate("may") },
  { label: "January mocks", value: getExamDate("january") },
  { label: "Next academic year", value: getExamDate("next_year") },
  { label: "I'll set a specific date", value: "custom" },
  { label: "I'm not sure yet", value: null },
];

/* ============================
   Sub-components
============================ */

function WhenScreen(props: {
  childName: string;
  value: string | null;
  onChange: (date: string | null) => void;
  onNext: () => void;
}) {
  const { childName, value, onChange, onNext } = props;
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          When are {childName}&apos;s exams?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Don&apos;t worry if you&apos;re not sure – you can adjust this later.
        </p>
      </div>

      <div className="space-y-3">
        {FUZZY_DATE_OPTIONS.map((option) => {
          const isSelected =
            option.value === "custom" ? showDatePicker : value === option.value;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                if (option.value === "custom") {
                  setShowDatePicker(true);
                } else {
                  setShowDatePicker(false);
                  onChange(option.value);
                  if (option.value !== null) {
                    setTimeout(onNext, 150);
                  }
                }
              }}
              className={`w-full rounded-2xl border px-5 py-4 text-left transition-colors ${
                isSelected
                  ? "border-primary/20 bg-primary/5"
                  : "border-border hover:border-input bg-background"
              }`}
            >
              <p className="font-medium text-foreground">{option.label}</p>
              {option.value && option.value !== "custom" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  We&apos;ll use{" "}
                  <span className="font-medium text-foreground">{option.value}</span>{" "}
                  as a placeholder date.
                </p>
              )}
            </button>
          );
        })}
      </div>

      {showDatePicker && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <label className="text-sm font-medium text-foreground">Select a date</label>
          <input
            type="date"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />

          {value && (
            <button
              type="button"
              onClick={onNext}
              className="mt-4 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      )}

      {value === null && !showDatePicker && (
        <button
          type="button"
          onClick={onNext}
          className="mt-2 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Continue without a date
        </button>
      )}
    </div>
  );
}

function FeelingScreen(props: {
  childName: string;
  value: ExamTimeline["feeling_code"];
  onChange: (code: ExamTimeline["feeling_code"]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { childName, value, onChange, onNext, onBack } = props;

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <AppIcon name="arrow-left" className="w-4 h-4" aria-hidden />
          Back
        </button>

        <h2 className="text-xl font-semibold text-foreground">
          How are things feeling right now?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Be honest – this helps us set a pace that feels doable for {childName}.
        </p>
      </div>

      <div className="space-y-3">
        {FEELING_OPTIONS.map((option) => {
          const isSelected = value === option.code;

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                onChange(option.code);
                setTimeout(onNext, 150);
              }}
              className={`w-full rounded-2xl border px-5 py-4 text-left transition-colors ${
                isSelected
                  ? "border-primary/20 bg-primary/5"
                  : "border-border hover:border-input bg-background"
              }`}
            >
              <div className="flex items-center gap-3">
                <AppIcon name={option.icon} className="w-6 h-6 flex-shrink-0" aria-hidden />
                <div>
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HistoryScreen(props: {
  value: ExamTimeline["history_code"];
  onChange: (code: ExamTimeline["history_code"]) => void;
  onBack: () => void;
}) {
  const { value, onChange, onBack } = props;

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <AppIcon name="arrow-left" className="w-4 h-4" aria-hidden />
          Back
        </button>

        <h2 className="text-xl font-semibold text-foreground">
          How did revision go last time?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          This helps us understand what might work better this time.
        </p>
      </div>

      <div className="space-y-3">
        {HISTORY_OPTIONS.map((option) => {
          const isSelected = value === option.code;

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => onChange(option.code)}
              className={`w-full rounded-2xl border px-5 py-4 text-left transition-colors ${
                isSelected
                  ? "border-primary/20 bg-primary/5"
                  : "border-border hover:border-input bg-background"
              }`}
            >
              <div className="flex items-center gap-3">
                <AppIcon name={option.icon} className="w-6 h-6 flex-shrink-0" aria-hidden />
                <div>
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange(null)}
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Skip this – we&apos;ll figure it out as we go
      </button>
    </div>
  );
}

/* ============================
   Main Component
============================ */

export default function ExamTimelineStep({
  childName = "your child",
  value,
  onChange,
}: Props) {
  const [step, setStep] = useState<Step>("when");

  function updateField<K extends keyof ExamTimeline>(
    field: K,
    fieldValue: ExamTimeline[K]
  ) {
    onChange({ ...value, [field]: fieldValue });
  }

  if (step === "when") {
    return (
      <WhenScreen
        childName={childName}
        value={value.exam_date}
        onChange={(date) => updateField("exam_date", date)}
        onNext={() => setStep("feeling")}
      />
    );
  }

  if (step === "feeling") {
    return (
      <FeelingScreen
        childName={childName}
        value={value.feeling_code}
        onChange={(code) => updateField("feeling_code", code)}
        onNext={() => setStep("history")}
        onBack={() => setStep("when")}
      />
    );
  }

  return (
    <HistoryScreen
      value={value.history_code}
      onChange={(code) => updateField("history_code", code)}
      onBack={() => setStep("feeling")}
    />
  );
}
