import { GameGrid, WordTray } from '@/components/game';
import { RewardedAdModal } from '@/components/ads/rewarded-ad-modal';
import { LeaderboardScreen } from '@/components/leaderboard/leaderboard-screen';
import { CorrectAnswersScreen } from '@/components/screens/correct-answers-screen';
import { HowToPlayScreen } from '@/components/screens/how-to-play-screen';
import { useAuth } from '@/contexts/auth-context';
import { generateDailyPuzzle } from '@/data/puzzle-generator';
import { fetchTodaysPuzzle, getOrCreateProfile, getPercentile, getTodayLeaderboard, getTodayLeaderboardPage, getUserStreak, getUserTodayScore, hasUserCompletedToday, LeaderboardEntry, reconcileScoreOnSignIn, submitScore, updateDisplayName, updateUserStreak } from '@/data/puzzleApi';
import { useGameState } from '@/hooks/use-game-state';
import { useRewardedAd } from '@/hooks/use-rewarded-ad';
import { CellPosition, GameScore, Puzzle } from '@/types/game';
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
import { haptics } from '@/utils/haptics';
import { areNotificationsEnabled, scheduleDailyNotification, setNotificationsEnabled } from '@/utils/notificationService';
import { formatTime, shareScore } from '@/utils/share';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { styles } from './index.styles';
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [signInBannerDismissed, setSignInBannerDismissed] = useState(true); // Start hidden until we check

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
      console.error('Error saving banner dismissed state:', e);
    }
  };

  // Track previous user for sign-out detection
  const prevUserForSignOutRef = useRef<string | null>(null);

  // Fetch display name when user logs in, clear state on sign-out
  useEffect(() => {
    if (user) {
      getOrCreateProfile(user.id).then(profile => {
        if (profile) {
          setDisplayName(profile.displayName);
          // Show modal if no display name set
          if (!profile.displayName) {
            setShowDisplayNameModal(true);
          }
        }
      });
      prevUserForSignOutRef.current = user.id;
    } else {
      // User signed out - clear display name and refresh leaderboard
      setDisplayName(null);

      // If there was a previous user, refresh leaderboard to clear isCurrentUser flags
      if (prevUserForSignOutRef.current) {
        console.log('User signed out, refreshing leaderboard');
        loadLeaderboard({ forceRefresh: true });
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
  // This handles: anonymousâ†’signed-in transfers and loading existing scores
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
        console.log('Reconciliation: Raw local score data:', scoreData);
        if (scoreData) {
          const parsed = safeJsonParse(scoreData);
          const parsedOwnerId = getStoredLocalUserId(parsed) ?? null;

          const claimable = extractClaimableAnonymousScore(parsed);
          console.log('Reconciliation: Parsed local score:', {
            scoreId: (parsed as any)?.scoreId,
            localUserId: parsedOwnerId,
            score: (parsed as any)?.score,
          });

          if (claimable) {
            localScore = claimable;
            console.log('Reconciliation: Will attempt to claim anonymous score');
          } else if ((parsed as any)?.score !== undefined && parsedOwnerId === null && !(parsed as any)?.scoreId) {
            // Score exists but scoreId is missing - the API submission might still be in progress
            // Retry after a delay to give it time to complete
            if (retryCount < MAX_RETRIES) {
              console.log(`Reconciliation: Score found but no scoreId yet, retrying in ${RETRY_DELAY}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
              setTimeout(() => runReconciliation(retryCount + 1), RETRY_DELAY);
              return;
            } else {
              console.log('Reconciliation: Max retries reached, scoreId still missing');
            }
          } else {
            console.log('Reconciliation: Not claiming - scoreId:', !!(parsed as any)?.scoreId, 'localUserId:', parsedOwnerId);
          }
        } else {
          console.log('Reconciliation: No local score found');
        }

        // Run reconciliation
        const result = await reconcileScoreOnSignIn(user.id, localScore);

        console.log('Reconciliation result:', result);

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
        console.error('Error during sign-in reconciliation:', e);
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
    if (!user || !displayNameInput.trim()) return;
    
    setSavingDisplayName(true);
    const success = await updateDisplayName(user.id, displayNameInput.trim());
    if (success) {
      setDisplayName(displayNameInput.trim());
      setShowDisplayNameModal(false);
      setDisplayNameInput('');
    }
    setSavingDisplayName(false);
  };

  // Load leaderboard data (for both preview and full modal)
  // This function loads all data atomically - leaderboard won't show until everything is ready
  const loadLeaderboard = async (opts?: { forceRefresh?: boolean }) => {
    if (loadingLeaderboard && !opts?.forceRefresh) return;

    // If force refresh, mark as refreshing but keep existing data visible
    if (opts?.forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoadingLeaderboard(true);
    }

    try {
      console.log('Loading leaderboard for user:', user?.id);

      // Load all data in parallel
      const [leaderboardData, puzzleData] = await Promise.all([
        getTodayLeaderboard(user?.id),
        !todaysPuzzle ? fetchTodaysPuzzle() : Promise.resolve(todaysPuzzle),
      ]);

      console.log('Leaderboard data:', leaderboardData);

      // Find user's rank from the leaderboard data
      const userEntry = leaderboardData.find(e => e.isCurrentUser);
      console.log('User entry found:', userEntry);

      // Set all state atomically - this ensures the UI updates together
      setLeaderboard(leaderboardData);
      if (userEntry) {
        setUserRank(userEntry.rank);
      }

      // Set puzzle data
      if (puzzleData) {
        setTodaysPuzzle(puzzleData);
      } else if (!todaysPuzzle) {
        setTodaysPuzzle(generateDailyPuzzle());
      }

      setLeaderboardLoaded(true);
      setLastLeaderboardRefresh(Date.now());
    } catch (e) {
      console.error('Error loading leaderboard:', e);
    } finally {
      setLoadingLeaderboard(false);
      setIsRefreshing(false);
    }
  };

  // Refresh leaderboard data (keeps existing data visible during refresh)
  const refreshLeaderboard = async () => {
    await loadLeaderboard({ forceRefresh: true });
    // Also refresh the full leaderboard if it was loaded
    if (fullLeaderboardLoaded) {
      await loadFullLeaderboard({ reset: true });
    }
  };

  const loadFullLeaderboard = async (opts?: { reset?: boolean }) => {
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
      console.error('Error loading full leaderboard:', e);
    } finally {
      setLoadingFullLeaderboard(false);
    }
  };

  // Load leaderboard when puzzle is completed
  useEffect(() => {
    if (dailyCompleted && !leaderboardLoaded && !loadingLeaderboard) {
      loadLeaderboard();
    }
  }, [dailyCompleted, leaderboardLoaded]);

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
    if (!dailyCompleted || !leaderboardLoaded || isPlaying || showLeaderboardScreen) {
      return;
    }

    const REFRESH_INTERVAL = 60000; // 60 seconds
    const intervalId = setInterval(() => {
      // Only refresh if data is older than the refresh interval
      if (Date.now() - lastLeaderboardRefresh >= REFRESH_INTERVAL) {
        console.log('Auto-refreshing leaderboard...');
        loadLeaderboard({ forceRefresh: true });
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [dailyCompleted, leaderboardLoaded, isPlaying, showLeaderboardScreen, lastLeaderboardRefresh]);

  const openLeaderboard = async () => {
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
          console.log('Checking completion for user:', user.id, user.email);
          const dbCompleted = await hasUserCompletedToday(user.id);
          console.log('DB completed:', dbCompleted);
          if (dbCompleted) {
            setDailyCompleted(true);
            // Get score from database
            const dbScore = await getUserTodayScore(user.id);
            if (dbScore) {
              const freshPercentile = await getPercentile(dbScore.score);
              setSavedScore({
                score: dbScore.score,
                timeSeconds: dbScore.timeSeconds,
                mistakes: dbScore.mistakes,
                correctPlacements: dbScore.correctPlacements,
                completed: dbScore.correctPlacements === 16,
                percentile: freshPercentile,
              });
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
              } else if (localUserId === user.id) {
                // This user played locally but DB doesn't have it (edge case, maybe offline)
                setDailyCompleted(true);
                const freshPercentile = await getPercentile(localScore.score);
                localScore.percentile = freshPercentile;
                setSavedScore(localScore);
              }
              // else: Different user played locally - current user can play fresh
            }
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
        console.log('Error checking completion:', e);
      }
      setLoading(false);
    };
    checkCompletion();
  }, [user]);

  const [fetchingPuzzle, setFetchingPuzzle] = useState(false);

  const handlePlayDaily = async () => {
    setFetchingPuzzle(true);
    setCurrentGameEnded(false);
    try {
      // Try to fetch from database first
      const dbPuzzle = await fetchTodaysPuzzle();
      if (dbPuzzle) {
        setPuzzle(dbPuzzle);
      } else {
        // Fallback to static puzzle if DB fetch fails
        console.log('No puzzle in DB, using static fallback');
        setPuzzle(generateDailyPuzzle());
      }


      // If already completed, open in review mode
      setIsReviewMode(dailyCompleted);
      setIsPlaying(true);
    } catch (e) {
      console.error('Error fetching puzzle:', e);
      // Fallback to static puzzle on error
      setPuzzle(generateDailyPuzzle());
      setIsReviewMode(dailyCompleted);
      setIsPlaying(true);
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
      console.log('handleComplete: Saving score to AsyncStorage:', {
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
      loadLeaderboard();
    } catch (e) {
      console.log('Error saving completion:', e);
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
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.homeHeader}>
          <View style={styles.homeHeaderLeft}>
            {streak > 0 && (
              <View style={styles.headerStreakBadge}>
                <Ionicons name="flame" size={14} color="#f59e0b" style={styles.headerStreakFlame} />
                <Text style={styles.headerStreakText}>{streak}</Text>
              </View>
            )}
          </View>
          <View style={styles.homeHeaderRight}>
            {user ? (
              <TouchableOpacity 
                style={styles.headerProfileButton}
                onPress={() => setShowProfileMenu(true)}
              >
                <View style={styles.headerProfileIcon}>
                  <Text style={styles.headerProfileInitial}>
                    {(displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.headerSignInButton}
                onPress={() => setShowSignIn(true)}
              >
                <Text style={styles.headerSignInText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sign In Banner (dismissible, for guests only) */}
        {!user && !signInBannerDismissed && (
          <View style={styles.signInBanner}>
            <View style={styles.signInBannerContent}>
              <View style={styles.signInBannerText}>
                <Text style={styles.signInBannerTitle}>Sign in to track stats, compete on leaderboards & sync across devices</Text>
              </View>
              <TouchableOpacity 
                style={styles.signInBannerButton}
                onPress={() => setShowSignIn(true)}
              >
                <Text style={styles.signInBannerButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.signInBannerDismiss}
              onPress={dismissSignInBanner}
            >
              <Text style={styles.signInBannerDismissText}>Ã—</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.mainMenuScroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.mainMenu}>
            <Image 
              source={require('@/assets/images/intersections-logo.png')} 
              style={styles.menuLogo}
              resizeMode="contain"
            />
            <Text style={styles.menuTitle}>Intersections</Text>
            <Text style={styles.menuSubtitle}>A Daily Word Puzzle</Text>
            {!loading && (
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                {dailyCompleted && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.menuButtons}>
              {/* Show Play button only if not completed */}
              {!dailyCompleted ? (
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={handlePlayDaily}
                  disabled={fetchingPuzzle || loading}
                >
                  {loading ? (
                    <View style={styles.playButtonLoading}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.playButtonLoadingText}>Loading...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.playButtonLabel}>
                        {fetchingPuzzle ? 'Loading...' : "Today's Puzzle"}
                      </Text>
                      <Text style={styles.playButtonDesc}>
                        {fetchingPuzzle ? 'Fetching puzzle' : 'New puzzle every day'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                /* Completed state - show condensed leaderboard */
                <>
                <TouchableOpacity
                  style={styles.completedContainer}
                  onPress={openLeaderboard}
                  activeOpacity={0.8}
                >
                  {/* Header with refresh button */}
                  <View style={styles.completedHeader}>
                    <View style={styles.completedHeaderContent}>
                      <View style={styles.completedHeaderTitleRow}>
                        <MaterialCommunityIcons name="trophy" size={20} color="#ffd700" />
                        <Text style={styles.completedTitle}>Today&apos;s Leaderboard</Text>
                      </View>
                      {userRank && (
                        <Text style={styles.completedRankText}>#{userRank} in the world</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.refreshButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        refreshLeaderboard();
                      }}
                      disabled={isRefreshing || loadingLeaderboard}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="refresh"
                        size={18}
                        color={isRefreshing ? '#666' : '#6a9fff'}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Condensed Leaderboard - show loading until ALL data is ready */}
                  {/* For logged-in users, we wait for userRank; for guests, just leaderboard */}
                  {(loadingLeaderboard && !leaderboardLoaded) || (user && leaderboardLoaded && leaderboard.length > 0 && userRank === null) ? (
                    <View style={styles.leaderboardLoadingContainer}>
                      <ActivityIndicator size="small" color="#6a9fff" />
                      <Text style={styles.leaderboardLoadingText}>Loading rankings...</Text>
                    </View>
                  ) : leaderboard.length === 0 ? (
                    <Text style={styles.leaderboardEmptyText}>No scores yet</Text>
                  ) : (
                    <View style={styles.leaderboardCompact}>
                      {/* Refreshing overlay indicator */}
                      {isRefreshing && (
                        <View style={styles.refreshingOverlay}>
                          <ActivityIndicator size="small" color="#6a9fff" />
                        </View>
                      )}
                      {/* Top 3 */}
                      {leaderboard.slice(0, 3).map((entry, index) => (
                        <View
                          key={index}
                          style={[
                            styles.leaderboardCompactRow,
                            isCurrentUserEntry(entry) && styles.leaderboardCompactRowCurrentUser,
                          ]}
                        >
                          <View style={styles.leaderboardCompactRank}>
                            {entry.rank === 1 ? (
                              <MaterialCommunityIcons name="medal" size={20} color="#ffd700" />
                            ) : entry.rank === 2 ? (
                              <MaterialCommunityIcons name="medal" size={20} color="#c0c0c0" />
                            ) : (
                              <MaterialCommunityIcons name="medal" size={20} color="#cd7f32" />
                            )}
                          </View>
                          <Text style={[
                            styles.leaderboardCompactName,
                            isCurrentUserEntry(entry) && styles.leaderboardCompactNameCurrentUser,
                          ]} numberOfLines={1}>
                            {entry.displayName || 'Anonymous'}
                            {isCurrentUserEntry(entry) && ' (you)'}
                          </Text>
                          <Text style={styles.leaderboardCompactCorrect}>{entry.correctPlacements}/16</Text>
                          <Text style={[
                            styles.leaderboardCompactScore,
                            isCurrentUserEntry(entry) && styles.leaderboardCompactScoreCurrentUser,
                          ]}>
                            {entry.score}
                          </Text>
                        </View>
                      ))}

                      {/* Show user's rank if not in top 3 */}
                      {userRank && userRank > 3 && savedScore && (
                        <>
                          <View style={styles.leaderboardDivider}>
                            <Text style={styles.leaderboardDividerText}>â€¢â€¢â€¢</Text>
                          </View>
                          <View
                            style={[styles.leaderboardCompactRow, styles.leaderboardCompactRowCurrentUser]}
                          >
                            <View style={styles.leaderboardCompactRank}>
                              <Text style={styles.leaderboardCompactRankText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                                #{userRank}
                              </Text>
                            </View>
                            <Text style={[styles.leaderboardCompactName, styles.leaderboardCompactNameCurrentUser]} numberOfLines={1}>
                              {displayName || 'Anonymous'} (you)
                            </Text>
                            <Text style={styles.leaderboardCompactCorrect}>{savedScore.correctPlacements}/16</Text>
                            <Text style={[styles.leaderboardCompactScore, styles.leaderboardCompactScoreCurrentUser]}>
                              {savedScore.score}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  )}

                  {/* Tap for details hint */}
                  <View style={styles.tapForDetailsHint}>
                    <Text style={styles.tapForDetailsText}>Tap for details</Text>
                    <Ionicons name="chevron-forward" size={14} color="#666" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.viewAnswersMainButton}
                  onPress={() => setShowAnswersScreen(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="grid-outline" size={20} color="#6a9fff" />
                  <Text style={styles.viewAnswersMainText}>View Correct Answers</Text>
                </TouchableOpacity>
                </>
              )}
          </View>

          <TouchableOpacity
            style={styles.howToPlayButton}
            onPress={() => setShowTutorial(true)}
          >
            <Ionicons name="help-circle-outline" size={20} color="#6a9fff" />
            <Text style={styles.howToPlayText}>How to Play</Text>
          </TouchableOpacity>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <Link href={"/privacy" as any} asChild>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>Privacy</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.footerLinkDivider}>â€¢</Text>
            <Link href={"/terms" as any} asChild>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>Terms</Text>
              </TouchableOpacity>
            </Link>
          </View>
          </View>
        </ScrollView>

        {/* Sign In Modal */}
        <Modal
          visible={showSignIn}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowSignIn(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.signInModal}>
              <Text style={styles.signInModalTitle}>Sign In</Text>
              <Text style={styles.signInModalSubtitle}>
                Sync your scores and streaks across devices
              </Text>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={async () => {
                  setSigningIn(true);
                  try {
                    await signInWithGoogle();
                    setShowSignIn(false);
                  } catch (e) {
                    console.error('Sign in error:', e);
                  } finally {
                    setSigningIn(false);
                  }
                }}
                disabled={signingIn}
              >
                <View style={styles.googleButtonContent}>
                  <AntDesign name="google" size={20} color="#4285f4" style={{ marginRight: 8 }} />
                  <Text style={styles.googleButtonText}>
                    {signingIn ? 'Signing in...' : 'Continue with Google'}
                  </Text>
                </View>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.appleButton}
                  onPress={async () => {
                    setSigningInWithApple(true);
                    try {
                      await signInWithApple();
                      setShowSignIn(false);
                    } catch (e) {
                      console.error('Apple sign in error:', e);
                    } finally {
                      setSigningInWithApple(false);
                    }
                  }}
                  disabled={signingInWithApple}
                  activeOpacity={0.8}
                >
                  <View style={styles.appleButtonContent}>
                    <Ionicons name="logo-apple" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.appleButtonText}>
                      {signingInWithApple ? 'Signing in...' : 'Continue with Apple'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.signInCancelButton}
                onPress={() => setShowSignIn(false)}
              >
                <Text style={styles.signInCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Profile Menu Modal */}
        <Modal
          visible={showProfileMenu}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowProfileMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowProfileMenu(false)}
          >
            <View style={styles.profileMenuModal}>
              {/* Profile Header */}
              <View style={styles.profileMenuHeader}>
                <View style={styles.profileMenuAvatar}>
                  <Text style={styles.profileMenuAvatarText}>
                    {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.profileMenuInfo}>
                  <Text style={styles.profileMenuName}>
                    {displayName || 'No display name'}
                  </Text>
                  <Text style={styles.profileMenuEmail}>{user?.email}</Text>
                </View>
              </View>

              {/* Menu Options */}
              <View style={styles.profileMenuDivider} />
              
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  setShowProfileMenu(false);
                  setDisplayNameInput(displayName || '');
                  setShowDisplayNameModal(true);
                }}
              >
                <Ionicons name="pencil" size={18} color="#6a9fff" style={styles.profileMenuItemIcon} />
                <Text style={styles.profileMenuItemText}>Edit Display Name</Text>
              </TouchableOpacity>

              <View style={styles.profileMenuDivider} />

              {/* Notification Toggle */}
              {Platform.OS !== 'web' && (
                <>
                  <TouchableOpacity
                    style={styles.profileMenuItem}
                    onPress={handleToggleNotifications}
                  >
                    <Ionicons name={notificationsEnabled ? "notifications" : "notifications-outline"} size={18} color="#6a9fff" style={styles.profileMenuItemIcon} />
                    <Text style={styles.profileMenuItemText}>Daily Notifications</Text>
                    <View style={[
                      styles.toggle,
                      notificationsEnabled && styles.toggleOn
                    ]}>
                      <View style={[
                        styles.toggleThumb,
                        notificationsEnabled && styles.toggleThumbOn
                      ]} />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.profileMenuDivider} />
                </>
              )}

              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  setShowProfileMenu(false);
                  signOut();
                }}
              >
                <Ionicons name="exit-outline" size={18} color="#ef4444" style={styles.profileMenuItemIcon} />
                <Text style={styles.profileMenuItemTextDanger}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Display Name Modal */}
        <Modal
          visible={showDisplayNameModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowDisplayNameModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.displayNameModal}>
              <Text style={styles.displayNameTitle}>
                {displayName ? 'Edit Display Name' : 'Set Your Display Name'}
              </Text>
              <Text style={styles.displayNameSubtitle}>
                This name will appear on the leaderboard
              </Text>

              <TextInput
                style={styles.displayNameInput}
                value={displayNameInput}
                onChangeText={setDisplayNameInput}
                placeholder="Enter display name"
                placeholderTextColor="#666"
                maxLength={20}
                autoFocus
              />

              <TouchableOpacity
                style={[
                  styles.displayNameSaveButton,
                  (!displayNameInput.trim() || savingDisplayName) && styles.displayNameSaveButtonDisabled
                ]}
                onPress={handleSaveDisplayName}
                disabled={!displayNameInput.trim() || savingDisplayName}
              >
                <Text style={styles.displayNameSaveText}>
                  {savingDisplayName ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>

              {displayName && (
                <TouchableOpacity
                  style={styles.displayNameCancelButton}
                  onPress={() => {
                    setShowDisplayNameModal(false);
                    setDisplayNameInput('');
                  }}
                >
                  <Text style={styles.displayNameCancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <>
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
        gameEnded={currentGameEnded}
      />
    </>
  );
}

interface GameContentProps {
  puzzle: Puzzle;
  onBack: () => void;
  onComplete: (score: GameScore, rank: number | null) => void;
  isReviewMode?: boolean;
  savedScore?: GameScore | null;
  userId?: string;
  userRank?: number | null;
  leaderboard: LeaderboardEntry[];
  leaderboardLoaded: boolean;
  loadingLeaderboard: boolean;
  onShowAnswersModal: () => void;
  onOpenLeaderboard: () => void;
  gameEnded: boolean;
}

function GameContent({ puzzle, onBack, onComplete, isReviewMode = false, savedScore, userId, userRank, leaderboard, leaderboardLoaded, loadingLeaderboard, onShowAnswersModal, onOpenLeaderboard, gameEnded }: GameContentProps) {
  const {
    gameState,
    unplacedWords,
    getWordAtCell,
    selectWord,
    placeWordAtCell,
    removeWordFromCell,
    isCellCorrect,
    grantExtraLife,
    elapsedTime,
    mistakes,
    finalScore,
  } = useGameState(puzzle);

  // Helper to determine if a leaderboard entry is the current user
  // For logged-in users, this uses isCurrentUser from the API
  // For anonymous users, we match by rank (which was returned when they submitted their score)
  const isCurrentUserEntry = (entry: LeaderboardEntry): boolean => {
    if (entry.isCurrentUser) return true;
    if (!userId && userRank) {
      return entry.rank === userRank;
    }
    return false;
  };

  const [resultRank, setResultRank] = useState<number | null>(null);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [showRewardedAdModal, setShowRewardedAdModal] = useState(false);
  const [hasShownAdOffer, setHasShownAdOffer] = useState(false);
  const [adOfferDeclined, setAdOfferDeclined] = useState(false);

  // Rewarded ad hook
  const rewardedAd = useRewardedAd();

  const isGameOver = gameState.lives <= 0;
  // Only show game over screen after user has declined the ad offer or already used it
  const shouldShowGameOver = isGameOver && (adOfferDeclined || !showRewardedAdModal) && hasShownAdOffer;

  // Show ad offer when lives reach 0 (only once per game)
  useEffect(() => {
    if (isGameOver && !hasShownAdOffer && !isReviewMode) {
      setShowRewardedAdModal(true);
      setHasShownAdOffer(true);
    }
  }, [isGameOver, hasShownAdOffer, isReviewMode]);

  // Reset ad offer flags when puzzle changes
  useEffect(() => {
    setHasShownAdOffer(false);
    setAdOfferDeclined(false);
  }, [puzzle]);

  const handleWatchAd = async () => {
    const rewarded = await rewardedAd.show();

    setShowRewardedAdModal(false);

    if (rewarded) {
      // User watched the ad, grant extra life
      grantExtraLife();
      setAdOfferDeclined(false);
      haptics.notification(Haptics.NotificationFeedbackType.Success);
      // Note: hasShownAdOffer stays true - only one ad offer per game
    } else {
      // User didn't complete the ad - treat as declined
      setAdOfferDeclined(true);
    }
  };

  const handleDeclineAd = () => {
    setShowRewardedAdModal(false);
    setAdOfferDeclined(true);
  };

  // Submit score when puzzle is solved OR game over (only if not in review mode)
  useEffect(() => {
    if (isReviewMode) return;

    const gameEnded = gameState.isSolved || shouldShowGameOver;
    if (gameEnded && finalScore && !submittingScore && resultRank === null) {
      // Transition to results screen immediately
      onComplete(finalScore, null);

      // Submit score in the background
      setSubmittingScore(true);
      submitScore(finalScore.score, finalScore.timeSeconds, finalScore.mistakes, finalScore.correctPlacements, userId)
        .then((result) => {
          if (result) {
            setResultRank(result.rank);
            // Update finalScore with percentile and scoreId
            finalScore.percentile = result.percentile;
            finalScore.scoreId = result.scoreId;
            // Re-call onComplete with the scoreId so it gets saved
            onComplete(finalScore, result.rank);
          }
        })
        .catch(console.error)
        .finally(() => setSubmittingScore(false));
    }
  }, [gameState.isSolved, shouldShowGameOver, finalScore, submittingScore, resultRank, onComplete]);

  const handleCellPress = (position: CellPosition) => {
    if (isReviewMode || isGameOver || gameState.isSolved) return;
    
    const existingWord = getWordAtCell(position);
    
    if (existingWord) {
      // Cell has a word - remove it
      removeWordFromCell(position);
      haptics.impact(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    if (gameState.selectedWordId) {
      // Place selected word
      const success = placeWordAtCell(position);
      if (success) {
        haptics.impact(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const handleCellLongPress = (position: CellPosition) => {
    if (isReviewMode || isGameOver || gameState.isSolved) return;
    
    const word = getWordAtCell(position);
    if (word) {
      removeWordFromCell(position);
      haptics.impact(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleWordSelect = (wordId: string | null) => {
    if (isReviewMode) return;
    selectWord(wordId);
    if (wordId) {
      haptics.selection();
    }
  };

  // Review mode - show the solved puzzle
  if (isReviewMode) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header with back arrow */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
            <Text style={styles.headerBackIcon}>â€¹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.reviewHeaderTitle}>Your Results</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.reviewScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {savedScore ? (
            <View style={styles.scoreCard}>
              <View style={styles.scoreRow}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>{savedScore.score}</Text>
                  <Text style={styles.scoreLabel}>Score</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>{savedScore.correctPlacements}/16</Text>
                  <Text style={styles.scoreLabel}>Correct</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>{formatTime(savedScore.timeSeconds)}</Text>
                  <Text style={styles.scoreLabel}>Time</Text>
                </View>
              </View>
              {userRank && (
                <View style={styles.reviewPercentileRow}>
                  <Text style={styles.reviewPercentileText}>Ranked #{userRank} today</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.scoreCard}>
              <Text style={styles.noScoreText}>Score data not available</Text>
              <Text style={styles.noScoreSubtext}>Completed before scoring was added</Text>
            </View>
          )}

          {savedScore && (
            <TouchableOpacity
              style={styles.reviewShareButton}
              onPress={() => shareScore(savedScore, userRank ?? null)}
            >
              <Text style={styles.reviewShareButtonText}>Share</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.reviewSubtitle}>Correct Answers</Text>
          
          <View style={styles.reviewGridContainer}>
            <GameGrid
              puzzle={puzzle}
              getWordAtCell={(pos) => {
                // Show the correct word for each cell
                const rowCat = puzzle.rowCategories[pos.rowIndex];
                const colCat = puzzle.colCategories[pos.colIndex];
                return puzzle.words.find(w => w.correctRowId === rowCat.id && w.correctColId === colCat.id) || null;
              }}
              isCellCorrect={() => true}
              selectedWordId={null}
              onCellPress={() => {}}
              onCellLongPress={() => {}}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Show results screen with embedded condensed leaderboard
  // Use gameEnded from parent to ensure we stay on this screen even after navigating away and back
  // Use savedScore from parent if finalScore is null (component remounted after navigating away)
  if (gameEnded) {
    const displayScore = finalScore || savedScore;
    const isWin = finalScore ? gameState.isSolved : (savedScore?.completed ?? false);
    const displayRank = resultRank || userRank;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isWin ? '#0a1a0f' : '#1a0a0a' }]}>
        <ScrollView contentContainerStyle={styles.gameCompleteScrollContent}>
          {/* Result Header */}
          <View style={styles.gameCompleteHeader}>
            {isWin ? (
              <MaterialCommunityIcons name="party-popper" size={64} color="#4ade80" style={{ marginBottom: 12 }} />
            ) : (
              <MaterialCommunityIcons name="heart-broken" size={64} color="#ff6b6b" style={{ marginBottom: 12 }} />
            )}
            <Text style={[styles.gameCompleteTitle, { color: isWin ? '#4ade80' : '#ff6b6b' }]}>
              {isWin ? 'Puzzle Solved!' : 'Game Over'}
            </Text>
            {displayRank && (
              <Text style={styles.gameCompleteRankText}>#{displayRank} in the world</Text>
            )}
          </View>

          {/* Score Summary */}
          <View style={styles.gameCompleteScoreCard}>
            <View style={styles.gameCompleteScoreRow}>
              <View style={styles.gameCompleteScoreItem}>
                <Text style={styles.gameCompleteScoreValue}>{displayScore?.score ?? 0}</Text>
                <Text style={styles.gameCompleteScoreLabel}>Score</Text>
              </View>
              <View style={styles.gameCompleteScoreItem}>
                <Text style={styles.gameCompleteScoreValue}>{displayScore?.correctPlacements ?? 0}/16</Text>
                <Text style={styles.gameCompleteScoreLabel}>Correct</Text>
              </View>
              <View style={styles.gameCompleteScoreItem}>
                <Text style={styles.gameCompleteScoreValue}>{formatTime(displayScore?.timeSeconds ?? 0)}</Text>
                <Text style={styles.gameCompleteScoreLabel}>Time</Text>
              </View>
            </View>
          </View>

          {/* Condensed Leaderboard */}
          <TouchableOpacity
            style={styles.gameCompleteLeaderboardCard}
            onPress={onOpenLeaderboard}
            activeOpacity={0.8}
          >
            <View style={styles.gameCompleteLeaderboardHeader}>
              <View style={styles.gameCompleteLeaderboardHeaderLeft}>
                <MaterialCommunityIcons name="trophy" size={20} color="#ffd700" />
                <Text style={styles.gameCompleteLeaderboardTitle}>Today&apos;s Leaderboard</Text>
              </View>
            </View>

            {loadingLeaderboard && !leaderboardLoaded ? (
              <ActivityIndicator size="small" color="#6a9fff" style={{ marginVertical: 16 }} />
            ) : leaderboard.length === 0 ? (
              <Text style={styles.leaderboardEmptyText}>No scores yet</Text>
            ) : (
              <View style={styles.leaderboardCompact}>
                {/* Top 3 */}
                {leaderboard.slice(0, 3).map((entry, index) => (
                  <View
                    key={index}
                    style={[
                      styles.leaderboardCompactRow,
                      isCurrentUserEntry(entry) && styles.leaderboardCompactRowCurrentUser,
                    ]}
                  >
                    <View style={styles.leaderboardCompactRank}>
                      {entry.rank === 1 ? (
                        <MaterialCommunityIcons name="medal" size={20} color="#ffd700" />
                      ) : entry.rank === 2 ? (
                        <MaterialCommunityIcons name="medal" size={20} color="#c0c0c0" />
                      ) : (
                        <MaterialCommunityIcons name="medal" size={20} color="#cd7f32" />
                      )}
                    </View>
                    <Text style={[
                      styles.leaderboardCompactName,
                      isCurrentUserEntry(entry) && styles.leaderboardCompactNameCurrentUser,
                    ]} numberOfLines={1}>
                      {entry.displayName || 'Anonymous'}
                      {isCurrentUserEntry(entry) && ' (you)'}
                    </Text>
                    <Text style={styles.leaderboardCompactCorrect}>{entry.correctPlacements}/16</Text>
                    <Text style={[
                      styles.leaderboardCompactScore,
                      isCurrentUserEntry(entry) && styles.leaderboardCompactScoreCurrentUser,
                    ]}>
                      {entry.score}
                    </Text>
                  </View>
                ))}

                {/* Show user's rank if not in top 3 */}
                {displayRank && displayRank > 3 && displayScore && (
                  <>
                    <View style={styles.leaderboardDivider}>
                      <Text style={styles.leaderboardDividerText}>â€¢â€¢â€¢</Text>
                    </View>
                    <View
                      style={[styles.leaderboardCompactRow, styles.leaderboardCompactRowCurrentUser]}
                    >
                      <View style={styles.leaderboardCompactRank}>
                        <Text style={styles.leaderboardCompactRankText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                          #{displayRank}
                        </Text>
                      </View>
                      <Text style={[styles.leaderboardCompactName, styles.leaderboardCompactNameCurrentUser]} numberOfLines={1}>
                        Anonymous (you)
                      </Text>
                      <Text style={styles.leaderboardCompactCorrect}>{displayScore.correctPlacements}/16</Text>
                      <Text style={[styles.leaderboardCompactScore, styles.leaderboardCompactScoreCurrentUser]}>
                        {displayScore.score}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            <View style={styles.tapForDetailsHint}>
              <Text style={styles.tapForDetailsText}>Tap for full leaderboard</Text>
              <Ionicons name="chevron-forward" size={14} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.gameCompleteActions}>
            <TouchableOpacity
              style={styles.gameCompleteActionButton}
              onPress={onShowAnswersModal}
            >
              <Ionicons name="grid-outline" size={20} color="#6a9fff" />
              <Text style={styles.gameCompleteActionButtonText}>View Correct Answers</Text>
            </TouchableOpacity>

            {displayScore && (
              <TouchableOpacity
                style={styles.gameCompleteShareButton}
                onPress={() => shareScore(displayScore, displayRank ?? null)}
              >
                <Ionicons name="share-outline" size={20} color="#4ade80" />
                <Text style={styles.gameCompleteShareButtonText}>Share Score</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Back to Home */}
          <TouchableOpacity
            style={styles.gameCompleteBackButton}
            onPress={onBack}
          >
            <Text style={styles.gameCompleteBackButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
          <Text style={styles.headerBackIcon}>â€¹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowTutorial(true)} style={styles.headerHelpButton}>
          <View style={styles.helpCircle}>
            <Text style={styles.headerHelpIcon}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Game Grid */}
      <View style={styles.gridContainer}>
        <GameGrid
          puzzle={puzzle}
          getWordAtCell={getWordAtCell}
          isCellCorrect={isCellCorrect}
          selectedWordId={gameState.selectedWordId}
          onCellPress={handleCellPress}
          onCellLongPress={handleCellLongPress}
        />
      </View>

      {/* Lives Display */}
      <View style={styles.livesContainer}>
        <Text style={styles.livesLabel}>Lives</Text>
        {[1, 2, 3].map((i) => (
          <View 
            key={i} 
            style={[
              styles.heart,
              i <= gameState.lives ? styles.heartFilled : styles.heartEmpty
            ]} 
          />
        ))}
      </View>

      {/* Word Tray */}
      {unplacedWords.length > 0 && (
        <WordTray
          words={unplacedWords}
          selectedWordId={gameState.selectedWordId}
          onWordSelect={handleWordSelect}
        />
      )}

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        visible={showRewardedAdModal}
        isLoading={rewardedAd.isLoading}
        isShowing={rewardedAd.isShowing}
        onWatchAd={handleWatchAd}
        onDecline={handleDeclineAd}
        error={rewardedAd.error}
      />
    </SafeAreaView>
  );
}




