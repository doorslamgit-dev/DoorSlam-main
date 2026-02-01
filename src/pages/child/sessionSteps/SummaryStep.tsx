// src/pages/child/sessionSteps/SummaryStep.tsx
// Step 5: Key takeaways + mnemonic
// UPDATED: January 2026
// REFACTORED: January 2026 - Modular structure with extracted components

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faLightbulb,
  faBrain,
  faRobot,
  faWandMagicSparkles,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import type { SummaryStepProps, MnemonicStyle, MnemonicData } from "../../../types/child/summarystep";
import { useSummaryStep } from "../../../hooks/child/summarystep";
import {
  KeyTakeawayCard,
  MnemonicStyleSelector,
  MnemonicPlayer,
  MnemonicNotAvailable,
} from "../../../components/child/summarystep";
import {
  getIconFromName,
  isSubjectMnemonicSuitable,
  extractKeyTakeaways,
  MNEMONIC_STYLES,
} from "../../../services/child/summarystep";
import {
  requestMnemonicTracked,
  transformToMnemonicData,
  MnemonicStyle as ApiMnemonicStyle,
} from "../../../services/mnemonics/mnemonicApi";

export default function SummaryStep({
  overview,
  payload,
  saving,
  onPatch,
  onNext,
  onRequestMnemonic,
}: SummaryStepProps) {
  const summary = payload?.summary ?? {};
  const existingMnemonic = summary.mnemonic ?? null;

  // Extract key takeaways from slides
  const keyTakeaways = useMemo(() => extractKeyTakeaways(payload), [payload]);

  // Check if mnemonic generation is suitable for this subject
  const mnemonicSuitable = useMemo(
    () => isSubjectMnemonicSuitable(overview.subject_name),
    [overview.subject_name]
  );

  const {
    selectedStyle,
    mnemonic,
    isGenerating,
    setMnemonic,
    setIsGenerating,
    handleSelectStyle,
  } = useSummaryStep({
    initialSelectedStyle: summary.selectedStyle ?? null,
    initialMnemonic: existingMnemonic,
  });

  const progressPercent = (overview.step_index / overview.total_steps) * 100;
  const subjectIcon = getIconFromName(overview.subject_icon);
  const subjectColor = overview.subject_color || "#5B2CFF";

  async function handleGenerateMnemonic() {
    if (!selectedStyle) return;

    const topicId = overview.topic_id;
    const topicName = overview.topic_name;

    if (!topicId) {
      console.error("[SummaryStep] Missing overview.topic_id (required for tracked mnemonic request)");
      setMnemonic({
        mnemonicId: null,
        style: selectedStyle,
        styleReference: "",
        lyrics: "",
        audioUrl: null,
        durationSeconds: null,
        status: "failed",
      });
      return;
    }

    setIsGenerating(true);
    setMnemonic({
      mnemonicId: null,
      style: selectedStyle,
      styleReference: MNEMONIC_STYLES.find((s) => s.id === selectedStyle)?.styleReference || "",
      lyrics: "",
      audioUrl: null,
      durationSeconds: null,
      status: "generating",
    });

    try {
      // If SessionRun provides a handler, use it.
      if (onRequestMnemonic) {
        const result = await onRequestMnemonic(selectedStyle);
        setMnemonic(result);

        await onPatch({
          summary: {
            ...summary,
            keyTakeaways,
            selectedStyle,
            mnemonic: result,
          },
        });
        return;
      }

      // Otherwise call the tracked flow directly (end-to-end from Summary).
      const originalPrompt = `${overview.subject_name} | ${topicName} | style=${selectedStyle} | step=summary`;

      const { response } = await requestMnemonicTracked({
        topicId,
        topicName,
        originalPrompt,
        subjectName: overview.subject_name.toLowerCase(),
        topicText: topicName,
        style: selectedStyle as ApiMnemonicStyle,
        level: "gcse",
        examBoard: null,
        callbackUrl: null,
        disableClientFallbackTracking: false,
      });

      const transformed = transformToMnemonicData(response, selectedStyle as ApiMnemonicStyle);

      const result: MnemonicData = {
        mnemonicId: transformed.mnemonicId,
        style: transformed.style as MnemonicStyle,
        styleReference: transformed.styleReference,
        lyrics: transformed.lyrics,
        audioUrl: transformed.audioUrl,
        durationSeconds: transformed.durationSeconds,
        status: transformed.status,
      };

      setMnemonic(result);

      await onPatch({
        summary: {
          ...summary,
          keyTakeaways,
          selectedStyle,
          mnemonic: result,
        },
      });
    } catch (error) {
      console.error("[SummaryStep] Mnemonic generation failed:", error);
      setMnemonic({
        mnemonicId: null,
        style: selectedStyle,
        styleReference: "",
        lyrics: "",
        audioUrl: null,
        durationSeconds: null,
        status: "failed",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleContinue() {
    await onPatch({
      summary: {
        ...summary,
        keyTakeaways,
        selectedStyle,
        mnemonic,
        completed_at: new Date().toISOString(),
      },
    });
    await onNext();
  }

  // Fallback takeaways if none extracted
  const displayTakeaways =
    keyTakeaways.length > 0
      ? keyTakeaways
      : [
          {
            id: "1",
            title: "Great job completing this session!",
            description: "Review your notes and flashcards to reinforce what you've learned today.",
          },
        ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: subjectColor }}
          >
            <FontAwesomeIcon icon={subjectIcon} className="text-white text-xl" />
          </div>
          <div>
            <p className="text-neutral-500 text-sm">
              {overview.subject_name} • Step {overview.step_index} of {overview.total_steps}
            </p>
            <h1 className="text-2xl font-bold text-primary-900">{overview.topic_name}</h1>
          </div>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* Key Takeaways */}
      <section>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faLightbulb} className="text-primary-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-900">What You've Learned</h2>
              <p className="text-neutral-500 text-sm">The key points from this session</p>
            </div>
          </div>

          <div className="space-y-3">
            {displayTakeaways.map((takeaway, index) => (
              <KeyTakeawayCard key={takeaway.id} takeaway={takeaway} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Help Me Remember (Memory Tools) */}
      <section>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faBrain} className="text-primary-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-900">Help Me Remember</h2>
              <p className="text-neutral-500 text-sm">Create a song to help the facts stick!</p>
            </div>
          </div>

          {!mnemonicSuitable ? (
            <MnemonicNotAvailable subjectName={overview.subject_name} />
          ) : !mnemonic || mnemonic.status === "failed" ? (
            <div className="space-y-5">
              <div className="p-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faRobot} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-900 mb-1">StudyBuddy's Music Maker</h3>
                    <p className="text-neutral-600 text-sm">
                      Pick a music style and I'll create a catchy song to help you remember the key facts!
                    </p>
                  </div>
                </div>

                <MnemonicStyleSelector
                  selectedStyle={selectedStyle}
                  onSelect={handleSelectStyle}
                  disabled={isGenerating}
                />

                {selectedStyle && (
                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      onClick={handleGenerateMnemonic}
                      disabled={isGenerating || saving}
                      className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faWandMagicSparkles} />
                      <span>Make My Song!</span>
                    </button>
                  </div>
                )}
              </div>

              {mnemonic?.status === "failed" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-800 text-sm">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" />
                    The last attempt didn't work. Try a different style or continue without a song.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <MnemonicPlayer mnemonic={mnemonic} sessionId={overview.revision_session_id} />
          )}
        </div>
      </section>

      {/* Encouragement */}
      <section>
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-card p-6 text-white">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faRobot} className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Amazing progress!</h3>
              <p className="text-primary-50 mb-3 text-sm">
                You've covered the key concepts for {overview.topic_name}. Take a moment to look over the
                points above — they'll help in your exams!
              </p>
              <p className="text-primary-100 text-xs flex items-center space-x-2">
                <FontAwesomeIcon icon={faLightbulb} />
                <span>Top tip: Try explaining what you learned to someone else — it really helps it stick!</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Continue */}
      <section>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-primary-900 mb-1">Ready to wrap up?</h3>
              <p className="text-neutral-600 text-sm">One quick reflection and you're done!</p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
            >
              <span>Continue</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
