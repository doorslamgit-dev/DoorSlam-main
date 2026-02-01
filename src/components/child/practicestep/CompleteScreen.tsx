// src/components/child/practicestep/CompleteScreen.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { QuestionAnswer } from "../../../types/child/practicestep";
import { getEncouragementMessage } from "../../../services/child/practicestep";

interface CompleteScreenProps {
  answers: QuestionAnswer[];
  totalQuestions: number;
  questionsAttempted: number;
  hasMoreQuestions: boolean;
  onDoMore: () => void;
  onContinue: () => void;
  saving: boolean;
}

export function CompleteScreen({
  answers,
  totalQuestions,
  questionsAttempted,
  hasMoreQuestions,
  onDoMore,
  onContinue,
  saving,
}: CompleteScreenProps) {
  const gotItCount = answers.filter((a) => a.selfAssessment === "got_it").length;
  const notQuiteCount = answers.filter((a) => a.selfAssessment === "not_quite").length;
  const unsureCount = answers.filter((a) => a.selfAssessment === "unsure").length;

  const { message, emoji } = getEncouragementMessage(
    gotItCount,
    notQuiteCount,
    unsureCount,
    questionsAttempted
  );

  const remainingQuestions = totalQuestions - questionsAttempted;

  const doMoreIcon: IconKey = "plus";
  const continueIcon: IconKey = "chevronRight";

  return (
    <div className="bg-white rounded-2xl shadow-card p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">{emoji}</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Practice complete!</h2>
        <p className="text-neutral-600">{message}</p>
      </div>

      {/* Results summary */}
      {questionsAttempted > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{gotItCount}</p>
            <p className="text-xs text-neutral-600 mt-1">Nailed it!</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{unsureCount}</p>
            <p className="text-xs text-neutral-600 mt-1">Not sure</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{notQuiteCount}</p>
            <p className="text-xs text-neutral-600 mt-1">Missed it</p>
          </div>
        </div>
      )}

      {/* Do more questions option */}
      {hasMoreQuestions && remainingQuestions > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Want more practice?</p>
              <p className="text-sm text-blue-700">
                {remainingQuestions} more question{remainingQuestions !== 1 ? "s" : ""} available
              </p>
            </div>
            <button
              type="button"
              onClick={onDoMore}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <AppIcon name={doMoreIcon} />
              Do more
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={saving}
        className="w-full py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        Continue
        <AppIcon name={continueIcon} />
      </button>
    </div>
  );
}
