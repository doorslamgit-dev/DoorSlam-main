// src/components/child/reinforcestep/IntroScreen.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface IntroScreenProps {
  topicName: string;
  slideCount: number;
  exampleCount: number;
  onStart: () => void;
}

function getIntroIconKeys(): { intro: IconKey } {
  return {
    intro: "bookOpen",
  };
}

export function IntroScreen({
  topicName,
  slideCount,
  exampleCount,
  onStart,
}: IntroScreenProps) {
  const icons = getIntroIconKeys();

  return (
    <div className="bg-neutral-0 rounded-2xl shadow-card p-8 text-center">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-primary-600 text-3xl" aria-hidden="true">
          <AppIcon name={icons.intro} />
        </span>
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 mb-3">
        Time to learn!
      </h2>

      <p className="text-lg text-neutral-600 mb-2">
        Let's explore the key ideas about{" "}
        <span className="font-semibold text-primary-600">{topicName}</span>.
      </p>

      <p className="text-neutral-500 mb-8">
        {slideCount > 0 && `${slideCount} quick explanation${slideCount > 1 ? "s" : ""}`}
        {slideCount > 0 && exampleCount > 0 && " + "}
        {exampleCount > 0 &&
          `${exampleCount} worked example${exampleCount > 1 ? "s" : ""}`}
      </p>

      <button
        type="button"
        onClick={onStart}
        className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition text-lg"
      >
        Let's learn!
      </button>
    </div>
  );
}
