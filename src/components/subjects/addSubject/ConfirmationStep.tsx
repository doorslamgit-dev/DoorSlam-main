// src/components/subjects/addSubject/ConfirmationStep.tsx
// Step component for confirming the addition of new subjects
// Shows a summary of subjects to be added with their target grades

import AppIcon from "../../ui/AppIcon";
import { type SubjectWithGrades } from "../../parentOnboarding/steps/SubjectPriorityGradesStep";

interface ConfirmationStepProps {
  subjectsWithGrades: SubjectWithGrades[];
  childName: string;
}

export default function ConfirmationStep({
  subjectsWithGrades,
  childName,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-neutral-600">
        You're about to add {subjectsWithGrades.length} subject
        {subjectsWithGrades.length !== 1 ? "s" : ""} to {childName}'s
        revision plan.
      </p>

      <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
        {subjectsWithGrades.map((subject) => (
          <div
            key={subject.subject_id}
            className="flex items-center justify-between bg-white rounded-lg p-3 border border-neutral-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <AppIcon name="book" className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-800">
                  {subject.subject_name}
                </p>
                <p className="text-sm text-neutral-500">
                  {subject.exam_board_name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-500">Target:</span>
                <span className="font-semibold text-primary-600">
                  Grade {subject.target_grade}
                </span>
              </div>
              {subject.current_grade && (
                <p className="text-xs text-neutral-400">
                  Current: Grade {subject.current_grade}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>What happens next:</strong> Sessions will be automatically
          redistributed across all subjects based on your priority order.{" "}
          {childName} will see the updated schedule right away.
        </p>
      </div>
    </div>
  );
}
