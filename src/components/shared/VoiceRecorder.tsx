// src/components/shared/VoiceRecorder.tsx
// FEAT-011 Phase 3c: Shared voice recording component
//
// Features:
// - PTT (push-to-talk) and toggle recording modes
// - Real-time waveform visualisation via AudioWaveform
// - Client-side silence detection
// - Cross-browser audio format handling (WebM/MP4)
// - Optional playback controls
// - Configurable max duration

import { useState, useRef, useEffect, useCallback } from "react";
import AudioWaveform from "./AudioWaveform";
import AppIcon from "../ui/AppIcon";
import { COLORS } from "../../constants/colors";

// =============================================================================
// Types
// =============================================================================

export interface RecordingData {
  blob: Blob;
  url: string;
  durationSeconds: number;
  mimeType: string;
}

export interface ExistingRecording {
  url: string;
  durationSeconds: number;
}

export interface VoiceRecorderProps {
  /** Called when recording completes successfully */
  onRecordingComplete: (data: RecordingData) => void;
  /** Called when recording starts */
  onRecordingStart?: () => void;
  /** Called when recording is cancelled */
  onRecordingCancel?: () => void;
  /** Called when silence is detected (no audio captured) */
  onSilenceDetected?: () => void;
  /** Called when an existing recording is deleted */
  onDelete?: () => void;
  /** Maximum recording duration in seconds */
  maxDurationSeconds?: number;
  /** Whether the recorder is disabled */
  disabled?: boolean;
  /** Recording mode: 'ptt' (hold to record) or 'toggle' (tap start/stop) */
  variant: "ptt" | "toggle";
  /** Show playback controls after recording */
  showPlayback?: boolean;
  /** Existing recording to display (for edit scenarios) */
  existingRecording?: ExistingRecording;
  /** dB threshold for silence detection (-50 default, lower = more sensitive) */
  silenceThreshold?: number;
  /** Waveform bar color */
  waveformColor?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes for the container */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_MAX_DURATION = 60; // seconds
const DEFAULT_SILENCE_THRESHOLD = -50; // dB

// Size configurations
const SIZE_CONFIG = {
  sm: {
    button: "w-10 h-10",
    icon: "w-4 h-4",
    waveformWidth: 80,
    waveformHeight: 24,
  },
  md: {
    button: "w-14 h-14",
    icon: "w-5 h-5",
    waveformWidth: 120,
    waveformHeight: 36,
  },
  lg: {
    button: "w-16 h-16",
    icon: "w-6 h-6",
    waveformWidth: 160,
    waveformHeight: 44,
  },
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function getSupportedMimeType(): string {
  // Check for supported MIME types in order of preference
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/wav",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }

  // Fallback - let browser decide
  return "";
}

// =============================================================================
// Component
// =============================================================================

export default function VoiceRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingCancel,
  onSilenceDetected,
  onDelete,
  maxDurationSeconds = DEFAULT_MAX_DURATION,
  disabled = false,
  variant,
  showPlayback = false,
  existingRecording,
  silenceThreshold = DEFAULT_SILENCE_THRESHOLD,
  waveformColor = COLORS.accent.purple,
  size = "md",
  className = "",
}: VoiceRecorderProps) {
  // =========================================================================
  // State
  // =========================================================================

  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [recordingData, setRecordingData] = useState<RecordingData | null>(
    existingRecording
      ? {
          blob: new Blob(), // Placeholder - we only have URL
          url: existingRecording.url,
          durationSeconds: existingRecording.durationSeconds,
          mimeType: "",
        }
      : null
  );
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  // =========================================================================
  // Refs
  // =========================================================================

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimeRef = useRef<number>(0);
  const peakLevelRef = useRef<number>(-Infinity);

  const sizeConfig = SIZE_CONFIG[size];

  // =========================================================================
  // Cleanup
  // =========================================================================

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setAnalyser(null);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // =========================================================================
  // Audio Playback
  // =========================================================================

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentPlaybackTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPreviewing(false);
      setCurrentPlaybackTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [recordingData?.url]);

  // =========================================================================
  // Recording Functions
  // =========================================================================

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    peakLevelRef.current = -Infinity;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context for waveform and silence detection
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      source.connect(analyserNode);

      analyserRef.current = analyserNode;
      setAnalyser(analyserNode);

      // Start monitoring audio levels for silence detection
      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

      const checkLevels = () => {
        if (!analyserRef.current) return;

        analyserNode.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const dB = average > 0 ? 20 * Math.log10(average / 255) : -Infinity;

        if (dB > peakLevelRef.current) {
          peakLevelRef.current = dB;
        }
      };

      // Set up MediaRecorder
      const mimeType = getSupportedMimeType();
      const options = mimeType ? ({ mimeType } as MediaRecorderOptions) : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
        checkLevels();
      };

      mediaRecorder.onstop = () => {
        const finalMimeType = mediaRecorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: finalMimeType });
        const url = URL.createObjectURL(blob);
        const finalDuration = recordingTimeRef.current;

        // Check for silence
        if (peakLevelRef.current < silenceThreshold) {
          // eslint-disable-next-line no-console
          console.log("[VoiceRecorder] Silence detected, peak:", peakLevelRef.current);
          URL.revokeObjectURL(url);
          onSilenceDetected?.();
          setError("I didn't catch that. Try again?");
          cleanup();
          return;
        }

        const data: RecordingData = {
          blob,
          url,
          durationSeconds: finalDuration,
          mimeType: finalMimeType,
        };

        setRecordingData(data);
        onRecordingComplete(data);
        cleanup();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms for level monitoring
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      onRecordingStart?.();

      // Start timer
      timerRef.current = setInterval(() => {
        checkLevels();
        recordingTimeRef.current += 1;

        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDurationSeconds) {
            stopRecording();
            return prev;
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[VoiceRecorder] Failed to start recording:", err);

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access.");
      } else {
        setError("Could not start recording. Please try again.");
      }

      cleanup();
    }
  }, [
    cleanup,
    maxDurationSeconds,
    onRecordingComplete,
    onRecordingStart,
    onSilenceDetected,
    silenceThreshold,
    stopRecording,
  ]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      audioChunksRef.current = []; // Discard recorded data

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      cleanup();
      onRecordingCancel?.();
    }
  }, [cleanup, isRecording, onRecordingCancel]);

  // =========================================================================
  // Playback Functions
  // =========================================================================

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !recordingData?.url) return;

    if (isPreviewing) {
      audio.pause();
      setIsPreviewing(false);
    } else {
      audio.currentTime = 0;
      setCurrentPlaybackTime(0);
      void audio.play();
      setIsPreviewing(true);
    }
  }, [isPreviewing, recordingData?.url]);

  const handleDelete = useCallback(() => {
    if (recordingData?.url && !existingRecording) {
      URL.revokeObjectURL(recordingData.url);
    }
    setRecordingData(null);
    setRecordingTime(0);
    setCurrentPlaybackTime(0);
    setError(null);
    onDelete?.();
  }, [existingRecording, onDelete, recordingData]);

  // =========================================================================
  // PTT Handlers
  // =========================================================================

  const handlePTTStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (disabled || isRecording) return;
      void startRecording();
    },
    [disabled, isRecording, startRecording]
  );

  const handlePTTEnd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (isRecording) stopRecording();
    },
    [isRecording, stopRecording]
  );

  // =========================================================================
  // Toggle Handler
  // =========================================================================

  const handleToggle = useCallback(() => {
    if (disabled) return;

    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }, [disabled, isRecording, startRecording, stopRecording]);

  // =========================================================================
  // Render: Recording State
  // =========================================================================

  if (isRecording) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Waveform */}
        <AudioWaveform
          analyser={analyser}
          isActive={isRecording}
          width={sizeConfig.waveformWidth}
          height={sizeConfig.waveformHeight}
          barColor={waveformColor}
          barCount={16}
        />

        {/* Timer */}
        <div className="text-sm font-medium text-neutral-700 min-w-[40px]">
          {formatTime(recordingTime)}
        </div>

        {/* Stop Button */}
        {variant === "toggle" ? (
          <button
            type="button"
            onClick={handleToggle}
            className={`${sizeConfig.button} rounded-full bg-red-500 flex items-center justify-center transition hover:bg-red-600 animate-pulse`}
            aria-label="Stop recording"
          >
            <AppIcon name="stop" className={`text-white ${sizeConfig.icon}`} />
          </button>
        ) : (
          <button
            type="button"
            onMouseUp={handlePTTEnd}
            onMouseLeave={handlePTTEnd}
            onTouchEnd={handlePTTEnd}
            className={`${sizeConfig.button} rounded-full bg-red-500 flex items-center justify-center transition animate-pulse`}
            aria-label="Release to stop recording"
          >
            <AppIcon name="mic" className={`text-white ${sizeConfig.icon}`} />
          </button>
        )}

        {/* Max duration indicator */}
        <div className="text-xs text-neutral-400">
          max {formatTime(maxDurationSeconds)}
        </div>

        {/* Optional: cancel (if you ever want it exposed) */}
        {/* <button type="button" onClick={cancelRecording}>Cancel</button> */}
      </div>
    );
  }

  // =========================================================================
  // Render: Playback State (has recording)
  // =========================================================================

  if (recordingData && showPlayback) {
    const progressPercent =
      recordingData.durationSeconds > 0
        ? (currentPlaybackTime / recordingData.durationSeconds) * 100
        : 0;

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {recordingData.url && (
          <audio ref={audioRef} src={recordingData.url} preload="metadata" />
        )}

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlayback}
          disabled={disabled}
          className={`${sizeConfig.button} rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center transition flex-shrink-0 disabled:opacity-50`}
          aria-label={isPreviewing ? "Pause playback" : "Play recording"}
        >
          <AppIcon
            name={isPreviewing ? "pause" : "play"}
            className={`text-white ${sizeConfig.icon}`}
          />
        </button>

        {/* Progress and Time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-neutral-700">
              Voice note recorded ✓
            </span>
            <span className="text-xs text-neutral-500">
              {formatTime(currentPlaybackTime)} /{" "}
              {formatTime(recordingData.durationSeconds)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={disabled}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-red-100 transition flex-shrink-0 disabled:opacity-50"
          aria-label="Delete recording"
        >
          <AppIcon name="trash" className="w-4 h-4 text-neutral-500" />
        </button>
      </div>
    );
  }

  // =========================================================================
  // Render: Error State
  // =========================================================================

  if (error) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 text-sm text-red-600">{error}</div>
        <button
          type="button"
          onClick={() => setError(null)}
          disabled={disabled}
          className={`${sizeConfig.button} rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition disabled:opacity-50`}
          aria-label="Try again"
        >
          <AppIcon name="rotate-cw" className={`text-neutral-600 ${sizeConfig.icon}`} />
        </button>
      </div>
    );
  }

  // =========================================================================
  // Render: Idle State (ready to record)
  // =========================================================================

  if (variant === "ptt") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          type="button"
          onMouseDown={handlePTTStart}
          onTouchStart={handlePTTStart}
          onMouseUp={handlePTTEnd}
          onMouseLeave={handlePTTEnd}
          onTouchEnd={handlePTTEnd}
          disabled={disabled}
          className={`${sizeConfig.button} rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed select-none`}
          title="Hold to record"
          aria-label="Hold to record"
        >
          <AppIcon name="mic" className={`text-white ${sizeConfig.icon}`} />
        </button>
        <span className="text-sm text-neutral-500">Hold to speak</span>
      </div>
    );
  }

  // Toggle variant - idle state
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`${sizeConfig.button} rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Tap to start recording"
        aria-label="Tap to start recording"
      >
        <AppIcon name="mic" className={`text-white ${sizeConfig.icon}`} />
      </button>
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-700">Record a voice note</p>
        <p className="text-xs text-neutral-500">Say what you learned in your own words</p>
      </div>
    </div>
  );
}
