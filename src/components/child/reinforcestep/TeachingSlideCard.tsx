// src/components/child/reinforcestep/TeachingSlideCard.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { TeachingSlide } from "../../../types/child/reinforcestep";

interface TeachingSlideCardProps {
  slide: TeachingSlide;
  currentIndex: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  isLastSlide: boolean;
}

function getTeachingSlideIconKeys() {
  return {
    bookOpen: "bookOpen" as IconKey,
    lightbulb: "lightbulb" as IconKey,
    graduationCap: "graduationCap" as IconKey,
    arrowLeft: "arrowLeft" as IconKey,
    arrowRight: "arrowRight" as IconKey,
  };
}

export function TeachingSlideCard({
  slide,
  currentIndex,
  totalSlides,
  onPrevious,
  onNext,
  isLastSlide,
}: TeachingSlideCardProps) {
  const icons = getTeachingSlideIconKeys();

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span className="flex items-center gap-2">
          <span className="text-info" aria-hidden="true">
            <AppIcon name={icons.bookOpen} />
          </span>
          Explanation {currentIndex + 1} of {totalSlides}
        </span>

        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex
                  ? "bg-info"
                  : i < currentIndex
                  ? "bg-blue-300"
                  : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main slide card */}
      <div className="bg-neutral-0 rounded-2xl shadow-card overflow-hidden">
        {/* Title bar */}
        <div className="bg-info px-6 py-4">
          <h3 className="text-xl font-bold text-white">{slide.title}</h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main explanation */}
          <p className="text-neutral-700 text-lg leading-relaxed">{slide.content}</p>

          {/* Key points */}
          {slide.key_points && slide.key_points.length > 0 && (
            <div className="bg-info-bg rounded-xl p-4">
              <h4 className="font-semibold text-info mb-3 flex items-center gap-2">
                <span className="text-info" aria-hidden="true">
                  <AppIcon name={icons.lightbulb} />
                </span>
                Key Points
              </h4>
              <ul className="space-y-2">
                {slide.key_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-info">
                    <span className="text-info mt-1" aria-hidden="true">
                      •
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Examiner tip */}
          {slide.examiner_tip && (
            <div className="bg-warning-bg border border-warning-border rounded-xl p-4">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <span className="text-warning" aria-hidden="true">
                  <AppIcon name={icons.graduationCap} />
                </span>
                Exam Tip
              </h4>
              <p className="text-warning text-sm">{slide.examiner_tip}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <AppIcon name={icons.arrowLeft} aria-hidden />
          Previous
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition"
        >
          {isLastSlide ? "Next" : "Continue"}
          <AppIcon name={icons.arrowRight} aria-hidden />
        </button>
      </div>
    </div>
  );
}
