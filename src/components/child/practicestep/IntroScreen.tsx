// src/components/child/practicestep/IntroScreen.tsx

import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

interface IntroScreenProps {
  topicName: string;
  totalQuestions: number;
  onStart: () => void;
}

const ICONS: { practice: IconKey } = {
  practice: "pencil",
};

export function IntroScreen({
  topicName,
  totalQuestions,
  onStart,
}: IntroScreenProps) {
  return (
    <div className="bg-background rounded-2xl shadow-sm p-8 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <AppIcon name={ICONS.practice} className="text-primary text-3xl" />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-3">
        Time to practise!
      </h2>

      <p className="text-lg text-muted-foreground mb-2">
        Let's see how much you've learned about{" "}
        <span className="font-semibold text-primary">{topicName}</span>.
      </p>

      <p className="text-muted-foreground mb-8">
        {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} ready – you can
        always do more if you want!
      </p>

      <button
        type="button"
        onClick={onStart}
        className="px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition text-lg"
      >
        Let’s do this!
      </button>
    </div>
  );
}
