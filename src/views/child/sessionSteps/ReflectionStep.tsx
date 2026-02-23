// src/views/child/sessionSteps/ReflectionStep.tsx

import { useState } from "react";
import AppIcon from "../../../components/ui/AppIcon";
import type { IconKey } from "../../../components/ui/AppIcon";

type ReflectionStepProps = {
  overview: {
    subject_name: string;
    topic_name: string;
    session_duration_minutes: number | null;
    step_key: string;
    step_percent: number;
  };
  payload: Record<string, unknown>;
  saving: boolean;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
  onNext: () => Promise<void>;
  onBack: () => Promise<void>;
  onExit: () => void;
  onFinish: (params: { confidenceLevel: string; notes?: string }) => Promise<void>;
};

export default function ReflectionStep({
  overview,
  payload,
  saving,
  onBack,
  onFinish,
}: ReflectionStepProps) {
  const reflection = (payload?.reflection ?? {}) as Record<string, unknown>;

  const [confidenceLevel, setConfidenceLevel] = useState<string>(
    (reflection.confidenceLevel as string) ?? "on_track"
  );
  const [notes, setNotes] = useState<string>((reflection.notes as string) ?? "");

  const handleFinish = async () => {
    await onFinish({ confidenceLevel, notes });
  };

  const confidenceLevels: Array<{ value: string; label: string; icon: IconKey; color: string }> = [
    { value: "confident", label: "Confident", icon: "check-circle", color: "green" },
    { value: "on_track", label: "On Track", icon: "circle-check", color: "blue" },
    { value: "needs_practice", label: "Needs Practice", icon: "circle-help", color: "yellow" },
    { value: "struggling", label: "Struggling", icon: "alert-circle", color: "red" },
  ];

  return (
    <div className="bg-neutral-0 rounded-2xl border border-neutral-100 shadow-sm p-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${overview.step_percent}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-neutral-500">Step 4 of 4: Reflection</div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">{overview.subject_name}</h1>
        <p className="mt-2 text-lg text-neutral-600">{overview.topic_name}</p>
      </div>

      {/* Confidence Level */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          How confident do you feel about this topic?
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {confidenceLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setConfidenceLevel(level.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                confidenceLevel === level.value
                  ? `border-${level.color}-600 bg-${level.color}-50`
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <AppIcon name={level.icon} className="w-6 h-6 flex-shrink-0" aria-hidden />
                <span className="font-semibold text-neutral-900">{level.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">
          Any notes or questions? (Optional)
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What went well? What was challenging? Any questions you still have?"
          className="w-full h-32 p-4 border-2 border-neutral-200 rounded-xl resize-none focus:outline-none focus:border-primary-600"
        />
      </div>

      {/* Finish */}
      <button
        type="button"
        onClick={handleFinish}
        disabled={saving}
        className="w-full px-8 py-4 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-semibold text-lg disabled:opacity-50 mb-6"
      >
        {saving ? "Finishing..." : "Complete Session"}
      </button>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium"
        >
          Back
        </button>
      </div>
    </div>
  );
}
