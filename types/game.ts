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
  /** The correct left row category ID this word belongs to */
  correctRowId: string;
  /** The correct column category ID this word belongs to */
  correctColId: string;
  /** The correct right row category ID this word belongs to (medium/hard only) */
  correctRightId?: string;
  /** The correct bottom column category ID this word belongs to (hard only) */
  correctBottomId?: string;
}

export interface Puzzle {
  id: string;
  title: string;
  difficulty: Difficulty;
  /** Left row categories */
  rowCategories: Category[];
  /** Column categories (top) */
  colCategories: Category[];
  /** Right row categories (medium/hard only) */
  rightCategories?: Category[];
  /** Bottom column categories (hard only) */
  bottomCategories?: Category[];
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

/** Check if a word placement is correct based on puzzle difficulty */
export function isPlacementCorrect(
  word: Word,
  position: CellPosition,
  puzzle: Puzzle
): boolean {
  const rowCategory = puzzle.rowCategories[position.rowIndex];
  const colCategory = puzzle.colCategories[position.colIndex];
  
  // Easy: Just check row and column
  if (puzzle.difficulty === 'easy') {
    return (
      word.correctRowId === rowCategory.id &&
      word.correctColId === colCategory.id
    );
  }
  
  // Medium: Also check right category
  if (puzzle.difficulty === 'medium') {
    const rightCategory = puzzle.rightCategories?.[position.rowIndex];
    return (
      word.correctRowId === rowCategory.id &&
      word.correctColId === colCategory.id &&
      word.correctRightId === rightCategory?.id
    );
  }
  
  // Hard: Check all four categories
  const rightCategory = puzzle.rightCategories?.[position.rowIndex];
  const bottomCategory = puzzle.bottomCategories?.[position.colIndex];
  return (
    word.correctRowId === rowCategory.id &&
    word.correctColId === colCategory.id &&
    word.correctRightId === rightCategory?.id &&
    word.correctBottomId === bottomCategory?.id
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
