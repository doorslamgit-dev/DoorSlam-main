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
    <div className="bg-background rounded-2xl shadow-sm p-8 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-primary text-3xl" aria-hidden="true">
          <AppIcon name={icons.intro} />
        </span>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-3">
        Time to learn!
      </h2>

      <p className="text-lg text-muted-foreground mb-2">
        Let's explore the key ideas about{" "}
        <span className="font-semibold text-primary">{topicName}</span>.
      </p>

      <p className="text-muted-foreground mb-8">
        {slideCount > 0 && `${slideCount} quick explanation${slideCount > 1 ? "s" : ""}`}
        {slideCount > 0 && exampleCount > 0 && " + "}
        {exampleCount > 0 &&
          `${exampleCount} worked example${exampleCount > 1 ? "s" : ""}`}
      </p>

      <button
        type="button"
        onClick={onStart}
        className="px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition text-lg"
      >
        Let's learn!
      </button>
    </div>
  );
}
