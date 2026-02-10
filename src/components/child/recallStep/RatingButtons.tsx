// src/components/child/recallStep/RatingButtons.tsx
// Undo, Still Learning, and Know It button group

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import type { CardRating } from "@/types/child/recallStep";

type RatingButtonsProps = {
  onRate: (rating: CardRating) => void;
  onUndo: () => void;
  canUndo: boolean;
  saving: boolean;
};

function getRatingButtonIcons(): {
  undo: IconKey;
} {
  return {
    undo: "undo",
  };
}

export function RatingButtons({
  onRate,
  onUndo,
  canUndo,
  saving,
}: RatingButtonsProps) {
  const icons = getRatingButtonIcons();

  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-2 bg-neutral-0 rounded-full shadow-lg p-2">
        {/* Undo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="w-12 h-12 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 disabled:opacity-30 transition"
          aria-label="Undo last rating"
        >
          <span aria-hidden="true">
            <AppIcon name={icons.undo} />
          </span>
        </button>

        {/* Still learning */}
        <button
          type="button"
          onClick={() => onRate("learning")}
          disabled={saving}
          className="w-14 h-14 rounded-full bg-warning-50 hover:bg-warning-100 flex items-center justify-center text-2xl transition disabled:opacity-50"
          aria-label="Still learning"
        >
          <span aria-hidden="true">🤔</span>
        </button>

        {/* Know it */}
        <button
          type="button"
          onClick={() => onRate("known")}
          disabled={saving}
          className="w-14 h-14 rounded-full bg-success-50 hover:bg-success-100 flex items-center justify-center text-2xl transition disabled:opacity-50"
          aria-label="I know this"
        >
          <span aria-hidden="true">😃</span>
        </button>
      </div>
    </div>
  );
}
