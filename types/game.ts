/**
 * Core types for the Fenceposts word puzzle game
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

export interface FencepostsCell {
  word: string;
  rowCategoryId: CategoryId;
  colCategoryId: CategoryId;
}

export interface FencepostsDailyPuzzle {
  date: string;                  // "YYYY-MM-DD"
  rowCategoryIds: CategoryId[];  // length 4
  colCategoryIds: CategoryId[];  // length 4
  cells: FencepostsCell[];       // length 16, row-major
}

