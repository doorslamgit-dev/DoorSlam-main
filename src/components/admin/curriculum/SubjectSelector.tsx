// src/components/admin/curriculum/SubjectSelector.tsx
// Dropdown for selecting a subject to manage in the curriculum admin.

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SubjectOption } from '@/types/curriculumAdmin';

interface SubjectSelectorProps {
  subjects: SubjectOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export default function SubjectSelector({
  subjects,
  selectedId,
  onSelect,
  loading = false,
}: SubjectSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Subject
      </label>
      <Select
        value={selectedId ?? undefined}
        onValueChange={onSelect}
        disabled={loading || subjects.length === 0}
      >
        <SelectTrigger className="w-72">
          <SelectValue placeholder={loading ? 'Loading subjects...' : 'Select a subject'} />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
                {subject.exam_board_name} {subject.subject_name}
                {subject.spec_code && (
                  <span className="text-muted-foreground">({subject.spec_code})</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
