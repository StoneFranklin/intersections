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
 * Get the current percentile for a score (for today's puzzle)
 * This can be called later to get updated percentile as more players complete
 */
export async function getPercentile(score: number): Promise<number> {
  const puzzleDate = getTodayDateString();
  return getScorePercentile(puzzleDate, score);
}

/**
 * Submit a score for today's puzzle
 * Returns the percentile rank (0-100)
 * If userId is provided, links the score to the user
 */
export async function submitScore(
  score: number,
  timeSeconds: number,
  mistakes: number,
  userId?: string
): Promise<{ percentile: number } | null> {
  const puzzleDate = getTodayDateString();
  
  try {
    // Insert the score (with optional user_id)
    const scoreData: {
      puzzle_date: string;
      score: number;
      time_seconds: number;
      mistakes: number;
      user_id?: string;
    } = {
      puzzle_date: puzzleDate,
      score,
      time_seconds: timeSeconds,
      mistakes,
    };
    
    if (userId) {
      scoreData.user_id = userId;
    }
    
    const { error: insertError } = await supabase
      .from('puzzle_scores')
      .insert(scoreData);

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

/**
 * Get user's streak from database
 */
export async function getUserStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
} | null> {
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, last_played_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error getting user streak:', error);
      return null;
    }

    if (!data) {
      return { currentStreak: 0, longestStreak: 0, lastPlayedDate: null };
    }

    return {
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastPlayedDate: data.last_played_date,
    };
  } catch (e) {
    console.error('Error in getUserStreak:', e);
    return null;
  }
}

/**
 * Update user's streak in database
 */
export async function updateUserStreak(
  userId: string,
  currentStreak: number,
  lastPlayedDate: string
): Promise<boolean> {
  try {
    // Upsert - insert if not exists, update if exists
    const { error } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        current_streak: currentStreak,
        last_played_date: lastPlayedDate,
        longest_streak: currentStreak, // Will be updated by trigger or manually
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error updating user streak:', error);
      return false;
    }

    // Update longest streak if current is higher
    await supabase
      .from('user_streaks')
      .update({ longest_streak: currentStreak })
      .eq('user_id', userId)
      .lt('longest_streak', currentStreak);

    return true;
  } catch (e) {
    console.error('Error in updateUserStreak:', e);
    return false;
  }
}

/**
 * Check if user has already completed today's puzzle
 */
export async function hasUserCompletedToday(userId: string): Promise<boolean> {
  const puzzleDate = getTodayDateString();
  
  try {
    const { count, error } = await supabase
      .from('puzzle_scores')
      .select('*', { count: 'exact', head: true })
      .eq('puzzle_date', puzzleDate)
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking user completion:', error);
      return false;
    }

    return (count || 0) > 0;
  } catch (e) {
    console.error('Error in hasUserCompletedToday:', e);
    return false;
  }
}

/**
 * Get user's score for today
 */
export async function getUserTodayScore(userId: string): Promise<{
  score: number;
  timeSeconds: number;
  mistakes: number;
} | null> {
  const puzzleDate = getTodayDateString();
  
  try {
    const { data, error } = await supabase
      .from('puzzle_scores')
      .select('score, time_seconds, mistakes')
      .eq('puzzle_date', puzzleDate)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      score: data.score,
      timeSeconds: data.time_seconds,
      mistakes: data.mistakes,
    };
  } catch (e) {
    console.error('Error in getUserTodayScore:', e);
    return null;
  }
}

export interface LeaderboardEntry {
  rank: number;
  score: number;
  timeSeconds: number;
  displayName: string | null;
  isCurrentUser: boolean;
}

/**
 * Get today's leaderboard (top 10 + current user if not in top 10)
 */
export async function getTodayLeaderboard(currentUserId?: string): Promise<LeaderboardEntry[]> {
  const puzzleDate = getTodayDateString();
  
  try {
    // Get top scores - don't join profiles, fetch separately
    const { data, error } = await supabase
      .from('puzzle_scores')
      .select('score, time_seconds, user_id')
      .eq('puzzle_date', puzzleDate)
      .order('score', { ascending: false })
      .order('time_seconds', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Process and dedupe by user (keep best score per user)
    // Use a composite key for anonymous users: null_index
    const userBestScores = new Map<string, typeof data[0]>();
    let anonymousIndex = 0;
    
    for (const entry of data) {
      const key = entry.user_id || `anon_${anonymousIndex++}`;
      const existing = userBestScores.get(key);
      
      if (!existing || entry.score > existing.score || 
          (entry.score === existing.score && entry.time_seconds < existing.time_seconds)) {
        userBestScores.set(key, entry);
      }
    }

    // Convert to array and sort
    const sortedEntries = Array.from(userBestScores.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time_seconds - b.time_seconds;
      })
      .slice(0, 10);

    // Get display names for users who have user_id
    const userIds = sortedEntries
      .filter(e => e.user_id)
      .map(e => e.user_id as string);
    
    console.log('Fetching display names for user IDs:', userIds);
    
    const displayNames = new Map<string, string>();
    if (userIds.length > 0) {
      // Query each profile individually to debug RLS issues
      for (const userId of userIds) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .eq('id', userId)
          .maybeSingle();
        
        console.log(`Profile for ${userId}:`, { profile, error: profileError });
        
        if (profile?.display_name) {
          displayNames.set(profile.id, profile.display_name);
        }
      }
    }
    
    console.log('Display names map:', Object.fromEntries(displayNames));

    // Build leaderboard entries
    const leaderboard: LeaderboardEntry[] = sortedEntries.map((entry, index) => ({
      rank: index + 1,
      score: entry.score,
      timeSeconds: entry.time_seconds,
      displayName: entry.user_id ? displayNames.get(entry.user_id) || null : null,
      isCurrentUser: currentUserId ? entry.user_id === currentUserId : false,
    }));

    // If current user is logged in and not in top 10, find their position
    if (currentUserId) {
      const userInTop10 = leaderboard.some(e => e.isCurrentUser);
      
      if (!userInTop10) {
        // Find user's score in original data
        const userEntry = data.find(e => e.user_id === currentUserId);
        if (userEntry) {
          // Count how many scores are better
          const betterScores = data.filter(e => 
            e.score > userEntry.score || 
            (e.score === userEntry.score && e.time_seconds < userEntry.time_seconds)
          ).length;
          
          leaderboard.push({
            rank: betterScores + 1,
            score: userEntry.score,
            timeSeconds: userEntry.time_seconds,
            displayName: displayNames.get(currentUserId) || null,
            isCurrentUser: true,
          });
        }
      }
    }

    return leaderboard;
  } catch (e) {
    console.error('Error in getTodayLeaderboard:', e);
    return [];
  }
}

/**
 * Get or create user profile
 */
export async function getOrCreateProfile(userId: string): Promise<{ displayName: string | null } | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) {
      // Create profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId });
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
      }
      return { displayName: null };
    }

    return { displayName: data.display_name };
  } catch (e) {
    console.error('Error in getOrCreateProfile:', e);
    return null;
  }
}

/**
 * Update user's display name
 */
export async function updateDisplayName(userId: string, displayName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        display_name: displayName 
      }, { 
        onConflict: 'id' 
      });

    if (error) {
      console.error('Error updating display name:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Error in updateDisplayName:', e);
    return false;
  }
}
