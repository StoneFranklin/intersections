import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Get the puzzle number for a given date from the database.
 * Puzzle #1 is the earliest puzzle in the database.
 *
 * @param puzzleDate - Date string in YYYY-MM-DD format
 * @returns Promise resolving to the puzzle number, or 0 if not found/error
 */
export async function getPuzzleNumber(puzzleDate: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('daily_puzzle')
      .select('puzzle_number')
      .eq('puzzle_date', puzzleDate)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching puzzle number:', error);
      return 0;
    }

    if (!data || data.puzzle_number == null) {
      logger.warn('No puzzle number found for date:', puzzleDate);
      return 0;
    }

    return data.puzzle_number;
  } catch (error) {
    logger.error('Error in getPuzzleNumber:', error);
    return 0;
  }
}

/**
 * Format a puzzle as "Intersections #N"
 *
 * @param puzzleNumber - The puzzle number (1-based)
 * @returns Formatted string or fallback
 */
export function formatPuzzleTitle(puzzleNumber: number): string {
  return puzzleNumber > 0 ? `Intersections #${puzzleNumber}` : 'Practice Puzzle';
}
