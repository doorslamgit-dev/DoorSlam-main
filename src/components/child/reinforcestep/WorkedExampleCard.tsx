// src/components/child/reinforcestep/WorkedExampleCard.tsx

import { useEffect, useState } from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { WorkedExample } from "../../../types/child/reinforcestep";

interface WorkedExampleCardProps {
  example: WorkedExample;
  currentIndex: number;
  totalExamples: number;
  onPrevious: () => void;
  onNext: () => void;
  isLastExample: boolean;
}

function getWorkedExampleIconKeys() {
  return {
    pencil: "pencil" as IconKey,
    lightbulb: "lightbulb" as IconKey,
    checkCircle: "checkCircle" as IconKey,
    warning: "warningTriangle" as IconKey,
    arrowLeft: "arrowLeft" as IconKey,
    arrowRight: "arrowRight" as IconKey,
  };
}

export function WorkedExampleCard({
  example,
  currentIndex,
  totalExamples,
  onPrevious,
  onNext,
  isLastExample,
}: WorkedExampleCardProps) {
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showMistake, setShowMistake] = useState(false);

  const icons = getWorkedExampleIconKeys();

  const totalSteps = example.steps?.length ?? 0;
  const allStepsRevealed = revealedSteps >= totalSteps;

  useEffect(() => {
    // Reset when example changes
    setRevealedSteps(0);
    setShowAnswer(false);
    setShowMistake(false);
  }, [example]);

  const handleRevealNext = () => {
    if (revealedSteps < totalSteps) {
      setRevealedSteps((prev) => prev + 1);
    } else {
      setShowAnswer(true);
    }
  };

  const handleReset = () => {
    setRevealedSteps(0);
    setShowAnswer(false);
    setShowMistake(false);
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span className="flex items-center gap-2">
          <span className="text-teal-600" aria-hidden="true">
            <AppIcon name={icons.pencil} />
          </span>
          Worked Example {currentIndex + 1} of {totalExamples}
        </span>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Title bar */}
        <div className="bg-teal-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">{example.title}</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Question context */}
          <div className="bg-neutral-50 rounded-xl p-4 border-l-4 border-teal-500">
            <h4 className="font-semibold text-neutral-900 mb-2">Question</h4>
            <p className="text-neutral-700">{example.question_context}</p>
          </div>

          {/* Solution steps - progressive reveal */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <span className="text-teal-600" aria-hidden="true">
                <AppIcon name={icons.lightbulb} />
              </span>
              Solution
              <span className="text-sm font-normal text-neutral-500">
                ({revealedSteps}/{totalSteps} steps shown)
              </span>
            </h4>

            <div className="space-y-3">
              {example.steps?.slice(0, revealedSteps).map((step, i) => (
                <div
                  key={step.step_id}
                  className="flex gap-3 p-3 bg-teal-50 rounded-lg animate-fadeIn"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-teal-900">{step.content}</p>
                    {step.marks > 0 && (
                      <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        {step.marks} mark{step.marks > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Reveal next step button */}
              {!allStepsRevealed && (
                <button
                  type="button"
                  onClick={handleRevealNext}
                  className="w-full py-3 border-2 border-dashed border-teal-300 text-teal-700 font-medium rounded-lg hover:bg-teal-50 transition"
                >
                  Show next step <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </div>

          {/* Final answer - only show after all steps */}
          {showAnswer && example.final_answer && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fadeIn">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <span className="text-green-700" aria-hidden="true">
                  <AppIcon name={icons.checkCircle} />
                </span>
                Final Answer
              </h4>
              <p className="text-green-800 font-medium text-lg">{example.final_answer}</p>
            </div>
          )}

          {/* Show answer button if all steps revealed but answer not shown */}
          {allStepsRevealed && !showAnswer && (
            <button
              type="button"
              onClick={() => setShowAnswer(true)}
              className="w-full py-3 bg-green-100 text-green-800 font-medium rounded-lg hover:bg-green-200 transition"
            >
              Show final answer
            </button>
          )}

          {/* Common mistake - toggle */}
          {example.common_mistake && showAnswer && (
            <div>
              {!showMistake ? (
                <button
                  type="button"
                  onClick={() => setShowMistake(true)}
                  className="text-sm text-amber-700 hover:text-amber-800 flex items-center gap-2"
                >
                  <span className="text-amber-700" aria-hidden="true">
                    <AppIcon name={icons.warning} />
                  </span>
                  Show common mistake to avoid
                </button>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 animate-fadeIn">
                  <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <span className="text-amber-700" aria-hidden="true">
                      <AppIcon name={icons.warning} />
                    </span>
                    Common Mistake
                  </h4>
                  <p className="text-amber-800 text-sm">{example.common_mistake}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            handleReset();
            onPrevious();
          }}
          className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition"
        >
          <AppIcon name={icons.arrowLeft} aria-hidden />
          Previous
        </button>

        <button
          type="button"
          onClick={() => {
            handleReset();
            onNext();
          }}
          disabled={!showAnswer}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition disabled:opacity-50 disabled:hover:bg-primary-600"
        >
          {isLastExample ? "Continue" : "Next Example"}
          <AppIcon name={icons.arrowRight} aria-hidden />
        </button>
      </div>

      {!showAnswer && (
        <p className="text-center text-sm text-neutral-400">
          Reveal all steps and the answer to continue
        </p>
      )}
    </div>
  );
}
