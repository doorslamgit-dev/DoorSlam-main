// src/components/child/studyBuddy/StudyBuddyPanel.tsx
// FEAT-011: Study Buddy AI Chatbot
// Phase 1-2: Text chat with context awareness
// Phase 3: Voice input with PTT (Push-to-Talk)
// Phase 4: Voice output with TTS (Text-to-Speech)
//
// UPDATED: January 2026 - Added play button on buddy messages

import React, { useState, useRef, useEffect, useCallback } from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { studyBuddyService } from "../../../services/child/studyBuddy/studyBuddyService";
import { studyBuddyVoiceService } from "../../../services/child/studyBuddy/studyBuddyVoiceService";
import AudioWaveform from "../../shared/AudioWaveform";
import type { VoiceQuotaStatus } from "../../../types/child/studyBuddy/voiceTypes";

// =============================================================================
// Types
// =============================================================================

interface StudyBuddyMessage {
  id: string;
  role: "child" | "buddy" | "system";
  content_text: string;
  input_mode: "text" | "voice" | null;
  created_at: string;
}

interface StepContext {
  step_key: string;
  content_type: string;
  content_unit_id: string;
  content_preview: string;
}

interface StudyBuddyPanelProps {
  revisionSessionId: string;
  childId: string;
  stepContext?: StepContext;
}

type PanelState =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "error";

// =============================================================================
// Icons (typed)
// =============================================================================

const ICON_ROBOT: IconKey = "robot";
const ICON_CLOSE: IconKey = "close";
const ICON_SEND: IconKey = "send";
const ICON_SPINNER: IconKey = "spinner";
const ICON_CHAT: IconKey = "chat";
const ICON_CHEVRON_DOWN: IconKey = "chevronDown";
const ICON_MIC: IconKey = "microphone";
const ICON_STOP: IconKey = "stop";
const ICON_VOLUME_UP: IconKey = "volumeUp";
const ICON_VOLUME_MUTE: IconKey = "volumeMute";

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
// Component
// =============================================================================

export const StudyBuddyPanel: React.FC<StudyBuddyPanelProps> = ({
  revisionSessionId,
  childId,
  stepContext,
}) => {
  // ===========================================================================
  // State
  // ===========================================================================

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<StudyBuddyMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [panelState, setPanelState] = useState<PanelState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [messagesRemaining, setMessagesRemaining] = useState(20);
  const [threadId, setThreadId] = useState<string | null>(null);

  // Voice input state
  const [voiceQuota, setVoiceQuota] = useState<VoiceQuotaStatus | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // TTS state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [loadingTTSMessageId, setLoadingTTSMessageId] = useState<string | null>(
    null
  );

  // ===========================================================================
  // Refs
  // ===========================================================================

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // ===========================================================================
  // Effects
  // ===========================================================================

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load thread and messages when panel opens
  useEffect(() => {
    if (isOpen && !threadId) {
      void loadThread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Load voice quota when panel opens
  useEffect(() => {
    if (isOpen && childId && revisionSessionId) {
      void loadVoiceQuota();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, childId, revisionSessionId]);

  // Listen for external open events (from StudyBuddyTrigger)
  useEffect(() => {
    const handleOpenEvent = (event: CustomEvent<{ prefillText?: string }>) => {
      setIsOpen(true);
      setIsMinimized(false);

      if (event.detail?.prefillText) {
        setInputText(event.detail.prefillText);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    window.addEventListener("openStudyBuddy", handleOpenEvent as EventListener);
    return () => {
      window.removeEventListener(
        "openStudyBuddy",
        handleOpenEvent as EventListener
      );
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
      stopAudioPlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===========================================================================
  // Data Loading
  // ===========================================================================

  const loadThread = async () => {
    try {
      const result = await studyBuddyService.getOrCreateThread(revisionSessionId);
      if (result.thread_id) {
        setThreadId(result.thread_id);

        const threadData = await studyBuddyService.getThread(revisionSessionId);
        if (threadData.success && threadData.messages) {
          setMessages(threadData.messages);
        }
      }
    } catch (err) {
      console.error("[StudyBuddyPanel] Failed to load thread:", err);
    }
  };

  const loadVoiceQuota = async () => {
    try {
      const quota = await studyBuddyVoiceService.getVoiceQuota(
        childId,
        revisionSessionId
      );
      setVoiceQuota(quota);
    } catch (err) {
      console.error("[StudyBuddyPanel] Failed to load voice quota:", err);
    }
  };

  // ===========================================================================
  // Recording Functions (STT)
  // ===========================================================================

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
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && panelState === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, [panelState]);

  const processVoiceRecording = async (blob: Blob, durationSeconds: number) => {
    setPanelState("transcribing");

    try {
      const result = await studyBuddyVoiceService.sendVoiceMessage(
        childId,
        revisionSessionId,
        blob,
        durationSeconds,
        stepContext
      );

      if (result.success && result.transcript) {
        setMessages((prev) => [
          ...prev,
          {
            id: `voice-child-${Date.now()}`,
            role: "child",
            content_text: result.transcript!,
            input_mode: "voice",
            created_at: new Date().toISOString(),
          },
          {
            id: `voice-buddy-${Date.now()}`,
            role: "buddy",
            content_text: result.response || "I couldn't generate a response.",
            input_mode: null,
            created_at: new Date().toISOString(),
          },
        ]);

        if (result.messages_remaining !== undefined) {
          setMessagesRemaining(result.messages_remaining);
        }

        if (result.quota) {
          setVoiceQuota((prev) =>
            prev
              ? {
                  ...prev,
                  remaining: {
                    session_minutes: result.quota!.session_minutes_remaining,
                    session_interactions:
                      result.quota!.session_interactions_remaining,
                    daily_minutes: result.quota!.daily_minutes_remaining,
                  },
                  can_use_voice: result.quota!.can_continue,
                }
              : prev
          );
        }

        setPanelState("idle");
        return;
      }

      if (result.error === "empty_transcript") {
        setError(result.message || "I didn't catch that. Try again?");
      } else if (result.error === "voice_quota_exceeded") {
        setError(result.message || "Voice quota exceeded. Try typing instead!");
        void loadVoiceQuota();
      } else {
        setError(result.message || "Failed to process voice message");
      }
      setPanelState("idle");
    } catch (err) {
      console.error("[StudyBuddyPanel] Voice message error:", err);
      setError("Something went wrong. Please try again.");
      setPanelState("idle");
    }
  };

  const startRecording = useCallback(async () => {
    if (panelState !== "idle") return;

    setError(null);

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

      mediaRecorder.onstop = async () => {
        const finalMimeType = mediaRecorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: finalMimeType });
        const durationSeconds =
          (Date.now() - recordingStartTimeRef.current) / 1000;

        cleanupRecording();

        if (durationSeconds > 0.5) {
          await processVoiceRecording(blob, durationSeconds);
          return;
        }

        setError("Recording too short. Hold longer to speak.");
        setPanelState("idle");
      };

      mediaRecorder.start(100);
      recordingStartTimeRef.current = Date.now();
      setPanelState("recording");
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          if (next >= 60) stopRecording();
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error("[StudyBuddyPanel] Failed to start recording:", err);

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access.");
      } else {
        setError("Could not start recording. Please try again.");
      }

      cleanupRecording();
      setPanelState("idle");
    }
  }, [panelState, cleanupRecording, stopRecording]);

  // ===========================================================================
  // PTT Event Handlers
  // ===========================================================================

  const handlePTTStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      void startRecording();
    },
    [startRecording]
  );

  const handlePTTEnd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (panelState === "recording") stopRecording();
    },
    [panelState, stopRecording]
  );

  // ===========================================================================
  // TTS Functions (Text-to-Speech)
  // ===========================================================================

  const stopAudioPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingMessageId(null);
    if (panelState === "speaking") setPanelState("idle");
  }, [panelState]);

  const handlePlayMessage = useCallback(
    async (messageId: string, text: string) => {
      if (playingMessageId === messageId) {
        stopAudioPlayback();
        return;
      }

      stopAudioPlayback();
      setLoadingTTSMessageId(messageId);

      try {
        const result = await studyBuddyVoiceService.speakText(
          text,
          "nova",
          messageId
        );

        if (result.success && result.audio_url) {
          const audio = new Audio(result.audio_url);
          audioRef.current = audio;

          audio.onended = () => {
            setPlayingMessageId(null);
            audioRef.current = null;
            if (panelState === "speaking") setPanelState("idle");
          };

          audio.onerror = () => {
            setError("Failed to play audio");
            setPlayingMessageId(null);
            audioRef.current = null;
            setPanelState("idle");
          };

          setPlayingMessageId(messageId);
          setLoadingTTSMessageId(null);
          setPanelState("speaking");
          await audio.play();
          return;
        }

        setError(result.message || "Failed to generate speech");
        setLoadingTTSMessageId(null);
      } catch (err) {
        console.error("[StudyBuddyPanel] TTS error:", err);
        setError("Failed to play message");
        setLoadingTTSMessageId(null);
      }
    },
    [playingMessageId, stopAudioPlayback, panelState]
  );

  // ===========================================================================
  // Text Message Handling
  // ===========================================================================

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || panelState !== "idle") return;

    setInputText("");
    setError(null);
    setPanelState("thinking");

    const tempChildMessage: StudyBuddyMessage = {
      id: `temp-${Date.now()}`,
      role: "child",
      content_text: text,
      input_mode: "text",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempChildMessage]);

    try {
      const result = await studyBuddyService.sendText(
        revisionSessionId,
        text,
        stepContext
      );

      if (result.success) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempChildMessage.id);
          return [
            ...filtered,
            {
              id: result.message_id || tempChildMessage.id,
              role: "child",
              content_text: text,
              input_mode: "text",
              created_at: new Date().toISOString(),
            },
            {
              id: `buddy-${Date.now()}`,
              role: "buddy",
              content_text: result.response || "I couldn't generate a response.",
              input_mode: null,
              created_at: new Date().toISOString(),
            },
          ];
        });

        setMessagesRemaining(
          result.messages_remaining ?? Math.max(0, messagesRemaining - 1)
        );
        setPanelState("idle");
        return;
      }

      setError(result.error || "Failed to send message");
      setPanelState("idle");
    } catch (err) {
      console.error("[StudyBuddyPanel] Send error:", err);
      setError("Something went wrong. Please try again.");
      setPanelState("idle");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // ===========================================================================
  // Render Helpers
  // ===========================================================================

  const canUseVoice = voiceQuota?.can_use_voice ?? false;
  const voiceInteractionsRemaining = voiceQuota?.remaining?.session_interactions ?? 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // ===========================================================================
  // Render: Closed State (Floating Button)
  // ===========================================================================

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center z-50"
        aria-label="Open Study Buddy"
      >
        <AppIcon name={ICON_ROBOT} />
      </button>
    );
  }

  // ===========================================================================
  // Render: Minimized State
  // ===========================================================================

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
          aria-label="Open Study Buddy"
        >
          <AppIcon name={ICON_ROBOT} />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-red text-white text-xs rounded-full flex items-center justify-center">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ===========================================================================
  // Render: Open Panel
  // ===========================================================================

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-neutral-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-neutral-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <AppIcon name={ICON_ROBOT} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Study Buddy</h3>
            <p className="text-white/70 text-xs">
              {messagesRemaining} messages left
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full flex items-center justify-center transition"
            aria-label="Minimise"
          >
            <AppIcon name={ICON_CHEVRON_DOWN} />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full flex items-center justify-center transition"
            aria-label="Close"
          >
            <AppIcon name={ICON_CLOSE} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-500 py-8">
            <div className="mx-auto w-fit text-neutral-300 mb-3">
              <AppIcon name={ICON_CHAT} />
            </div>
            <p className="text-sm">Hi! I’m your Study Buddy 👋</p>
            <p className="text-xs mt-1">
              Ask me anything about what you’re learning!
            </p>
            {canUseVoice && (
              <p className="text-xs mt-2 text-primary-600">
                Tip: hold the mic button to ask with your voice
              </p>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isPlaying={playingMessageId === msg.id}
              isLoadingTTS={loadingTTSMessageId === msg.id}
              onPlay={() => void handlePlayMessage(msg.id, msg.content_text)}
            />
          ))
        )}

        {/* Thinking indicator */}
        {panelState === "thinking" && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <AppIcon name={ICON_ROBOT} />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 shadow-sm flex items-center gap-2">
              <span className="animate-spin">
                <AppIcon name={ICON_SPINNER} />
              </span>
              <span className="text-neutral-500 text-sm">Thinking…</span>
            </div>
          </div>
        )}

        {/* Transcribing indicator */}
        {panelState === "transcribing" && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <AppIcon name={ICON_ROBOT} />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 shadow-sm flex items-center gap-2">
              <span className="animate-spin">
                <AppIcon name={ICON_SPINNER} />
              </span>
              <span className="text-neutral-500 text-sm">Processing voice…</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-3 text-accent-red text-sm">
            {error}
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-2 underline text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice quota indicator */}
      {canUseVoice && voiceInteractionsRemaining > 0 && panelState === "idle" && (
        <div className="px-4 py-1 bg-primary-50 border-t border-primary-100">
          <p className="text-xs text-primary-700 flex items-center gap-1">
            <AppIcon name={ICON_MIC} />
            <span>{voiceInteractionsRemaining} voice messages left</span>
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-neutral-200 bg-white">
        {messagesRemaining > 0 ? (
          <>
            {/* Recording state */}
            {panelState === "recording" ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <AudioWaveform
                    analyser={analyser}
                    isActive={true}
                    width={120}
                    height={32}
                    barCount={16}
                  />
                  <span className="text-sm font-medium text-accent-red">
                    {formatTime(recordingTime)}
                  </span>
                </div>

                <button
                  type="button"
                  onMouseUp={handlePTTEnd}
                  onMouseLeave={handlePTTEnd}
                  onTouchEnd={handlePTTEnd}
                  className="w-12 h-12 bg-accent-red text-white rounded-full flex items-center justify-center animate-pulse"
                  aria-label="Stop recording"
                >
                  <AppIcon name={ICON_STOP} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-end">
                {/* PTT Voice button */}
                {canUseVoice && panelState === "idle" && (
                  <button
                    type="button"
                    onMouseDown={handlePTTStart}
                    onTouchStart={handlePTTStart}
                    onMouseUp={handlePTTEnd}
                    onMouseLeave={handlePTTEnd}
                    onTouchEnd={handlePTTEnd}
                    disabled={panelState !== "idle"}
                    className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 active:bg-primary-600 active:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0 select-none"
                    aria-label="Hold to record voice message"
                    title="Hold to speak"
                  >
                    <AppIcon name={ICON_MIC} />
                  </button>
                )}

                {/* Text input */}
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    canUseVoice ? "Type or hold 🎤 to speak…" : "Ask me anything…"
                  }
                  className="flex-1 resize-none border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[40px] max-h-[100px]"
                  rows={1}
                  disabled={panelState !== "idle"}
                />

                {/* Send button */}
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!inputText.trim() || panelState !== "idle"}
                  className="w-10 h-10 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
                  aria-label="Send"
                >
                  <AppIcon name={ICON_SEND} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-neutral-500 text-sm py-2">
            You’ve used all your questions for this session.
            <br />
            Keep revising! 💪
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// Message Bubble Component (with TTS play button)
// =============================================================================

interface MessageBubbleProps {
  message: StudyBuddyMessage;
  isPlaying: boolean;
  isLoadingTTS: boolean;
  onPlay: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isPlaying,
  isLoadingTTS,
  onPlay,
}) => {
  const isChild = message.role === "child";
  const isBuddy = message.role === "buddy";
  const isVoice = message.input_mode === "voice";

  return (
    <div className={`flex items-start gap-2 ${isChild ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isChild
            ? "bg-accent-green"
            : "bg-gradient-to-br from-primary-500 to-primary-700"
        }`}
        aria-hidden="true"
      >
        {isChild ? (
          <span className="text-white text-sm font-bold">Y</span>
        ) : (
          <AppIcon name={ICON_ROBOT} />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
          isChild
            ? "bg-accent-green text-white rounded-tr-none"
            : "bg-white text-neutral-800 rounded-tl-none"
        }`}
      >
        {/* Voice indicator for child messages */}
        {isVoice && isChild && (
          <div className="flex items-center gap-1 mb-1 opacity-70">
            <AppIcon name={ICON_MIC} />
            <span className="text-xs">Voice</span>
          </div>
        )}

        <p className="text-sm whitespace-pre-wrap">{message.content_text}</p>

        {/* TTS Play button for buddy messages */}
        {isBuddy && (
          <button
            type="button"
            onClick={onPlay}
            disabled={isLoadingTTS}
            className="mt-2 flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={isPlaying ? "Stop" : "Listen"}
          >
            {isLoadingTTS ? (
              <>
                <span className="animate-spin">
                  <AppIcon name={ICON_SPINNER} />
                </span>
                <span>Loading…</span>
              </>
            ) : isPlaying ? (
              <>
                <AppIcon name={ICON_VOLUME_MUTE} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <AppIcon name={ICON_VOLUME_UP} />
                <span>Listen</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyBuddyPanel;
