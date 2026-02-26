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

  const { message, icon: encouragementIcon } = getEncouragementMessage(
    gotItCount,
    notQuiteCount,
    unsureCount,
    questionsAttempted
  );

  const remainingQuestions = totalQuestions - questionsAttempted;

  const doMoreIcon: IconKey = "plus";
  const continueIcon: IconKey = "chevronRight";

  return (
    <div className="bg-background rounded-2xl shadow-sm p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AppIcon name={encouragementIcon as IconKey} className="w-10 h-10 text-success" aria-hidden />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Practice complete!</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>

      {/* Results summary */}
      {questionsAttempted > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-success/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-success">{gotItCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Nailed it!</p>
          </div>
          <div className="bg-warning/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-warning">{unsureCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Not sure</p>
          </div>
          <div className="bg-destructive/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{notQuiteCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Missed it</p>
          </div>
        </div>
      )}

      {/* Do more questions option */}
      {hasMoreQuestions && remainingQuestions > 0 && (
        <div className="bg-info/10 border border-info/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-info">Want more practice?</p>
              <p className="text-sm text-info">
                {remainingQuestions} more question{remainingQuestions !== 1 ? "s" : ""} available
              </p>
            </div>
            <button
              type="button"
              onClick={onDoMore}
              className="px-4 py-2 bg-info text-white font-medium rounded-lg hover:bg-info transition flex items-center gap-2"
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
        className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        Continue
        <AppIcon name={continueIcon} />
      </button>
    </div>
  );
}
