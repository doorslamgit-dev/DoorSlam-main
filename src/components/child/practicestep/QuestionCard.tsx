// src/components/child/practicestep/QuestionCard.tsx

import { useState } from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import type { PracticeQuestion, SelfAssessment } from "../../../types/child/practicestep";
import {
  getDifficultyLabel,
  getDifficultyColor,
} from "../../../services/child/practicestep";

interface QuestionCardProps {
  question: PracticeQuestion;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: string;
  onAnswerChange: (value: string) => void;
  isSubmitted: boolean;
  onSubmit: () => void;
  selfAssessment: SelfAssessment;
  onSelfAssess: (assessment: SelfAssessment) => void;
  onNext: () => void;
  isLastQuestion: boolean;
  onSkipToFinish: () => void;
  remainingQuestions: number;
}

const ICONS: Record<
  "help" | "play" | "checkCircle" | "warning" | "robot" | "star" | "idea",
  IconKey
> = {
  help: "questionCircle",
  play: "play",
  checkCircle: "checkCircle",
  warning: "triangleExclamation",
  robot: "robot",
  star: "star",
  idea: "lightbulb",
};

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  onSubmit,
  selfAssessment,
  onSelfAssess,
  onNext,
  isLastQuestion,
  onSkipToFinish,
  remainingQuestions,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOption(optionId);
    onAnswerChange(optionId);
  };

  const canSubmit =
    question.questionType === "multiple_choice"
      ? selectedOption !== null
      : userAnswer.trim().length > 0;

  const difficultyLabel = getDifficultyLabel(question.difficulty);
  const difficultyColor = getDifficultyColor(question.difficulty);
  const showAnswer = selfAssessment !== null;

  return (
    <div className="space-y-4">
      {/* Question header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
            Q{questionNumber}
          </span>
          <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
            {question.marks} mark{question.marks !== 1 ? "s" : ""}
          </span>
          {question.difficulty && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyColor}`}>
              {difficultyLabel}
            </span>
          )}
        </div>
        <span className="text-muted-foreground text-sm">
          {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question card */}
      <div className="bg-background rounded-2xl shadow-sm overflow-hidden">
        {/* Question text */}
        <div className="p-6 border-b border-border">
          <p className="text-lg text-foreground leading-relaxed">{question.text}</p>
        </div>

        {/* Answer input */}
        <div className="p-6">
          {!isSubmitted ? (
            <>
              {question.questionType === "multiple_choice" && question.options?.length > 0 ? (
                <div className="space-y-2">
                  {question.options.map((option, idx) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleOptionSelect(option.id)}
                      className={`
                        w-full text-left p-4 rounded-xl border-2 transition-all
                        ${
                          selectedOption === option.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-input bg-background"
                        }
                      `}
                    >
                      <span className="font-semibold text-primary mr-3">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : question.questionType === "numeric" ? (
                <input
                  type="text"
                  inputMode="decimal"
                  value={userAnswer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  placeholder="Enter your answer..."
                  className="w-full p-4 text-lg border-2 border-border rounded-xl focus:border-primary focus:outline-none transition"
                />
              ) : (
                <textarea
                  value={userAnswer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  placeholder="Write your answer..."
                  rows={4}
                  className="w-full p-4 text-lg border-2 border-border rounded-xl focus:border-primary focus:outline-none transition resize-none"
                />
              )}

              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                className="mt-4 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:hover:bg-primary"
              >
                Check my answer
              </button>

              {/* Stuck? Helper row */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  disabled
                  className="text-primary hover:text-primary font-medium flex items-center gap-1.5 opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <AppIcon name={ICONS.help} />
                  <span>Stuck? View related notes</span>
                </button>
                <button
                  type="button"
                  disabled
                  className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-1.5 opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <AppIcon name={ICONS.play} />
                  <span>Watch solution</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Submitted answer display */}
              <div className="bg-muted rounded-xl p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
                <p className="text-foreground font-medium">
                  {question.questionType === "multiple_choice"
                    ? question.options?.find((o) => o.id === userAnswer)?.label || userAnswer
                    : userAnswer}
                </p>
              </div>

              {/* Self-assessment */}
              {!selfAssessment && (
                <div className="bg-info/10 border border-info/20 rounded-xl p-5">
                  <p className="text-info font-medium mb-4 text-center">
                    How do you think you did? Select to see the answer:
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => onSelfAssess("got_it")}
                      className="flex-1 max-w-[140px] py-4 px-4 bg-background hover:bg-success/10 border-2 border-success/20 hover:border-success text-success rounded-xl transition flex flex-col items-center gap-2 shadow-sm"
                    >
                      <span className="text-2xl">😊</span>
                      <span className="text-sm font-semibold">Nailed it!</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelfAssess("unsure")}
                      className="flex-1 max-w-[140px] py-4 px-4 bg-background hover:bg-warning/10 border-2 border-warning/20 hover:border-warning text-warning rounded-xl transition flex flex-col items-center gap-2 shadow-sm"
                    >
                      <span className="text-2xl">🤔</span>
                      <span className="text-sm font-semibold">Not sure</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelfAssess("not_quite")}
                      className="flex-1 max-w-[140px] py-4 px-4 bg-background hover:bg-destructive/10 border-2 border-destructive/20 hover:border-destructive text-destructive rounded-xl transition flex flex-col items-center gap-2 shadow-sm"
                    >
                      <span className="text-2xl">😅</span>
                      <span className="text-sm font-semibold">Missed it</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Answer reveal section */}
        {showAnswer && (
          <div className="border-t border-border p-6 bg-muted space-y-4">
            {/* Self-assessment result badge */}
            <div
              className={`p-3 rounded-xl text-center ${
                selfAssessment === "got_it"
                  ? "bg-success/10 text-success"
                  : selfAssessment === "not_quite"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/10 text-warning"
              }`}
            >
              <span className="text-lg mr-2">
                {selfAssessment === "got_it" ? "😊" : selfAssessment === "not_quite" ? "😅" : "🤔"}
              </span>
              <span className="font-medium">
                {selfAssessment === "got_it"
                  ? "You said: Nailed it!"
                  : selfAssessment === "not_quite"
                  ? "You said: Missed it"
                  : "You said: Not sure"}
              </span>
            </div>

            {/* Correct answer */}
            <div className="bg-success/10 border border-success/20 rounded-xl p-4">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AppIcon name={ICONS.checkCircle} className="text-success" />
                Correct Answer
              </h4>
              <p className="text-success font-medium text-lg">
                {question.questionType === "multiple_choice" && question.correct_option_id
                  ? question.options?.find((o) => o.id === question.correct_option_id)?.label
                  : question.correct_value}
              </p>
            </div>

            {/* Smart Mark button */}
            <div className="relative group inline-block">
              <button
                type="button"
                disabled
                className="py-2.5 px-4 bg-gradient-to-r from-primary/10 to-info/10 text-primary/70 font-medium rounded-xl flex items-center gap-2 cursor-not-allowed opacity-60 text-sm"
              >
                <AppIcon name={ICONS.robot} />
                <span>Smart Mark my answer</span>
                <AppIcon name={ICONS.star} className="text-xs" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                Coming soon!
              </div>
            </div>

            {/* Mark scheme */}
            {question.mark_scheme && question.mark_scheme.length > 0 && (
              <div className="bg-info/10 border border-info/20 rounded-xl p-4">
                <h4 className="font-semibold text-info mb-2 flex items-center gap-2">
                  <AppIcon name={ICONS.idea} className="text-info" />
                  Mark Scheme
                </h4>
                <ul className="space-y-2">
                  {question.mark_scheme.map((item, i) => (
                    <li key={i} className="flex gap-2 text-info">
                      <span className="font-mono text-sm bg-info/10 px-2 py-0.5 rounded font-bold flex-shrink-0">
                        {item.code}
                      </span>
                      <span>{item.criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Explanation */}
            {question.explanation && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <h4 className="font-semibold text-primary mb-2">Explanation</h4>
                <p className="text-primary">{question.explanation}</p>
              </div>
            )}

            {/* Common mistakes */}
            {question.common_mistakes && question.common_mistakes.length > 0 && (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AppIcon name={ICONS.warning} className="text-warning" />
                  Common Mistakes to Avoid
                </h4>
                <ul className="space-y-1">
                  {question.common_mistakes.map((mistake, i) => (
                    <li key={i} className="text-warning flex items-start gap-2">
                      <span className="text-warning">•</span>
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Helper links row */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
              <button
                type="button"
                disabled
                className="text-primary hover:text-primary font-medium flex items-center gap-1.5 opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                <AppIcon name={ICONS.help} />
                <span>View related notes</span>
              </button>
              <button
                type="button"
                disabled
                className="px-4 py-2 bg-secondary text-muted-foreground rounded-lg font-medium flex items-center gap-2 opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                <AppIcon name={ICONS.play} />
                <span>Watch Solution</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {showAnswer && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={onNext}
            className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2"
          >
            {isLastQuestion ? "Finish practice" : "Next question"}
            <AppIcon name={ICONS.checkCircle} />
          </button>

          {!isLastQuestion && remainingQuestions > 1 && (
            <button
              type="button"
              onClick={onSkipToFinish}
              className="w-full py-3 text-muted-foreground hover:text-foreground font-medium transition text-sm"
            >
              Finish practice early ({remainingQuestions - 1} questions left)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
