// src/components/subjects/AddSubjectModal.tsx
// FEAT-012: Enhanced modal with re-prioritization and impact assessment
// Modal for adding subjects to an existing child

import { useState, useEffect, useMemo, useCallback } from "react";
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
  }, [selectedSubjects]);

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
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
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

  // Get recommendation color
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "on_track":
        return "text-green-700 bg-green-50 border-green-200";
      case "tight_but_ok":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "add_sessions":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "prioritize":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-neutral-700 bg-neutral-50 border-neutral-200";
    }
  };

  const getRecommendationIconName = (rec: string) => {
    switch (rec) {
      case "on_track":
        return "check-circle" as const;
      case "tight_but_ok":
        return "info" as const;
      case "add_sessions":
      case "prioritize":
        return "triangle-alert" as const;
      default:
        return "info" as const;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-neutral-800">
              {STEP_TITLES[step] || "Add subjects"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <AppIcon name="x" className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-neutral-700">
                Step {currentStepDisplay} of {totalSteps}
              </span>
              <span className="text-xs font-medium text-neutral-500">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mx-8 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex-shrink-0">
            <p className="text-sm font-medium text-red-800">
              Something went wrong
            </p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
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
                        onClick={() => moveSubjectUp(index)}
                        disabled={index === 0}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Move up"
                      >
                        <AppIcon name="arrow-up" className="w-4 h-4 text-neutral-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSubjectDown(index)}
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
          )}

          {/* Step 5: Impact Assessment */}
          {step === STEPS.IMPACT && (
            <div className="space-y-6">
              {loadingImpact ? (
                <div className="flex items-center justify-center py-12">
                  <AppIcon
                    name="loader"
                    className="w-6 h-6 text-primary-600 animate-spin"
                  />
                </div>
              ) : impactAssessment ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-neutral-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-neutral-800">
                        {impactAssessment.current_weekly_sessions}
                      </div>
                      <div className="text-sm text-neutral-500">
                        Sessions/week
                      </div>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-neutral-800">
                        {impactAssessment.total_topics}
                      </div>
                      <div className="text-sm text-neutral-500">Total topics</div>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-neutral-800">
                        {impactAssessment.coverage_percent}%
                      </div>
                      <div className="text-sm text-neutral-500">Coverage</div>
                    </div>
                  </div>

                  {/* Topic Breakdown */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="font-medium text-neutral-800 mb-3 flex items-center gap-2">
                      <AppIcon
                        name="chart-line"
                        className="w-4 h-4 text-primary-600"
                      />
                      Topic Breakdown
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Existing subjects</span>
                        <span className="font-medium">
                          {impactAssessment.existing_topic_count} topics
                        </span>
                      </div>
                      <div className="flex justify-between text-primary-600">
                        <span>New subjects</span>
                        <span className="font-medium">
                          +{impactAssessment.new_topic_count} topics
                        </span>
                      </div>
                      <div className="border-t border-neutral-200 pt-2 flex justify-between font-medium">
                        <span className="text-neutral-800">Total</span>
                        <span>{impactAssessment.total_topics} topics</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div
                    className={`rounded-xl border p-4 ${getRecommendationColor(
                      impactAssessment.recommendation
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <AppIcon
                        name={getRecommendationIconName(
                          impactAssessment.recommendation
                        )}
                        className="w-5 h-5 mt-0.5"
                        aria-hidden={true}
                      />
                      <div>
                        <h3 className="font-semibold mb-1">
                          {impactAssessment.recommendation === "on_track" &&
                            "Looking good!"}
                          {impactAssessment.recommendation === "tight_but_ok" &&
                            "Coverage is tight"}
                          {impactAssessment.recommendation === "add_sessions" &&
                            "Consider adding sessions"}
                          {impactAssessment.recommendation === "prioritize" &&
                            "Prioritization important"}
                        </h3>
                        <p className="text-sm">
                          {impactAssessment.recommendation_detail}
                        </p>
                        {impactAssessment.additional_sessions_needed > 0 && (
                          <p className="text-sm mt-2 font-medium">
                            Suggested: Add {impactAssessment.additional_sessions_needed}{" "}
                            session
                            {impactAssessment.additional_sessions_needed !== 1
                              ? "s"
                              : ""}{" "}
                            per week
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sessions info */}
                  <div className="text-sm text-neutral-500 text-center">
                    <p>
                      {impactAssessment.total_available_sessions} total sessions over{" "}
                      {impactAssessment.weeks_in_plan} weeks
                    </p>
                    <p>
                      ≈ {impactAssessment.sessions_per_topic.toFixed(1)} sessions per topic
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  Unable to load impact assessment
                </div>
              )}
            </div>
          )}

          {/* Step 6: Confirm */}
          {step === STEPS.CONFIRM && (
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
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between flex-shrink-0">
          {/* Back button */}
          {step > STEPS.EXAM_TYPE &&
          step !== STEPS.SUBJECTS &&
          step !== STEPS.PATHWAYS &&
          step !== STEPS.GRADES ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={busy}
              className="px-6 py-3 rounded-full font-medium text-neutral-700 bg-neutral-200 hover:bg-neutral-300 transition-colors disabled:opacity-50"
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
              className="px-8 py-3 rounded-full font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-6 py-3 rounded-full font-medium text-neutral-700 bg-neutral-200 hover:bg-neutral-300 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext || busy}
                className="px-8 py-3 rounded-full font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-6 py-3 rounded-full font-medium text-neutral-700 bg-neutral-200 hover:bg-neutral-300 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext || busy || loadingImpact}
                className="px-8 py-3 rounded-full font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-6 py-3 rounded-full font-medium text-neutral-700 bg-neutral-200 hover:bg-neutral-300 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy}
                className="px-8 py-3 rounded-full font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
