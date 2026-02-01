// src/hooks/child/completestep/useCompleteStep.ts

import { useState, useCallback } from "react";
import { ConfidenceLevel, AudioNoteData } from "../../../types/child/completestep";

interface UseCompleteStepProps {
  initialPostConfidence?: ConfidenceLevel | null;
  initialJournalNote?: string;
  initialAudioUrl?: string | null;
  initialAudioDuration?: number;
}

export function useCompleteStep({
  initialPostConfidence,
  initialJournalNote,
  initialAudioUrl,
  initialAudioDuration,
}: UseCompleteStepProps) {
  const [postConfidence, setPostConfidence] = useState<ConfidenceLevel | null>(
    initialPostConfidence ?? null
  );
  const [journalNote, setJournalNote] = useState(initialJournalNote ?? "");
  const [audioData, setAudioData] = useState<AudioNoteData>({
    blob: null,
    url: initialAudioUrl ?? null,
    durationSeconds: initialAudioDuration ?? 0,
  });

  const canFinish = postConfidence !== null;

  const handleConfidenceSelect = useCallback((level: ConfidenceLevel) => {
    setPostConfidence(level);
  }, []);

  const handleJournalChange = useCallback((value: string) => {
    setJournalNote(value);
  }, []);

  const handleAudioRecorded = useCallback((data: AudioNoteData) => {
    setAudioData(data);
  }, []);

  const handleAudioDelete = useCallback(() => {
    setAudioData({ blob: null, url: null, durationSeconds: 0 });
  }, []);

  return {
    postConfidence,
    journalNote,
    audioData,
    canFinish,
    handleConfidenceSelect,
    handleJournalChange,
    handleAudioRecorded,
    handleAudioDelete,
  };
}
