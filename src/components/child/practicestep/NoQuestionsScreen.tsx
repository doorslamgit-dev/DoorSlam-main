// src/components/child/practicestep/NoQuestionsScreen.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface NoQuestionsScreenProps {
  onNext: () => void;
}

const ICONS: { empty: IconKey } = {
  empty: "questionCircle",
};

export function NoQuestionsScreen({ onNext }: NoQuestionsScreenProps) {
  return (
    <div className="bg-background rounded-2xl shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
        <AppIcon name={ICONS.empty} className="text-muted-foreground text-2xl" />
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2">
        No practice questions yet
      </h2>

      <p className="text-muted-foreground mb-6">
        We don't have practice questions ready for this topic. Let's move on!
      </p>

      <button
        type="button"
        onClick={onNext}
        className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition"
      >
        Continue
      </button>
    </div>
  );
}
