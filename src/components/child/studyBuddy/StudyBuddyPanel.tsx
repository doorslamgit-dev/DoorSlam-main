// src/components/child/studyBuddy/StudyBuddyPanel.tsx
// FEAT-011: Study Buddy AI Chatbot
// Phase 1-2: Text chat with context awareness
// Phase 3: Voice input with PTT (Push-to-Talk)
// Phase 4: Voice output with TTS (Text-to-Speech)
//
// UPDATED: January 2026 - Added play button on buddy messages

import React, { useState, useRef, useEffect } from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";
import { studyBuddyService } from "../../../services/child/studyBuddy/studyBuddyService";
import { studyBuddyVoiceService } from "../../../services/child/studyBuddy/studyBuddyVoiceService";
import AudioWaveform from "../../shared/AudioWaveform";
import type { VoiceQuotaStatus } from "../../../types/child/studyBuddy/voiceTypes";
import MessageBubble from "./MessageBubble";
import { useVoiceRecording } from "../../../hooks/child/useVoiceRecording";
import { useAudioPlayback } from "../../../hooks/child/useAudioPlayback";

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
const _ICON_VOLUME_UP: IconKey = "volumeUp";
const _ICON_VOLUME_MUTE: IconKey = "volumeMute";

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
  const [voiceQuota, setVoiceQuota] = useState<VoiceQuotaStatus | null>(null);
  const [loadingTTSMessageId, setLoadingTTSMessageId] = useState<string | null>(
    null
  );

  // ===========================================================================
  // Custom Hooks
  // ===========================================================================

  // Voice recording hook
  const voiceRecording = useVoiceRecording();

  // Audio playback hook
  const audioPlayback = useAudioPlayback((errorMsg: string) => {
    setError(errorMsg);
  });

  // ===========================================================================
  // Refs
  // ===========================================================================

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      audioPlayback.stop();
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
  // Voice Recording - Process audio blob when recording completes
  // ===========================================================================

  useEffect(() => {
    const processVoiceRecording = async (blob: Blob) => {
      setPanelState("transcribing");

      try {
        const durationSeconds = voiceRecording.recordingTime;
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

    if (voiceRecording.audioBlob) {
      void processVoiceRecording(voiceRecording.audioBlob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceRecording.audioBlob]);

  // Sync recording state with panel state
  useEffect(() => {
    if (voiceRecording.isRecording) {
      setPanelState("recording");
    }
  }, [voiceRecording.isRecording]);

  // Handle recording errors
  useEffect(() => {
    if (voiceRecording.error) {
      setError(voiceRecording.error);
      setPanelState("idle");
    }
  }, [voiceRecording.error]);

  // ===========================================================================
  // PTT Event Handlers
  // ===========================================================================

  const handlePTTStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (panelState === "idle") {
      void voiceRecording.startRecording();
    }
  };

  const handlePTTEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (voiceRecording.isRecording) {
      voiceRecording.stopRecording();
    }
  };

  // ===========================================================================
  // TTS Functions (Text-to-Speech)
  // ===========================================================================

  const handlePlayMessage = async (messageId: string, text: string) => {
    if (audioPlayback.currentlyPlayingId === messageId) {
      audioPlayback.stop();
      setPanelState("idle");
      return;
    }

    setLoadingTTSMessageId(messageId);

    try {
      const result = await studyBuddyVoiceService.speakText(
        text,
        "nova",
        messageId
      );

      if (result.success && result.audio_url) {
        setLoadingTTSMessageId(null);
        setPanelState("speaking");
        await audioPlayback.play(result.audio_url, messageId);
        return;
      }

      setError(result.message || "Failed to generate speech");
      setLoadingTTSMessageId(null);
    } catch (err) {
      console.error("[StudyBuddyPanel] TTS error:", err);
      setError("Failed to play message");
      setLoadingTTSMessageId(null);
    }
  };

  // Sync playback state with panel state
  useEffect(() => {
    if (!audioPlayback.isPlaying && panelState === "speaking") {
      setPanelState("idle");
    }
  }, [audioPlayback.isPlaying, panelState]);

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
        className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center z-50"
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
      <div className="fixed bottom-20 right-6 z-50">
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
    <div className="fixed bottom-20 right-6 w-80 sm:w-96 h-[500px] bg-neutral-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-neutral-200">
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
            <p className="text-sm">Hi! I’m your Study Buddy</p>
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
              isPlaying={audioPlayback.currentlyPlayingId === msg.id}
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
            <div className="bg-neutral-0 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm flex items-center gap-2">
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
            <div className="bg-neutral-0 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm flex items-center gap-2">
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
      <div className="p-3 border-t border-neutral-200 bg-neutral-0">
        {messagesRemaining > 0 ? (
          <>
            {/* Recording state */}
            {panelState === "recording" ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <AudioWaveform
                    analyser={voiceRecording.analyser}
                    isActive={true}
                    width={120}
                    height={32}
                    barCount={16}
                  />
                  <span className="text-sm font-medium text-accent-red">
                    {formatTime(voiceRecording.recordingTime)}
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
                    canUseVoice ? "Type or hold mic to speak…" : "Ask me anything…"
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
            Keep revising!
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyBuddyPanel;
