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
    <div className="bg-white rounded-2xl shadow-card p-8 text-center">
      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AppIcon name={ICONS.practice} className="text-purple-600 text-3xl" />
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 mb-3">
        Time to practise!
      </h2>

      <p className="text-lg text-neutral-600 mb-2">
        Let's see how much you've learned about{" "}
        <span className="font-semibold text-primary-600">{topicName}</span>.
      </p>

      <p className="text-neutral-500 mb-8">
        {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} ready – you can
        always do more if you want!
      </p>

      <button
        type="button"
        onClick={onStart}
        className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition text-lg"
      >
        Let’s do this!
      </button>
    </div>
  );
}
