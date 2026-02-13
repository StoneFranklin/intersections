/**
 * Core types for the Intersections word puzzle game
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Category {
  id: string;
  label: string;
}

export interface Word {
  id: string;
  text: string;
  /** The correct row category ID this word belongs to */
  correctRowId: string;
  /** The correct column category ID this word belongs to */
  correctColId: string;
}

export interface Puzzle {
  id: string;
  title: string;
  difficulty: Difficulty;
  /** Row categories (left side) */
  rowCategories: Category[];
  /** Column categories (top) */
  colCategories: Category[];
  /** All words in this puzzle */
  words: Word[];
}

export interface CellPosition {
  rowIndex: number;
  colIndex: number;
}

export interface PlacedWord {
  wordId: string;
  position: CellPosition;
}

export interface GameState {
  puzzle: Puzzle;
  /** Words that have been placed on the grid */
  placements: PlacedWord[];
  /** Currently selected word ID (from the tray) */
  selectedWordId: string | null;
  /** Whether the puzzle is solved */
  isSolved: boolean;
  /** Current number of lives */
  lives: number;
}

/** Check if a word placement is correct based on row and column */
export function isPlacementCorrect(
  word: Word,
  position: CellPosition,
  puzzle: Puzzle
): boolean {
  const rowCategory = puzzle.rowCategories[position.rowIndex];
  const colCategory = puzzle.colCategories[position.colIndex];
  
  return (
    word.correctRowId === rowCategory.id &&
    word.correctColId === colCategory.id
  );
}

/** Check if the entire puzzle is solved correctly */
export function isPuzzleSolved(
  placements: PlacedWord[],
  puzzle: Puzzle
): boolean {
  // Must have all words placed
  if (placements.length !== puzzle.words.length) {
    return false;
  }
  
  // Each placement must be correct
  for (const placement of placements) {
    const word = puzzle.words.find(w => w.id === placement.wordId);
    if (!word || !isPlacementCorrect(word, placement.position, puzzle)) {
      return false;
    }
  }
  
  return true;
}

// types.ts
export type CategoryId = string;

export interface IntersectionsCell {
  word: string;
  rowCategoryId: CategoryId;
  colCategoryId: CategoryId;
}

export interface IntersectionsDailyPuzzle {
  date: string;                  // "YYYY-MM-DD"
  rowCategoryIds: CategoryId[];  // length 4
  colCategoryIds: CategoryId[];  // length 4
  cells: IntersectionsCell[];       // length 16, row-major
}

/**
 * Score tracking for a completed puzzle
 */
export interface GameScore {
  /** Time taken in seconds */
  timeSeconds: number;
  /** Number of incorrect placements made */
  mistakes: number;
  /** Final calculated score (higher is better) */
  score: number;
  /** Number of correct placements (out of 16) */
  correctPlacements: number;
  /** Whether the puzzle was fully solved */
  completed: boolean;
  /** Percentile rank (0-100, calculated after submission) */
  percentile?: number;
  /** Database ID of the score record (for claiming anonymous scores) */
  scoreId?: string;
}

/**
 * Calculate score based on correct placements and mistakes
 *
 * Scoring hierarchy (strict):
 * 1. CORRECT PLACEMENTS: More correct ALWAYS beats fewer correct
 * 2. MISTAKES: Fewer mistakes ALWAYS beats more mistakes (same correct count)
 * 3. TIME: Handled externally - the leaderboard and database already use
 *    time_seconds as a tiebreaker when scores are equal (see getScoreRank)
 *
 * Score range: 1-1000 (whole numbers)
 *
 * Structure: Each correct placement owns a 62-point band.
 * Within each band, each mistake reduces the score by 1 point.
 * This guarantees the hierarchy for up to 61 mistakes per band.
 * With extreme mistakes, scores clamp to the band floor (1 point above
 * the previous band's ceiling) to preserve "more correct always wins".
 */
export function calculateScore(
  timeSeconds: number,
  mistakes: number,
  correctPlacements: number = 16,
  totalCells: number = 16
): number {
  if (correctPlacements === 0) {
    return 1;
  }

  // Each correct placement gets a 62-point band
  // 16 * 62 = 992, plus 8-point bonus for perfect game = 1000
  const BAND_SIZE = 62;
  const PERFECT_BONUS = totalCells * BAND_SIZE < 1000 ? 1000 - totalCells * BAND_SIZE : 0; // 8 points

  // Band ceiling for this correctness level (best possible score)
  const ceiling = correctPlacements * BAND_SIZE + (correctPlacements === totalCells ? PERFECT_BONUS : 0);

  // Band floor: 1 point above the previous level's ceiling
  // This guarantees more correct ALWAYS wins
  const floor = (correctPlacements - 1) * BAND_SIZE + 1;

  // Each mistake costs 1 point within the band
  const score = ceiling - mistakes;

  // Clamp to band floor (never drop into previous correctness band)
  return Math.max(floor, Math.min(1000, score));
}

