// src/components/child/reinforcestep/IntroScreen.tsx

import { StepIntroScreen } from "../session/StepIntroScreen";

interface IntroScreenProps {
  topicName: string;
  slideCount: number;
  exampleCount: number;
  onStart: () => void;
}

export function IntroScreen({ topicName, slideCount, exampleCount, onStart }: IntroScreenProps) {
  const parts = [
    slideCount > 0 ? `${slideCount} quick explanation${slideCount > 1 ? "s" : ""}` : null,
    exampleCount > 0 ? `${exampleCount} worked example${exampleCount > 1 ? "s" : ""}` : null,
  ].filter(Boolean);

  return (
    <StepIntroScreen
      icon="bookOpen"
      title="Time to learn!"
      description={
        <>
          Let's explore the key ideas about{" "}
          <span className="font-semibold text-primary">{topicName}</span>.
        </>
      }
      detail={parts.join(" + ")}
      buttonLabel="Let's learn!"
      onStart={onStart}
    />
  );
}
