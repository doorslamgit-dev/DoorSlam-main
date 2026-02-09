// supabase/functions/studybuddy-transcribe/index.ts
// FEAT-011 Phase 3b: Voice Input Transcription
//
// Accepts audio blob, transcribes via OpenAI Whisper, returns transcript.
// Handles WebM (Chrome/Firefox) and MP4 (Safari) formats.
// Checks and records voice quota usage.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// Configuration
// =============================================================================

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions";
const WHISPER_MODEL = "whisper-1";

// Supported audio formats
const SUPPORTED_MIME_TYPES = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
];

// =============================================================================
// CORS Headers
// =============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// =============================================================================
// Types
// =============================================================================

interface TranscribeRequest {
  revision_session_id: string;
  duration_seconds: number;
  child_id: string;
}

interface QuotaStatus {
  success: boolean;
  voice_enabled?: boolean;
  can_use_voice?: boolean;
  remaining?: {
    session_minutes: number;
    session_interactions: number;
    daily_minutes: number;
  };
  error?: string;
}

interface TranscribeResponse {
  success: boolean;
  transcript?: string;
  duration_seconds?: number;
  quota?: {
    session_minutes_remaining: number;
    daily_minutes_remaining: number;
    session_interactions_remaining: number;
    can_continue: boolean;
  };
  error?: string;
  message?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "audio/webm": "webm",
    "audio/mp4": "mp4",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
  };
  return extensions[mimeType] || "webm";
}

async function transcribeWithWhisper(
  audioBlob: Blob,
  mimeType: string
): Promise<{ text: string } | { error: string }> {
  if (!OPENAI_API_KEY) {
    return { error: "OpenAI API key not configured" };
  }

  const formData = new FormData();
  const extension = getFileExtension(mimeType);
  const file = new File([audioBlob], `audio.${extension}`, { type: mimeType });
  
  formData.append("file", file);
  formData.append("model", WHISPER_MODEL);
  formData.append("language", "en"); // Optimize for English

  try {
    const response = await fetch(WHISPER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Whisper] API error:", response.status, errorText);
      return { error: `Whisper API error: ${response.status}` };
    }

    const result = await response.json();
    return { text: result.text || "" };
  } catch (error) {
    console.error("[Whisper] Request failed:", error);
    return { error: "Failed to transcribe audio" };
  }
}

// =============================================================================
// Main Handler
// =============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // ==========================================================================
    // 1. Auth Validation
    // ==========================================================================
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================================================
    // 2. Parse FormData
    // ==========================================================================

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const revisionSessionId = formData.get("revision_session_id") as string | null;
    const durationSecondsStr = formData.get("duration_seconds") as string | null;
    const childId = formData.get("child_id") as string | null;

    if (!audioFile) {
      return new Response(
        JSON.stringify({ success: false, error: "No audio file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!revisionSessionId) {
      return new Response(
        JSON.stringify({ success: false, error: "revision_session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!childId) {
      return new Response(
        JSON.stringify({ success: false, error: "child_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const durationSeconds = parseFloat(durationSecondsStr || "0");

    // ==========================================================================
    // 3. Validate Audio Format
    // ==========================================================================

    const mimeType = audioFile.type || "audio/webm";
    
    if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
      console.warn(`[Transcribe] Unsupported MIME type: ${mimeType}, attempting anyway`);
    }

    console.log(`[Transcribe] Received audio: ${mimeType}, ${audioFile.size} bytes, ${durationSeconds}s`);

    // ==========================================================================
    // 4. Check Voice Quota
    // ==========================================================================

    const { data: quotaData, error: quotaError } = await supabase.rpc(
      "rpc_get_voice_quota_status",
      {
        p_child_id: childId,
        p_revision_session_id: revisionSessionId,
      }
    );

    if (quotaError) {
      console.error("[Transcribe] Quota check failed:", quotaError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to check voice quota" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const quota = quotaData as QuotaStatus;

    if (!quota.success) {
      return new Response(
        JSON.stringify({ success: false, error: quota.error || "Quota check failed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!quota.voice_enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "voice_not_enabled",
          message: "Voice input is not available for your account." 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!quota.can_use_voice) {
      // Determine which limit was hit
      let message = "You've used all your voice time. Try typing instead!";
      
      if (quota.remaining?.session_interactions === 0) {
        message = "You've used all your voice messages for this session. Try typing instead!";
      } else if (quota.remaining?.session_minutes === 0) {
        message = "You've used all your voice time for this session. Try typing instead!";
      } else if (quota.remaining?.daily_minutes === 0) {
        message = "You've used all your voice time for today. Try again tomorrow!";
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: "voice_quota_exceeded",
          message,
          quota: {
            session_minutes_remaining: quota.remaining?.session_minutes || 0,
            daily_minutes_remaining: quota.remaining?.daily_minutes || 0,
            session_interactions_remaining: quota.remaining?.session_interactions || 0,
            can_continue: false,
          },
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==========================================================================
    // 5. Transcribe with Whisper
    // ==========================================================================

    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: mimeType });
    const transcriptionResult = await transcribeWithWhisper(audioBlob, mimeType);

    if ("error" in transcriptionResult) {
      return new Response(
        JSON.stringify({ success: false, error: transcriptionResult.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transcript = transcriptionResult.text.trim();

    // Check for empty transcription (silence)
    if (!transcript) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "empty_transcript",
          message: "I didn't catch that. Could you try again?",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Transcribe] Transcript: "${transcript.substring(0, 100)}..."`);

    // ==========================================================================
    // 6. Record Voice Usage
    // ==========================================================================

    const { data: usageData, error: usageError } = await supabase.rpc(
      "rpc_record_voice_usage",
      {
        p_child_id: childId,
        p_revision_session_id: revisionSessionId,
        p_duration_seconds: durationSeconds,
      }
    );

    if (usageError) {
      console.error("[Transcribe] Failed to record usage:", usageError);
      // Don't fail the request, just log the error
    }

    // ==========================================================================
    // 7. Calculate Updated Quota
    // ==========================================================================

    const durationMinutes = durationSeconds / 60;
    const updatedQuota = {
      session_minutes_remaining: Math.max(0, (quota.remaining?.session_minutes || 0) - durationMinutes),
      daily_minutes_remaining: Math.max(0, (quota.remaining?.daily_minutes || 0) - durationMinutes),
      session_interactions_remaining: Math.max(0, (quota.remaining?.session_interactions || 0) - 1),
      can_continue: true, // Will be recalculated
    };

    updatedQuota.can_continue = 
      updatedQuota.session_minutes_remaining > 0 &&
      updatedQuota.session_interactions_remaining > 0 &&
      updatedQuota.daily_minutes_remaining > 0;

    // ==========================================================================
    // 8. Return Success Response
    // ==========================================================================

    const response: TranscribeResponse = {
      success: true,
      transcript,
      duration_seconds: durationSeconds,
      quota: updatedQuota,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Transcribe] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});