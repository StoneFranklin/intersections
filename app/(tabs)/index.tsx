import { LeaderboardScreen } from '@/components/leaderboard/leaderboard-screen';
import { CorrectAnswersScreen } from '@/components/screens/correct-answers-screen';
import { HowToPlayScreen } from '@/components/screens/how-to-play-screen';
import { useAuth } from '@/contexts/auth-context';
import { fetchTodaysPuzzle, getOrCreateProfile, getPercentile, getTodayLeaderboard, getTodayLeaderboardPage, getUserStreak, getUserTodayScore, hasUserCompletedToday, LeaderboardEntry, reconcileScoreOnSignIn, updateDisplayName, updateUserStreak } from '@/data/puzzleApi';
import { GameScore, Puzzle } from '@/types/game';
import { getTodayKey, getYesterdayKey } from '@/utils/dateKeys';
import {
  dailyCompletedKey,
  dailyRankKey,
  dailyScoreKey,
  extractClaimableAnonymousScore,
  getStoredLocalUserId,
  normalizeStoredDailyScore,
  safeJsonParse,
  serializeStoredDailyScore,
} from '@/utils/dailyScoreStorage';
import { validateDisplayName } from '@/utils/displayNameValidation';
import { logger } from '@/utils/logger';
import { areNotificationsEnabled, scheduleDailyNotification, setNotificationsEnabled } from '@/utils/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { GameContent } from './_components/game-content';
import { HomeMenu } from './_components/home-menu';
export default function GameScreen() {
  const { user, signInWithGoogle, signInWithApple, signOut } = useAuth();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [savedScore, setSavedScore] = useState<GameScore | null>(null);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTutorialScreen, setShowTutorial] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showSignIn, setShowSignIn] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signingInWithApple, setSigningInWithApple] = useState(false);
  const [showLeaderboardScreen, setShowLeaderboardScreen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [leaderboardLoaded, setLeaderboardLoaded] = useState(false);
  const [fullLeaderboard, setFullLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingFullLeaderboard, setLoadingFullLeaderboard] = useState(false);
  const [fullLeaderboardLoaded, setFullLeaderboardLoaded] = useState(false);
  const [fullLeaderboardFrom, setFullLeaderboardFrom] = useState(0);
  const [fullLeaderboardHasMore, setFullLeaderboardHasMore] = useState(true);
  const [showAnswersScreen, setShowAnswersScreen] = useState(false);
  const [todaysPuzzle, setTodaysPuzzle] = useState<Puzzle | null>(null);
  const [lastLeaderboardRefresh, setLastLeaderboardRefresh] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentGameEnded, setCurrentGameEnded] = useState(false);
  const [puzzleFetchError, setPuzzleFetchError] = useState<string | null>(null);

  // Helper to determine if a leaderboard entry is the current user
  // For logged-in users, this uses isCurrentUser from the API
  // For anonymous users, we match by rank (which was returned when they submitted their score)
  const isCurrentUserEntry = (entry: LeaderboardEntry): boolean => {
    if (entry.isCurrentUser) return true;
    if (!user && userRank) {
      return entry.rank === userRank;
    }
    return false;
  };

  // Display name state
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [signInBannerDismissed, setSignInBannerDismissed] = useState(true); // Start hidden until we check
  const displayNameRef = useRef<string | null>(null);

  // Notification settings state
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);

  // Check if sign-in banner was dismissed
  useEffect(() => {
    const checkBannerDismissed = async () => {
      try {
        const dismissed = await AsyncStorage.getItem('signInBannerDismissed');
        setSignInBannerDismissed(dismissed === 'true');
      } catch {
        setSignInBannerDismissed(false);
      }
    };
    if (!user) {
      checkBannerDismissed();
    }
  }, [user]);

  const dismissSignInBanner = async () => {
    setSignInBannerDismissed(true);
    try {
      await AsyncStorage.setItem('signInBannerDismissed', 'true');
    } catch (e) {
      logger.error('Error saving banner dismissed state:', e);
    }
  };

  // Track previous user for sign-out detection
  const prevUserForSignOutRef = useRef<string | null>(null);

  // Fetch display name when user logs in, clear state on sign-out
  useEffect(() => {
    if (user) {
      getOrCreateProfile(user.id).then(profile => {
        if (profile) {
          if (profile.displayName) {
            setDisplayName(profile.displayName);
            setShowDisplayNameModal(false);
            displayNameRef.current = profile.displayName;
          } else if (!displayNameRef.current) {
            // Show modal only if we don't already have a local display name
            setShowDisplayNameModal(true);
          }
        }
      });
      prevUserForSignOutRef.current = user.id;
    } else {
      // User signed out - clear display name and refresh leaderboard
      setDisplayName(null);
      displayNameRef.current = null;
      setLeaderboard([]);
      setLeaderboardLoaded(false);
      setFullLeaderboard([]);
      setFullLeaderboardLoaded(false);
      setFullLeaderboardFrom(0);
      setFullLeaderboardHasMore(true);
      setUserRank(null);
      setShowLeaderboardScreen(false);

      // If there was a previous user, refresh leaderboard to clear isCurrentUser flags
      if (prevUserForSignOutRef.current) {
        logger.log('User signed out, clearing leaderboard state');
        prevUserForSignOutRef.current = null;
      }
    }
  }, [user]);

  // Load notification preference
  useEffect(() => {
    const loadNotificationPreference = async () => {
      if (Platform.OS !== 'web') {
        const enabled = await areNotificationsEnabled();
        setNotificationsEnabledState(enabled);
      }
    };
    loadNotificationPreference();
  }, []);

  // Track previous user to detect sign-in events
  const prevUserRef = useRef<string | null>(null);

  // Reconcile score state when user signs in
  // This handles: anonymous->signed-in transfers and loading existing scores
  useEffect(() => {
    // Only run when user transitions from null to signed-in
    if (!user || prevUserRef.current === user.id) {
      prevUserRef.current = user?.id ?? null;
      return;
    }

    // Set immediately to prevent duplicate runs from concurrent renders
    prevUserRef.current = user.id;

    const runReconciliation = async (retryCount = 0) => {
      const todayKey = getTodayKey();
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // 1 second

      try {
        // Get local score if any (including scoreId for claiming anonymous scores)
        // Only claim anonymous scores (localUserId === null), not scores from other users
        let localScore: { scoreId: string; score: number; timeSeconds: number; mistakes: number; correctPlacements: number } | null = null;
        const scoreData = await AsyncStorage.getItem(dailyScoreKey(todayKey));
        logger.log('Reconciliation: Raw local score data:', scoreData);
        if (scoreData) {
          const parsed = safeJsonParse(scoreData);
          const parsedOwnerId = getStoredLocalUserId(parsed) ?? null;

          const claimable = extractClaimableAnonymousScore(parsed);
          logger.log('Reconciliation: Parsed local score:', {
            scoreId: (parsed as any)?.scoreId,
            localUserId: parsedOwnerId,
            score: (parsed as any)?.score,
          });

          if (claimable) {
            localScore = claimable;
            logger.log('Reconciliation: Will attempt to claim anonymous score');
          } else if ((parsed as any)?.score !== undefined && parsedOwnerId === null && !(parsed as any)?.scoreId) {
            // Score exists but scoreId is missing - the API submission might still be in progress
            // Retry after a delay to give it time to complete
            if (retryCount < MAX_RETRIES) {
              logger.log(`Reconciliation: Score found but no scoreId yet, retrying in ${RETRY_DELAY}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
              setTimeout(() => runReconciliation(retryCount + 1), RETRY_DELAY);
              return;
            } else {
              logger.log('Reconciliation: Max retries reached, scoreId still missing');
            }
          } else {
            logger.log('Reconciliation: Not claiming - scoreId:', !!(parsed as any)?.scoreId, 'localUserId:', parsedOwnerId);
          }
        } else {
          logger.log('Reconciliation: No local score found');
        }

        // Run reconciliation
        const result = await reconcileScoreOnSignIn(user.id, localScore);

        logger.log('Reconciliation result:', result);

        switch (result.action) {
          case 'loaded_existing':
            // User already played on another device - load their score
            if (result.score) {
              setSavedScore({
                score: result.score.score,
                timeSeconds: result.score.timeSeconds,
                mistakes: result.score.mistakes,
                correctPlacements: result.score.correctPlacements,
                completed: result.score.correctPlacements === 16,
              });
              setDailyCompleted(true);
              if (result.rank) setUserRank(result.rank);
              // Save to local storage for consistency, with localUserId set to this user
              await AsyncStorage.setItem(dailyCompletedKey(todayKey), 'true');
              await AsyncStorage.setItem(
                dailyScoreKey(todayKey),
                JSON.stringify(
                  serializeStoredDailyScore(
                    { ...(result.score as any), completed: result.score.correctPlacements === 16 } as GameScore,
                    user.id
                  )
                )
              );
            }
            break;

          case 'claimed_anonymous':
            // Anonymous score was claimed for this user - update rank/percentile
            if (result.rank) setUserRank(result.rank);
            // Update local storage to mark this score as belonging to this user
            if (result.score) {
              await AsyncStorage.setItem(
                dailyScoreKey(todayKey),
                JSON.stringify(
                  serializeStoredDailyScore(
                    { ...(result.score as any), completed: result.score.correctPlacements === 16 } as GameScore,
                    user.id
                  )
                )
              );
            }
            break;

          case 'no_change':
            // Fresh state - nothing to do
            break;
        }
      } catch (e) {
        logger.error('Error during sign-in reconciliation:', e);
      }
    };

    runReconciliation();
  }, [user]);

  const handleToggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabledState(newValue);
    await setNotificationsEnabled(newValue);
  };

  const handleSaveDisplayName = async () => {
    if (!user) return;

    const validation = validateDisplayName(displayNameInput);
    if (!validation.ok) {
      setDisplayNameError(validation.error || 'Invalid display name.');
      return;
    }
    
    setSavingDisplayName(true);
    try {
      const success = await updateDisplayName(user.id, validation.normalized);
      if (success) {
        setDisplayName(validation.normalized);
        displayNameRef.current = validation.normalized;
        setShowDisplayNameModal(false);
        setDisplayNameInput('');
        setDisplayNameError(null);
        const refreshedProfile = await getOrCreateProfile(user.id);
        if (refreshedProfile?.displayName) {
          setDisplayName(refreshedProfile.displayName);
          displayNameRef.current = refreshedProfile.displayName;
        }
      } else {
        setDisplayNameError('Unable to save that display name.');
      }
    } finally {
      setSavingDisplayName(false);
    }
  };

  // Load leaderboard data (for both preview and full modal)
  // This function loads all data atomically - leaderboard won't show until everything is ready
  const loadLeaderboard = async (opts?: { forceRefresh?: boolean }) => {
    if (!user) return;
    if (loadingLeaderboard && !opts?.forceRefresh) return;

    // If force refresh, mark as refreshing but keep existing data visible
    if (opts?.forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoadingLeaderboard(true);
    }

    try {
      logger.log('Loading leaderboard for user:', user?.id);

      // Load all data in parallel
      const [leaderboardData, puzzleData] = await Promise.all([
        getTodayLeaderboard(user?.id),
        !todaysPuzzle ? fetchTodaysPuzzle() : Promise.resolve(todaysPuzzle),
      ]);

      logger.log('Leaderboard data:', leaderboardData);

      // Find user's rank from the leaderboard data
      const userEntry = leaderboardData.find(e => e.isCurrentUser);
      logger.log('User entry found:', userEntry);

      // Set all state atomically - this ensures the UI updates together
      setLeaderboard(leaderboardData);
      if (userEntry) {
        setUserRank(userEntry.rank);
      }

      // Set puzzle data
      if (puzzleData) {
        setTodaysPuzzle(puzzleData);
      }

      setLeaderboardLoaded(true);
      setLastLeaderboardRefresh(Date.now());
    } catch (e) {
      logger.error('Error loading leaderboard:', e);
    } finally {
      setLoadingLeaderboard(false);
      setIsRefreshing(false);
    }
  };

  // Refresh leaderboard data (keeps existing data visible during refresh)
  const refreshLeaderboard = async () => {
    if (!user) return;
    await loadLeaderboard({ forceRefresh: true });
    // Also refresh the full leaderboard if it was loaded
    if (fullLeaderboardLoaded) {
      await loadFullLeaderboard({ reset: true });
    }
  };

  const loadFullLeaderboard = async (opts?: { reset?: boolean }) => {
    if (!user) return;
    if (loadingFullLeaderboard) return;
    if (!fullLeaderboardHasMore && !opts?.reset) return;

    setLoadingFullLeaderboard(true);
    try {
      const from = opts?.reset ? 0 : fullLeaderboardFrom;
      const page = await getTodayLeaderboardPage({ from, pageSize: 50, currentUserId: user?.id });
      setFullLeaderboard(prev => (opts?.reset ? page.entries : [...prev, ...page.entries]));
      setFullLeaderboardFrom(page.nextFrom);
      setFullLeaderboardHasMore(page.hasMore);
      setFullLeaderboardLoaded(true);
    } catch (e) {
      logger.error('Error loading full leaderboard:', e);
    } finally {
      setLoadingFullLeaderboard(false);
    }
  };

  // Load leaderboard when puzzle is completed
  useEffect(() => {
    if (user && dailyCompleted && !leaderboardLoaded && !loadingLeaderboard) {
      loadLeaderboard();
    }
  }, [dailyCompleted, leaderboardLoaded, loadingLeaderboard, user]);

  // Reload leaderboard when user changes (e.g., after login) to get correct "isCurrentUser" marking
  useEffect(() => {
    if (user && dailyCompleted && leaderboardLoaded) {
      // Reset and reload to get fresh user identification
      setLeaderboardLoaded(false);
      setUserRank(null);
      setFullLeaderboard([]);
      setFullLeaderboardLoaded(false);
      setFullLeaderboardFrom(0);
      setFullLeaderboardHasMore(true);
    }
  }, [user?.id]);

  // Auto-refresh leaderboard every 60 seconds when on home screen and puzzle is completed
  useEffect(() => {
    if (!user || !dailyCompleted || !leaderboardLoaded || isPlaying || showLeaderboardScreen) {
      return;
    }

    const REFRESH_INTERVAL = 60000; // 60 seconds
    const intervalId = setInterval(() => {
      // Only refresh if data is older than the refresh interval
      if (Date.now() - lastLeaderboardRefresh >= REFRESH_INTERVAL) {
        logger.log('Auto-refreshing leaderboard...');
        loadLeaderboard({ forceRefresh: true });
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [dailyCompleted, leaderboardLoaded, isPlaying, showLeaderboardScreen, lastLeaderboardRefresh, user]);

  const openLeaderboard = async () => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    setShowLeaderboardScreen(true);
    if (!leaderboardLoaded) {
      await loadLeaderboard();
    }
    if (!fullLeaderboardLoaded) {
      await loadFullLeaderboard({ reset: true });
    }
  };

  // Check if today's puzzle was already completed and load streak
  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const todayKey = getTodayKey();
        const yesterdayKey = getYesterdayKey();
        
        // If logged in, check database first
        if (user) {
          logger.log('Checking completion for user:', user.id, user.email);
          const dbCompleted = await hasUserCompletedToday(user.id);
          logger.log('DB completed:', dbCompleted);
          let hasAppliedCompletion = false;
          if (dbCompleted) {
            // Get score from database
            const dbScore = await getUserTodayScore(user.id);
            if (dbScore) {
              const hasScoreActivity =
                dbScore.score > 0 ||
                dbScore.timeSeconds > 0 ||
                dbScore.mistakes > 0 ||
                dbScore.correctPlacements > 0;
              if (!hasScoreActivity) {
                logger.warn('DB score is empty; treating as not completed.');
              } else {
                setDailyCompleted(true);
                const freshPercentile = await getPercentile(dbScore.score);
                setSavedScore({
                  score: dbScore.score,
                  timeSeconds: dbScore.timeSeconds,
                  mistakes: dbScore.mistakes,
                  correctPlacements: dbScore.correctPlacements,
                  completed: dbScore.correctPlacements === 16,
                  percentile: freshPercentile,
                });
                hasAppliedCompletion = true;
              }
            }
          } else {
            // User hasn't played on their account today - check local storage
            const scoreData = await AsyncStorage.getItem(dailyScoreKey(todayKey));
            if (scoreData) {
              const parsed = safeJsonParse(scoreData);
              const localScore = normalizeStoredDailyScore(parsed) ?? (parsed as any);
              const localUserId = getStoredLocalUserId(parsed) ?? null; // null = anon, string = userId

              if (localUserId === null) {
                // Anonymous play on this device - can be claimed by this user
                // Show as completed, reconciliation will claim the score
                setDailyCompleted(true);
                const freshPercentile = await getPercentile(localScore.score);
                localScore.percentile = freshPercentile;
                setSavedScore(localScore);
                hasAppliedCompletion = true;
              } else if (localUserId === user.id) {
                // This user played locally but DB doesn't have it (edge case, maybe offline)
                setDailyCompleted(true);
                const freshPercentile = await getPercentile(localScore.score);
                localScore.percentile = freshPercentile;
                setSavedScore(localScore);
                hasAppliedCompletion = true;
              }
              // else: Different user played locally - current user can play fresh
            }
          }

          if (!hasAppliedCompletion) {
            setDailyCompleted(false);
            setSavedScore(null);
            setUserRank(null);
          }

          // Get streak from database
          const dbStreak = await getUserStreak(user.id);
          if (dbStreak) {
            const todayDate = new Date().toISOString().split('T')[0];
            const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            
            if (dbStreak.lastPlayedDate === todayDate || dbStreak.lastPlayedDate === yesterdayDate) {
              setStreak(dbStreak.currentStreak);
            } else {
              setStreak(0);
            }
          }
        } else {
          // Not logged in - use local storage
          const completed = await AsyncStorage.getItem(dailyCompletedKey(todayKey));
          setDailyCompleted(completed === 'true');
          
          // Load saved score and rank if completed
          if (completed === 'true') {
            const scoreData = await AsyncStorage.getItem(dailyScoreKey(todayKey));
            if (scoreData) {
              const parsed = safeJsonParse(scoreData);
              const score = normalizeStoredDailyScore(parsed) ?? (parsed as GameScore);
              // Fetch fresh percentile from database
              const freshPercentile = await getPercentile(score.score);
              score.percentile = freshPercentile;
              setSavedScore(score);
            }
            // Load saved rank for anonymous users
            const savedRank = await AsyncStorage.getItem(dailyRankKey(todayKey));
            if (savedRank) {
              setUserRank(parseInt(savedRank, 10));
            }
          }
          
          // Calculate streak from local storage
          const savedStreak = await AsyncStorage.getItem('streak');
          const lastStreakDate = await AsyncStorage.getItem('lastStreakDate');
          
          if (savedStreak && lastStreakDate) {
            const streakCount = parseInt(savedStreak, 10);
            if (lastStreakDate === todayKey) {
              setStreak(streakCount);
            } else if (lastStreakDate === yesterdayKey) {
              setStreak(streakCount);
            } else {
              setStreak(0);
            }
          }
        }
      } catch (e) {
        logger.error('Error checking completion:', e);
      }
      setLoading(false);
    };
    checkCompletion();
  }, [user]);

  const [fetchingPuzzle, setFetchingPuzzle] = useState(false);

  const handlePlayDaily = async () => {
    setPuzzleFetchError(null);
    setFetchingPuzzle(true);
    setCurrentGameEnded(false);
    try {
      // Try to fetch from database first
      const dbPuzzle = await fetchTodaysPuzzle();
      if (dbPuzzle) {
        setPuzzle(dbPuzzle);
        // If already completed, open in review mode
        setIsReviewMode(dailyCompleted);
        setIsPlaying(true);
      } else {
        setPuzzleFetchError("Can't load today's puzzle. Check your connection and try again.");
      }
    } catch (e) {
      logger.error('Error fetching puzzle:', e);
      setPuzzleFetchError("Can't load today's puzzle. Check your connection and try again.");
    } finally {
      setFetchingPuzzle(false);
    }
  };

  const handleComplete = async (score: GameScore, rank: number | null) => {
    try {
      const todayKey = getTodayKey();
      const yesterdayKey = getYesterdayKey();
      const todayDate = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Always save to local storage with userId to track who played
      await AsyncStorage.setItem(dailyCompletedKey(todayKey), 'true');
      // Store localUserId with the score so we know who played on this device
      // null = anonymous, string = specific user
      const scoreWithUser = serializeStoredDailyScore(score, user?.id ?? null);
      logger.log('handleComplete: Saving score to AsyncStorage:', {
        scoreId: scoreWithUser.scoreId,
        localUserId: scoreWithUser.localUserId,
        score: scoreWithUser.score,
      });
      await AsyncStorage.setItem(dailyScoreKey(todayKey), JSON.stringify(scoreWithUser));
      if (rank) {
        await AsyncStorage.setItem(dailyRankKey(todayKey), rank.toString());
      }
      setDailyCompleted(true);
      setSavedScore(score);
      setCurrentGameEnded(true);
      if (rank) {
        setUserRank(rank);
      }
      
      // Calculate new streak
      let newStreak = 1;
      
      if (user) {
        // Logged in - get streak from database
        const dbStreak = await getUserStreak(user.id);
        if (dbStreak && dbStreak.lastPlayedDate === yesterdayDate) {
          newStreak = dbStreak.currentStreak + 1;
        } else if (dbStreak && dbStreak.lastPlayedDate === todayDate) {
          newStreak = dbStreak.currentStreak; // Already played today
        }
        // Update streak in database
        await updateUserStreak(user.id, newStreak, todayDate);
      } else {
        // Not logged in - use local storage
        const lastStreakDate = await AsyncStorage.getItem('lastStreakDate');
        const savedStreak = await AsyncStorage.getItem('streak');
        
        if (lastStreakDate === yesterdayKey && savedStreak) {
          newStreak = parseInt(savedStreak, 10) + 1;
        } else if (lastStreakDate === todayKey && savedStreak) {
          newStreak = parseInt(savedStreak, 10);
        }
      }
      
      // Save to local storage too (for offline/non-logged in consistency)
      await AsyncStorage.setItem('streak', newStreak.toString());
      await AsyncStorage.setItem('lastStreakDate', todayKey);
      setStreak(newStreak);

      // Schedule notification for tomorrow at 9 AM
      await scheduleDailyNotification();

      // Load leaderboard data for the results screen
      if (user) {
        loadLeaderboard();
      }
    } catch (e) {
      logger.error('Error saving completion:', e);
    }
  };

  const handleBack = () => {
    setIsPlaying(false);
    setIsReviewMode(false);
  };
  // Show full-screen leaderboard
  if (showLeaderboardScreen) {
    return (
      <LeaderboardScreen
        fullLeaderboard={fullLeaderboard}
        loadingFullLeaderboard={loadingFullLeaderboard}
        fullLeaderboardLoaded={fullLeaderboardLoaded}
        fullLeaderboardHasMore={fullLeaderboardHasMore}
        isRefreshing={isRefreshing}
        userRank={userRank}
        savedScore={savedScore}
        onBack={() => setShowLeaderboardScreen(false)}
        onRefresh={refreshLeaderboard}
        onLoadMore={() => loadFullLeaderboard()}
        isCurrentUserEntry={isCurrentUserEntry}
      />
    );
  }

  // Show full-screen correct answers
  if (showAnswersScreen) {
    return (
      <CorrectAnswersScreen
        puzzle={todaysPuzzle}
        onBack={() => setShowAnswersScreen(false)}
        onRetry={async () => {
          const puzzleData = await fetchTodaysPuzzle();
          if (puzzleData) {
            setTodaysPuzzle(puzzleData);
          }
        }}
      />
    );
  }
  // Show full-screen how to play
  if (showTutorialScreen) {
    return <HowToPlayScreen onBack={() => setShowTutorial(false)} />;
  }

  // Show main menu
  if (!isPlaying || !puzzle) {
    return (
      <HomeMenu
        user={user}
        displayName={displayName}
        streak={streak}
        loading={loading}
        dailyCompleted={dailyCompleted}
        fetchingPuzzle={fetchingPuzzle}
        leaderboard={leaderboard}
        loadingLeaderboard={loadingLeaderboard}
        leaderboardLoaded={leaderboardLoaded}
        userRank={userRank}
        savedScore={savedScore}
        isRefreshing={isRefreshing}
        puzzleFetchError={puzzleFetchError}
        showSignIn={showSignIn}
        setShowSignIn={setShowSignIn}
        signingIn={signingIn}
        setSigningIn={setSigningIn}
        signingInWithApple={signingInWithApple}
        setSigningInWithApple={setSigningInWithApple}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        showDisplayNameModal={showDisplayNameModal}
        setShowDisplayNameModal={setShowDisplayNameModal}
        displayNameInput={displayNameInput}
        setDisplayNameInput={(value) => {
          setDisplayNameInput(value);
          if (displayNameError) setDisplayNameError(null);
        }}
        displayNameError={displayNameError}
        savingDisplayName={savingDisplayName}
        onSaveDisplayName={handleSaveDisplayName}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        signInBannerDismissed={signInBannerDismissed}
        onDismissSignInBanner={dismissSignInBanner}
        isCurrentUserEntry={isCurrentUserEntry}
        onPlayDaily={handlePlayDaily}
        onOpenLeaderboard={openLeaderboard}
        onRefreshLeaderboard={refreshLeaderboard}
        onShowAnswers={() => setShowAnswersScreen(true)}
        onShowTutorial={() => setShowTutorial(true)}
        signInWithGoogle={signInWithGoogle}
        signInWithApple={signInWithApple}
        signOut={signOut}
      />
    );
  }

  return (
    <GameContent
      puzzle={puzzle}
      onBack={handleBack}
      onComplete={handleComplete}
      isReviewMode={isReviewMode}
      savedScore={savedScore}
      userId={user?.id}
      userRank={userRank}
      leaderboard={leaderboard}
      leaderboardLoaded={leaderboardLoaded}
      loadingLeaderboard={loadingLeaderboard}
      onShowAnswersModal={() => setShowAnswersScreen(true)}
      onOpenLeaderboard={openLeaderboard}
      onShowTutorial={() => setShowTutorial(true)}
      gameEnded={currentGameEnded}
    />
  );
}
