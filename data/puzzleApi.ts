import { supabase } from "@/lib/supabase";
import { IntersectionsDailyPuzzle, Puzzle, Word } from "@/types/game";
import { Friend, FriendRequest, UserSearchResult } from "@/types/friends";
import { logger } from "@/utils/logger";
import { validateDisplayName } from "@/utils/displayNameValidation";

const GRID_SIZE = 4;

// Lock to prevent concurrent reconciliation attempts
let reconciliationInProgress: string | null = null;

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
    logger.error('Error fetching daily puzzle:', error);
    return null;
  }

  const payload = data?.payload;

  if (!isIntersectionsDailyPuzzle(payload)) {
    logger.error('Daily puzzle payload has unexpected shape:', payload);
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
 * Returns the percentile rank (0-100), the rank, and the score ID
 * If userId is provided, links the score to the user
 */
export async function submitScore(
  score: number,
  timeSeconds: number,
  mistakes: number,
  correctPlacements: number,
  userId?: string
): Promise<{ percentile: number; rank: number; scoreId: string } | null> {
  const puzzleDate = getTodayDateString();

  try {
    // If user is logged in, check if they already have a score (prevents duplicates)
    if (userId) {
      const existingScore = await getUserTodayScore(userId);
      if (existingScore) {
        // User already has a score - return their existing rank/percentile
        logger.log('User already has a score for today, skipping submission');
        const percentile = await getScorePercentile(puzzleDate, existingScore.score);
        const rank = await getScoreRank(puzzleDate, existingScore.score, existingScore.timeSeconds);
        return { percentile, rank, scoreId: existingScore.id };
      }
    }

    // Insert the score (with optional user_id)
    const scoreData: {
      puzzle_date: string;
      score: number;
      time_seconds: number;
      mistakes: number;
      correct_placements: number;
      user_id?: string;
    } = {
      puzzle_date: puzzleDate,
      score,
      time_seconds: timeSeconds,
      mistakes,
      correct_placements: correctPlacements,
    };

    if (userId) {
      scoreData.user_id = userId;
    }

    const { data, error: insertError } = await supabase
      .from('puzzle_scores')
      .insert(scoreData)
      .select('id')
      .single();

    if (insertError || !data) {
      logger.error('Error submitting score:', insertError);
      return null;
    }

    // Calculate percentile and rank
    const percentile = await getScorePercentile(puzzleDate, score);
    const rank = await getScoreRank(puzzleDate, score, timeSeconds);
    return { percentile, rank, scoreId: data.id };
  } catch (e) {
    logger.error('Error in submitScore:', e);
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
    // Get count of scores lower than this score (only signed-in users)
    const { count: lowerCount, error: lowerError } = await supabase
      .from('puzzle_scores')
      .select('*', { count: 'exact', head: true })
      .eq('puzzle_date', puzzleDate)
      .not('user_id', 'is', null)
      .lt('score', score);

    if (lowerError) {
      logger.error('Error getting lower scores:', lowerError);
      return 50; // Default to 50th percentile on error
    }

    // Get total count of scores for today (only signed-in users)
    const { count: totalCount, error: totalError } = await supabase
      .from('puzzle_scores')
      .select('*', { count: 'exact', head: true })
      .eq('puzzle_date', puzzleDate)
      .not('user_id', 'is', null);

    if (totalError || !totalCount) {
      logger.error('Error getting total scores:', totalError);
      return 50;
    }

    // Percentile = (number of scores below / total scores) * 100
    const percentile = Math.round(((lowerCount || 0) / totalCount) * 100);
    return percentile;
  } catch (e) {
    logger.error('Error calculating percentile:', e);
    return 50;
  }
}

/**
 * Get the rank for a score on a given date
 * Returns the position (1 = first place)
 */
export async function getScoreRank(
  puzzleDate: string,
  score: number,
  timeSeconds: number
): Promise<number> {
  try {
    // Get count of scores better than this score (higher score, or same score with faster time)
    // Only count signed-in users
    const { count: betterCount, error } = await supabase
      .from('puzzle_scores')
      .select('*', { count: 'exact', head: true })
      .eq('puzzle_date', puzzleDate)
      .not('user_id', 'is', null)
      .or(`score.gt.${score},and(score.eq.${score},time_seconds.lt.${timeSeconds})`);

    if (error) {
      logger.error('Error getting rank:', error);
      return 1;
    }

    return (betterCount || 0) + 1;
  } catch (e) {
    logger.error('Error calculating rank:', e);
    return 1;
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
      .eq('puzzle_date', puzzleDate)
      .not('user_id', 'is', null);

    if (error || !data || data.length === 0) {
      return null;
    }

    const scores = data.map(d => d.score);
    const totalPlayers = scores.length;
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalPlayers);
    const topScore = Math.max(...scores);

    return { totalPlayers, averageScore, topScore };
  } catch (e) {
    logger.error('Error getting today stats:', e);
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
      logger.error('Error getting user streak:', error);
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
    logger.error('Error in getUserStreak:', e);
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
      logger.error('Error updating user streak:', error);
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
    logger.error('Error in updateUserStreak:', e);
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
      logger.error('Error checking user completion:', error);
      return false;
    }

    return (count || 0) > 0;
  } catch (e) {
    logger.error('Error in hasUserCompletedToday:', e);
    return false;
  }
}

/**
 * Get user's score for today
 */
export async function getUserTodayScore(userId: string): Promise<{
  id: string;
  score: number;
  timeSeconds: number;
  mistakes: number;
  correctPlacements: number;
} | null> {
  const puzzleDate = getTodayDateString();

  try {
    const { data, error } = await supabase
      .from('puzzle_scores')
      .select('id, score, time_seconds, mistakes, correct_placements')
      .eq('puzzle_date', puzzleDate)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      score: data.score,
      timeSeconds: data.time_seconds,
      mistakes: data.mistakes,
      correctPlacements: data.correct_placements ?? 16,
    };
  } catch (e) {
    logger.error('Error in getUserTodayScore:', e);
    return null;
  }
}

export interface LeaderboardEntry {
  rank: number;
  score: number;
  timeSeconds: number;
  correctPlacements: number;
  mistakes: number;
  displayName: string | null;
  avatarUrl: string | null;
  isCurrentUser: boolean;
}

async function fetchDisplayNames(userIds: string[]): Promise<Map<string, string>> {
  const displayNames = new Map<string, string>();
  const uniqueUserIds = Array.from(new Set(userIds)).filter(Boolean);

  if (uniqueUserIds.length === 0) return displayNames;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', uniqueUserIds);

    if (!error && data) {
      for (const profile of data) {
        if (profile?.id && profile?.display_name) {
          displayNames.set(profile.id, profile.display_name);
        }
      }
      return displayNames;
    }
  } catch {
    // Fall through to per-user queries below
  }

  // Fallback to per-user queries (keeps working even if RLS behaves unexpectedly on .in())
  for (const userId of uniqueUserIds) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.display_name) {
        displayNames.set(profile.id, profile.display_name);
      }
    } catch {
      // Ignore individual lookup failures
    }
  }

  return displayNames;
}

interface UserProfile {
  displayName: string | null;
  avatarUrl: string | null;
}

async function fetchUserProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
  const profiles = new Map<string, UserProfile>();
  const uniqueUserIds = Array.from(new Set(userIds)).filter(Boolean);

  if (uniqueUserIds.length === 0) return profiles;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', uniqueUserIds);

    if (!error && data) {
      for (const profile of data) {
        if (profile?.id) {
          profiles.set(profile.id, {
            displayName: profile.display_name || null,
            avatarUrl: profile.avatar_url || null,
          });
        }
      }
      return profiles;
    }
  } catch {
    // Fall through to per-user queries below
  }

  // Fallback to per-user queries (keeps working even if RLS behaves unexpectedly on .in())
  for (const userId of uniqueUserIds) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        profiles.set(profile.id, {
          displayName: profile.display_name || null,
          avatarUrl: profile.avatar_url || null,
        });
      }
    } catch {
      // Ignore individual lookup failures
    }
  }

  return profiles;
}

export async function getTodayLeaderboardPage(params?: {
  from?: number;
  pageSize?: number;
  currentUserId?: string;
}): Promise<{ entries: LeaderboardEntry[]; hasMore: boolean; nextFrom: number }> {
  const puzzleDate = getTodayDateString();
  const from = params?.from ?? 0;
  const pageSize = params?.pageSize ?? 50;
  const currentUserId = params?.currentUserId;

  try {
    const { data, error } = await supabase
      .from('puzzle_scores')
      .select('score, time_seconds, correct_placements, mistakes, user_id')
      .eq('puzzle_date', puzzleDate)
      .not('user_id', 'is', null)
      .order('score', { ascending: false })
      .order('time_seconds', { ascending: true })
      .range(from, from + pageSize);

    if (error) {
      logger.error('Error fetching leaderboard page:', error);
      return { entries: [], hasMore: false, nextFrom: from };
    }

    const rows = data || [];
    const hasMore = rows.length > pageSize;
    const pageRows = rows.slice(0, pageSize);

    const userIds = pageRows
      .filter(r => r.user_id)
      .map(r => r.user_id as string);

    const userProfiles = await fetchUserProfiles(userIds);

    const entries: LeaderboardEntry[] = pageRows.map((row, index) => {
      const profile = row.user_id ? userProfiles.get(row.user_id) : null;
      return {
        rank: from + index + 1,
        score: row.score,
        timeSeconds: row.time_seconds,
        correctPlacements: row.correct_placements || 0,
        mistakes: row.mistakes || 0,
        displayName: profile?.displayName || null,
        avatarUrl: profile?.avatarUrl || null,
        isCurrentUser: currentUserId ? row.user_id === currentUserId : false,
      };
    });

    return { entries, hasMore, nextFrom: from + pageRows.length };
  } catch (e) {
    logger.error('Error in getTodayLeaderboardPage:', e);
    return { entries: [], hasMore: false, nextFrom: from };
  }
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
      .select('score, time_seconds, correct_placements, mistakes, user_id')
      .eq('puzzle_date', puzzleDate)
      .not('user_id', 'is', null)
      .order('score', { ascending: false })
      .order('time_seconds', { ascending: true })
      .limit(50);

    if (error) {
      logger.error('Error fetching leaderboard:', error);
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

    // Get user profiles for users who have user_id
    const userIds = sortedEntries
      .filter(e => e.user_id)
      .map(e => e.user_id as string);

    logger.log('Fetching user profiles for user IDs:', userIds);

    const userProfiles = await fetchUserProfiles(userIds);

    logger.log('User profiles map:', Object.fromEntries(userProfiles));

    // Build leaderboard entries
    const leaderboard: LeaderboardEntry[] = sortedEntries.map((entry, index) => {
      const profile = entry.user_id ? userProfiles.get(entry.user_id) : null;
      return {
        rank: index + 1,
        score: entry.score,
        timeSeconds: entry.time_seconds,
        correctPlacements: entry.correct_placements || 0,
        mistakes: entry.mistakes || 0,
        displayName: profile?.displayName || null,
        avatarUrl: profile?.avatarUrl || null,
        isCurrentUser: currentUserId ? entry.user_id === currentUserId : false,
      };
    });

    // If current user is logged in and not in top 10, find their position
    if (currentUserId) {
      const userInTop10 = leaderboard.some(e => e.isCurrentUser);
      
      if (!userInTop10) {
        // Fetch user's best score for today and compute rank via count query (does not depend on top-N fetch)
        const { data: userEntry, error: userEntryError } = await supabase
          .from('puzzle_scores')
          .select('score, time_seconds, correct_placements, mistakes, user_id')
          .eq('puzzle_date', puzzleDate)
          .eq('user_id', currentUserId)
          .order('score', { ascending: false })
          .order('time_seconds', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (userEntryError) {
          logger.error('Error fetching current user score:', userEntryError);
        }

        if (userEntry) {
          const rank = await getScoreRank(puzzleDate, userEntry.score, userEntry.time_seconds);
          if (!userProfiles.has(currentUserId)) {
            const extraProfiles = await fetchUserProfiles([currentUserId]);
            for (const [id, profile] of extraProfiles.entries()) {
              userProfiles.set(id, profile);
            }
          }
          const currentUserProfile = userProfiles.get(currentUserId);

          leaderboard.push({
            rank,
            score: userEntry.score,
            timeSeconds: userEntry.time_seconds,
            correctPlacements: userEntry.correct_placements || 0,
            mistakes: userEntry.mistakes || 0,
            displayName: currentUserProfile?.displayName || null,
            avatarUrl: currentUserProfile?.avatarUrl || null,
            isCurrentUser: true,
          });
        }
      }
    }

    return leaderboard;
  } catch (e) {
    logger.error('Error in getTodayLeaderboard:', e);
    return [];
  }
}

/**
 * Get or create user profile
 */
export async function getOrCreateProfile(userId: string): Promise<{ displayName: string | null; avatarUrl: string | null } | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error fetching profile:', error);
      return null;
    }

    if (!data) {
      // Create profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId });

      if (insertError) {
        logger.error('Error creating profile:', insertError);
      }
      return { displayName: null, avatarUrl: null };
    }

    return { displayName: data.display_name, avatarUrl: data.avatar_url };
  } catch (e) {
    logger.error('Error in getOrCreateProfile:', e);
    return null;
  }
}

/**
 * Update user's display name
 */
export type UpdateDisplayNameResult =
  | { success: true }
  | { success: false; error: 'invalid' | 'taken' | 'unknown' };

export async function updateDisplayName(userId: string, displayName: string): Promise<UpdateDisplayNameResult> {
  try {
    const validation = validateDisplayName(displayName);
    if (!validation.ok) {
      logger.warn('Invalid display name rejected by validation:', validation.error);
      return { success: false, error: 'invalid' };
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        display_name: validation.normalized
      }, {
        onConflict: 'id'
      });

    if (error) {
      logger.error('Error updating display name:', error);
      // Check for unique constraint violation (PostgreSQL error code 23505)
      if (error.code === '23505') {
        return { success: false, error: 'taken' };
      }
      return { success: false, error: 'unknown' };
    }

    return { success: true };
  } catch (e) {
    logger.error('Error in updateDisplayName:', e);
    return { success: false, error: 'unknown' };
  }
}

/**
 * Reconciliation result when a user signs in
 */
export interface ReconciliationResult {
  action: 'claimed_anonymous' | 'loaded_existing' | 'no_change';
  score?: {
    score: number;
    timeSeconds: number;
    mistakes: number;
    correctPlacements: number;
  };
  rank?: number;
  percentile?: number;
}

/**
 * Claim an anonymous score by updating the existing record with the user's ID
 * If scoreId is provided, updates that specific record
 * Otherwise falls back to inserting a new record (legacy behavior)
 */
export async function claimAnonymousScore(
  userId: string,
  scoreId: string | null,
  score: number,
  timeSeconds: number
): Promise<{ rank: number; percentile: number } | null> {
  const puzzleDate = getTodayDateString();

  try {
    // Check if user already has a score for today (prevents duplicates from race conditions)
    const existingScore = await getUserTodayScore(userId);
    if (existingScore) {
      // Already claimed - just return the rank/percentile
      const percentile = await getScorePercentile(puzzleDate, existingScore.score);
      const rank = await getScoreRank(puzzleDate, existingScore.score, existingScore.timeSeconds);
      return { rank, percentile };
    }

    if (scoreId) {
      // Update the existing anonymous record with the user's ID
      logger.log('Attempting to claim anonymous score:', { scoreId, userId });
      const { data: updateData, error: updateError } = await supabase
        .from('puzzle_scores')
        .update({ user_id: userId })
        .eq('id', scoreId)
        .is('user_id', null) // Only update if still anonymous
        .select('id');

      if (updateError) {
        logger.error('Error claiming anonymous score:', updateError);
        return null;
      }

      // Verify the update actually affected a row
      if (!updateData || updateData.length === 0) {
        logger.warn('claimAnonymousScore: No rows updated. Score may already be claimed or does not exist.', { scoreId });
        // Check if this user now owns the score (maybe it was already claimed by them)
        const checkResult = await supabase
          .from('puzzle_scores')
          .select('id, user_id')
          .eq('id', scoreId)
          .single();

        if (checkResult.data?.user_id === userId) {
          logger.log('Score already belongs to this user, continuing...');
        } else {
          logger.error('Score not claimed - belongs to:', checkResult.data?.user_id);
          return null;
        }
      } else {
        logger.log('Successfully claimed anonymous score:', updateData);
      }
    } else {
      // No scoreId - this shouldn't happen in normal flow, but handle gracefully
      logger.warn('claimAnonymousScore called without scoreId');
      return null;
    }

    // Calculate rank and percentile for the claimed score
    const percentile = await getScorePercentile(puzzleDate, score);
    const rank = await getScoreRank(puzzleDate, score, timeSeconds);

    return { rank, percentile };
  } catch (e) {
    logger.error('Error in claimAnonymousScore:', e);
    return null;
  }
}

/**
 * Reconcile score state when a user signs in
 *
 * This handles the following scenarios:
 * 1. User already has a DB score (played on another device) → Load existing
 * 2. Local score exists and user has no DB score → Claim that score
 * 3. No local score and no DB score → Allow new play
 */
export async function reconcileScoreOnSignIn(
  userId: string,
  localScore: {
    scoreId: string;
    score: number;
    timeSeconds: number;
    mistakes: number;
    correctPlacements: number;
  } | null
): Promise<ReconciliationResult> {
  // Prevent concurrent reconciliation for the same user
  if (reconciliationInProgress === userId) {
    logger.log('Reconciliation already in progress for user, skipping');
    return { action: 'no_change' };
  }

  reconciliationInProgress = userId;
  const puzzleDate = getTodayDateString();

  try {
    // First, check if user already has a score in the database
    const existingScore = await getUserTodayScore(userId);

    if (existingScore) {
      // User already played (on another device or earlier)
      // Load their existing score, ignore any local anonymous play
      const rank = await getScoreRank(puzzleDate, existingScore.score, existingScore.timeSeconds);
      const percentile = await getScorePercentile(puzzleDate, existingScore.score);

      return {
        action: 'loaded_existing',
        score: existingScore,
        rank,
        percentile,
      };
    }

    // User has no DB score - check if there's a local score to claim
    if (localScore) {
      // Claim the local score for this user by updating the existing record
      const result = await claimAnonymousScore(
        userId,
        localScore.scoreId,
        localScore.score,
        localScore.timeSeconds
      );

      if (result) {
        return {
          action: 'claimed_anonymous',
          score: localScore,
          rank: result.rank,
          percentile: result.percentile,
        };
      }
    }

    // No existing score and no local score to claim - allow new play
    return {
      action: 'no_change',
    };
  } catch (e) {
    logger.error('Error in reconcileScoreOnSignIn:', e);
    // On error, default to no_change to avoid blocking legitimate users
    return { action: 'no_change' };
  } finally {
    reconciliationInProgress = null;
  }
}

// ================== FRIENDS API ==================

/**
 * Search for users by display name (for adding friends)
 * Excludes the current user and returns friendship status
 */
export async function searchUsers(
  currentUserId: string,
  query: string,
  limit: number = 20
): Promise<UserSearchResult[]> {
  if (!query.trim()) return [];

  try {
    // Search profiles by display name
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${query}%`)
      .neq('id', currentUserId)
      .not('display_name', 'is', null)
      .limit(limit);

    if (profilesError) {
      logger.error('Error searching users:', profilesError);
      return [];
    }

    if (!profiles || profiles.length === 0) return [];

    // Get friendship status for each user
    const userIds = profiles.map(p => p.id);
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select('id, requester_id, addressee_id, status')
      .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
      .in('requester_id', [currentUserId, ...userIds])
      .in('addressee_id', [currentUserId, ...userIds]);

    if (friendshipsError) {
      logger.error('Error fetching friendships for search:', friendshipsError);
    }

    // Build a map of user ID to friendship status
    const friendshipMap = new Map<string, UserSearchResult['friendshipStatus']>();
    if (friendships) {
      for (const f of friendships) {
        const otherUserId = f.requester_id === currentUserId ? f.addressee_id : f.requester_id;
        if (f.status === 'accepted') {
          friendshipMap.set(otherUserId, 'accepted');
        } else if (f.status === 'pending') {
          if (f.requester_id === currentUserId) {
            friendshipMap.set(otherUserId, 'pending_outgoing');
          } else {
            friendshipMap.set(otherUserId, 'pending_incoming');
          }
        }
      }
    }

    return profiles.map(profile => ({
      id: profile.id,
      displayName: profile.display_name || 'Anonymous',
      avatarUrl: profile.avatar_url || null,
      friendshipStatus: friendshipMap.get(profile.id) || 'none',
    }));
  } catch (e) {
    logger.error('Error in searchUsers:', e);
    return [];
  }
}

/**
 * Send a friend request to another user
 */
export async function sendFriendRequest(
  requesterId: string,
  addresseeId: string
): Promise<{ success: boolean; error?: string; friendshipId?: string }> {
  try {
    // Check if friendship already exists in either direction
    const { data: existing, error: existingError } = await supabase
      .from('friendships')
      .select('id, status, requester_id')
      .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error('Error checking existing friendship:', existingError);
      return { success: false, error: 'Failed to check existing friendship' };
    }

    if (existing) {
      if (existing.status === 'accepted') {
        return { success: false, error: 'Already friends' };
      }
      if (existing.status === 'pending') {
        if (existing.requester_id === requesterId) {
          return { success: false, error: 'Friend request already sent' };
        } else {
          // They sent us a request - accept it instead
          const acceptResult = await acceptFriendRequest(existing.id, requesterId);
          if (acceptResult.success) {
            return { success: true, friendshipId: existing.id };
          }
          return { success: false, error: 'Failed to accept existing request' };
        }
      }
      if (existing.status === 'blocked') {
        return { success: false, error: 'Cannot send request to this user' };
      }
    }

    // Create new friend request
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Error sending friend request:', error);
      return { success: false, error: 'Failed to send friend request' };
    }

    return { success: true, friendshipId: data.id };
  } catch (e) {
    logger.error('Error in sendFriendRequest:', e);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(
  friendshipId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', friendshipId)
      .eq('addressee_id', userId)
      .eq('status', 'pending');

    if (error) {
      logger.error('Error accepting friend request:', error);
      return { success: false, error: 'Failed to accept friend request' };
    }

    return { success: true };
  } catch (e) {
    logger.error('Error in acceptFriendRequest:', e);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Decline a friend request
 */
export async function declineFriendRequest(
  friendshipId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .eq('addressee_id', userId)
      .eq('status', 'pending');

    if (error) {
      logger.error('Error declining friend request:', error);
      return { success: false, error: 'Failed to decline friend request' };
    }

    return { success: true };
  } catch (e) {
    logger.error('Error in declineFriendRequest:', e);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Cancel an outgoing friend request
 */
export async function cancelFriendRequest(
  friendshipId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .eq('requester_id', userId)
      .eq('status', 'pending');

    if (error) {
      logger.error('Error canceling friend request:', error);
      return { success: false, error: 'Failed to cancel friend request' };
    }

    return { success: true };
  } catch (e) {
    logger.error('Error in cancelFriendRequest:', e);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Remove a friend (unfriend)
 */
export async function removeFriend(
  friendshipId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) {
      logger.error('Error removing friend:', error);
      return { success: false, error: 'Failed to remove friend' };
    }

    return { success: true };
  } catch (e) {
    logger.error('Error in removeFriend:', e);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all pending friend requests (incoming and outgoing)
 */
export async function getFriendRequests(
  userId: string
): Promise<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }> {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('id, requester_id, addressee_id, status, created_at')
      .eq('status', 'pending')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) {
      logger.error('Error fetching friend requests:', error);
      return { incoming: [], outgoing: [] };
    }

    if (!data || data.length === 0) {
      return { incoming: [], outgoing: [] };
    }

    // Get all user IDs we need to look up
    const userIds = data.map(f =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );
    const profiles = await fetchUserProfiles(userIds);

    const incoming: FriendRequest[] = [];
    const outgoing: FriendRequest[] = [];

    for (const friendship of data) {
      const isIncoming = friendship.addressee_id === userId;
      const otherUserId = isIncoming ? friendship.requester_id : friendship.addressee_id;
      const profile = profiles.get(otherUserId);

      const request: FriendRequest = {
        id: friendship.id,
        user: {
          id: otherUserId,
          displayName: profile?.displayName || null,
          avatarUrl: profile?.avatarUrl || null,
        },
        status: friendship.status,
        createdAt: friendship.created_at,
        direction: isIncoming ? 'incoming' : 'outgoing',
      };

      if (isIncoming) {
        incoming.push(request);
      } else {
        outgoing.push(request);
      }
    }

    return { incoming, outgoing };
  } catch (e) {
    logger.error('Error in getFriendRequests:', e);
    return { incoming: [], outgoing: [] };
  }
}

/**
 * Get all accepted friends
 */
export async function getFriends(userId: string): Promise<Friend[]> {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('id, requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) {
      logger.error('Error fetching friends:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get the "other" user IDs
    const friendUserIds = data.map(f =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );
    const profiles = await fetchUserProfiles(friendUserIds);

    return data.map(friendship => {
      const friendId = friendship.requester_id === userId
        ? friendship.addressee_id
        : friendship.requester_id;
      const profile = profiles.get(friendId);
      return {
        id: friendId,
        displayName: profile?.displayName || null,
        avatarUrl: profile?.avatarUrl || null,
        friendshipId: friendship.id,
      };
    });
  } catch (e) {
    logger.error('Error in getFriends:', e);
    return [];
  }
}

/**
 * Get friend IDs for filtering leaderboard
 */
export async function getFriendIds(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) {
      logger.error('Error fetching friend IDs:', error);
      return [];
    }

    if (!data) return [];

    return data.map(f =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );
  } catch (e) {
    logger.error('Error in getFriendIds:', e);
    return [];
  }
}

/**
 * Get today's friends leaderboard (paginated)
 */
export async function getFriendsLeaderboardPage(params: {
  userId: string;
  from?: number;
  pageSize?: number;
}): Promise<{ entries: LeaderboardEntry[]; hasMore: boolean; nextFrom: number }> {
  const { userId, from = 0, pageSize = 50 } = params;
  const puzzleDate = getTodayDateString();

  try {
    // Get friend IDs
    const friendIds = await getFriendIds(userId);

    // Include self in the leaderboard
    const userIdsToInclude = [userId, ...friendIds];

    if (userIdsToInclude.length === 0) {
      return { entries: [], hasMore: false, nextFrom: from };
    }

    const { data, error } = await supabase
      .from('puzzle_scores')
      .select('score, time_seconds, correct_placements, mistakes, user_id')
      .eq('puzzle_date', puzzleDate)
      .in('user_id', userIdsToInclude)
      .order('score', { ascending: false })
      .order('time_seconds', { ascending: true })
      .range(from, from + pageSize);

    if (error) {
      logger.error('Error fetching friends leaderboard:', error);
      return { entries: [], hasMore: false, nextFrom: from };
    }

    const rows = data || [];
    const hasMore = rows.length > pageSize;
    const pageRows = rows.slice(0, pageSize);

    const userIds = pageRows
      .filter(r => r.user_id)
      .map(r => r.user_id as string);

    const userProfiles = await fetchUserProfiles(userIds);

    const entries: LeaderboardEntry[] = pageRows.map((row, index) => {
      const profile = row.user_id ? userProfiles.get(row.user_id) : null;
      return {
        rank: from + index + 1,
        score: row.score,
        timeSeconds: row.time_seconds,
        correctPlacements: row.correct_placements || 0,
        mistakes: row.mistakes || 0,
        displayName: profile?.displayName || null,
        avatarUrl: profile?.avatarUrl || null,
        isCurrentUser: row.user_id === userId,
      };
    });

    return { entries, hasMore, nextFrom: from + pageRows.length };
  } catch (e) {
    logger.error('Error in getFriendsLeaderboardPage:', e);
    return { entries: [], hasMore: false, nextFrom: from };
  }
}

/**
 * Get count of pending incoming requests (for badge)
 */
export async function getPendingRequestCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .eq('addressee_id', userId)
      .eq('status', 'pending');

    if (error) {
      logger.error('Error fetching pending request count:', error);
      return 0;
    }

    return count || 0;
  } catch (e) {
    logger.error('Error in getPendingRequestCount:', e);
    return 0;
  }
}

// ================== PUSH NOTIFICATIONS API ==================

/**
 * Register or update the user's Expo Push Token
 */
export async function registerPushToken(
  userId: string,
  pushToken: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ expo_push_token: pushToken })
      .eq('id', userId);

    if (error) {
      logger.error('Error registering push token:', error);
      return false;
    }

    logger.log('Push token registered successfully');
    return true;
  } catch (e) {
    logger.error('Error in registerPushToken:', e);
    return false;
  }
}

/**
 * Unregister the user's push token (on logout)
 */
export async function unregisterPushToken(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ expo_push_token: null })
      .eq('id', userId);

    if (error) {
      logger.error('Error unregistering push token:', error);
      return false;
    }

    logger.log('Push token unregistered successfully');
    return true;
  } catch (e) {
    logger.error('Error in unregisterPushToken:', e);
    return false;
  }
}
