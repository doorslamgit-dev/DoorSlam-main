// src/components/child/practicestep/IntroScreen.tsx

import { StepIntroScreen } from "../session/StepIntroScreen";

interface IntroScreenProps {
  topicName: string;
  totalQuestions: number;
  onStart: () => void;
}

export function IntroScreen({ topicName, totalQuestions, onStart }: IntroScreenProps) {
  return (
    <StepIntroScreen
      icon="pencil"
      title="Time to practise!"
      description={
        <>
          Let's see how much you've learned about{" "}
          <span className="font-semibold text-primary">{topicName}</span>.
        </>
      }
      detail={`${totalQuestions} question${totalQuestions !== 1 ? "s" : ""} ready – you can always do more if you want!`}
      buttonLabel="Let's do this!"
      onStart={onStart}
    />
  );
}
