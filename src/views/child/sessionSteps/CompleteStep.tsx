// src/views/child/sessionSteps/CompleteStep.tsx
// UPDATED: January 2026 - 6-Step Session Model
// Step 6: Combined Celebration + Reflection + Audio Notes
// Child-friendly language update
// REFACTORED: January 2026 - Modular structure with extracted components
//
// PRESERVES: Audio recording, transcription workflow, reflection insert
// FEAT-011 Phase 2: Added studyBuddyService.updateSummary on completion

import AppIcon from "../../../components/ui/AppIcon";

import type {
  CompleteStepProps,
  GamificationResult,
} from "../../../types/child/completestep";
import { useCompleteStep } from "../../../hooks/child/completestep";
import {
  CelebrationBanner,
  ConfidenceSelector,
  AudioRecorder,
} from "../../../components/child/completestep";
import { getIconFromName } from "../../../services/child/completestep";
import { supabase } from "../../../lib/supabase";
import { studyBuddyService } from "../../../services/child/studyBuddy/studyBuddyService";
import { getSubjectColor } from "../../../constants/colors";

export default function CompleteStep({
  overview,
  payload,
  saving,
  onPatch,
  onFinish,
  onStartNextSession,
  onUploadAudio,
}: CompleteStepProps) {
  const complete = payload?.complete ?? {};
  const initialGamification: GamificationResult = complete.gamification ?? {
    xpEarned: 45,
    currentStreak: 5,
    newBadge: { id: "focus_master", name: "Focus Master", icon: "trophy" },
  };

  const {
    postConfidence,
    journalNote,
    audioData,
    canFinish,
    handleConfidenceSelect,
    handleJournalChange,
    handleAudioRecorded,
    handleAudioDelete,
  } = useCompleteStep({
    initialPostConfidence: complete.postConfidence ?? null,
    initialJournalNote: complete.journalNote ?? "",
    initialAudioUrl: complete.audioNoteUrl ?? null,
    initialAudioDuration: complete.audioDurationSeconds ?? 0,
  });

  const subjectIcon = getIconFromName(overview.subject_icon);
  const subjectColor = getSubjectColor(overview.subject_name);
  const childName = overview.child_name || "there";
  const sessionMinutes = overview.session_duration_minutes ?? 20;

  async function handleFinish() {
    // Upload audio if we have a new recording
    let audioUrl = complete.audioNoteUrl ?? null;
    if (audioData.blob && onUploadAudio) {
      try {
        audioUrl = await onUploadAudio(audioData.blob);
      } catch (error) {
        console.error("[CompleteStep] Audio upload failed:", error);
      }
    }

    // Insert reflection record for transcription workflow
    const hasAudio = !!audioUrl;
    const hasTextNote = journalNote.trim().length > 0;

    if (hasAudio || hasTextNote) {
      const { error: reflectionError } = await supabase
        .from("child_session_reflections")
        .insert({
          child_id: overview.child_id,
          revision_session_id: overview.revision_session_id,
          audio_url: audioUrl || null,
          audio_duration_seconds: hasAudio ? audioData.durationSeconds : null,
          text_note: hasTextNote ? journalNote.trim() : null,
          context_type: "session_reflection",
          transcription_status: hasAudio ? "pending" : null,
        });

      if (reflectionError) {
        // Reflection save failed — non-blocking, session still completes
      }
    }

    // Save to step payload
    await onPatch({
      complete: {
        gamification: initialGamification,
        postConfidence,
        journalNote: journalNote.trim() || null,
        audioNoteUrl: audioUrl,
        audioDurationSeconds: audioData.durationSeconds,
        completed_at: new Date().toISOString(),
      },
    });

    try {
      await studyBuddyService.updateSummary(overview.revision_session_id, true);
    } catch {
      // Study Buddy summary update is non-blocking
    }

    await onFinish();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: subjectColor }}
          >
            <AppIcon name={subjectIcon} className="text-primary-foreground w-6 h-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">
              {overview.subject_name} • Step {overview.step_index} of {overview.total_steps}
            </p>
            <h1 className="text-2xl font-bold text-primary">{overview.topic_name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-full">
            <AppIcon name="circle-check" className="text-success w-4 h-4" />
            <span className="text-success font-medium text-sm">Complete!</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <AppIcon name="clock" className="w-4 h-4" />
            <span>{sessionMinutes} mins</span>
          </div>
        </div>
      </section>

      {/* Celebration */}
      <section>
        <CelebrationBanner childName={childName} gamification={initialGamification} />
      </section>

      {/* Confidence Check */}
      <section>
        <div className="bg-background rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <AppIcon name="circle-help" className="w-6 h-6 text-primary" aria-hidden />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">How do you feel about this topic?</h2>
              <p className="text-muted-foreground text-sm">Be honest - it helps us help you!</p>
            </div>
          </div>

          <ConfidenceSelector
            selected={postConfidence}
            onSelect={handleConfidenceSelect}
            disabled={saving}
          />
        </div>
      </section>

      {/* Notes Section */}
      <section>
        <div className="bg-background rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <AppIcon name="pencil" className="text-primary w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Any notes for next time?</h2>
              <p className="text-muted-foreground text-sm">Questions, thoughts, things to remember</p>
            </div>
          </div>

          <textarea
            value={journalNote}
            onChange={(e) => handleJournalChange(e.target.value)}
            disabled={saving}
            placeholder="What stood out? Any questions? Write anything you want to remember..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-ring transition resize-none disabled:opacity-50 text-foreground"
          />

          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <AppIcon name="mic" className="text-primary w-4 h-4" />
              <span className="font-medium">Or say it instead:</span>
            </p>
            <AudioRecorder
              existingUrl={complete.audioNoteUrl ?? null}
              existingDuration={complete.audioDurationSeconds ?? 0}
              onRecordingComplete={handleAudioRecorded}
              onDelete={handleAudioDelete}
              disabled={saving}
            />
          </div>
        </div>
      </section>

      {/* Encouragement */}
      <section>
        <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl shadow-sm p-6 text-primary-foreground">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AppIcon name="star" className="text-primary-foreground w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Amazing work, {childName}!</h3>
              <p className="text-primary-foreground/80 text-sm mb-3">
                Every session makes you stronger. Take a break, have a snack, and feel proud of what you've
                done today!
              </p>
              <p className="text-primary-foreground/70 text-xs flex items-center gap-2">
                <AppIcon name="lightbulb" className="w-4 h-4 text-primary-foreground/70 flex-shrink-0" aria-hidden />
                <span>Top tip: Tell someone what you learned - it helps it stick!</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section>
        <div className="bg-background rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleFinish}
              disabled={!canFinish || saving}
              className="flex items-center gap-2 px-5 py-3 bg-secondary text-foreground font-medium rounded-xl hover:bg-accent transition disabled:opacity-50"
            >
              <AppIcon name="home" className="w-4 h-4" />
              <span>Home</span>
            </button>

            {onStartNextSession ? (
              <button
                type="button"
                onClick={async () => {
                  await handleFinish();
                  onStartNextSession();
                }}
                disabled={!canFinish || saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
              >
                <span>{saving ? "Saving..." : "Next Session"}</span>
                <AppIcon name="arrow-right" className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={!canFinish || saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
              >
                <span>{saving ? "Saving..." : "Finish"}</span>
                <AppIcon name="circle-check" className="w-4 h-4" />
              </button>
            )}
          </div>

          {!canFinish && (
            <p className="mt-4 text-center text-muted-foreground text-sm">
              Please tell us how you're feeling about this topic to continue
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
