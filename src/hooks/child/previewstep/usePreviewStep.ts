// src/hooks/child/previewstep/usePreviewStep.ts

import { useState, useCallback, useMemo } from "react";
import { ConfidenceLevel, PreviewPayload } from "../../../types/child/previewstep";

interface UsePreviewStepProps {
  initialPayload?: PreviewPayload;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
  onNext: () => Promise<void>;
}

export function usePreviewStep({ initialPayload, onPatch, onNext }: UsePreviewStepProps) {
  const [preConfidence, setPreConfidence] = useState<ConfidenceLevel | null>(
    initialPayload?.preConfidence ?? null
  );
  const [socialMediaOff, setSocialMediaOff] = useState<boolean>(
    initialPayload?.socialMediaOff ?? false
  );
  const [isStarting, setIsStarting] = useState(false);

  const canStart = useMemo(() => preConfidence !== null, [preConfidence]);

  const handleConfidenceSelect = useCallback((level: ConfidenceLevel) => {
    setPreConfidence(level);
  }, []);

  const handleSocialMediaToggle = useCallback(() => {
    setSocialMediaOff((prev) => !prev);
  }, []);

  const handleStart = useCallback(async () => {
    if (!canStart || isStarting) return;

    setIsStarting(true);
    try {
      await onPatch({
        preview: {
          preConfidence,
          socialMediaOff,
          started_at: new Date().toISOString(),
        },
      });
      await onNext();
    } finally {
      setIsStarting(false);
    }
  }, [canStart, isStarting, preConfidence, socialMediaOff, onPatch, onNext]);

  return {
    state: {
      preConfidence,
      socialMediaOff,
      isStarting,
    },
    derived: {
      canStart,
    },
    handlers: {
      handleConfidenceSelect,
      handleSocialMediaToggle,
      handleStart,
    },
  };
}
