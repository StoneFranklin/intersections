/**
 * Core types for the Fenceposts word puzzle game
 */

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
  /** Row categories (e.g., word lengths) */
  rowCategories: Category[];
  /** Column categories (e.g., semantic themes) */
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
  /** Number of incorrect placements made */
  mistakes: number;
}

/** Check if a word placement is correct */
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
