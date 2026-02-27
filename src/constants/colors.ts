// src/constants/colors.ts
// Centralized color constants matching Tailwind theme

export const COLORS = {
  // Primary colors
  primary: {
    50: "#F7F4FF",
    100: "#EAE3FF",
    200: "#D6C7FF",
    300: "#C3B5FF",
    400: "#9A84FF",
    500: "#744FFF",
    600: "#5B2CFF", // Main brand purple
    700: "#4520C5",
    800: "#32168E",
    900: "#2A185E",
  },

  // Neutral colors
  neutral: {
    0: "#FFFFFF",
    50: "#F9FAFC",
    100: "#F6F7FB",
    200: "#E1E4EE",
    300: "#CFD3E0",
    400: "#A8AEBD",
    500: "#6C7280",
    600: "#4B5161",
    700: "#1F2330",
    800: "#121420",
    900: "#050611",
  },

  // Accent colors
  accent: {
    green: "#1EC592",
    amber: "#FFB547",
    red: "#F05151",
    blue: "#5B8DEF",
    purple: "#7C3AED",
    pink: "#EC4899",
    orange: "#F97316",
    lime: "#84CC16",
    indigo: "#6366F1",
  },

  // Semantic colors
  success: "#1EC592",
  warning: "#FFB547",
  danger: "#F05151",
  info: "#5B8DEF",

  // Chart colors (for data visualization)
  chart: [
    "#5B2CFF", // primary-600
    "#9A84FF", // primary-400
    "#C3B5FF", // primary-300
    "#1EC592", // accent-green
    "#FFB547", // accent-amber
    "#F05151", // accent-red
  ],
} as const;

// Activity-specific colors
export const ACTIVITY_COLORS = {
  completed: COLORS.accent.green,
  submitted: COLORS.primary[600],
  needs_practice: COLORS.accent.amber,
} as const;

// Status colors
export const STATUS_COLORS = {
  on_track: COLORS.accent.green,
  needs_attention: COLORS.accent.amber,
  behind: COLORS.accent.red,
  completed: COLORS.accent.purple,
  not_started: COLORS.neutral[400],
} as const;

/**
 * Subject color mapping - centralized color assignments for GCSE subjects
 * Maps subject names (normalized, lowercase) to color values from our token system
 */
export const SUBJECT_COLOR_MAP: Record<string, string> = {
  // Core subjects
  "maths": COLORS.primary[600],
  "mathematics": COLORS.primary[600],
  "english": COLORS.accent.blue,
  "english language": COLORS.accent.blue,
  "english literature": COLORS.accent.indigo,

  // Sciences
  "science": COLORS.accent.green,
  "combined science": COLORS.accent.green,
  "physics": COLORS.accent.blue,
  "chemistry": COLORS.accent.green,
  "biology": COLORS.accent.lime,

  // Humanities
  "history": COLORS.accent.amber,
  "geography": COLORS.accent.lime,
  "religious studies": COLORS.accent.purple,
  "re": COLORS.accent.purple,
  "religious education": COLORS.accent.purple,

  // Languages
  "french": COLORS.accent.pink,
  "spanish": COLORS.accent.red,
  "german": COLORS.accent.orange,
  "languages": COLORS.accent.purple,

  // Creative & Practical
  "art": COLORS.accent.pink,
  "art and design": COLORS.accent.pink,
  "music": COLORS.accent.purple,
  "drama": COLORS.accent.pink,
  "design and technology": COLORS.accent.orange,
  "dt": COLORS.accent.orange,
  "food technology": COLORS.accent.orange,

  // Computing & Business
  "computer science": COLORS.accent.indigo,
  "computing": COLORS.accent.indigo,
  "ict": COLORS.accent.blue,
  "business studies": COLORS.accent.blue,
  "business": COLORS.accent.blue,
  "economics": COLORS.accent.amber,

  // Physical Education
  "pe": COLORS.accent.red,
  "physical education": COLORS.accent.red,
  "sport": COLORS.accent.red,

  // Additional subjects
  "psychology": COLORS.accent.purple,
  "sociology": COLORS.accent.indigo,
  "citizenship": COLORS.accent.blue,
  "media studies": COLORS.accent.pink,
};

/**
 * Get subject color from token system
 * Falls back to primary-600 if subject not found
 *
 * @param subjectName - Name of the subject (e.g., "Maths", "English Language")
 * @returns Hex color value from COLORS token system
 *
 * @example
 * const color = getSubjectColor("Maths"); // Returns "#5B2CFF"
 * const color = getSubjectColor("Unknown Subject"); // Returns "#5B2CFF" (fallback)
 */
export function getSubjectColor(subjectName?: string | null): string {
  if (!subjectName) return COLORS.primary[600];

  const normalized = subjectName.toLowerCase().trim();
  return SUBJECT_COLOR_MAP[normalized] || COLORS.primary[600];
}
