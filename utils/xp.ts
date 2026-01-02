/**
 * XP and leveling system utilities
 *
 * XP is earned from puzzle scores. Daily puzzles give full XP, archive puzzles give 50%.
 * Players can watch an ad after completing a puzzle to double their XP gain.
 *
 * Level progression uses an exponential curve where each level requires more XP.
 */

/**
 * Calculate XP earned from a puzzle score
 * @param score - The puzzle score (0-1000)
 * @param isDaily - Whether this is a daily puzzle (true) or archive puzzle (false)
 * @returns The base XP earned (before any multipliers like double XP)
 */
export function calculateXP(score: number, isDaily: boolean): number {
  // Base XP is score / 10 (so max 100 XP per puzzle)
  const baseXP = Math.floor(score / 10);

  // Archive puzzles give 50% XP to incentivize daily play
  if (!isDaily) {
    return Math.floor(baseXP * 0.5);
  }

  return baseXP;
}

/**
 * XP required to reach a specific level
 * Uses exponential curve: XP = 100 * level^1.5
 *
 * Level 1: 100 XP
 * Level 2: 283 XP
 * Level 5: 1,118 XP
 * Level 10: 3,162 XP
 * Level 20: 8,944 XP
 * Level 50: 35,355 XP
 * Level 100: 100,000 XP
 */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate current level from total XP
 * Inverse of xpRequiredForLevel: level = (XP / 100)^(2/3)
 */
export function levelFromXP(totalXP: number): number {
  if (totalXP <= 0) return 1;

  // Binary search for the level since we use floor in xpRequiredForLevel
  let low = 1;
  let high = 1000; // Max level cap

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    if (xpRequiredForLevel(mid) <= totalXP) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return low;
}

/**
 * Get XP progress within current level
 * @returns Object with current XP in level, XP needed for next level, and progress percentage
 */
export function getLevelProgress(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  progress: number; // 0-1
} {
  const level = levelFromXP(totalXP);
  const xpForCurrentLevel = xpRequiredForLevel(level);
  const xpForNextLevel = xpRequiredForLevel(level + 1);

  const currentLevelXP = totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeeded > 0 ? currentLevelXP / xpNeeded : 1;

  return {
    level,
    currentLevelXP,
    xpForNextLevel: xpNeeded,
    progress: Math.min(1, Math.max(0, progress)),
  };
}

/**
 * Format XP for display (e.g., "1,234 XP")
 */
export function formatXP(xp: number): string {
  return `${xp.toLocaleString()} XP`;
}

/**
 * Get a title/rank name for a level
 * Can be customized with themed names
 */
export function getLevelTitle(level: number): string {
  if (level >= 100) return 'Grandmaster';
  if (level >= 75) return 'Master';
  if (level >= 50) return 'Expert';
  if (level >= 35) return 'Adept';
  if (level >= 25) return 'Skilled';
  if (level >= 15) return 'Journeyman';
  if (level >= 10) return 'Apprentice';
  if (level >= 5) return 'Novice';
  return 'Beginner';
}
