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
          <span className="bg-primary-600 text-white text-sm font-bold px-3 py-1 rounded-full">
            Q{questionNumber}
          </span>
          <span className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
            {question.marks} mark{question.marks !== 1 ? "s" : ""}
          </span>
          {question.difficulty && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyColor}`}>
              {difficultyLabel}
            </span>
          )}
        </div>
        <span className="text-neutral-500 text-sm">
          {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Question text */}
        <div className="p-6 border-b border-neutral-100">
          <p className="text-lg text-neutral-900 leading-relaxed">{question.text}</p>
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
                            ? "border-primary-500 bg-primary-50"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }
                      `}
                    >
                      <span className="font-semibold text-primary-600 mr-3">
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
                  className="w-full p-4 text-lg border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                />
              ) : (
                <textarea
                  value={userAnswer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  placeholder="Write your answer..."
                  rows={4}
                  className="w-full p-4 text-lg border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none transition resize-none"
                />
              )}

              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                className="mt-4 w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition disabled:opacity-50 disabled:hover:bg-primary-600"
              >
                Check my answer
              </button>

              {/* Stuck? Helper row */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  disabled
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  <AppIcon name={ICONS.help} />
                  <span>Stuck? View related notes</span>
                </button>
                <button
                  type="button"
                  disabled
                  className="text-neutral-500 hover:text-neutral-700 font-medium flex items-center gap-1.5 opacity-50 cursor-not-allowed"
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
              <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-neutral-500 mb-1">Your answer:</p>
                <p className="text-neutral-900 font-medium">
                  {question.questionType === "multiple_choice"
                    ? question.options?.find((o) => o.id === userAnswer)?.label || userAnswer
                    : userAnswer}
                </p>
              </div>

              {/* Self-assessment */}
              {!selfAssessment && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <p className="text-blue-900 font-medium mb-4 text-center">
                    How do you think you did? Select to see the answer:
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => onSelfAssess("got_it")}
                      className="flex-1 max-w-[140px] py-4 px-4 bg-white hover:bg-green-50 border-2 border-green-200 hover:border-green-400 text-green-700 rounded-xl transition flex flex-col items-center gap-2 shadow-sm"
                    >
                      <span className="text-2xl">😊</span>
                      <span className="text-sm font-semibold">Nailed it!</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelfAssess("unsure")}
                      className="flex-1 max-w-[140px] py-4 px-4 bg-white hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-400 text-amber-700 rounded-xl transition flex flex-col items-center gap-2 shadow-sm"
                    >
                      <span className="text-2xl">🤔</span>
                      <span className="text-sm font-semibold">Not sure</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelfAssess("not_quite")}
                      className="flex-1 max-w-[140px] py-4 px-4 bg-white hover:bg-red-50 border-2 border-red-200 hover:border-red-400 text-red-700 rounded-xl transition flex flex-col items-center gap-2 shadow-sm"
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
          <div className="border-t border-neutral-200 p-6 bg-neutral-50 space-y-4">
            {/* Self-assessment result badge */}
            <div
              className={`p-3 rounded-xl text-center ${
                selfAssessment === "got_it"
                  ? "bg-green-100 text-green-800"
                  : selfAssessment === "not_quite"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
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
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <AppIcon name={ICONS.checkCircle} className="text-green-600" />
                Correct Answer
              </h4>
              <p className="text-green-800 font-medium text-lg">
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
                className="py-2.5 px-4 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-400 font-medium rounded-xl flex items-center gap-2 cursor-not-allowed opacity-60 text-sm"
              >
                <AppIcon name={ICONS.robot} />
                <span>Smart Mark my answer</span>
                <AppIcon name={ICONS.star} className="text-xs" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                Coming soon!
              </div>
            </div>

            {/* Mark scheme */}
            {question.mark_scheme && question.mark_scheme.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AppIcon name={ICONS.idea} className="text-blue-600" />
                  Mark Scheme
                </h4>
                <ul className="space-y-2">
                  {question.mark_scheme.map((item, i) => (
                    <li key={i} className="flex gap-2 text-blue-800">
                      <span className="font-mono text-sm bg-blue-100 px-2 py-0.5 rounded font-bold flex-shrink-0">
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
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Explanation</h4>
                <p className="text-purple-800">{question.explanation}</p>
              </div>
            )}

            {/* Common mistakes */}
            {question.common_mistakes && question.common_mistakes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AppIcon name={ICONS.warning} className="text-amber-600" />
                  Common Mistakes to Avoid
                </h4>
                <ul className="space-y-1">
                  {question.common_mistakes.map((mistake, i) => (
                    <li key={i} className="text-amber-800 flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Helper links row */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-neutral-200">
              <button
                type="button"
                disabled
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                <AppIcon name={ICONS.help} />
                <span>View related notes</span>
              </button>
              <button
                type="button"
                disabled
                className="px-4 py-2 bg-neutral-100 text-neutral-500 rounded-lg font-medium flex items-center gap-2 opacity-50 cursor-not-allowed"
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
            className="w-full py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2"
          >
            {isLastQuestion ? "Finish practice" : "Next question"}
            <AppIcon name={ICONS.checkCircle} />
          </button>

          {!isLastQuestion && remainingQuestions > 1 && (
            <button
              type="button"
              onClick={onSkipToFinish}
              className="w-full py-3 text-neutral-500 hover:text-neutral-700 font-medium transition text-sm"
            >
              Finish practice early ({remainingQuestions - 1} questions left)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
