import type { SubjectLegend as SubjectLegendType } from "../../services/timetableService";

interface SubjectLegendProps {
  subjects: SubjectLegendType[];
}

export function SubjectLegend({ subjects }: SubjectLegendProps) {
  if (subjects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h3 className="text-sm font-semibold mb-4 text-neutral-700">
        Subject Legend
      </h3>
      <div className="flex flex-wrap gap-6">
        {subjects.map((subject) => (
          <div key={subject.subject_id} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: subject.subject_color }}
            />
            <span className="text-sm text-neutral-600">
              {subject.subject_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
