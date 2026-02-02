// src/constants/icons.ts
// Centralized icon system for consistent icon usage across the app

import type { IconKey } from "../components/ui/AppIcon";

/**
 * Subject Icon Mapping
 * Maps database icon names to Lucide icon names (used with AppIcon)
 * Used for subject icons across timetable, sessions, and dashboards
 */
export const SUBJECT_ICON_MAP: Record<string, IconKey> = {
  // Core subjects
  calculator: "calculator",
  book: "book",
  flask: "flask-conical",
  atom: "atom",
  globe: "globe",
  landmark: "landmark",
  dna: "dna",

  // Language & humanities
  language: "languages",
  languages: "languages",

  // Creative subjects
  palette: "palette",
  music: "music",
  "theater-masks": "drama",

  // Science & tech
  microscope: "microscope",
  "laptop-code": "laptop",

  // Other subjects
  dumbbell: "dumbbell",
  running: "person-standing",
  pray: "hands",
  cross: "cross",
  leaf: "leaf",
  utensils: "utensils",
  "balance-scale": "scale",
  "chart-line": "chart-line",

  // Subject name aliases (for convenience)
  history: "landmark",
  science: "flask-conical",
  maths: "calculator",
  math: "calculator",
  english: "book",
  geography: "globe",
  physics: "atom",
  chemistry: "flask-conical",
  biology: "dna",
  pe: "dumbbell",
  "physical-education": "dumbbell",
  art: "palette",
  drama: "drama",
  re: "hands",
  "religious-education": "hands",
  computing: "laptop",
  "computer-science": "laptop",
  ict: "laptop",
} as const;

/**
 * Get Lucide icon name from database subject icon name
 * Falls back to "book" if icon not found
 */
export function getSubjectIcon(iconName?: string | null): IconKey {
  if (!iconName) return "book";
  const normalized = iconName.toLowerCase().trim();
  return SUBJECT_ICON_MAP[normalized] || "book";
}

/**
 * Icon Size Constants
 * Use these for consistent icon sizing across the app
 */
export const ICON_SIZES = {
  xs: "w-3 h-3",      // 12px - tiny badges, inline text
  sm: "w-4 h-4",      // 16px - buttons, chips, small cards
  base: "w-5 h-5",    // 20px - default size, most UI elements
  lg: "w-6 h-6",      // 24px - larger buttons, prominent icons
  xl: "w-8 h-8",      // 32px - hero sections, empty states
  "2xl": "w-10 h-10", // 40px - large cards, avatars
  "3xl": "w-12 h-12", // 48px - very large UI elements
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/**
 * Get icon size class by size key
 * @example getIconSize('sm') → 'w-4 h-4'
 */
export function getIconSize(size: IconSize = 'base'): string {
  return ICON_SIZES[size];
}

/**
 * Status Icon Mapping
 * Icons used for different status states
 */
export const STATUS_ICONS = {
  // Session/task status
  not_started: "circle",
  started: "clock",
  in_progress: "clock",
  completed: "check-circle",
  skipped: "minus",

  // Plan/schedule status
  on_track: "check-circle",
  behind: "flame",
  needs_attention: "triangle-alert",
  complete: "check-circle",

  // Confidence levels
  very_confident: "rocket",
  confident: "check",
  neutral: "eye",
  unsure: "circle-question",
  struggling: "hand-heart",
} as const;

/**
 * Get status icon by status key
 */
export function getStatusIcon(status?: string): IconKey {
  if (!status) return "circle";
  const normalized = status.toLowerCase().replace(/_/g, '_');
  return (STATUS_ICONS[normalized as keyof typeof STATUS_ICONS] || "circle") as IconKey;
}

/**
 * Common icon usage patterns by context
 * Use these as reference for which icons to use where
 */
export const ICON_USAGE = {
  // Navigation
  navigation: {
    back: "arrow-left",
    forward: "arrow-right",
    close: "x",
    menu: "grip-vertical",
    expand: "chevron-down",
    collapse: "chevron-right",
  },

  // Actions
  actions: {
    add: "plus",
    remove: "minus",
    edit: "pencil",
    delete: "trash-2",
    save: "save",
    settings: "settings",
    search: "search",
    filter: "sliders-horizontal",
  },

  // Time & scheduling
  time: {
    calendar: "calendar",
    clock: "clock",
    deadline: "calendar-clock",
    completed_date: "calendar-check",
    blocked: "calendar-x",
    timer: "hourglass",
  },

  // Feedback & status
  feedback: {
    success: "check-circle",
    error: "triangle-alert",
    warning: "triangle-alert",
    info: "info",
    loading: "loader",
  },

  // Content
  content: {
    idea: "lightbulb",
    tip: "lightbulb",
    message: "message-circle",
    book: "book",
    reading: "book-open",
    learning: "graduation-cap",
  },

  // Progress & achievement
  progress: {
    target: "target",
    trophy: "trophy",
    star: "star",
    flame: "flame",
    streak: "flame",
    growth: "sprout",
    trend_up: "trending-up",
    trend_down: "trending-down",
  },

  // User & account
  user: {
    profile: "user",
    logout: "log-out",
    security: "shield",
    lock: "lock",
    unlock: "unlock",
    email: "mail",
  },

  // Rewards & premium
  rewards: {
    gift: "gift",
    points: "star",
    coins: "coins",
    wallet: "wallet",
    crown: "crown",
    ticket: "ticket",
  },
} as const;

/**
 * Icon documentation: which icons are used where
 *
 * ## Subject Icons
 * - Used in: Timetable cards, session cards, subject lists, progress widgets
 * - Files: TimetableHeroCard, TodayView, SessionList, SubjectCard
 * - Mapping: SUBJECT_ICON_MAP (database icon name → Lucide icon name)
 *
 * ## Status Icons
 * - Used in: Session status badges, plan status indicators, confidence levels
 * - Files: SessionItem, TimetableHeroCard, confidence selectors
 * - Mapping: STATUS_ICONS
 *
 * ## UI Icons
 * - Used in: Buttons, navigation, actions, feedback
 * - Files: All components via AppIcon
 * - Defined in: AppIcon.tsx ICON_MAP
 *
 * ## Icon Sizes
 * - xs (12px): Inline badges, tiny indicators
 * - sm (16px): Button icons, small cards
 * - base (20px): Default size for most UI
 * - lg (24px): Prominent buttons and icons
 * - xl (32px): Hero sections, empty states
 * - 2xl+ (40px+): Large cards, special UI
 */
