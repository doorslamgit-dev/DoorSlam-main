// src/components/child/recallStep/IntroScreen.tsx

import { StepIntroScreen } from "../session/StepIntroScreen";

type IntroScreenProps = {
  childName: string;
  topicName: string;
  totalCards: number;
  onStart: () => void;
};

export function IntroScreen({ childName, topicName, totalCards, onStart }: IntroScreenProps) {
  const firstName = childName?.split(" ")[0] || "there";

  return (
    <StepIntroScreen
      icon="lightbulb"
      title={`Hey ${firstName}!`}
      description={
        <>
          Before we start, let's have some fun and see what you already know about{" "}
          <span className="font-semibold text-primary">{topicName}</span>!
        </>
      }
      detail={`${totalCards} quick questions – no pressure, just do your best!`}
      buttonLabel="Let's go!"
      buttonIcon="rocket"
      onStart={onStart}
    />
  );
}
