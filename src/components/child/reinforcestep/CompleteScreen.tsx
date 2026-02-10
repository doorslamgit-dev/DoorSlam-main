// src/components/child/reinforcestep/CompleteScreen.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface CompleteScreenProps {
  slideCount: number;
  exampleCount: number;
  onContinue: () => void;
  saving: boolean;
}

function getCompleteScreenIcons(): { continue: IconKey } {
  return {
    continue: "arrowRight",
  };
}

export function CompleteScreen({
  slideCount,
  exampleCount,
  onContinue,
  saving,
}: CompleteScreenProps) {
  const icons = getCompleteScreenIcons();

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-8 text-center">
      {/* Decorative hero icon */}
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-primary-600 text-3xl" aria-hidden="true">
          🧠
        </span>
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 mb-3">
        Brilliant! You've learned the key ideas!
      </h2>

      <p className="text-neutral-600 mb-6">
        You've worked through{" "}
        {slideCount > 0 && `${slideCount} explanation${slideCount > 1 ? "s" : ""}`}
        {slideCount > 0 && exampleCount > 0 && " and "}
        {exampleCount > 0 &&
          `${exampleCount} worked example${exampleCount > 1 ? "s" : ""}`}.
      </p>

      <p className="text-neutral-500 mb-8">
        Now it's time to put what you've learned into practice!
      </p>

      <button
        type="button"
        onClick={onContinue}
        disabled={saving}
        className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition text-lg disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
        aria-label="Continue to practice"
      >
        <span>Let's practice!</span>
        <span aria-hidden="true">
          <AppIcon name={icons.continue} />
        </span>
      </button>
    </div>
  );
}
