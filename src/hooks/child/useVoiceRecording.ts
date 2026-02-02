// src/hooks/child/useVoiceRecording.ts
// Custom hook for handling voice recording with MediaRecorder
// Includes audio context, waveform analysis, and silence detection

import { useState, useRef, useCallback } from "react";

// =============================================================================
// Types
// =============================================================================

export interface UseVoiceRecordingReturn {
  isRecording: boolean;
  recordingTime: number;
  analyser: AnalyserNode | null;
  audioBlob: Blob | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearError: () => void;
}

// =============================================================================
// Helper: Get supported MIME type
// =============================================================================

function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

// =============================================================================
// Hook
// =============================================================================

export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Cleanup function
  const cleanupRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAnalyser(null);
    setRecordingTime(0);
    setIsRecording(false);
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (isRecording) return;

    setError(null);
    setAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Waveform analyser
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      // MediaRecorder
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const finalMimeType = mediaRecorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: finalMimeType });
        const durationSeconds =
          (Date.now() - recordingStartTimeRef.current) / 1000;

        cleanupRecording();

        if (durationSeconds > 0.5) {
          setAudioBlob(blob);
        } else {
          setError("Recording too short. Hold longer to speak.");
        }
      };

      mediaRecorder.start(100);
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          if (next >= 60) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error("[useVoiceRecording] Failed to start recording:", err);

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access.");
      } else {
        setError("Could not start recording. Please try again.");
      }

      cleanupRecording();
    }
  }, [isRecording, cleanupRecording, stopRecording]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isRecording,
    recordingTime,
    analyser,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    clearError,
  };
};
