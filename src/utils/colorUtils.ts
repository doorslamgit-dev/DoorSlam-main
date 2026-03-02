// src/utils/colorUtils.ts
// Shared colour manipulation utilities

import { SUBJECT_PALETTE } from "../constants/colors";

/**
 * Convert a hex colour to rgba with the given alpha.
 *
 * @param hex - Hex colour string (e.g., "#5B2CFF" or "5B2CFF")
 * @param alpha - Alpha value between 0 and 1
 * @returns rgba() CSS string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Build a stable subject_id → palette colour mapping based on the order
 * subjects were added to the plan. The first subject gets palette[0],
 * the second palette[1], and so on (wraps if > 10 subjects).
 *
 * @param subjectIds - Subject IDs in their sort_order (ascending)
 * @returns Record mapping subject_id to a hex colour
 */
export function buildSubjectColorMap(
  subjectIds: string[]
): Record<string, string> {
  const map: Record<string, string> = {};
  subjectIds.forEach((id, index) => {
    map[id] = SUBJECT_PALETTE[index % SUBJECT_PALETTE.length] as string;
  });
  return map;
}
