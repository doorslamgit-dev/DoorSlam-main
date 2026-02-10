// src/services/child/studyBuddy/studyBuddyVoiceService.ts
// FEAT-011 Phase 3 & 4: Voice Input (STT) and Voice Output (TTS) Service
//
// Handles:
// - Voice quota checking
// - Audio transcription (Whisper)
// - Text-to-speech (OpenAI TTS)

import { supabase } from "../../../lib/supabase";
import type {
  VoiceQuotaStatus,
  TranscriptionResult,
  TranscriptionQuota,
} from "../../../types/child/studyBuddy/voiceTypes";

// =============================================================================
// Types
// =============================================================================

interface StepContext {
  step_key: string;
  content_type: string;
  content_unit_id: string;
  content_preview: string;
}

interface SendVoiceMessageResult {
  success: boolean;
  transcript?: string;
  response?: string;
  quota?: TranscriptionQuota;
  error?: string;
  message?: string;
  thread_id?: string;
  message_id?: string;
  messages_remaining?: number;
}

// TTS Types
type TTSVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

interface SpeakTextResult {
  success: boolean;
  audio_base64?: string;
  audio_url?: string;
  content_type?: string;
  cached?: boolean;
  error?: string;
  message?: string;
}

// Audio cache to avoid re-generating same responses
const audioCache = new Map<string, string>();

// =============================================================================
// Voice Service
// =============================================================================

class StudyBuddyVoiceService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  }

  // ===========================================================================
  // Quota Management
  // ===========================================================================

  /**
   * Get current voice quota status for a child
   */
  async getVoiceQuota(
    childId: string,
    revisionSessionId: string
  ): Promise<VoiceQuotaStatus> {
    const { data, error } = await supabase.rpc("rpc_get_voice_quota_status", {
      p_child_id: childId,
      p_revision_session_id: revisionSessionId,
    });

    if (error) {
      console.error("[VoiceService] getVoiceQuota error:", error);
      return this.createErrorQuotaStatus(error.message);
    }

    return data as VoiceQuotaStatus;
  }

  /**
   * Check if voice is available (quick check without full quota details)
   */
  async canUseVoice(
    childId: string,
    revisionSessionId: string
  ): Promise<boolean> {
    const quota = await this.getVoiceQuota(childId, revisionSessionId);
    return quota.success && quota.can_use_voice;
  }

  // ===========================================================================
  // Transcription (STT - Speech to Text)
  // ===========================================================================

  /**
   * Transcribe audio using the studybuddy-transcribe Edge Function
   */
  async transcribeAudio(
    childId: string,
    revisionSessionId: string,
    audioBlob: Blob,
    durationSeconds: number
  ): Promise<TranscriptionResult> {
    try {
      const session = await this.getSession();
      if (!session) {
        return {
          success: false,
          error: "not_authenticated",
          message: "Please sign in to use voice input.",
        };
      }

      // Build FormData
      const formData = new FormData();
      
      // Determine file extension from MIME type
      const extension = this.getFileExtension(audioBlob.type);
      formData.append("audio", audioBlob, `audio.${extension}`);
      formData.append("revision_session_id", revisionSessionId);
      formData.append("duration_seconds", durationSeconds.toString());
      formData.append("child_id", childId);

      // Call Edge Function
      const response = await fetch(
        `${this.baseUrl}/functions/v1/studybuddy-transcribe`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("[VoiceService] transcribeAudio error:", result);
      }

      return result as TranscriptionResult;
    } catch (error) {
      console.error("[VoiceService] transcribeAudio exception:", error);
      return {
        success: false,
        error: "transcription_failed",
        message: "Failed to transcribe audio. Please try again.",
      };
    }
  }

  // ===========================================================================
  // Text-to-Speech (TTS)
  // ===========================================================================

  /**
   * Convert text to speech using OpenAI TTS
   * Returns audio as a data URL that can be played directly
   */
  async speakText(
    text: string,
    voice: TTSVoice = "nova",
    messageId?: string
  ): Promise<SpeakTextResult> {
    try {
      // Check cache first (using text hash as key)
      const cacheKey = this.hashText(text + voice);
      const cachedAudio = audioCache.get(cacheKey);
      if (cachedAudio) {
        return {
          success: true,
          audio_url: cachedAudio,
          content_type: "audio/mpeg",
          cached: true,
        };
      }

      const session = await this.getSession();
      if (!session) {
        return {
          success: false,
          error: "not_authenticated",
          message: "Please sign in to use voice output.",
        };
      }

      const response = await fetch(
        `${this.baseUrl}/functions/v1/studybuddy-speak`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            voice,
            message_id: messageId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[VoiceService] speakText error:", result);
        return {
          success: false,
          error: result.error || "tts_failed",
          message: result.message || "Failed to generate speech.",
        };
      }

      // Convert base64 to data URL
      let audioUrl: string;
      if (result.audio_url) {
        // Server returned a URL (cached or from storage)
        audioUrl = result.audio_url;
      } else if (result.audio_base64) {
        // Server returned base64, convert to data URL
        audioUrl = `data:${result.content_type || "audio/mpeg"};base64,${result.audio_base64}`;
      } else {
        return {
          success: false,
          error: "no_audio",
          message: "No audio data received.",
        };
      }

      // Cache the audio URL
      audioCache.set(cacheKey, audioUrl);

      // Limit cache size (keep last 20 items)
      if (audioCache.size > 20) {
        const firstKey = audioCache.keys().next().value;
        if (firstKey) audioCache.delete(firstKey);
      }

      return {
        success: true,
        audio_url: audioUrl,
        content_type: result.content_type || "audio/mpeg",
        cached: result.cached || false,
      };
    } catch (error) {
      console.error("[VoiceService] speakText exception:", error);
      return {
        success: false,
        error: "tts_failed",
        message: "Failed to generate speech. Please try again.",
      };
    }
  }

  /**
   * Play audio from a URL or data URL
   * Returns a promise that resolves when playback completes
   */
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.onerror = (_e) => reject(new Error("Audio playback failed"));
      audio.play().catch(reject);
    });
  }

  /**
   * Convenience method: speak text and play it immediately
   */
  async speakAndPlay(
    text: string,
    voice: TTSVoice = "nova",
    messageId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const result = await this.speakText(text, voice, messageId);
    
    if (!result.success || !result.audio_url) {
      return { success: false, error: result.error || result.message };
    }

    try {
      await this.playAudio(result.audio_url);
      return { success: true };
    } catch (error) {
      console.error("[VoiceService] playAudio error:", error);
      return { success: false, error: "playback_failed" };
    }
  }

  // ===========================================================================
  // Combined Voice Message Flow
  // ===========================================================================

  /**
   * Send a voice message: transcribe audio then send as text to Study Buddy
   * This is the main method to use for voice input in the panel.
   */
  async sendVoiceMessage(
    childId: string,
    revisionSessionId: string,
    audioBlob: Blob,
    durationSeconds: number,
    stepContext?: StepContext
  ): Promise<SendVoiceMessageResult> {
    // Step 1: Transcribe the audio
    const transcriptionResult = await this.transcribeAudio(
      childId,
      revisionSessionId,
      audioBlob,
      durationSeconds
    );

    if (!transcriptionResult.success) {
      return {
        success: false,
        error: transcriptionResult.error,
        message: transcriptionResult.message,
        quota: transcriptionResult.quota,
      };
    }

    const transcript = transcriptionResult.transcript!;

    // Step 2: Send the transcribed text to Study Buddy
    try {
      const session = await this.getSession();
      if (!session) {
        return {
          success: false,
          transcript,
          error: "not_authenticated",
          message: "Please sign in to use Study Buddy.",
        };
      }

      const response = await fetch(
        `${this.baseUrl}/functions/v1/studybuddy-send-text`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            revision_session_id: revisionSessionId,
            message_text: transcript,
            input_mode: "voice",
            step_context: stepContext,
          }),
        }
      );

      const textResult = await response.json();

      if (!textResult.success) {
        return {
          success: false,
          transcript,
          error: textResult.error || "send_failed",
          message: textResult.message || "Failed to get response.",
          quota: transcriptionResult.quota,
        };
      }

      return {
        success: true,
        transcript,
        response: textResult.response,
        quota: transcriptionResult.quota,
        thread_id: textResult.thread_id,
        message_id: textResult.message_id,
        messages_remaining: textResult.messages_remaining,
      };
    } catch (error) {
      console.error("[VoiceService] sendVoiceMessage exception:", error);
      return {
        success: false,
        transcript,
        error: "send_failed",
        message: "Failed to send message. Please try again.",
        quota: transcriptionResult.quota,
      };
    }
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  private async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  }

  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      "audio/webm": "webm",
      "audio/webm;codecs=opus": "webm",
      "audio/mp4": "mp4",
      "audio/mpeg": "mp3",
      "audio/wav": "wav",
      "audio/ogg": "ogg",
      "audio/ogg;codecs=opus": "ogg",
    };
    return extensions[mimeType] || "webm";
  }

  private hashText(text: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  private createErrorQuotaStatus(errorMessage: string): VoiceQuotaStatus {
    return {
      success: false,
      voice_enabled: false,
      tier_code: "unknown",
      limits: {
        max_session_minutes: 0,
        max_session_interactions: 0,
        max_daily_minutes: 0,
      },
      usage: {
        session_minutes_used: 0,
        session_interactions_used: 0,
        daily_minutes_used: 0,
        daily_interactions_used: 0,
      },
      remaining: {
        session_minutes: 0,
        session_interactions: 0,
        daily_minutes: 0,
      },
      can_use_voice: false,
      error: errorMessage,
    };
  }
}

// =============================================================================
// Export Singleton Instance
// =============================================================================

export const studyBuddyVoiceService = new StudyBuddyVoiceService();

// Also export the class and types for testing
export { StudyBuddyVoiceService };
export type { TTSVoice, SpeakTextResult, SendVoiceMessageResult };