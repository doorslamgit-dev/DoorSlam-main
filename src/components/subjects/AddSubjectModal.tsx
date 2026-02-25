// src/components/subjects/AddSubjectModal.tsx
// FEAT-012: Enhanced modal with re-prioritization and impact assessment
// Modal for adding subjects to an existing child

import { useState, useEffect, useMemo, useCallback } from "react";
import Alert from "../ui/Alert";
import AppIcon from "../ui/AppIcon";

import {
  addSubjectsToChild,
  getImpactAssessment,
  type SubjectToAdd,
  type PathwaySelection,
  type SubjectPriority,
  type ImpactAssessment,
} from "../../services/addSubjectService";

// Import existing step components
import ExamTypeStep from "../parentOnboarding/steps/ExamTypeStep";
import SubjectBoardStep, {
  type SelectedSubject,
} from "../parentOnboarding/steps/SubjectBoardStep";
import PathwaySelectionStep, {
  type PathwaySelectionData,
} from "../parentOnboarding/steps/PathwaySelectionStep";
import SubjectPriorityGradesStep, {
  type SubjectWithGrades,
} from "../parentOnboarding/steps/SubjectPriorityGradesStep";

// Import add subject step components
import PrioritizeSubjectsStep from "./addSubject/PrioritizeSubjectsStep";
import ImpactAssessmentStep from "./addSubject/ImpactAssessmentStep";
import ConfirmationStep from "./addSubject/ConfirmationStep";

interface AddSubjectModalProps {
  childId: string;
  childName: string;
  existingSubjectIds: string[];
  existingSubjects: Array<{
    subject_id: string;
    subject_name: string;
    exam_board_name?: string;
    current_grade?: string;
    target_grade?: string;
    icon?: string;
    color?: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Steps for the Add Subject flow
const STEPS = {
  EXAM_TYPE: 0,
  SUBJECTS: 1,
  PATHWAYS: 2,
  GRADES: 3,
  PRIORITIZE: 4,
  IMPACT: 5,
  CONFIRM: 6,
} as const;

const STEP_TITLES: Record<number, string> = {
  [STEPS.EXAM_TYPE]: "Choose exam type",
  [STEPS.SUBJECTS]: "Select subjects",
  [STEPS.PATHWAYS]: "Subject options",
  [STEPS.GRADES]: "Set target grades",
  [STEPS.PRIORITIZE]: "Prioritize subjects",
  [STEPS.IMPACT]: "Plan impact",
  [STEPS.CONFIRM]: "Confirm & add",
};

// Subject item for prioritization
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

export default function AddSubjectModal({
  childId,
  childName,
  existingSubjectIds,
  existingSubjects,
  isOpen,
  onClose,
  onSuccess,
}: AddSubjectModalProps) {
  // Step state
  const [step, setStep] = useState<number>(STEPS.EXAM_TYPE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [selectedExamTypeIds, setSelectedExamTypeIds] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubject[]>(
    []
  );
  const [pathwaySelections, setPathwaySelections] = useState<
    PathwaySelectionData[]
  >([]);
  const [subjectsWithGrades, setSubjectsWithGrades] = useState<
    SubjectWithGrades[]
  >([]);

  // FEAT-012: New state for prioritization and impact
  const [prioritizedSubjects, setPrioritizedSubjects] = useState<
    PrioritizedSubject[]
  >([]);
  const [impactAssessment, setImpactAssessment] =
    useState<ImpactAssessment | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(STEPS.EXAM_TYPE);
      setSelectedExamTypeIds([]);
      setSelectedSubjects([]);
      setPathwaySelections([]);
      setSubjectsWithGrades([]);
      setPrioritizedSubjects([]);
      setImpactAssessment(null);
      setError(null);
    }
  }, [isOpen]);

  // Convert selected subjects to grades format when entering grades step
  useEffect(() => {
    if (
      step === STEPS.GRADES &&
      selectedSubjects.length > 0 &&
      subjectsWithGrades.length === 0
    ) {
      const converted: SubjectWithGrades[] = selectedSubjects.map((s, index) => ({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        exam_board_name: s.exam_board_name,
        sort_order: index + 1,
        current_grade: null,
        target_grade: null,
        grade_confidence: "estimated" as const,
      }));
      setSubjectsWithGrades(converted);
    }
  }, [step, selectedSubjects, subjectsWithGrades.length]);

  // Build prioritized subjects list when entering prioritize step
  useEffect(() => {
    if (step === STEPS.PRIORITIZE && prioritizedSubjects.length === 0) {
      // Combine existing subjects with new subjects
      const existing: PrioritizedSubject[] = existingSubjects.map((s) => ({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        exam_board_name: s.exam_board_name,
        current_grade: s.current_grade ? String(s.current_grade) : null,
        target_grade: s.target_grade ? String(s.target_grade) : null,
        grade_gap:
          s.target_grade && s.current_grade
            ? (typeof s.target_grade === "number"
                ? s.target_grade
                : parseInt(String(s.target_grade), 10)) -
              (typeof s.current_grade === "number"
                ? s.current_grade
                : parseInt(String(s.current_grade), 10))
            : 2,
        is_new: false,
        icon: s.icon,
        color: s.color,
      }));

      const newOnes: PrioritizedSubject[] = subjectsWithGrades.map((s) => ({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        exam_board_name: s.exam_board_name,
        current_grade: s.current_grade !== null ? String(s.current_grade) : null,
        target_grade: s.target_grade !== null ? String(s.target_grade) : null,
        grade_gap:
          s.target_grade && s.current_grade ? s.target_grade - s.current_grade : 2,
        is_new: true,
      }));

      // New subjects go at the end by default
      setPrioritizedSubjects([...existing, ...newOnes]);
    }
  }, [step, existingSubjects, subjectsWithGrades, prioritizedSubjects.length]);

  // Load impact assessment when entering impact step
  useEffect(() => {
    if (step === STEPS.IMPACT && !impactAssessment) {
      void loadImpactAssessment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const loadImpactAssessment = async () => {
    setLoadingImpact(true);
    setError(null);

    const newSubjectIds = subjectsWithGrades.map((s) => s.subject_id);
    const { data, error: fetchError } = await getImpactAssessment(
      childId,
      newSubjectIds
    );

    if (fetchError) {
      setError(fetchError);
    } else {
      setImpactAssessment(data);
    }

    setLoadingImpact(false);
  };

  // Check if any selected subjects require pathways
  const subjectsRequiringPathways = useMemo(() => {
    return [];
  }, []);

  const hasPathwayStep = subjectsRequiringPathways.length > 0;

  // Subject IDs for pathway step
  const subjectIdsForPathways = useMemo(() => {
    return selectedSubjects.map((s) => s.subject_id);
  }, [selectedSubjects]);

  // Navigation validation
  const canNext = useMemo(() => {
    switch (step) {
      case STEPS.EXAM_TYPE:
        return selectedExamTypeIds.length > 0;
      case STEPS.SUBJECTS:
        return selectedSubjects.length > 0;
      case STEPS.PATHWAYS:
        return true;
      case STEPS.GRADES:
        return (
          subjectsWithGrades.length > 0 &&
          subjectsWithGrades.every((s) => s.target_grade !== null)
        );
      case STEPS.PRIORITIZE:
        return prioritizedSubjects.length > 0;
      case STEPS.IMPACT:
        return impactAssessment !== null;
      default:
        return true;
    }
  }, [
    step,
    selectedExamTypeIds,
    selectedSubjects,
    subjectsWithGrades,
    prioritizedSubjects,
    impactAssessment,
  ]);

  // Handle navigation
  const handleNext = useCallback(() => {
    setError(null);

    if (step === STEPS.EXAM_TYPE) {
      setStep(STEPS.SUBJECTS);
    } else if (step === STEPS.SUBJECTS) {
      if (hasPathwayStep) {
        setStep(STEPS.PATHWAYS);
      } else {
        setSubjectsWithGrades([]);
        setStep(STEPS.GRADES);
      }
    } else if (step === STEPS.PATHWAYS) {
      setSubjectsWithGrades([]);
      setStep(STEPS.GRADES);
    } else if (step === STEPS.GRADES) {
      setPrioritizedSubjects([]);
      setStep(STEPS.PRIORITIZE);
    } else if (step === STEPS.PRIORITIZE) {
      setImpactAssessment(null);
      setStep(STEPS.IMPACT);
    } else if (step === STEPS.IMPACT) {
      setStep(STEPS.CONFIRM);
    }
  }, [step, hasPathwayStep]);

  const handleBack = useCallback(() => {
    setError(null);

    if (step === STEPS.SUBJECTS) {
      setStep(STEPS.EXAM_TYPE);
    } else if (step === STEPS.PATHWAYS) {
      setStep(STEPS.SUBJECTS);
    } else if (step === STEPS.GRADES) {
      if (hasPathwayStep) {
        setStep(STEPS.PATHWAYS);
      } else {
        setStep(STEPS.SUBJECTS);
      }
    } else if (step === STEPS.PRIORITIZE) {
      setStep(STEPS.GRADES);
    } else if (step === STEPS.IMPACT) {
      setStep(STEPS.PRIORITIZE);
    } else if (step === STEPS.CONFIRM) {
      setStep(STEPS.IMPACT);
    }
  }, [step, hasPathwayStep]);

  // Move subject up in priority
  const moveSubjectUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...prioritizedSubjects];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    setPrioritizedSubjects(newOrder);
  };

  // Move subject down in priority
  const moveSubjectDown = (index: number) => {
    if (index === prioritizedSubjects.length - 1) return;
    const newOrder = [...prioritizedSubjects];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    setPrioritizedSubjects(newOrder);
  };

  // Submit handler
  const handleSubmit = async () => {
    setBusy(true);
    setError(null);

    try {
      const subjects: SubjectToAdd[] = subjectsWithGrades.map((s) => ({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        exam_board_name: s.exam_board_name,
        current_grade: s.current_grade !== null ? String(s.current_grade) : null,
        target_grade: s.target_grade !== null ? String(s.target_grade) : null,
        grade_confidence:
          s.grade_confidence === "unknown" ? "estimated" : s.grade_confidence,
      }));

      const pathways: PathwaySelection[] = pathwaySelections
        .filter((p) => p.pathway_id && p.pathway_id !== "skipped")
        .map((p) => ({
          subject_id: p.subject_id,
          pathway_id: p.pathway_id,
        }));

      // FEAT-012: Include priorities for ALL subjects
      const priorities: SubjectPriority[] = prioritizedSubjects.map((s, idx) => ({
        subject_id: s.subject_id,
        sort_order: idx + 1,
      }));

      const result = await addSubjectsToChild(
        childId,
        subjects,
        pathways,
        priorities
      );

      if (!result.success) {
        setError(result.error || "Failed to add subjects");
        setBusy(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "An unexpected error occurred"));
    } finally {
      setBusy(false);
    }
  };

  // Calculate progress - now with more steps
  const totalSteps = hasPathwayStep ? 7 : 6;
  const getDisplayStep = () => {
    if (!hasPathwayStep && step >= STEPS.PATHWAYS) {
      return step; // Pathways step is skipped, so adjust
    }
    return step + 1;
  };
  const currentStepDisplay = getDisplayStep();
  const progressPercent = Math.round((currentStepDisplay / totalSteps) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-background rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              {STEP_TITLES[step] || "Add subjects"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <AppIcon name="x" className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-foreground">
                Step {currentStepDisplay} of {totalSteps}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <Alert variant="error" title="Something went wrong" className="mx-8 mt-6 flex-shrink-0">
            {error}
          </Alert>
        )}

        {/* Content */}
        <div className="px-8 py-6 flex-1 overflow-y-auto">
          {/* Step 0: Exam Type Selection */}
          {step === STEPS.EXAM_TYPE && (
            <ExamTypeStep
              value={selectedExamTypeIds}
              onChange={(ids) => {
                setSelectedExamTypeIds(Array.isArray(ids) ? ids : [ids]);
                setSelectedSubjects([]);
                setPathwaySelections([]);
                setSubjectsWithGrades([]);
              }}
            />
          )}

          {/* Step 1: Subject Selection */}
          {step === STEPS.SUBJECTS && (
            <SubjectBoardStep
              examTypeIds={selectedExamTypeIds}
              value={selectedSubjects}
              onChange={(newSubjects) => {
                const filtered = newSubjects.filter(
                  (s) => !existingSubjectIds.includes(s.subject_id)
                );
                setSelectedSubjects(filtered);
                setPathwaySelections([]);
              }}
              onBackToExamTypes={() => setStep(STEPS.EXAM_TYPE)}
              onDone={handleNext}
            />
          )}

          {/* Step 2: Pathway Selection (if needed) */}
          {step === STEPS.PATHWAYS && (
            <PathwaySelectionStep
              subjectIds={subjectIdsForPathways}
              value={pathwaySelections}
              onChange={setPathwaySelections}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {/* Step 3: Grades */}
          {step === STEPS.GRADES && (
            <SubjectPriorityGradesStep
              subjects={subjectsWithGrades}
              onSubjectsChange={setSubjectsWithGrades}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {/* Step 4: Prioritize ALL Subjects */}
          {step === STEPS.PRIORITIZE && (
            <PrioritizeSubjectsStep
              prioritizedSubjects={prioritizedSubjects}
              onMoveSubjectUp={moveSubjectUp}
              onMoveSubjectDown={moveSubjectDown}
            />
          )}

          {/* Step 5: Impact Assessment */}
          {step === STEPS.IMPACT && (
            <ImpactAssessmentStep
              impactAssessment={impactAssessment}
              loadingImpact={loadingImpact}
            />
          )}

          {/* Step 6: Confirm */}
          {step === STEPS.CONFIRM && (
            <ConfirmationStep
              subjectsWithGrades={subjectsWithGrades}
              childName={childName}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-muted border-t border-border flex items-center justify-between flex-shrink-0">
          {/* Back button */}
          {step > STEPS.EXAM_TYPE &&
          step !== STEPS.SUBJECTS &&
          step !== STEPS.PATHWAYS &&
          step !== STEPS.GRADES ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={busy}
              className="px-6 py-3 rounded-full font-medium text-foreground bg-muted hover:bg-muted transition-colors disabled:opacity-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {/* Continue/Submit button */}
          {step === STEPS.EXAM_TYPE && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext || busy}
              className="px-8 py-3 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          )}

          {step === STEPS.PRIORITIZE && (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={busy}
                className="px-6 py-3 rounded-full font-medium text-foreground bg-muted hover:bg-muted transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext || busy}
                className="px-8 py-3 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                See Impact
              </button>
            </>
          )}

          {step === STEPS.IMPACT && (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={busy}
                className="px-6 py-3 rounded-full font-medium text-foreground bg-muted hover:bg-muted transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext || busy || loadingImpact}
                className="px-8 py-3 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </>
          )}

          {step === STEPS.CONFIRM && (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={busy}
                className="px-6 py-3 rounded-full font-medium text-foreground bg-muted hover:bg-muted transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy}
                className="px-8 py-3 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {busy ? (
                  <>
                    <AppIcon name="loader" className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <AppIcon name="plus" className="w-4 h-4" />
                    Add & Redistribute
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
