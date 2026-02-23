// src/utils/colorUtils.ts
// Shared colour manipulation utilities

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
