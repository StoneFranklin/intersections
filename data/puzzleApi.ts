import { supabase } from "@/lib/supabase";
import { FencepostsDailyPuzzle, Puzzle, Word } from "@/types/game";

const GRID_SIZE = 4;

// optional sanity check
function isFencepostsDailyPuzzle(payload: any): payload is FencepostsDailyPuzzle {
  return (
    payload &&
    typeof payload.date === 'string' &&
    Array.isArray(payload.rowCategoryIds) &&
    Array.isArray(payload.colCategoryIds) &&
    Array.isArray(payload.cells)
  );
}

export async function getDailyPuzzle(date: string): Promise<FencepostsDailyPuzzle | null> {
  const { data, error } = await supabase
    .from('daily_puzzle')
    .select('payload')
    .eq('puzzle_date', date)
    .maybeSingle();  // returns null if not found

  if (error) {
    console.error('Error fetching daily puzzle:', error);
    return null;
  }

  const payload = data?.payload;

  if (!isFencepostsDailyPuzzle(payload)) {
    console.error('Daily puzzle payload has unexpected shape:', payload);
    return null;
  }

  return payload;
}

/**
 * Convert category ID to display label
 * e.g. "red_things" -> "Red Things"
 */
function categoryIdToLabel(id: string): string {
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert FencepostsDailyPuzzle (DB format) to Puzzle (game format)
 */
export function convertToPuzzle(dbPuzzle: FencepostsDailyPuzzle): Puzzle {
  // Convert category IDs to Category objects
  const rowCategories = dbPuzzle.rowCategoryIds.map(id => ({
    id,
    label: categoryIdToLabel(id),
  }));

  const colCategories = dbPuzzle.colCategoryIds.map(id => ({
    id,
    label: categoryIdToLabel(id),
  }));

  // Convert cells to Word objects
  const words: Word[] = dbPuzzle.cells.map((cell, index) => ({
    id: `word-${index}`,
    text: cell.word,
    correctRowId: cell.rowCategoryId,
    correctColId: cell.colCategoryId,
  }));

  return {
    id: `daily-${dbPuzzle.date}`,
    title: `Daily Puzzle`,
    difficulty: 'medium',
    rowCategories,
    colCategories,
    words,
  };
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Fetch and convert today's puzzle for the game
 */
export async function fetchTodaysPuzzle(): Promise<Puzzle | null> {
  const date = getTodayDateString();
  const dbPuzzle = await getDailyPuzzle(date);
  
  if (!dbPuzzle) {
    return null;
  }
  
  return convertToPuzzle(dbPuzzle);
}
