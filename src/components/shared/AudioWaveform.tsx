// src/components/shared/AudioWaveform.tsx
// FEAT-011 Phase 3c: Real-time audio waveform visualisation
//
// Canvas-based animated bars driven by Web Audio API AnalyserNode.
// Used by VoiceRecorder for visual feedback during recording.

import { useEffect, useRef } from "react";
import { COLORS } from "../../constants/colors";

// =============================================================================
// Types
// =============================================================================

interface AudioWaveformProps {
  /** Web Audio API AnalyserNode connected to audio source */
  analyser: AnalyserNode | null;
  /** Whether to animate the waveform */
  isActive: boolean;
  /** Number of frequency bars to display */
  barCount?: number;
  /** Color of the bars (Tailwind color or hex) */
  barColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Width of the canvas */
  width?: number;
  /** Height of the canvas */
  height?: number;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_BAR_COUNT = 20;
const DEFAULT_BAR_COLOR = COLORS.accent.purple; // accent-purple
const DEFAULT_BG_COLOR = "transparent";
const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 40;

// =============================================================================
// Helpers
// =============================================================================

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));

  // Prefer native roundRect when available
  const anyCtx = ctx as unknown as { roundRect?: (...args: any[]) => void };
  if (typeof anyCtx.roundRect === "function") {
    ctx.beginPath();
    anyCtx.roundRect(x, y, w, h, radius);
    ctx.fill();
    return;
  }

  // Fallback path
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  ctx.fill();
}

function withAlpha(hexOrCss: string, alphaHex: string) {
  // If user passes a hex like #RRGGBB or #RGB, we can append alpha.
  // If not, return as-is (CSS names, rgb(), hsl(), etc).
  const s = (hexOrCss || "").trim();
  if (s.startsWith("#")) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      const r = hex[0];
      const g = hex[1];
      const b = hex[2];
      return `#${r}${r}${g}${g}${b}${b}${alphaHex}`;
    }
    if (hex.length === 6) return `#${hex}${alphaHex}`;
    if (hex.length === 8) return `#${hex.slice(0, 6)}${alphaHex}`;
  }
  return hexOrCss;
}

// =============================================================================
// Component
// =============================================================================

export default function AudioWaveform({
  analyser,
  isActive,
  barCount = DEFAULT_BAR_COUNT,
  barColor = DEFAULT_BAR_COLOR,
  backgroundColor = DEFAULT_BG_COLOR,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  className = "",
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure backing store matches props (in case CSS scales it)
    canvas.width = width;
    canvas.height = height;

    // Set up / refresh data array for frequency data
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    } else {
      dataArrayRef.current = null;
    }

    const minBarHeight = 4;
    const radius = 2;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const safeBarCount = Math.max(1, Math.floor(barCount));
      const slotW = canvas.width / safeBarCount;
      const barWidth = slotW * 0.7;
      const barGap = slotW * 0.3;

      if (analyser && dataArrayRef.current && isActive) {
        // Get frequency data (Uint8Array is the expected type)
        analyser.getByteFrequencyData(dataArrayRef.current);

        // Calculate bar heights from frequency data
        const step = Math.max(1, Math.floor(dataArrayRef.current.length / safeBarCount));

        for (let i = 0; i < safeBarCount; i++) {
          let sum = 0;
          const start = i * step;
          const end = Math.min(start + step, dataArrayRef.current.length);

          for (let j = start; j < end; j++) sum += dataArrayRef.current[j] || 0;

          const average = sum / Math.max(1, end - start);

          const normalizedHeight = Math.max(
            minBarHeight,
            (average / 255) * (canvas.height - 4)
          );

          const x = i * (barWidth + barGap) + barGap / 2;
          const y = (canvas.height - normalizedHeight) / 2;

          ctx.fillStyle = barColor;
          drawRoundedRect(ctx, x, y, barWidth, normalizedHeight, radius);
        }
      } else {
        // Idle state: draw minimal bars
        const idleColor = isActive ? barColor : withAlpha(barColor, "40"); // ~25% opacity for hex
        ctx.fillStyle = idleColor;

        for (let i = 0; i < Math.max(1, Math.floor(barCount)); i++) {
          const x = i * (barWidth + barGap) + barGap / 2;
          const y = (canvas.height - minBarHeight) / 2;
          drawRoundedRect(ctx, x, y, barWidth, minBarHeight, radius);
        }
      }

      if (isActive) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    // Start / stop
    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [analyser, isActive, barCount, barColor, backgroundColor, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ width, height }}
    />
  );
}
