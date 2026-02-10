// src/components/child/reinforcestep/NoContentScreen.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface NoContentScreenProps {
  onNext: () => void;
}

function getNoContentIconKeys(): { bookOpen: IconKey } {
  return {
    bookOpen: "bookOpen",
  };
}

export function NoContentScreen({ onNext }: NoContentScreenProps) {
  const icons = getNoContentIconKeys();

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-8 text-center">
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-neutral-500 text-2xl" aria-hidden="true">
          <AppIcon name={icons.bookOpen} />
        </span>
      </div>

      <h2 className="text-xl font-bold text-neutral-900 mb-2">Let's skip ahead!</h2>
      <p className="text-neutral-600 mb-6">
        We don't have teaching content ready for this topic yet. Let's go straight to practice!
      </p>

      <button
        type="button"
        onClick={onNext}
        className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition"
      >
        Continue to Practice
      </button>
    </div>
  );
}
