// src/components/child/summarystep/MnemonicPlayer.tsx

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import AppIcon from "../../ui/AppIcon";
import type { IconKey } from "../../ui/AppIcon";

import { MnemonicData } from "../../../types/child/summarystep";
import {
  MNEMONIC_STYLES,
  formatTime,
  resolveAudioUrl,
  safeIntSeconds,
} from "../../../services/child/summarystep";
import {
  isMnemonicFavourite,
  setMnemonicFavourite,
  startMnemonicPlay,
  endMnemonicPlay,
} from "../../../services/mnemonics/mnemonicActivityService";

interface MnemonicPlayerProps {
  mnemonic: MnemonicData;
  sessionId: string;
}

function getStyleIconKey(styleId: string | null | undefined): IconKey {
  // Map your mnemonic styles to your AppIcon keys (typed).
  // Adjust the IconKey values to match your canonical set if needed.
  const STYLE_ICON = {
    pop: "music",
    rap: "mic",
    rock: "guitar",
    edm: "sparkles",
    classical: "musicNote",
    default: "disc",
  } satisfies Record<string, IconKey>;

  if (!styleId) return STYLE_ICON.default;
  return STYLE_ICON[styleId] ?? STYLE_ICON.default;
}

export function MnemonicPlayer({ mnemonic, sessionId }: MnemonicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(mnemonic.durationSeconds ?? null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isMetadataReady, setIsMetadataReady] = useState(false);

  const [isFav, setIsFav] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  // Tracking refs (avoid stale closures)
  const playIdRef = useRef<string | null>(null);
  const playStartMsRef = useRef<number | null>(null);
  const currentTimeRef = useRef<number>(0);

  const styleConfig = useMemo(
    () => MNEMONIC_STYLES.find((s) => s.id === mnemonic.style),
    [mnemonic.style]
  );

  const styleIconKey = useMemo<IconKey>(() => getStyleIconKey(mnemonic.style), [mnemonic.style]);

  const resolvedAudioUrl = useMemo(
    () => resolveAudioUrl(mnemonic.audioUrl),
    [mnemonic.audioUrl]
  );

  const progressPercent = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  // Keep refs in sync
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Load favourite status
  useEffect(() => {
    let cancelled = false;

    async function loadFav() {
      if (mnemonic.status !== "ready") return;
      if (!mnemonic.mnemonicId) return;

      try {
        const fav = await isMnemonicFavourite({ mnemonicId: mnemonic.mnemonicId });
        if (!cancelled) setIsFav(fav);
      } catch (e) {
        console.error("[MnemonicPlayer] favourite lookup failed:", e);
      }
    }

    loadFav();
    return () => {
      cancelled = true;
    };
  }, [mnemonic.status, mnemonic.mnemonicId]);

  const stopPlayTracking = useCallback(async (completed: boolean) => {
    const playId = playIdRef.current;
    if (!playId) return;

    const startMs = playStartMsRef.current;
    const elapsedSeconds = startMs ? (Date.now() - startMs) / 1000 : currentTimeRef.current;

    try {
      await endMnemonicPlay({
        playId,
        playDurationSeconds:
          safeIntSeconds(elapsedSeconds) ?? safeIntSeconds(currentTimeRef.current) ?? 0,
        completed,
      });
    } catch (e) {
      console.error("[MnemonicPlayer] end play tracking failed:", e);
    } finally {
      playIdRef.current = null;
      playStartMsRef.current = null;
    }
  }, []);

  const startPlayTrackingIfNeeded = useCallback(async () => {
    if (!mnemonic.mnemonicId) return;
    if (playIdRef.current) return;

    try {
      const id = await startMnemonicPlay({
        mnemonicId: mnemonic.mnemonicId,
        sessionId,
        source: "summary",
      });
      playIdRef.current = id;
      playStartMsRef.current = Date.now();
    } catch (e) {
      console.error("[MnemonicPlayer] start play tracking failed:", e);
    }
  }, [mnemonic.mnemonicId, sessionId]);

  // Reset player state when mnemonic changes
  useEffect(() => {
    setIsPlaying(false);
    setDuration(mnemonic.durationSeconds ?? null);
    setCurrentTime(0);
    setAudioError(null);
    setIsMetadataReady(false);

    // Close any active play before switching
    void stopPlayTracking(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mnemonic.audioUrl, mnemonic.durationSeconds, mnemonic.style]);

  // Close any active play on unmount
  useEffect(() => {
    return () => {
      void stopPlayTracking(false);
    };
  }, [stopPlayTracking]);

  async function toggleFavourite() {
    if (!mnemonic.mnemonicId) return;
    if (favBusy) return;

    setFavBusy(true);
    const next = !isFav;
    setIsFav(next);

    try {
      await setMnemonicFavourite({
        mnemonicId: mnemonic.mnemonicId,
        makeFavourite: next,
      });
    } catch (e) {
      console.error("[MnemonicPlayer] favourite toggle failed:", e);
      setIsFav(!next);
    } finally {
      setFavBusy(false);
    }
  }

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError(null);

    if (!resolvedAudioUrl) {
      setAudioError("No audio URL was provided for this mnemonic.");
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        await stopPlayTracking(false);
        return;
      }

      await startPlayTrackingIfNeeded();

      const playPromise = audio.play();
      if (playPromise) await playPromise;

      setIsPlaying(true);
    } catch (err) {
      console.error("[MnemonicPlayer] play() failed:", err);
      setIsPlaying(false);
      await stopPlayTracking(false);
      setAudioError(
        "Audio couldn't be played. This is usually a private file URL, an expired signed link, or a CORS issue."
      );
    }
  }

  async function handleDownload() {
    if (!resolvedAudioUrl) return;

    try {
      const res = await fetch(resolvedAudioUrl);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `mnemonic-${mnemonic.style}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[MnemonicPlayer] download failed:", err);
      setAudioError("Couldn't download the audio file.");
    }
  }

  function handleSeek(clientX: number) {
    const audio = audioRef.current;
    if (!audio || !duration || duration <= 0) return;

    const bar = document.getElementById("mnemonic-progress-bar");
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const x = Math.min(rect.right, Math.max(rect.left, clientX));
    const pct = (x - rect.left) / rect.width;
    const nextTime = pct * duration;

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  if (mnemonic.status === "generating") {
    return (
      <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
        <div className="flex items-center justify-center space-x-4 py-8">
          <AppIcon name={"spinner" as IconKey} className="text-primary-600 text-3xl animate-spin" />
          <div>
            <p className="font-semibold text-primary-900">Creating your song...</p>
            <p className="text-neutral-600 text-sm">StudyBuddy is writing lyrics and making music</p>
          </div>
        </div>
      </div>
    );
  }

  if (mnemonic.status === "failed") {
    return (
      <div className="p-6 bg-accent-red/5 rounded-xl border border-accent-red/20">
        <p className="text-accent-red font-semibold mb-2">Oops! Something went wrong</p>
        <p className="text-neutral-600 text-sm">
          We couldn't make your song this time. Try picking a different style or skip for now.
        </p>
      </div>
    );
  }

  if (mnemonic.status !== "ready") return null;

  return (
    <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
      <audio
        ref={audioRef}
        src={resolvedAudioUrl ?? undefined}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = (e.currentTarget as HTMLAudioElement).duration;
          if (Number.isFinite(d)) {
            setDuration(d);
            setIsMetadataReady(true);
          } else {
            setIsMetadataReady(true);
          }
        }}
        onTimeUpdate={(e) => {
          const t = (e.currentTarget as HTMLAudioElement).currentTime;
          setCurrentTime(t);
        }}
        onPause={async () => {
          // Covers pauses not triggered via our button (mobile/browser behaviour)
          if (isPlaying) {
            setIsPlaying(false);
            await stopPlayTracking(false);
          }
        }}
        onEnded={async () => {
          setIsPlaying(false);
          setCurrentTime(0);
          await stopPlayTracking(true);
        }}
        onError={async () => {
          setIsPlaying(false);
          await stopPlayTracking(false);
          setAudioError(
            "Audio failed to load. Check that the URL is public or signed, and that CORS allows playback."
          );
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${
              styleConfig?.gradient || "from-primary-500 to-primary-600"
            }`}
          >
            <AppIcon name={styleIconKey} className="text-white text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-primary-900">Your {styleConfig?.name || "Song"}</h3>
            <p className="text-neutral-600 text-sm">
              {duration ? formatTime(duration) : isMetadataReady ? "Ready to play" : "Loading..."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleFavourite}
            disabled={!mnemonic.mnemonicId || favBusy}
            aria-pressed={isFav}
            aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-primary-50 transition disabled:opacity-50"
            title={isFav ? "Remove from favourites" : "Add to favourites"}
          >
            <AppIcon name={"heart" as IconKey} className={isFav ? "text-accent-red" : "text-primary-600"} />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!resolvedAudioUrl}
            aria-label="Download audio"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-primary-50 transition disabled:opacity-50"
            title="Download"
          >
            <AppIcon name={"download" as IconKey} className="text-primary-600" />
          </button>
        </div>
      </div>

      {/* Audio Player */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={togglePlay}
            disabled={!resolvedAudioUrl}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center hover:bg-primary-700 transition flex-shrink-0 disabled:opacity-50 disabled:hover:bg-primary-600"
            title={isPlaying ? "Pause" : "Play"}
          >
            <AppIcon name={(isPlaying ? "pause" : "play") as IconKey} className="text-white text-xl" />
          </button>

          <div className="flex-1">
            <div
              id="mnemonic-progress-bar"
              className="w-full bg-neutral-200 rounded-full h-2 mb-2 cursor-pointer"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={duration ?? 0}
              aria-valuenow={currentTime}
              onClick={(e) => handleSeek(e.clientX)}
            >
              <div
                className="bg-primary-600 h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-neutral-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {!resolvedAudioUrl && (
          <div className="mt-3 text-xs text-neutral-600 flex items-start space-x-2">
            <AppIcon name={"warning" as IconKey} className="mt-0.5" />
            <span>No audio URL found. Your n8n workflow needs to return a playable URL (public or signed).</span>
          </div>
        )}

        {audioError && (
          <div className="mt-3 text-xs text-accent-red flex items-start space-x-2">
            <AppIcon name={"warning" as IconKey} className="mt-0.5" />
            <span>{audioError}</span>
          </div>
        )}
      </div>

      {/* Lyrics */}
      <div className="bg-white rounded-xl p-5">
        <h4 className="font-semibold text-neutral-700 mb-3 flex items-center space-x-2">
          <AppIcon name={"disc" as IconKey} className="text-primary-600" />
          <span>Lyrics</span>
        </h4>
        <p className="text-neutral-700 whitespace-pre-line text-sm leading-relaxed">{mnemonic.lyrics}</p>
      </div>
    </div>
  );
}
