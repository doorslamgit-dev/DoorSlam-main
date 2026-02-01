// src/components/child/completestep/AudioRecorder.tsx

import { useRef, useState, useEffect } from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { AudioNoteData } from "../../../types/child/completestep";

interface AudioRecorderProps {
  existingUrl: string | null;
  existingDuration: number;
  onRecordingComplete: (data: AudioNoteData) => void;
  onDelete: () => void;
  disabled: boolean;
}

export function AudioRecorder({
  existingUrl,
  existingDuration,
  onRecordingComplete,
  onDelete,
  disabled,
}: AudioRecorderProps) {
  const micIcon: IconKey = "microphone";
  const stopIcon: IconKey = "stop";
  const playIcon: IconKey = "play";
  const pauseIcon: IconKey = "pause";
  const trashIcon: IconKey = "trash";

  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [audioData, setAudioData] = useState<AudioNoteData>({
    blob: null,
    url: existingUrl,
    durationSeconds: existingDuration,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioData.url && !existingUrl) URL.revokeObjectURL(audioData.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentPlaybackTime(Math.floor(audio.currentTime));
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
  }, [audioData.url]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingTimeRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const finalDuration = recordingTimeRef.current;

        const newAudioData: AudioNoteData = {
          blob,
          url,
          durationSeconds: finalDuration,
        };

        setAudioData(newAudioData);
        onRecordingComplete(newAudioData);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= 60) {
            stopRecording();
            return prev;
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[AudioRecorder] Failed to start recording:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  function togglePreview() {
    if (!audioRef.current || !audioData.url) return;

    if (isPreviewing) {
      audioRef.current.pause();
      setIsPreviewing(false);
    } else {
      audioRef.current.currentTime = 0;
      setCurrentPlaybackTime(0);
      void audioRef.current.play();
      setIsPreviewing(true);
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !audioData.durationSeconds) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioData.durationSeconds;

    audioRef.current.currentTime = newTime;
    setCurrentPlaybackTime(Math.floor(newTime));
  }

  function handleDelete() {
    if (audioData.url && !existingUrl) {
      URL.revokeObjectURL(audioData.url);
    }
    setAudioData({ blob: null, url: null, durationSeconds: 0 });
    setRecordingTime(0);
    setCurrentPlaybackTime(0);
    setIsPreviewing(false);
    onDelete();
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  const hasRecording = audioData.url !== null;
  const progressPercentage =
    audioData.durationSeconds > 0
      ? (currentPlaybackTime / audioData.durationSeconds) * 100
      : 0;

  return (
    <div className="p-5 bg-neutral-50 rounded-xl">
      {audioData.url && <audio ref={audioRef} src={audioData.url} />}

      {!hasRecording ? (
        <div className="text-center">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition ${
              isRecording ? "bg-accent-red animate-pulse" : "bg-primary-600 hover:bg-primary-700"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            <AppIcon
              name={isRecording ? stopIcon : micIcon}
              className="text-white text-xl"
              aria-hidden
            />
          </button>

          {isRecording ? (
            <>
              <p className="font-semibold text-neutral-900 mb-1">
                Recording... {formatTime(recordingTime)}
              </p>
              <p className="text-neutral-500 text-sm">Tap to stop (max 60s)</p>

              <div className="mt-3 w-full max-w-[200px] mx-auto">
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-red transition-all duration-1000 ease-linear"
                    style={{ width: `${(recordingTime / 60) * 100}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="font-medium text-neutral-700 mb-1">Record a voice note</p>
              <p className="text-neutral-500 text-sm">Say what you learned in your own words</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePreview}
              className="w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center transition flex-shrink-0"
              aria-label={isPreviewing ? "Pause playback" : "Play recording"}
              title={isPreviewing ? "Pause" : "Play"}
            >
              <AppIcon
                name={isPreviewing ? pauseIcon : playIcon}
                className="text-white text-lg"
                aria-hidden
              />
            </button>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-700">Voice note recorded ✓</p>
              <p className="text-sm text-neutral-500">
                {formatTime(currentPlaybackTime)} / {formatTime(audioData.durationSeconds)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={disabled}
              className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center hover:bg-accent-red/10 hover:text-accent-red transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Delete recording"
              title="Delete"
            >
              <AppIcon name={trashIcon} className="text-neutral-500" aria-hidden />
            </button>
          </div>

          <div
            className="h-1.5 bg-neutral-200 rounded-full overflow-hidden cursor-pointer"
            onClick={handleProgressClick}
            role="button"
            tabIndex={0}
            aria-label="Seek playback position"
            title="Click to seek"
          >
            <div
              className="h-full bg-primary-600 transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
