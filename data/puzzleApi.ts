import { supabase } from "@/lib/supabase";
import { IntersectionsDailyPuzzle, Puzzle, Word } from "@/types/game";

const GRID_SIZE = 4;

// optional sanity check
function isIntersectionsDailyPuzzle(payload: any): payload is IntersectionsDailyPuzzle {
  return (
    payload &&
    typeof payload.date === 'string' &&
    Array.isArray(payload.rowCategoryIds) &&
    Array.isArray(payload.colCategoryIds) &&
    Array.isArray(payload.cells)
  );
}

export async function getDailyPuzzle(date: string): Promise<IntersectionsDailyPuzzle | null> {
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

  if (!isIntersectionsDailyPuzzle(payload)) {
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
 * Convert IntersectionsDailyPuzzle (DB format) to Puzzle (game format)
 */
export function convertToPuzzle(dbPuzzle: IntersectionsDailyPuzzle): Puzzle {
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

/**
 * Submit a score for today's puzzle
 * Returns the percentile rank (0-100)
 */
export async function submitScore(
  score: number,
  timeSeconds: number,
  mistakes: number
): Promise<{ percentile: number } | null> {
  const puzzleDate = getTodayDateString();
  
  try {
    // Insert the score
    const { error: insertError } = await supabase
      .from('puzzle_scores')
      .insert({
        puzzle_date: puzzleDate,
        score,
        time_seconds: timeSeconds,
        mistakes,
      });

    if (insertError) {
      console.error('Error submitting score:', insertError);
      return null;
    }

    // Calculate percentile
    const percentile = await getScorePercentile(puzzleDate, score);
    return { percentile };
  } catch (e) {
    console.error('Error in submitScore:', e);
    return null;
  }
}

/**
 * Get the percentile rank for a score on a given date
 * Returns 0-100, where 100 means you beat everyone
 */
export async function getScorePercentile(
  puzzleDate: string,
  score: number
): Promise<number> {
  try {
    // Get count of scores lower than this score
    const { count: lowerCount, error: lowerError } = await supabase
      .from('puzzle_scores')
      .select('*', { count: 'exact', head: true })
      .eq('puzzle_date', puzzleDate)
      .lt('score', score);

    if (lowerError) {
      console.error('Error getting lower scores:', lowerError);
      return 50; // Default to 50th percentile on error
    }

    // Get total count of scores for today
    const { count: totalCount, error: totalError } = await supabase
      .from('puzzle_scores')
      .select('*', { count: 'exact', head: true })
      .eq('puzzle_date', puzzleDate);

    if (totalError || !totalCount) {
      console.error('Error getting total scores:', totalError);
      return 50;
    }

    // Percentile = (number of scores below / total scores) * 100
    const percentile = Math.round(((lowerCount || 0) / totalCount) * 100);
    return percentile;
  } catch (e) {
    console.error('Error calculating percentile:', e);
    return 50;
  }
}

/**
 * Get today's leaderboard stats
 */
export async function getTodayStats(): Promise<{
  totalPlayers: number;
  averageScore: number;
  topScore: number;
} | null> {
  const puzzleDate = getTodayDateString();
  
  try {
    const { data, error } = await supabase
      .from('puzzle_scores')
      .select('score')
      .eq('puzzle_date', puzzleDate);

    if (error || !data || data.length === 0) {
      return null;
    }

    const scores = data.map(d => d.score);
    const totalPlayers = scores.length;
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalPlayers);
    const topScore = Math.max(...scores);

    return { totalPlayers, averageScore, topScore };
  } catch (e) {
    console.error('Error getting today stats:', e);
    return null;
  }
}
