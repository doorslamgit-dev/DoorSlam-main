// src/components/subjects/addSubject/PrioritizeSubjectsStep.tsx
// Step component for prioritizing all subjects (existing + new)
// Allows users to reorder subjects via drag-and-drop to set revision priority

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AppIcon from "../../ui/AppIcon";

export interface PrioritizedSubject {
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
  onReorder: (subjects: PrioritizedSubject[]) => void;
}

/* ============================
   Sortable Card
============================ */

function SortableSubjectCard({
  subject,
  index,
}: {
  subject: PrioritizedSubject;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subject.subject_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
        isDragging
          ? "border-primary/50 shadow-lg ring-2 ring-ring/30 rotate-1 z-50"
          : subject.is_new
            ? "bg-primary/5 border-primary/20"
            : "bg-background border-border"
      }`}
    >
      {/* Priority number */}
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
        {index + 1}
      </div>

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <AppIcon name="grip-vertical" className="w-4 h-4" aria-hidden />
      </button>

      {/* Subject info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {subject.subject_name}
          </span>
          {subject.is_new && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex-shrink-0">
              New
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {subject.exam_board_name}
          {subject.grade_gap != null && subject.grade_gap > 0 && (
            <span className="ml-2 text-warning">
              • {subject.grade_gap} grade gap
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================
   Main Component
============================ */

export default function PrioritizeSubjectsStep({
  prioritizedSubjects,
  onReorder,
}: PrioritizeSubjectsStepProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = prioritizedSubjects.findIndex(
        (s) => s.subject_id === active.id
      );
      const newIndex = prioritizedSubjects.findIndex(
        (s) => s.subject_id === over.id
      );
      onReorder(arrayMove(prioritizedSubjects, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mb-4">
          Drag subjects to set their priority. Higher priority subjects will
          receive more revision sessions.
        </p>
        <p className="text-sm text-muted-foreground flex items-center">
          <AppIcon
            name="info"
            className="w-4 h-4 text-muted-foreground mr-2"
          />
          Subjects with larger grade gaps may benefit from higher priority.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={prioritizedSubjects.map((s) => s.subject_id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {prioritizedSubjects.map((subject, index) => (
              <SortableSubjectCard
                key={subject.subject_id}
                subject={subject}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
