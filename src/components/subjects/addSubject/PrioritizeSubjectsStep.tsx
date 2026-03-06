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
}

export default function PrioritizeSubjectsStep({
  prioritizedSubjects,
}: PrioritizeSubjectsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mb-4">
          Drag subjects to set their priority. Higher priority subjects
          will receive more revision sessions.
        </p>
        <p className="text-sm text-muted-foreground flex items-center">
          <AppIcon
            name="info"
            className="w-4 h-4 text-muted-foreground mr-2"
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
                ? "bg-primary/5 border-primary/20"
                : "bg-background border-border"
            }`}
          >
            {/* Priority number */}
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground">
              {index + 1}
            </div>

            {/* Drag handle placeholder */}
            <AppIcon
              name="grip"
              className="w-4 h-4 text-muted-foreground"
              aria-hidden={true}
            />

            {/* Subject info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {subject.subject_name}
                </span>
                {subject.is_new && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    New
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {subject.exam_board_name}
                {subject.grade_gap && subject.grade_gap > 0 && (
                  <span className="ml-2 text-warning">
                    • {subject.grade_gap} grade gap
                  </span>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
