// src/components/subjects/DeleteSubjectModal.tsx
// Modal for removing subjects from a child's revision plan
// 3-step flow: SELECT → IMPACT → CONFIRM

import { useState, useEffect, useMemo, useCallback } from 'react';
import AppIcon from '../ui/AppIcon';
import Alert from '../ui/Alert';
import {
  getDeletionImpactAssessment,
  removeSubjectsFromChild,
  type DeletionImpactAssessment,
} from '../../services/deleteSubjectService';

interface DeleteSubjectModalProps {
  childId: string;
  childName: string;
  currentSubjects: Array<{
    subject_id: string;
    subject_name: string;
    exam_board_name?: string;
    icon?: string;
    color?: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = {
  SELECT: 0,
  IMPACT: 1,
  CONFIRM: 2,
} as const;

const STEP_TITLES: Record<number, string> = {
  [STEPS.SELECT]: 'Select subjects to remove',
  [STEPS.IMPACT]: 'Review impact',
  [STEPS.CONFIRM]: 'Confirm removal',
};

function getRecommendationStyle(rec: string) {
  switch (rec) {
    case 'coverage_improves':
      return { bg: 'bg-success/10 border-success/20', text: 'text-success', icon: 'check-circle' as const };
    case 'excess_capacity':
      return { bg: 'bg-info/10 border-info/20', text: 'text-info', icon: 'info' as const };
    case 'no_subjects_remain':
      return { bg: 'bg-warning/10 border-warning/20', text: 'text-warning', icon: 'triangle-alert' as const };
    default:
      return { bg: 'bg-muted border-border', text: 'text-foreground', icon: 'info' as const };
  }
}

export default function DeleteSubjectModal({
  childId,
  childName,
  currentSubjects,
  isOpen,
  onClose,
  onSuccess,
}: DeleteSubjectModalProps) {
  const [step, setStep] = useState<number>(STEPS.SELECT);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [impactAssessment, setImpactAssessment] = useState<DeletionImpactAssessment | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(STEPS.SELECT);
      setSelectedSubjectIds([]);
      setImpactAssessment(null);
      setError(null);
    }
  }, [isOpen]);

  // Load impact when entering IMPACT step
  useEffect(() => {
    if (step === STEPS.IMPACT && !impactAssessment) {
      void loadImpact();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const loadImpact = async () => {
    setLoadingImpact(true);
    setError(null);

    const { data, error: fetchError } = await getDeletionImpactAssessment(
      childId,
      selectedSubjectIds
    );

    if (fetchError) {
      setError(fetchError);
    } else {
      setImpactAssessment(data);
    }

    setLoadingImpact(false);
  };

  const toggleSubject = useCallback((subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  }, []);

  const canNext = useMemo(() => {
    switch (step) {
      case STEPS.SELECT:
        return selectedSubjectIds.length > 0;
      case STEPS.IMPACT:
        return impactAssessment !== null;
      default:
        return true;
    }
  }, [step, selectedSubjectIds, impactAssessment]);

  const handleNext = useCallback(() => {
    setError(null);
    if (step === STEPS.SELECT) {
      setImpactAssessment(null);
      setStep(STEPS.IMPACT);
    } else if (step === STEPS.IMPACT) {
      setStep(STEPS.CONFIRM);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    setError(null);
    if (step === STEPS.IMPACT) {
      setStep(STEPS.SELECT);
    } else if (step === STEPS.CONFIRM) {
      setStep(STEPS.IMPACT);
    }
  }, [step]);

  const handleSubmit = async () => {
    setBusy(true);
    setError(null);

    const result = await removeSubjectsFromChild(childId, selectedSubjectIds);

    if (!result.success) {
      setError(result.error || 'Failed to remove subjects');
      setBusy(false);
      return;
    }

    onSuccess();
    onClose();
    setBusy(false);
  };

  // Selected subject details for display
  const selectedSubjects = useMemo(
    () => currentSubjects.filter((s) => selectedSubjectIds.includes(s.subject_id)),
    [currentSubjects, selectedSubjectIds]
  );

  const totalSteps = 3;
  const progressPercent = Math.round(((step + 1) / totalSteps) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-background rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              {STEP_TITLES[step] || 'Remove subjects'}
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
                Step {step + 1} of {totalSteps}
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
          {/* Step 0: SELECT */}
          {step === STEPS.SELECT && (
            <div>
              <p className="text-muted-foreground mb-6">
                Select the subjects you want to remove from {childName}&apos;s revision plan.
                Future planned sessions for these subjects will be deleted.
              </p>

              <div className="space-y-3">
                {currentSubjects.map((subject) => {
                  const isSelected = selectedSubjectIds.includes(subject.subject_id);
                  return (
                    <button
                      key={subject.subject_id}
                      type="button"
                      onClick={() => toggleSubject(subject.subject_id)}
                      className={`w-full border-2 rounded-xl p-4 text-left transition-all ${
                        isSelected
                          ? 'border-destructive bg-destructive/5'
                          : 'border-border hover:border-destructive/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-destructive border-destructive'
                              : 'bg-background border-input'
                          }`}
                        >
                          <AppIcon
                            name="check"
                            className={`w-3.5 h-3.5 text-white transition-opacity ${
                              isSelected ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        </div>

                        {/* Subject info */}
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground">
                            {subject.subject_name}
                          </span>
                          {subject.exam_board_name && (
                            <p className="text-sm text-muted-foreground">
                              {subject.exam_board_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedSubjectIds.length > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {selectedSubjectIds.length} subject{selectedSubjectIds.length !== 1 ? 's' : ''} selected
                  for removal
                </p>
              )}
            </div>
          )}

          {/* Step 1: IMPACT */}
          {step === STEPS.IMPACT && (
            <div>
              {loadingImpact ? (
                <div className="flex items-center justify-center py-12">
                  <AppIcon name="loader" className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : !impactAssessment ? (
                <div className="text-center py-8 text-muted-foreground">
                  Unable to load impact assessment
                </div>
              ) : (
                <ImpactDisplay impact={impactAssessment} />
              )}
            </div>
          )}

          {/* Step 2: CONFIRM */}
          {step === STEPS.CONFIRM && (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                You&apos;re about to remove {selectedSubjects.length} subject
                {selectedSubjects.length !== 1 ? 's' : ''} from {childName}&apos;s revision plan.
              </p>

              <div className="bg-muted rounded-xl p-4 space-y-3">
                {selectedSubjects.map((subject) => (
                  <div
                    key={subject.subject_id}
                    className="flex items-center gap-3 bg-background rounded-lg p-3 border border-border"
                  >
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AppIcon name="x" className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{subject.subject_name}</p>
                      {subject.exam_board_name && (
                        <p className="text-sm text-muted-foreground">{subject.exam_board_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Alert variant="error" title="This action cannot be undone">
                {impactAssessment && impactAssessment.future_sessions_to_delete > 0 && (
                  <span>
                    {impactAssessment.future_sessions_to_delete} future planned session
                    {impactAssessment.future_sessions_to_delete !== 1 ? 's' : ''} will be
                    permanently deleted.{' '}
                  </span>
                )}
                Completed sessions and earned XP will be preserved.
              </Alert>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-muted border-t border-border flex items-center justify-between flex-shrink-0">
          {/* Back / Cancel */}
          {step > STEPS.SELECT ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={busy}
              className="px-6 py-3 rounded-full font-medium text-foreground bg-muted hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {/* Action button */}
          {step === STEPS.SELECT && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext}
              className="px-8 py-3 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              See Impact
            </button>
          )}

          {step === STEPS.IMPACT && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext || loadingImpact}
              className="px-8 py-3 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          )}

          {step === STEPS.CONFIRM && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              className="px-8 py-3 rounded-full font-semibold text-white bg-destructive hover:bg-destructive/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {busy ? (
                <>
                  <AppIcon name="loader" className="w-4 h-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <AppIcon name="trash" className="w-4 h-4" />
                  Remove Subject{selectedSubjectIds.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================
   Impact Display Sub-component
============================ */

function ImpactDisplay({ impact }: { impact: DeletionImpactAssessment }) {
  const style = getRecommendationStyle(impact.recommendation);
  const coverageImproved = impact.new_coverage_percent > impact.current_coverage_percent;

  return (
    <div className="space-y-6">
      {/* Coverage comparison */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {impact.current_coverage_percent}%
          </div>
          <div className="text-xs text-muted-foreground leading-tight">Current coverage</div>
        </div>
        <div className="bg-muted rounded-xl p-4 text-center flex items-center justify-center">
          <AppIcon name="arrow-right" className="w-6 h-6 text-muted-foreground" />
        </div>
        <div
          className={`rounded-xl p-4 text-center ${
            coverageImproved ? 'bg-success/10' : 'bg-muted'
          }`}
        >
          <div
            className={`text-2xl font-bold ${
              coverageImproved ? 'text-success' : 'text-foreground'
            }`}
          >
            {impact.new_coverage_percent}%
          </div>
          <div className="text-xs text-muted-foreground leading-tight">After removal</div>
        </div>
      </div>

      {/* Subjects being removed */}
      <div className="bg-muted rounded-xl p-4">
        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <AppIcon name="minus-circle" className="w-4 h-4 text-destructive" />
          Subjects being removed
        </h3>
        <div className="space-y-2 text-sm">
          {impact.removing_subjects.map((s) => (
            <div key={s.subject_id} className="flex justify-between">
              <span className="text-muted-foreground">{s.subject_name}</span>
              <span className="font-medium text-destructive">
                {s.topic_count} topic{s.topic_count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between font-medium">
            <span className="text-foreground">Total removed</span>
            <span className="text-destructive">{impact.removing_topic_count} topics</span>
          </div>
        </div>
      </div>

      {/* Sessions impact */}
      <div className="bg-muted rounded-xl p-4">
        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <AppIcon name="calendar" className="w-4 h-4 text-primary" />
          Session impact
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Future sessions to delete</span>
            <span className="font-medium">{impact.future_sessions_to_delete}</span>
          </div>
          {impact.completed_sessions_preserved > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed sessions preserved</span>
              <span className="font-medium text-success">
                {impact.completed_sessions_preserved}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Remaining subjects</span>
            <span className="font-medium">{impact.remaining_subject_count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Remaining topics</span>
            <span className="font-medium">{impact.remaining_topic_count}</span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-xl border p-4 ${style.bg}`}>
        <div className="flex items-start gap-3">
          <AppIcon name={style.icon} className={`w-5 h-5 mt-0.5 ${style.text}`} />
          <div>
            <p className={`text-sm ${style.text}`}>{impact.recommendation_detail}</p>
            {impact.excess_sessions_per_week > 0 && (
              <p className={`text-sm mt-2 font-medium ${style.text}`}>
                You could reduce your weekly schedule by ~{impact.excess_sessions_per_week} session
                {impact.excess_sessions_per_week !== 1 ? 's' : ''} if you want to free up time.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
