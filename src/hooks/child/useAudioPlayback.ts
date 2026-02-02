// src/hooks/child/useAudioPlayback.ts
// Custom hook for handling audio playback and TTS (Text-to-Speech)
// Manages audio element lifecycle, playback state, and mute functionality

import { useState, useRef, useCallback } from "react";

// =============================================================================
// Types
// =============================================================================

export interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  currentlyPlayingId: string | null;
  isMuted: boolean;
  play: (audioUrl: string, messageId: string) => Promise<void>;
  stop: () => void;
  toggleMute: () => void;
}

// =============================================================================
// Hook
// =============================================================================

export const useAudioPlayback = (
  onError?: (error: string) => void
): UseAudioPlaybackReturn => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );
  const [isMuted, setIsMuted] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentlyPlayingId(null);
  }, []);

  // Play audio
  const play = useCallback(
    async (audioUrl: string, messageId: string) => {
      // If already playing this message, stop it
      if (currentlyPlayingId === messageId) {
        stop();
        return;
      }

      // Stop any currently playing audio
      stop();

      try {
        const audio = new Audio(audioUrl);
        audio.muted = isMuted;
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentlyPlayingId(null);
          audioRef.current = null;
        };

        audio.onerror = () => {
          const errorMessage = "Failed to play audio";
          if (onError) {
            onError(errorMessage);
          }
          setIsPlaying(false);
          setCurrentlyPlayingId(null);
          audioRef.current = null;
        };

        setCurrentlyPlayingId(messageId);
        setIsPlaying(true);
        await audio.play();
      } catch (err) {
        console.error("[useAudioPlayback] Failed to play audio:", err);
        const errorMessage = "Failed to play audio";
        if (onError) {
          onError(errorMessage);
        }
        setIsPlaying(false);
        setCurrentlyPlayingId(null);
      }
    },
    [currentlyPlayingId, isMuted, stop, onError]
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
      }
      return newMuted;
    });
  }, []);

  return {
    isPlaying,
    currentlyPlayingId,
    isMuted,
    play,
    stop,
    toggleMute,
  };
};
