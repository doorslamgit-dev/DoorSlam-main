

// src/views/parent/ParentOnboardingPage.tsx
// Two-phase onboarding flow for parents:
// Phase 1 (default): Child Details → Exam Type → Subjects → Dashboard
// Phase 2 (?phase=schedule&child=<id>): Goal → Needs → Pathways → Grades → Period → Availability → Confirm → Dashboard

import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';

import OnboardingModal from "../../components/parentOnboarding/OnboardingModal";
import ChildDetailsStep, {
  ChildDetails,
} from "../../components/parentOnboarding/steps/ChildDetailsStep";
import GoalStep from "../../components/parentOnboarding/steps/GoalStep";
import NeedsStep, {
  type NeedClusterSelection,
} from "../../components/parentOnboarding/steps/NeedsStep";
import ExamTypeStep from "../../components/parentOnboarding/steps/ExamTypeStep";
import SubjectBoardStep, {
  type SelectedSubject,
} from "../../components/parentOnboarding/steps/SubjectBoardStep";
import PathwaySelectionStep, {
  type PathwaySelectionData,
} from "../../components/parentOnboarding/steps/PathwaySelectionStep";
import SubjectPriorityGradesStep, {
  type SubjectWithGrades,
} from "../../components/parentOnboarding/steps/SubjectPriorityGradesStep";
import RevisionPeriodStep, {
  type RevisionPeriodData,
} from "../../components/parentOnboarding/steps/RevisionPeriodStep";
import AvailabilityBuilderStep, {
  type DateOverride,
} from "../../components/parentOnboarding/steps/AvailabilityBuilderStep";
import ConfirmStep from "../../components/parentOnboarding/steps/ConfirmStep";

import {
  rpcParentCreateChildBasic,
  rpcSetChildGoal,
  rpcUpdateChildSubjectGrades,
  rpcInitChildRevisionPeriod,
  setChildNeedClusters,
} from "../../services/parentOnboarding/parentOnboardingService";
import { rpcSaveChildPathways } from "../../services/parentOnboarding/pathwayService";
import { saveTemplateAndRegenerate } from "../../services/timetableService";
import { getSubjectsForPrioritization } from "../../services/addSubjectService";
import {
  calculateRecommendedSessions,
  type RecommendationResult,
  type DayTemplate,
} from "../../services/parentOnboarding/recommendationService";
import { useAuth } from "../../contexts/AuthContext";

/* ============================
   Constants & Helpers
============================ */

function createEmptyTemplate(): DayTemplate[] {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return dayNames.map((name, index) => ({
    day_of_week: index,
    day_name: name,
    is_enabled: index < 5,
    slots: [],
    session_count: 0,
  }));
}

function createDefaultRevisionPeriod(): RevisionPeriodData {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  const startDate = new Date(today);
  startDate.setDate(today.getDate() + daysUntilMonday);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 56);

  return {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    contingency_enabled: true,
    current_revision_score: 5,
    past_revision_score: 5,
    is_first_time: true,
    contingency_percent: 10,
    feeling_code: null,
    history_code: null,
  };
}

function normaliseStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [String(value)];
}

function formatSupabaseError(e: unknown): string {
  if (!e) return "Failed to save";
  const msg = (e instanceof Error ? e.message : "Failed to save");
  const err = e as Record<string, unknown>;
  const details = err.details ? `\n\nDetails: ${err.details}` : "";
  const hint = err.hint ? `\n\nHint: ${err.hint}` : "";
  return `${msg}${details}${hint}`;
}

/** Convert TEXT grade from DB to number for the grades step UI */
function gradeTextToNumber(grade: string | null): number | null {
  if (!grade) return null;
  const num = parseInt(grade, 10);
  return isNaN(num) ? null : num;
}

/** Convert number grade from UI to TEXT for the RPC */
function gradeNumberToText(grade: number | null): string | null {
  return grade === null ? null : String(grade);
}

/* ============================
   Phase 1 Step Configuration
   Child Details → Exam Type → Subjects
============================ */

const P1_STEPS = {
  CHILD_DETAILS: 0,
  EXAM_TYPE: 1,
  SUBJECTS: 2,
} as const;

const P1_STEP_TITLES: Record<number, string> = {
  [P1_STEPS.CHILD_DETAILS]: "Add your child",
  [P1_STEPS.EXAM_TYPE]: "Exam type",
  [P1_STEPS.SUBJECTS]: "Choose subjects",
};

const P1_TOTAL_STEPS = 3;

/* ============================
   Phase 2 Step Configuration
   Goal → Needs → Pathways → Grades → Period → Availability → Confirm
============================ */

const P2_STEPS = {
  GOAL: 0,
  NEEDS: 1,
  PATHWAYS: 2,
  PRIORITY_GRADES: 3,
  REVISION_PERIOD: 4,
  AVAILABILITY: 5,
  CONFIRM: 6,
} as const;

const P2_STEP_TITLES: Record<number, string> = {
  [P2_STEPS.GOAL]: "Set a goal",
  [P2_STEPS.NEEDS]: "Learning support",
  [P2_STEPS.PATHWAYS]: "Subject options",
  [P2_STEPS.PRIORITY_GRADES]: "Grades & priority",
  [P2_STEPS.REVISION_PERIOD]: "Revision period",
  [P2_STEPS.AVAILABILITY]: "Weekly schedule",
  [P2_STEPS.CONFIRM]: "Review & confirm",
};

const P2_TOTAL_STEPS = 7;

/* ============================
   Main Component
============================ */

export default function ParentOnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh, parentChildCount } = useAuth();

  // Phase detection from URL
  const phase = searchParams.get('phase') === 'schedule' ? 2 : 1;
  const childIdFromUrl = searchParams.get('child');

  const [pendingDashboardNav, setPendingDashboardNav] = useState(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 1 state: child + exam type + subjects
  const [child, setChild] = useState<ChildDetails>({
    first_name: "",
    last_name: "",
    preferred_name: "",
    country: "England",
    year_group: 11,
  });
  const [examTypeIds, setExamTypeIds] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubject[]>([]);

  // Phase 2 state: schedule setup (also used in old flow)
  const [phase2ChildId] = useState<string | null>(childIdFromUrl);
  const [phase2ChildName, setPhase2ChildName] = useState<string>("");
  const [phase2SubjectsLoaded, setPhase2SubjectsLoaded] = useState(false);
  const [goalCode, setGoalCode] = useState<string | undefined>(undefined);
  const [needClusters, setNeedClusters] = useState<NeedClusterSelection[]>([]);
  const [pathwaySelections, setPathwaySelections] = useState<PathwaySelectionData[]>([]);
  const [subjectsWithGrades, setSubjectsWithGrades] = useState<SubjectWithGrades[]>([]);
  const [revisionPeriod, setRevisionPeriod] = useState<RevisionPeriodData>(
    createDefaultRevisionPeriod()
  );
  const [weeklyTemplate, setWeeklyTemplate] = useState<DayTemplate[]>(createEmptyTemplate());
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [, setIsLoadingRecommendation] = useState(false);

  // Current step config based on phase
  const stepTitles = phase === 1 ? P1_STEP_TITLES : P2_STEP_TITLES;
  const totalSteps = phase === 1 ? P1_TOTAL_STEPS : P2_TOTAL_STEPS;

  /* ============================
     Effects
  ============================ */

  // Navigate to pricing page once Phase 1 completes (child created)
  // User must choose a plan before accessing the dashboard
  useEffect(() => {
    if (pendingDashboardNav && parentChildCount !== null && parentChildCount > 0) {
      setPendingDashboardNav(false);
      navigate("/pricing", { replace: true });
    }
  }, [pendingDashboardNav, parentChildCount, navigate]);

  // Phase 2: Load enrolled subjects from DB on mount
  useEffect(() => {
    if (phase !== 2 || !phase2ChildId || phase2SubjectsLoaded) return;

    let cancelled = false;

    async function loadEnrolledSubjects() {
      const { data, error: fetchError } = await getSubjectsForPrioritization(phase2ChildId!);
      if (cancelled) return;

      if (fetchError || !data) {
        console.error("Failed to load enrolled subjects:", fetchError);
        return;
      }

      const loaded: SubjectWithGrades[] = data.map(s => ({
        subject_id: s.subject_id,
        subject_name: s.subject_name,
        exam_board_name: s.exam_board_name,
        sort_order: s.sort_order,
        current_grade: gradeTextToNumber(s.current_grade),
        target_grade: gradeTextToNumber(s.target_grade),
        grade_confidence: (s.grade_confidence as 'confirmed' | 'estimated' | 'unknown') || 'confirmed',
      }));

      setSubjectsWithGrades(loaded);
      setPhase2SubjectsLoaded(true);

      // Set child name from first subject's context (or fetch separately)
      if (data.length > 0 && !phase2ChildName) {
        // Child name will be set from query param or fetched — for now use placeholder
        setPhase2ChildName("your child");
      }
    }

    loadEnrolledSubjects();
    return () => { cancelled = true; };
  }, [phase, phase2ChildId, phase2SubjectsLoaded, phase2ChildName]);

  // Phase 2: Auto-convert subjects to grades format (for fresh Phase 2 entry)
  useEffect(() => {
    if (phase === 2 && step === P2_STEPS.PRIORITY_GRADES && subjectsWithGrades.length === 0 && phase2SubjectsLoaded) {
      // Subjects loaded but empty — shouldn't happen but handle gracefully
      console.warn("Phase 2: No enrolled subjects found for this child");
    }
  }, [phase, step, subjectsWithGrades.length, phase2SubjectsLoaded]);

  // Recommendation calculations (Phase 2 only, for availability step)
  const calculateRecommendations = useCallback(async () => {
    if (subjectsWithGrades.length === 0 || !goalCode) return;

    setIsLoadingRecommendation(true);
    try {
      const subjectData = subjectsWithGrades.map(s => ({
        subject_id: s.subject_id,
        sort_order: s.sort_order,
        current_grade: s.current_grade,
        target_grade: s.target_grade,
        grade_confidence: s.grade_confidence,
      }));

      const needClusterCodes = needClusters.map(nc => nc.cluster_code);

      const result = await calculateRecommendedSessions(
        subjectData,
        goalCode,
        needClusterCodes,
        revisionPeriod.contingency_percent
      );

      setRecommendation(result);
    } catch (err) {
      console.error('Error calculating recommendations:', err);
    } finally {
      setIsLoadingRecommendation(false);
    }
  }, [subjectsWithGrades, goalCode, needClusters, revisionPeriod.contingency_percent]);

  useEffect(() => {
    if (phase === 2 && step === P2_STEPS.AVAILABILITY && subjectsWithGrades.length > 0 && goalCode && !recommendation) {
      calculateRecommendations();
    }
  }, [phase, step, subjectsWithGrades, goalCode, recommendation, calculateRecommendations]);

  /* ============================
     Phase 2 Confirm Payload (for display in ConfirmStep)
  ============================ */
  const phase2Payload = useMemo(() => {
    if (phase !== 2) return {};

    const weekly_availability: Record<string, {
      enabled: boolean;
      slots: Array<{
        time_of_day: 'early_morning' | 'morning' | 'afternoon' | 'evening';
        session_pattern: 'p20' | 'p45' | 'p70';
      }>
    }> = {};

    for (const day of weeklyTemplate) {
      weekly_availability[day.day_of_week.toString()] = {
        enabled: day.is_enabled,
        slots: day.slots.map(s => ({
          time_of_day: s.time_of_day as 'early_morning' | 'morning' | 'afternoon' | 'evening',
          session_pattern: s.session_pattern as 'p20' | 'p45' | 'p70',
        })),
      };
    }

    const subjects = subjectsWithGrades.map(s => ({
      subject_id: s.subject_id,
      subject_name: s.subject_name,
      exam_board_name: s.exam_board_name,
      sort_order: s.sort_order,
      current_grade: s.current_grade,
      target_grade: s.target_grade,
      grade_confidence: s.grade_confidence,
    }));

    const need_clusters = needClusters.map(nc => ({ cluster_code: nc.cluster_code }));

    const pathway_selections = pathwaySelections
      .filter(ps => ps.pathway_id !== 'skipped')
      .map(ps => ({ subject_id: ps.subject_id, pathway_id: ps.pathway_id }));

    return {
      child: { first_name: phase2ChildName || "Your child" },
      goal_code: goalCode ?? null,
      subjects,
      need_clusters,
      pathway_selections,
      revision_period: {
        start_date: revisionPeriod.start_date,
        end_date: revisionPeriod.end_date,
        contingency_percent: revisionPeriod.contingency_percent,
        feeling_code: revisionPeriod.feeling_code,
        history_code: revisionPeriod.history_code,
      },
      weekly_availability,
      date_overrides: dateOverrides.length > 0 ? dateOverrides : undefined,
    };
  }, [phase, weeklyTemplate, subjectsWithGrades, needClusters, pathwaySelections, goalCode, revisionPeriod, dateOverrides, phase2ChildName]);

  /* ============================
     Validation
  ============================ */
  const canNext = useMemo(() => {
    if (phase === 1) {
      switch (step) {
        case P1_STEPS.CHILD_DETAILS:
          return !!child.first_name?.trim();
        case P1_STEPS.EXAM_TYPE:
          return normaliseStringArray(examTypeIds).length > 0;
        case P1_STEPS.SUBJECTS:
          return true; // SubjectBoardStep has own nav
        default:
          return true;
      }
    }

    // Phase 2
    switch (step) {
      case P2_STEPS.GOAL:
        return !!goalCode;
      case P2_STEPS.NEEDS:
        return true;
      case P2_STEPS.PATHWAYS:
        return true; // Self-navigating
      case P2_STEPS.PRIORITY_GRADES:
        return subjectsWithGrades.length > 0 && subjectsWithGrades.every(s => s.target_grade !== null);
      case P2_STEPS.REVISION_PERIOD:
        return !!revisionPeriod.start_date && !!revisionPeriod.end_date;
      case P2_STEPS.AVAILABILITY:
        return weeklyTemplate.some(d => d.is_enabled && d.slots.length > 0);
      default:
        return true;
    }
  }, [phase, step, child.first_name, examTypeIds, goalCode, subjectsWithGrades, revisionPeriod, weeklyTemplate]);

  /* ============================
     Phase 1 Submit
  ============================ */
  async function phase1Submit() {
    if (!child.first_name?.trim()) {
      setError("Please enter your child's first name.");
      return;
    }
    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await rpcParentCreateChildBasic({
        child: {
          first_name: child.first_name.trim(),
          last_name: child.last_name?.trim() || undefined,
          preferred_name: child.preferred_name?.trim() || undefined,
          country: child.country || "England",
          year_group: child.year_group || 11,
        },
        subjects: selectedSubjects.map((s, index) => ({
          subject_id: s.subject_id,
          sort_order: index + 1,
        })),
        exam_type_ids: examTypeIds,
      });

      // Refresh auth context so parentChildCount updates
      setPendingDashboardNav(true);
      await refresh();
    } catch (e: unknown) {
      setError(formatSupabaseError(e));
    } finally {
      setBusy(false);
    }
  }

  /* ============================
     Phase 2 Submit
  ============================ */
  async function phase2Submit() {
    if (!phase2ChildId) {
      setError("No child selected. Please go back to the dashboard.");
      return;
    }
    if (!goalCode) {
      setError("Please choose a goal.");
      return;
    }
    if (subjectsWithGrades.length === 0 || !subjectsWithGrades.every(s => s.target_grade !== null)) {
      setError("Please set a target grade for each subject.");
      return;
    }
    if (!revisionPeriod.start_date || !revisionPeriod.end_date) {
      setError("Please set a revision period.");
      return;
    }

    const hasSession = weeklyTemplate.some(d => d.is_enabled && d.slots.length > 0);
    if (!hasSession) {
      setError("Please add at least one study session to your schedule.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      // 1. Set goal
      await rpcSetChildGoal(phase2ChildId, goalCode);

      // 2. Set need clusters (if any)
      if (needClusters.length > 0) {
        await setChildNeedClusters(
          phase2ChildId,
          needClusters.map(nc => ({ cluster_code: nc.cluster_code }))
        );
      }

      // 3. Save pathways (if any)
      const filteredPathways = pathwaySelections.filter(ps => ps.pathway_id !== 'skipped');
      if (filteredPathways.length > 0) {
        await rpcSaveChildPathways(phase2ChildId, filteredPathways);
      }

      // 4. Update subject grades
      await rpcUpdateChildSubjectGrades(
        phase2ChildId,
        subjectsWithGrades.map(s => ({
          subject_id: s.subject_id,
          current_grade: gradeNumberToText(s.current_grade),
          target_grade: gradeNumberToText(s.target_grade),
          grade_confidence: s.grade_confidence,
        }))
      );

      // 5. Create revision period + plan
      await rpcInitChildRevisionPeriod(phase2ChildId, {
        start_date: revisionPeriod.start_date,
        end_date: revisionPeriod.end_date,
        contingency_percent: revisionPeriod.contingency_percent,
        feeling_code: revisionPeriod.feeling_code,
        history_code: revisionPeriod.history_code,
      });

      // 6. Save template + regenerate sessions
      await saveTemplateAndRegenerate(phase2ChildId, weeklyTemplate);

      // Navigate to dashboard
      navigate("/parent", { replace: true });
    } catch (e: unknown) {
      setError(formatSupabaseError(e));
    } finally {
      setBusy(false);
    }
  }

  /* ============================
     Display Names
  ============================ */
  const childDisplayName = phase === 1
    ? (child.preferred_name?.trim() || child.first_name?.trim() || "Your child")
    : (phase2ChildName || "Your child");

  /* ============================
     Navigation Handlers
  ============================ */

  // Phase 1: self-navigating step is SUBJECTS only
  const phase1SelfNav = phase === 1 && step === P1_STEPS.SUBJECTS;

  // Phase 2: self-navigating steps
  const phase2SelfNav = phase === 2 && ([P2_STEPS.PATHWAYS, P2_STEPS.PRIORITY_GRADES, P2_STEPS.REVISION_PERIOD, P2_STEPS.AVAILABILITY] as number[]).includes(step);

  const isSelfNavigating = phase1SelfNav || phase2SelfNav;

  // Phase 2 navigation handlers
  const handlePathwaysNext = useCallback(() => {
    setError(null);
    // Reset grades so they re-populate from subjectsWithGrades
    setStep(P2_STEPS.PRIORITY_GRADES);
  }, []);

  const handlePathwaysBack = useCallback(() => {
    setStep(P2_STEPS.NEEDS);
  }, []);

  const handlePriorityGradesNext = useCallback(() => {
    setError(null);
    setStep(P2_STEPS.REVISION_PERIOD);
  }, []);

  const handlePriorityGradesBack = useCallback(() => {
    setStep(P2_STEPS.PATHWAYS);
  }, []);

  const handleRevisionPeriodNext = useCallback(() => {
    setError(null);
    calculateRecommendations();
    setStep(P2_STEPS.AVAILABILITY);
  }, [calculateRecommendations]);

  const handleRevisionPeriodBack = useCallback(() => {
    setStep(P2_STEPS.PRIORITY_GRADES);
  }, []);

  const handleAvailabilityNext = useCallback(() => {
    setError(null);
    setStep(P2_STEPS.CONFIRM);
  }, []);

  const handleAvailabilityBack = useCallback(() => {
    setStep(P2_STEPS.REVISION_PERIOD);
  }, []);

  const subjectIdsForPathways = useMemo(() => {
    return subjectsWithGrades.map(s => s.subject_id);
  }, [subjectsWithGrades]);

  /* ============================
     Render
  ============================ */
  const showDefaultNav = !isSelfNavigating && step < (phase === 2 ? P2_STEPS.CONFIRM : P1_TOTAL_STEPS);
  const showProgress = step < (phase === 2 ? P2_STEPS.CONFIRM + 1 : P1_TOTAL_STEPS);

  const continueLabel = phase === 2 && step === P2_STEPS.NEEDS && needClusters.length === 0
    ? "Skip"
    : "Continue";

  const maxStep = phase === 1
    ? P1_STEPS.SUBJECTS
    : P2_STEPS.CONFIRM;

  return (
    <OnboardingModal
      title={stepTitles[step] ?? (phase === 1 ? "Add your child" : "Complete schedule")}
      currentStep={step + 1}
      totalSteps={totalSteps}
      showProgress={showProgress}
      error={error}
      onClose={() => navigate(phase === 2 ? "/parent" : "/")}
      backButton={
        showDefaultNav
          ? {
              disabled: step === 0 || busy,
              onClick: () => setStep((s) => Math.max(0, s - 1)),
            }
          : null
      }
      continueButton={
        showDefaultNav && step < maxStep
          ? {
              label: continueLabel,
              disabled: !canNext || busy,
              loading: busy,
              onClick: () => setStep((s) => Math.min(maxStep, s + 1)),
            }
          : null
      }
    >
      {/* ======================== PHASE 1 STEPS ======================== */}

      {phase === 1 && step === P1_STEPS.CHILD_DETAILS && (
        <ChildDetailsStep value={child} onChange={setChild} />
      )}

      {phase === 1 && step === P1_STEPS.EXAM_TYPE && (
        <ExamTypeStep
          value={examTypeIds}
          onChange={(ids) => {
            setExamTypeIds(normaliseStringArray(ids));
            setSelectedSubjects([]);
          }}
        />
      )}

      {phase === 1 && step === P1_STEPS.SUBJECTS && (
        <SubjectBoardStep
          examTypeIds={normaliseStringArray(examTypeIds)}
          value={selectedSubjects}
          onChange={(newSubjects) => {
            setSelectedSubjects(newSubjects);
          }}
          onBackToExamTypes={() => setStep(P1_STEPS.EXAM_TYPE)}
          onDone={phase1Submit}
        />
      )}

      {/* ======================== PHASE 2 STEPS ======================== */}

      {phase === 2 && step === P2_STEPS.GOAL && (
        <GoalStep value={goalCode} onChange={setGoalCode} />
      )}

      {phase === 2 && step === P2_STEPS.NEEDS && (
        <NeedsStep
          childName={childDisplayName}
          value={needClusters}
          onChange={setNeedClusters}
        />
      )}

      {phase === 2 && step === P2_STEPS.PATHWAYS && (
        <PathwaySelectionStep
          subjectIds={subjectIdsForPathways}
          value={pathwaySelections}
          onChange={setPathwaySelections}
          onBack={handlePathwaysBack}
          onNext={handlePathwaysNext}
        />
      )}

      {phase === 2 && step === P2_STEPS.PRIORITY_GRADES && (
        <SubjectPriorityGradesStep
          subjects={subjectsWithGrades}
          onSubjectsChange={setSubjectsWithGrades}
          onNext={handlePriorityGradesNext}
          onBack={handlePriorityGradesBack}
        />
      )}

      {phase === 2 && step === P2_STEPS.REVISION_PERIOD && (
        <RevisionPeriodStep
          revisionPeriod={revisionPeriod}
          onRevisionPeriodChange={setRevisionPeriod}
          onNext={handleRevisionPeriodNext}
          onBack={handleRevisionPeriodBack}
        />
      )}

      {phase === 2 && step === P2_STEPS.AVAILABILITY && (
        <AvailabilityBuilderStep
          weeklyTemplate={weeklyTemplate}
          dateOverrides={dateOverrides}
          recommendation={recommendation}
          revisionPeriod={revisionPeriod}
          subjects={subjectsWithGrades}
          goalCode={goalCode}
          needClusters={needClusters}
          onTemplateChange={setWeeklyTemplate}
          onOverridesChange={setDateOverrides}
          onNext={handleAvailabilityNext}
          onBack={handleAvailabilityBack}
        />
      )}

      {phase === 2 && step === P2_STEPS.CONFIRM && (
        <ConfirmStep payload={phase2Payload} busy={busy} onSubmit={phase2Submit} />
      )}
    </OnboardingModal>
  );
}
