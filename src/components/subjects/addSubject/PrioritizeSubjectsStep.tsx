// src/components/subjects/addSubject/PrioritizeSubjectsStep.tsx
// Step component for prioritizing all subjects (existing + new)
// Allows users to reorder subjects to set revision priority

import AppIcon from "../../ui/AppIcon";

interface PrioritizedSubject {
  subject_id: string;
  subject_name: string;
  exam_board_name?: string;
  current_grade?: string | null;
  target_grade?: string | null;
  grade_gap?: number;
  is_new: boolean;
  icon?: string;
  color?: string;
}

interface PrioritizeSubjectsStepProps {
  prioritizedSubjects: PrioritizedSubject[];
  onMoveSubjectUp: (index: number) => void;
  onMoveSubjectDown: (index: number) => void;
}

export default function PrioritizeSubjectsStep({
  prioritizedSubjects,
  onMoveSubjectUp,
  onMoveSubjectDown,
}: PrioritizeSubjectsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-neutral-600 mb-4">
          Drag subjects to set their priority. Higher priority subjects
          will receive more revision sessions.
        </p>
        <p className="text-sm text-neutral-500 flex items-center">
          <AppIcon
            name="info"
            className="w-4 h-4 text-neutral-500 mr-2"
          />
          Subjects with larger grade gaps may benefit from higher priority.
        </p>
      </div>

      <div className="space-y-2">
        {prioritizedSubjects.map((subject, index) => (
          <div
            key={subject.subject_id}
            className={`flex items-center gap-3 p-4 rounded-xl border ${
              subject.is_new
                ? "bg-primary-50 border-primary-200"
                : "bg-white border-neutral-200"
            }`}
          >
            {/* Priority number */}
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600">
              {index + 1}
            </div>

            {/* Drag handle placeholder */}
            <AppIcon
              name="grip"
              className="w-4 h-4 text-neutral-400"
              aria-hidden={true}
            />

            {/* Subject info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-800">
                  {subject.subject_name}
                </span>
                {subject.is_new && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-600 text-white">
                    New
                  </span>
                )}
              </div>
              <div className="text-sm text-neutral-500">
                {subject.exam_board_name}
                {subject.grade_gap && subject.grade_gap > 0 && (
                  <span className="ml-2 text-amber-600">
                    • {subject.grade_gap} grade gap
                  </span>
                )}
              </div>
            </div>

            {/* Move buttons */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onMoveSubjectUp(index)}
                disabled={index === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Move up"
              >
                <AppIcon name="arrow-up" className="w-4 h-4 text-neutral-500" />
              </button>
              <button
                type="button"
                onClick={() => onMoveSubjectDown(index)}
                disabled={index === prioritizedSubjects.length - 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Move down"
              >
                <AppIcon
                  name="arrow-down"
                  className="w-4 h-4 text-neutral-500"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
