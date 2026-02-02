// src/components/child/studyBuddy/MessageBubble.tsx
// Message Bubble Component for Study Buddy Panel
// Displays individual messages with TTS play button for buddy messages

import React from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

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

export interface MessageBubbleProps {
  message: StudyBuddyMessage;
  isPlaying: boolean;
  isLoadingTTS: boolean;
  onPlay: () => void;
}

// =============================================================================
// Icons
// =============================================================================

const ICON_ROBOT: IconKey = "robot";
const ICON_MIC: IconKey = "microphone";
const ICON_SPINNER: IconKey = "spinner";
const ICON_VOLUME_UP: IconKey = "volumeUp";
const ICON_VOLUME_MUTE: IconKey = "volumeMute";

// =============================================================================
// Component
// =============================================================================

export const MessageBubble: React.FC<MessageBubbleProps> = ({
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

export default MessageBubble;
