// src/services/child/summarystep.ts

import { KeyTakeaway, TeachingSlide, MnemonicStyle } from "../../types/child/summarystep";
import { getSubjectIcon } from "../../constants/icons";

// =============================================================================
// Icon Mapping
// =============================================================================

export function getIconFromName(iconName?: string): string {
  return getSubjectIcon(iconName);
}

// =============================================================================
// Mnemonic Suitability
// =============================================================================

const MNEMONIC_SUITABLE_SUBJECTS = [
  "chemistry",
  "physics",
  "biology",
  "maths",
  "mathematics",
  "history",
  "geography",
  "computer science",
  "computing",
];

const MNEMONIC_UNSUITABLE_SUBJECTS = [
  "english literature",
  "english language",
  "religious studies",
  "art",
  "drama",
];

export function isSubjectMnemonicSuitable(subjectName: string): boolean {
  const normalised = subjectName.toLowerCase().trim();

  if (MNEMONIC_UNSUITABLE_SUBJECTS.some((s) => normalised.includes(s))) {
    return false;
  }

  if (MNEMONIC_SUITABLE_SUBJECTS.some((s) => normalised.includes(s))) {
    return true;
  }

  return false;
}

// =============================================================================
// Key Takeaways Extraction
// =============================================================================

export function extractKeyTakeaways(payload: {
  reinforce?: { slides?: TeachingSlide[] };
  summary?: { keyTakeaways?: KeyTakeaway[] };
}): KeyTakeaway[] {
  const takeaways: KeyTakeaway[] = [];

  // First, try to get from summary.keyTakeaways if already computed
  if (payload.summary?.keyTakeaways && payload.summary.keyTakeaways.length > 0) {
    return payload.summary.keyTakeaways;
  }

  // Extract from reinforce.slides[].key_points
  const slides = payload.reinforce?.slides ?? [];

  slides.forEach((slide, slideIndex) => {
    if (slide.key_points && slide.key_points.length > 0) {
      slide.key_points.forEach((point, pointIndex) => {
        takeaways.push({
          id: `${slide.id}-${pointIndex}`,
          title: slide.title || `Key Point ${slideIndex + 1}`,
          description: point,
        });
      });
    }
  });

  // If no key points found, create a summary from slide titles
  if (takeaways.length === 0 && slides.length > 0) {
    slides.forEach((slide, index) => {
      if (slide.title) {
        takeaways.push({
          id: `slide-${index}`,
          title: slide.title,
          description:
            slide.content?.substring(0, 150) + (slide.content?.length > 150 ? "..." : "") ||
            "Review this concept in your notes.",
        });
      }
    });
  }

  // Limit to 5 takeaways maximum
  return takeaways.slice(0, 5);
}

// =============================================================================
// Style Configuration
// =============================================================================

export const MNEMONIC_STYLES: Array<{
  id: MnemonicStyle;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  styleReference: string;
}> = [
  {
    id: "hip-hop",
    name: "Hip-Hop",
    description: "Catchy rap beats",
    icon: "mic",
    gradient: "from-primary-500 to-pink-500",
    styleReference: "street-anthem",
  },
  {
    id: "pop",
    name: "Pop",
    description: "Upbeat melody",
    icon: "music",
    gradient: "from-blue-500 to-cyan-500",
    styleReference: "upbeat-pop",
  },
  {
    id: "rock",
    name: "Rock",
    description: "Electric vibes",
    icon: "guitar",
    gradient: "from-orange-500 to-red-500",
    styleReference: "indie-rock",
  },
];

// =============================================================================
// Audio Helpers
// =============================================================================

export function formatTime(seconds: number | null | undefined): string {
  if (!seconds || Number.isNaN(seconds) || !Number.isFinite(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function resolveAudioUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) return raw;

  const AUDIO_BUCKET = "mnemonics";
  const path = raw.replace(/^\/+/, "");
  return `${supabaseUrl}/storage/v1/object/public/${AUDIO_BUCKET}/${path}`;
}

export function safeIntSeconds(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;
  if (value < 0) return 0;
  return Math.round(value);
}
