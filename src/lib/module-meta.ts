// Per-module mystical metadata: kanji glyph, aura hue, roman numeral

export const MODULE_KANJI: Record<number, string> = {
  1: "愛", // Love
  2: "技", // Skill
  3: "求", // Need
  4: "報", // Reward / Paid for
  5: "道", // The Way
  6: "光", // Light
};

export const MODULE_HUE: Record<number, number> = {
  1: 30,  // amber
  2: 270, // violet
  3: 0,   // crimson
  4: 150, // emerald
  5: 210, // azure
  6: 45,  // gold
};

export const ROMAN: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI",
};
