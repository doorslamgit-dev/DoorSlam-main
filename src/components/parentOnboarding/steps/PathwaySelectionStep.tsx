// src/components/parentOnboarding/steps/PathwaySelectionStep.tsx
// Onboarding step for selecting exam tiers (Foundation/Higher) and options (RS routes/faiths)

import { useCallback, useEffect, useMemo, useState } from "react";
import AppIcon from "../../ui/AppIcon";
import {
  rpcGetSubjectPathways,
  buildPathwayHierarchy,
  type SubjectPathways,
  type PathwayOption,
} from "../../../services/parentOnboarding/pathwayService";

/* ============================
   Types
============================ */

export type PathwaySelectionData = {
  subject_id: string;
  pathway_id: string;
  pathway_name: string;
};

type Props = {
  /** Subject IDs from the previous step */
  subjectIds: string[];
  /** Current selections */
  value: PathwaySelectionData[];
  /** Update selections */
  onChange: (selections: PathwaySelectionData[]) => void;
  /** Navigate back */
  onBack: () => void;
  /** Navigate forward (called when all required selections made, or skipped) */
  onNext: () => void;
};

/* ============================
   SubjectPathwayCard Component
============================ */

type SubjectCardProps = {
  subject: SubjectPathways;
  selections: PathwaySelectionData[];
  onSelect: (subjectId: string, pathway: PathwayOption) => void;
  onSkip: (subjectId: string) => void;
  onClear: (subjectId: string) => void;
};

function SubjectPathwayCard({
  subject,
  selections,
  onSelect,
  onSkip,
  onClear,
}: SubjectCardProps) {
  const hierarchy = useMemo(
    () => buildPathwayHierarchy(subject.pathways),
    [subject.pathways]
  );

  // Find current selections for this subject
  const subjectSelections = selections.filter(
    (s) => s.subject_id === subject.subject_id
  );
  const selectedIds = subjectSelections.map((s) => s.pathway_id);

  // Determine what level we're at
  const selectedTopLevel = hierarchy.find((p) => selectedIds.includes(p.id));
  const showChildren = !!selectedTopLevel && selectedTopLevel.children.length > 0;
  const selectedChild = showChildren
    ? selectedTopLevel!.children.find((c) => selectedIds.includes(c.id))
    : null;

  // Is this subject complete?
  const isComplete = useMemo(() => {
    if (hierarchy.length === 0) return true;
    if (!selectedTopLevel) return false;
    if (selectedTopLevel.children.length > 0 && !selectedChild) return false;
    return true;
  }, [hierarchy.length, selectedTopLevel, selectedChild]);

  const isSkipped = subjectSelections.some((s) => s.pathway_id === "skipped");

  const statusStyles = isComplete
    ? "border-accent-green/30 bg-neutral-0"
    : isSkipped
      ? "border-warning-border bg-neutral-0"
      : "border-neutral-200 bg-neutral-0";

  const badgeStyles = isComplete
    ? "bg-accent-green/10 text-accent-green"
    : isSkipped
      ? "bg-warning-bg text-warning"
      : "bg-neutral-100 text-neutral-400";

  const statusIcon: "check" | "circle-question" | "chevron-right" = isComplete
    ? "check"
    : isSkipped
      ? "circle-question"
      : "chevron-right";

  return (
    <div className={`rounded-xl border shadow-sm ${statusStyles}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${badgeStyles}`}
          >
            <AppIcon name={statusIcon} className="w-4 h-4" aria-hidden />
          </div>

          <div>
            <div className="font-medium text-neutral-900">
              {subject.subject_name}
            </div>

            {isComplete && selectedTopLevel && (
              <div className="text-sm text-neutral-500">
                {selectedTopLevel.pathway_name}
                {selectedChild && ` → ${selectedChild.pathway_name}`}
              </div>
            )}

            {isSkipped && (
              <div className="text-sm text-warning">
                Selection needed before revision starts
              </div>
            )}
          </div>
        </div>

        {!isComplete && !isSkipped && (
          <button
            type="button"
            onClick={() => onSkip(subject.subject_id)}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            I'm not sure
          </button>
        )}
      </div>

      {/* Selection Area */}
      {!isComplete && !isSkipped && (
        <div className="p-4">
          {/* Top-level selection */}
          {!selectedTopLevel && (
            <div>
              <div className="text-sm font-medium text-neutral-700 mb-3">
                {hierarchy.length === 2 &&
                hierarchy[0]?.pathway_code === "foundation"
                  ? "Which tier is your child studying?"
                  : "Select an option"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hierarchy.map((pathway) => (
                  <button
                    key={pathway.id}
                    type="button"
                    onClick={() => onSelect(subject.subject_id, pathway)}
                    className="rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-3 text-left hover:border-neutral-300 hover:bg-neutral-50 transition"
                  >
                    <div className="font-medium text-neutral-900">
                      {pathway.pathway_name}
                    </div>

                    {pathway.pathway_code === "foundation" && (
                      <div className="text-sm text-neutral-500 mt-1">
                        Grades 1–5 available
                      </div>
                    )}
                    {pathway.pathway_code === "higher" && (
                      <div className="text-sm text-neutral-500 mt-1">
                        Grades 4–9 available
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Child-level selection (e.g., RS faith options) */}
          {showChildren && !selectedChild && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-neutral-700">
                  Now select the specific option
                </div>
                <button
                  type="button"
                  onClick={() => onClear(subject.subject_id)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Change {selectedTopLevel!.pathway_name}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedTopLevel!.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => onSelect(subject.subject_id, child)}
                    className="rounded-lg border border-neutral-200 bg-neutral-0 px-3 py-2 text-left hover:border-neutral-300 hover:bg-neutral-50 transition"
                  >
                    <div className="font-medium text-neutral-900 text-sm">
                      {child.pathway_name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed state - allow changing */}
      {isComplete && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => onClear(subject.subject_id)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Change selection
          </button>
        </div>
      )}

      {/* Skipped state - allow completing */}
      {isSkipped && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => onClear(subject.subject_id)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Select now
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================
   Main Component
============================ */

export default function PathwaySelectionStep({
  subjectIds,
  value,
  onChange,
  onBack,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectsWithPathways, setSubjectsWithPathways] = useState<
    SubjectPathways[]
  >([]);

  // Fetch pathway data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (subjectIds.length === 0) {
        setSubjectsWithPathways([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await rpcGetSubjectPathways(subjectIds);
        if (cancelled) return;
        setSubjectsWithPathways(data);
      } catch (e: unknown) {
        if (cancelled) return;
        setError((e instanceof Error ? e.message : "Failed to load pathway options"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [subjectIds]);

  // Handle pathway selection
  const handleSelect = useCallback(
    (subjectId: string, pathway: PathwayOption) => {
      const subject = subjectsWithPathways.find(
        (s) => s.subject_id === subjectId
      );
      if (!subject) return;

      // Remove skip marker if present
      let newSelections = value.filter(
        (s) => !(s.subject_id === subjectId && s.pathway_id === "skipped")
      );

      // If this is a child pathway, keep the parent selection
      if (pathway.parent_pathway_id) {
        // Keep parent, add child
        newSelections = newSelections.filter(
          (s) =>
            s.subject_id !== subjectId ||
            s.pathway_id === pathway.parent_pathway_id
        );
      } else {
        // This is a top-level selection - clear any existing selections for this subject
        newSelections = newSelections.filter((s) => s.subject_id !== subjectId);
      }

      newSelections.push({
        subject_id: subjectId,
        pathway_id: pathway.id,
        pathway_name: pathway.pathway_name,
      });

      onChange(newSelections);
    },
    [value, onChange, subjectsWithPathways]
  );

  // Handle skip
  const handleSkip = useCallback(
    (subjectId: string) => {
      // Clear any existing selections and add skip marker
      const newSelections = value.filter((s) => s.subject_id !== subjectId);
      newSelections.push({
        subject_id: subjectId,
        pathway_id: "skipped",
        pathway_name: "Not selected",
      });
      onChange(newSelections);
    },
    [value, onChange]
  );

  // Handle clear (to change selection)
  const handleClear = useCallback(
    (subjectId: string) => {
      onChange(value.filter((s) => s.subject_id !== subjectId));
    },
    [value, onChange]
  );

  // Check if all subjects are addressed (either selected or skipped)
  const allAddressed = useMemo(() => {
    for (const subject of subjectsWithPathways) {
      const subjectSelections = value.filter(
        (s) => s.subject_id === subject.subject_id
      );
      if (subjectSelections.length === 0) return false;

      // Check if it's skipped
      if (subjectSelections.some((s) => s.pathway_id === "skipped")) continue;

      // Check if selection is complete (has required depth)
      const hierarchy = buildPathwayHierarchy(subject.pathways);
      const selectedIds = subjectSelections.map((s) => s.pathway_id);
      const selectedTopLevel = hierarchy.find((p) => selectedIds.includes(p.id));

      if (!selectedTopLevel) return false;

      if (selectedTopLevel.children.length > 0) {
        const hasChild = selectedTopLevel.children.some((c) =>
          selectedIds.includes(c.id)
        );
        if (!hasChild) return false;
      }
    }
    return true;
  }, [subjectsWithPathways, value]);

  // Count skipped subjects
  const skippedCount = useMemo(() => {
    return value.filter((s) => s.pathway_id === "skipped").length;
  }, [value]);

  // If no subjects require pathway selection, auto-advance
  useEffect(() => {
    if (!loading && subjectsWithPathways.length === 0) {
      onNext();
    }
  }, [loading, subjectsWithPathways.length, onNext]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Checking subject options…
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Loading tier and option details
          </p>
        </div>

        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-neutral-100 rounded-xl" />
          <div className="h-24 bg-neutral-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 p-4">
          <div className="flex items-start gap-3">
            <AppIcon
              name="triangle-alert"
              className="w-5 h-5 text-accent-red mt-0.5"
              aria-hidden
            />
            <div>
              <div className="font-medium text-neutral-900">
                Failed to load options
              </div>
              <div className="text-sm text-neutral-600 mt-1">{error}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  if (subjectsWithPathways.length === 0) {
    // Should auto-advance, but just in case
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">
          Select exam tiers and options
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Some subjects have tiers or routes. This helps us show the right content.
        </p>
      </div>

      {/* Info box */}
      <div className="rounded-xl bg-primary-50 border border-primary-200 p-4 text-sm text-primary-900">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <AppIcon name="info" className="w-5 h-5 text-primary-600" aria-hidden />
          </div>
          <div>
            <p className="font-semibold">Not sure?</p>
            <p className="text-primary-800">
              You can skip for now and set this later. Check exercise books or ask the
              teacher.
            </p>
          </div>
        </div>
      </div>

      {/* Subject cards */}
      <div className="space-y-4">
        {subjectsWithPathways.map((subject) => (
          <SubjectPathwayCard
            key={subject.subject_id}
            subject={subject}
            selections={value}
            onSelect={handleSelect}
            onSkip={handleSkip}
            onClear={handleClear}
          />
        ))}
      </div>

      {/* Skipped warning */}
      {skippedCount > 0 && (
        <div className="rounded-xl bg-warning-bg border border-warning-border p-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AppIcon
              name="triangle-alert"
              className="w-5 h-5 text-warning mt-0.5"
              aria-hidden
            />
            <div>
              <p className="font-semibold">
                {skippedCount === 1
                  ? "1 subject needs a tier/option before revision can start."
                  : `${skippedCount} subjects need tiers/options before revision can start.`}
              </p>
              <p className="text-warning">
                You’ll see a reminder on your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!allAddressed}
          className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {skippedCount > 0 ? "Continue anyway" : "Next"}
        </button>
      </div>
    </div>
  );
}
