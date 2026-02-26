// src/components/parentOnboarding/steps/SubjectPriorityGradesStep.tsx

import { useCallback } from "react";
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

/* ============================
   Types
============================ */

export interface SubjectWithGrades {
  subject_id: string;
  subject_name: string;
  exam_board_id?: string;
  exam_board_name: string;
  exam_type_id?: string;
  exam_type_name?: string;
  sort_order: number;
  current_grade: number | null;
  target_grade: number | null;
  grade_confidence: "confirmed" | "estimated" | "unknown";
}

interface SubjectPriorityGradesStepProps {
  subjects: SubjectWithGrades[];
  onSubjectsChange: (subjects: SubjectWithGrades[]) => void;
  onNext: () => void;
  onBack: () => void;
}

/* ============================
   Constants
============================ */

const GRADE_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Not sure" },
  { value: 9, label: "9" },
  { value: 8, label: "8" },
  { value: 7, label: "7" },
  { value: 6, label: "6" },
  { value: 5, label: "5" },
  { value: 4, label: "4" },
  { value: 3, label: "3" },
  { value: 2, label: "2" },
  { value: 1, label: "1" },
];

const TARGET_GRADE_OPTIONS = GRADE_OPTIONS.filter((g) => g.value !== null);

/* ============================
   Sortable Card Component
============================ */

interface SortableCardProps {
  subject: SubjectWithGrades;
  index: number;
  onGradeChange: (field: "current_grade" | "target_grade", value: number | null) => void;
}

function SortableCard({ subject, index, onGradeChange }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: subject.subject_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const gradeGap =
    subject.current_grade !== null && subject.target_grade !== null
      ? subject.target_grade - subject.current_grade
      : 0;

  const hasLargeGap = gradeGap >= 3;

  // Build subtitle: "GCSE · Mathematics · AQA"
  const subtitleParts = [
    subject.exam_type_name,
    subject.subject_name,
    subject.exam_board_name,
  ].filter(Boolean);
  const subtitle = subtitleParts.join(" · ");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-background border-2 rounded-xl p-5 transition-all ${
        isDragging
          ? "border-primary/50 shadow-lg ring-2 ring-ring/30 rotate-1 z-50"
          : "border-border hover:border-primary/50 hover:shadow-soft"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Priority Badge */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-gradient-button">
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">
                {subject.subject_name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            </div>

            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              type="button"
              className="cursor-grab touch-none p-2 text-muted-foreground hover:text-muted-foreground transition-colors flex-shrink-0"
              aria-label="Drag to reorder"
            >
              <AppIcon name="grip-vertical" className="w-4 h-4" aria-hidden />
            </button>
          </div>

          {/* Grade selectors */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Grade */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Current grade
              </label>
              <select
                value={subject.current_grade ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                  onGradeChange("current_grade", val);
                }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                {GRADE_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? ""}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Grade */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Target grade
              </label>
              <select
                value={subject.target_grade ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                  onGradeChange("target_grade", val);
                }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="">Select target</option>
                {TARGET_GRADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value ?? ""}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Large Gap Warning */}
          {hasLargeGap && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/30 p-3">
              <AppIcon
                name="triangle-alert"
                className="w-4 h-4 text-warning mt-0.5"
                aria-hidden
              />
              <div className="text-sm text-foreground">
                <strong>Ambitious target!</strong> A {gradeGap}-grade improvement will need
                significant focus. We'll allocate more sessions to this subject.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================
   Main Component
============================ */

export default function SubjectPriorityGradesStep({
  subjects,
  onSubjectsChange,
  onNext,
  onBack,
}: SubjectPriorityGradesStepProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // helps avoid accidental drags when using dropdowns
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = subjects.findIndex((s) => s.subject_id === active.id);
        const newIndex = subjects.findIndex((s) => s.subject_id === over.id);

        const reordered = arrayMove(subjects, oldIndex, newIndex).map((s, idx) => ({
          ...s,
          sort_order: idx + 1,
        }));

        onSubjectsChange(reordered);
      }
    },
    [subjects, onSubjectsChange]
  );

  const handleGradeChange = useCallback(
    (subjectId: string, field: "current_grade" | "target_grade", value: number | null) => {
      const updated = subjects.map((s) => {
        if (s.subject_id !== subjectId) return s;

        const newSubject: SubjectWithGrades = { ...s, [field]: value } as SubjectWithGrades;

        if (field === "current_grade") {
          newSubject.grade_confidence = value === null ? "unknown" : "confirmed";
        }

        return newSubject;
      });

      onSubjectsChange(updated);
    },
    [subjects, onSubjectsChange]
  );

  // Validation: all subjects must have target grade
  const isValid = subjects.every((s) => s.target_grade !== null);
  const incompleteCount = subjects.filter((s) => s.target_grade === null).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Prioritise subjects
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Tell us where the biggest gaps are so we can focus the plan.
        </p>
      </div>

      {/* Tip Box */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <AppIcon name="lightbulb" className="w-3 h-3 text-white" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1">
              How to prioritise
            </h3>
            <p className="text-xs text-primary leading-relaxed">
              Focus on subjects with the largest grade gaps or where your child needs the most
              support. Drag to reorder — highest priority at the top.
            </p>
          </div>
        </div>
      </div>

      {/* Sortable List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={subjects.map((s) => s.subject_id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4 mb-6">
            {subjects.map((subject, index) => (
              <SortableCard
                key={subject.subject_id}
                subject={subject}
                index={index}
                onGradeChange={(field, value) =>
                  handleGradeChange(subject.subject_id, field, value)
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Validation Message */}
      {!isValid && (
        <div className="rounded-xl bg-secondary border border-border p-4 mb-6">
          <div className="flex items-start gap-3">
            <AppIcon
              name="info"
              className="w-5 h-5 text-muted-foreground mt-0.5"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">
              Please set a target grade for{" "}
              {incompleteCount === 1
                ? "the remaining subject"
                : `all ${incompleteCount} remaining subjects`}
              .
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-full font-medium text-foreground bg-muted hover:bg-muted transition-all"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="px-8 py-3 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
