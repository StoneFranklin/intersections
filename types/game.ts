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
}

/**
 * Calculate score based on correct placements, time, and mistakes
 * Partial completion gets proportional base score
 * Full completion gets a bonus
 * Max score is 1000
 */
export function calculateScore(
  timeSeconds: number, 
  mistakes: number,
  correctPlacements: number = 16,
  totalCells: number = 16
): number {
  const MAX_SCORE = 1000;
  const BASE_SCORE = 800;              // Base for full completion
  const COMPLETION_BONUS = 200;        // +200 for completing the puzzle (800 + 200 = 1000 max)
  const TIME_PENALTY_PER_SECOND = 2;   // -2 points per second
  const MISTAKE_PENALTY = 50;          // -50 points per mistake
  
  // Proportional base score based on correct placements
  const proportionalBase = Math.floor((correctPlacements / totalCells) * BASE_SCORE);
  
  // Bonus for full completion
  const completed = correctPlacements === totalCells;
  const completionBonus = completed ? COMPLETION_BONUS : 0;
  
  // Time penalty caps at 50% of base score
  const maxTimePenalty = proportionalBase * 0.5;
  const timePenalty = Math.min(Math.floor(timeSeconds * TIME_PENALTY_PER_SECOND), maxTimePenalty);
  
  const mistakePenalty = mistakes * MISTAKE_PENALTY;
  
  const score = proportionalBase + completionBonus - timePenalty - mistakePenalty;
  
  // Score between 0 and MAX_SCORE
  return Math.max(0, Math.min(MAX_SCORE, score));
}

