import type { SubjectLegend as SubjectLegendType } from "../../services/timetableService";
import { getSubjectColor } from "../../constants/colors";

interface SubjectLegendProps {
  subjects: SubjectLegendType[];
}

export function SubjectLegend({ subjects }: SubjectLegendProps) {
  if (subjects.length === 0) {
    return null;
  }

  return (
    <div className="bg-background rounded-2xl shadow-soft p-6">
      <h3 className="text-sm font-semibold mb-4 text-foreground">
        Subject Legend
      </h3>
      <div className="flex flex-wrap gap-6">
        {subjects.map((subject) => (
          <div key={subject.subject_id} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getSubjectColor(subject.subject_name) }}
            />
            <span className="text-sm text-muted-foreground">
              {subject.subject_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
