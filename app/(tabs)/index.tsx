import { GameGrid, WordTray } from '@/components/game';
import { RewardedAdModal } from '@/components/ads/rewarded-ad-modal';
import { useAuth } from '@/contexts/auth-context';
import { generateDailyPuzzle } from '@/data/puzzle-generator';
import { fetchTodaysPuzzle, getOrCreateProfile, getPercentile, getTodayLeaderboard, getTodayLeaderboardPage, getUserStreak, getUserTodayScore, hasUserCompletedToday, LeaderboardEntry, submitScore, updateDisplayName, updateUserStreak } from '@/data/puzzleApi';
import { useGameState } from '@/hooks/use-game-state';
import { useRewardedAd } from '@/hooks/use-rewarded-ad';
import { CellPosition, GameScore, Puzzle } from '@/types/game';
import { areNotificationsEnabled, scheduleDailyNotification, setNotificationsEnabled } from '@/utils/notificationService';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Format seconds into MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Generate share text for score
function generateShareText(score: GameScore, rank: number | null): string {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  let text = `Intersections - ${today}\n\n`;
  text += `My score today: ${score.score}\n`;
  text += `${score.correctPlacements}/16 correct in ${formatTime(score.timeSeconds)}\n`;

  if (rank !== null) {
    text += `Ranked #${rank} today\n`;
  }

  text += `\nPlay at: stonefranklin.github.io/intersections`;

  return text;
}

// Share score function
async function shareScore(score: GameScore, rank: number | null) {
  const text = generateShareText(score, rank);
  
  if (Platform.OS === 'web') {
    // Web share API or fallback to clipboard
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e) {
        // User cancelled or error
        await navigator.clipboard.writeText(text);
        alert('Score copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  } else {
    // Native share
    try {
      await Share.share({ message: text });
    } catch (e) {
      console.error('Share error:', e);
    }
  }
}

// Safe haptics wrapper for web
const haptics = {
  impact: (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  },
  selection: () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  },
  notification: (type: Haptics.NotificationFeedbackType) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(type);
    }
  },
};

// Get today's date string for storage key
function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// Get yesterday's date key
function getYesterdayKey(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
}

export default function GameScreen() {
  const { user, loading: authLoading, signInWithGoogle, signInWithApple, signOut } = useAuth();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [savedScore, setSavedScore] = useState<GameScore | null>(null);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
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
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [todaysPuzzle, setTodaysPuzzle] = useState<Puzzle | null>(null);
  
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
      } catch (e) {
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

  // Fetch display name when user logs in
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
    } else {
      setDisplayName(null);
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
  const loadLeaderboard = async () => {
    if (loadingLeaderboard) return;
    setLoadingLeaderboard(true);
    try {
      console.log('Loading leaderboard for user:', user?.id);
      const data = await getTodayLeaderboard(user?.id);
      console.log('Leaderboard data:', data);
      setLeaderboard(data);
      // Find user's rank
      const userEntry = data.find(e => e.isCurrentUser);
      console.log('User entry found:', userEntry);
      if (userEntry) {
        setUserRank(userEntry.rank);
      }
      setLeaderboardLoaded(true);

      // Also load the puzzle for showing correct answers
      if (!todaysPuzzle) {
        const puzzle = await fetchTodaysPuzzle();
        if (puzzle) {
          setTodaysPuzzle(puzzle);
        } else {
          setTodaysPuzzle(generateDailyPuzzle());
        }
      }
    } catch (e) {
      console.error('Error loading leaderboard:', e);
    } finally {
      setLoadingLeaderboard(false);
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
            // Check local storage as fallback (in case completed on another device or as guest)
            const localCompleted = await AsyncStorage.getItem(`completed-${todayKey}`);
            if (localCompleted === 'true') {
              setDailyCompleted(true);
              // Try to load local score
              const scoreData = await AsyncStorage.getItem(`score-${todayKey}`);
              if (scoreData) {
                const score = JSON.parse(scoreData) as GameScore;
                const freshPercentile = await getPercentile(score.score);
                score.percentile = freshPercentile;
                setSavedScore(score);
              }
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
          const completed = await AsyncStorage.getItem(`completed-${todayKey}`);
          setDailyCompleted(completed === 'true');
          
          // Load saved score if completed
          if (completed === 'true') {
            const scoreData = await AsyncStorage.getItem(`score-${todayKey}`);
            if (scoreData) {
              const score = JSON.parse(scoreData) as GameScore;
              // Fetch fresh percentile from database
              const freshPercentile = await getPercentile(score.score);
              score.percentile = freshPercentile;
              setSavedScore(score);
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

      // Always save to local storage
      await AsyncStorage.setItem(`completed-${todayKey}`, 'true');
      await AsyncStorage.setItem(`score-${todayKey}`, JSON.stringify(score));
      setDailyCompleted(true);
      setSavedScore(score);
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
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.leaderboardScreenHeader}>
          <TouchableOpacity onPress={() => setShowLeaderboardScreen(false)} style={styles.leaderboardScreenBackButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.leaderboardScreenTitleContainer}>
            <MaterialCommunityIcons name="trophy" size={24} color="#ffd700" />
            <Text style={styles.leaderboardScreenTitle}>Today's Leaderboard</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          style={styles.leaderboardScreenContent}
          contentContainerStyle={styles.leaderboardScreenContentContainer}
          data={fullLeaderboard}
          keyExtractor={(item, index) => `${item.rank}-${index}`}
          onEndReached={() => {
            if (fullLeaderboardHasMore && !loadingFullLeaderboard) {
              loadFullLeaderboard();
            }
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <>
              {userRank && (
                <View style={styles.userRankBanner}>
                  <Text style={styles.userRankBannerText}>You are ranked</Text>
                  <Text
                    style={styles.userRankBannerValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    #{userRank} in the world
                  </Text>
                </View>
              )}

              {savedScore && (
                <View style={styles.leaderboardScreenActions}>
                  <TouchableOpacity
                    style={styles.leaderboardScreenShareButton}
                    onPress={() => shareScore(savedScore!, userRank)}
                  >
                    <Ionicons name="share-outline" size={20} color="#4ade80" />
                    <Text style={styles.leaderboardScreenShareText}>Share Score</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            loadingFullLeaderboard && !fullLeaderboardLoaded ? (
              <ActivityIndicator size="large" color="#6a9fff" style={{ marginVertical: 40 }} />
            ) : (
              <Text style={styles.leaderboardEmpty}>No scores yet today. Be the first!</Text>
            )
          }
          renderItem={({ item: entry }) => (
            <View
              style={[
                styles.leaderboardFullRow,
                entry.isCurrentUser && styles.leaderboardFullRowCurrentUser,
              ]}
            >
              <View style={styles.leaderboardFullRank}>
                {entry.rank === 1 ? (
                  <MaterialCommunityIcons name="medal" size={28} color="#ffd700" />
                ) : entry.rank === 2 ? (
                  <MaterialCommunityIcons name="medal" size={28} color="#c0c0c0" />
                ) : entry.rank === 3 ? (
                  <MaterialCommunityIcons name="medal" size={28} color="#cd7f32" />
                ) : (
                  <Text style={styles.leaderboardFullRankText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                    #{entry.rank}
                  </Text>
                )}
              </View>
              <View style={styles.leaderboardFullInfo}>
                <Text
                  style={[
                    styles.leaderboardFullName,
                    entry.isCurrentUser && styles.leaderboardFullNameCurrentUser,
                  ]}
                  numberOfLines={1}
                >
                  {entry.displayName || 'Anonymous'}
                  {entry.isCurrentUser && ' (you)'}
                </Text>
                <Text style={styles.leaderboardFullMeta}>
                  {entry.correctPlacements}/16 correct - {formatTime(entry.timeSeconds)}
                  {/*
                  {entry.correctPlacements}/16 correct ƒ?› {formatTime(entry.timeSeconds)}
                  */}
                </Text>
              </View>
              <Text
                style={[
                  styles.leaderboardFullScore,
                  entry.isCurrentUser && styles.leaderboardFullScoreCurrentUser,
                ]}
              >
                {entry.score}
              </Text>
            </View>
          )}
          ListFooterComponent={
            loadingFullLeaderboard && fullLeaderboardLoaded ? (
              <ActivityIndicator size="small" color="#6a9fff" style={{ marginVertical: 16 }} />
            ) : fullLeaderboardHasMore && fullLeaderboardLoaded ? (
              <TouchableOpacity
                style={styles.leaderboardCloseButton}
                onPress={() => loadFullLeaderboard()}
                disabled={loadingFullLeaderboard}
              >
                <Text style={styles.leaderboardCloseText}>Load more</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ height: 12 }} />
            )
          }
        />

        {/* Legacy ScrollView version (disabled) */}
        {false && (
        <ScrollView style={styles.leaderboardScreenContent} contentContainerStyle={styles.leaderboardScreenContentContainer}>
          {/* User's rank banner */}
          {userRank && (
            <View style={styles.userRankBanner}>
              <Text style={styles.userRankBannerText}>You are ranked</Text>
              <Text
                style={styles.userRankBannerValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                #{userRank} in the world
              </Text>
            </View>
          )}

          {/* Full Leaderboard */}
          {loadingLeaderboard && !leaderboardLoaded ? (
            <ActivityIndicator size="large" color="#6a9fff" style={{ marginVertical: 40 }} />
          ) : leaderboard.length === 0 ? (
            <Text style={styles.leaderboardEmpty}>No scores yet today. Be the first!</Text>
          ) : (
            <View style={styles.leaderboardFullList}>
              {leaderboard.map((entry, index) => (
                <View
                  key={index}
                  style={[
                    styles.leaderboardFullRow,
                    entry.isCurrentUser && styles.leaderboardFullRowCurrentUser,
                  ]}
                >
                  <View style={styles.leaderboardFullRank}>
                    {entry.rank === 1 ? (
                      <MaterialCommunityIcons name="medal" size={28} color="#ffd700" />
                    ) : entry.rank === 2 ? (
                      <MaterialCommunityIcons name="medal" size={28} color="#c0c0c0" />
                    ) : entry.rank === 3 ? (
                      <MaterialCommunityIcons name="medal" size={28} color="#cd7f32" />
                    ) : (
                      <Text style={styles.leaderboardFullRankText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                        #{entry.rank}
                      </Text>
                    )}
                  </View>
                  <View style={styles.leaderboardFullInfo}>
                    <Text style={[
                      styles.leaderboardFullName,
                      entry.isCurrentUser && styles.leaderboardFullNameCurrentUser,
                    ]} numberOfLines={1}>
                      {entry.displayName || 'Anonymous'}
                      {entry.isCurrentUser && ' (you)'}
                    </Text>
                    <Text style={styles.leaderboardFullMeta}>
                      {entry.correctPlacements}/16 correct - {formatTime(entry.timeSeconds)}
                      {/*
                      {entry.correctPlacements}/16 correct • {formatTime(entry.timeSeconds)}
                      */}
                    </Text>
                  </View>
                  <Text style={[
                    styles.leaderboardFullScore,
                    entry.isCurrentUser && styles.leaderboardFullScoreCurrentUser,
                  ]}>
                    {entry.score}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Action buttons */}
          {savedScore && (
            <View style={styles.leaderboardScreenActions}>
              <TouchableOpacity
                style={styles.leaderboardScreenShareButton}
                onPress={() => shareScore(savedScore!, userRank)}
              >
                <Ionicons name="share-outline" size={20} color="#4ade80" />
                <Text style={styles.leaderboardScreenShareText}>Share Score</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        )}

        {/* Correct Answers Modal */}
        <Modal
          visible={showAnswersModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowAnswersModal(false)}
        >
          <SafeAreaView style={styles.answersModalContainer}>
            <View style={styles.answersModalHeader}>
              <TouchableOpacity onPress={() => setShowAnswersModal(false)} style={styles.answersModalBackButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.answersModalTitle}>Correct Answers</Text>
              <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.answersModalContent}>
              {todaysPuzzle && (
                <GameGrid
                  puzzle={todaysPuzzle}
                  getWordAtCell={(pos) => {
                    const rowCat = todaysPuzzle.rowCategories[pos.rowIndex];
                    const colCat = todaysPuzzle.colCategories[pos.colIndex];
                    return todaysPuzzle.words.find(w => w.correctRowId === rowCat.id && w.correctColId === colCat.id) || null;
                  }}
                  isCellCorrect={() => true}
                  selectedWordId={null}
                  onCellPress={() => {}}
                  onCellLongPress={() => {}}
                />
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
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
              <Text style={styles.signInBannerDismissText}>×</Text>
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
                  {/* Header */}
                  <View style={styles.completedHeader}>
                    <View style={styles.completedHeaderLeft}>
                      <MaterialCommunityIcons name="trophy" size={20} color="#ffd700" />
                      <Text style={styles.completedTitle}>Today's Leaderboard</Text>
                    </View>
                    {userRank && (
                      <Text style={styles.completedRankText}>#{userRank} in the world</Text>
                    )}
                  </View>

                  {/* Condensed Leaderboard */}
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
                            entry.isCurrentUser && styles.leaderboardCompactRowCurrentUser,
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
                            entry.isCurrentUser && styles.leaderboardCompactNameCurrentUser,
                          ]} numberOfLines={1}>
                            {entry.displayName || 'Anonymous'}
                            {entry.isCurrentUser && ' (you)'}
                          </Text>
                          <Text style={styles.leaderboardCompactCorrect}>{entry.correctPlacements}/16</Text>
                          <Text style={[
                            styles.leaderboardCompactScore,
                            entry.isCurrentUser && styles.leaderboardCompactScoreCurrentUser,
                          ]}>
                            {entry.score}
                          </Text>
                        </View>
                      ))}

                      {/* Show user's rank if not in top 3 */}
                      {userRank && userRank > 3 && (
                        <>
                          <View style={styles.leaderboardDivider}>
                            <Text style={styles.leaderboardDividerText}>•••</Text>
                          </View>
                          {leaderboard.filter(e => e.isCurrentUser).map((entry, index) => (
                            <View
                              key={`user-${index}`}
                              style={[styles.leaderboardCompactRow, styles.leaderboardCompactRowCurrentUser]}
                            >
                              <View style={styles.leaderboardCompactRank}>
                                <Text style={styles.leaderboardCompactRankText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                                  #{entry.rank}
                                </Text>
                              </View>
                              <Text style={[styles.leaderboardCompactName, styles.leaderboardCompactNameCurrentUser]} numberOfLines={1}>
                                {entry.displayName || 'Anonymous'} (you)
                              </Text>
                              <Text style={styles.leaderboardCompactCorrect}>{entry.correctPlacements}/16</Text>
                              <Text style={[styles.leaderboardCompactScore, styles.leaderboardCompactScoreCurrentUser]}>
                                {entry.score}
                              </Text>
                            </View>
                          ))}
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
                  onPress={() => setShowAnswersModal(true)}
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
            <Link href={"/about" as any} asChild>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>About</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.footerLinkDivider}>•</Text>
            <Link href={"/privacy" as any} asChild>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>Privacy</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.footerLinkDivider}>•</Text>
            <Link href={"/terms" as any} asChild>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>Terms</Text>
              </TouchableOpacity>
            </Link>
          </View>
          </View>
        </ScrollView>

        {/* Tutorial Modal */}
        <Modal
          visible={showTutorial}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowTutorial(false)}
        >
          <SafeAreaView style={styles.answersModalContainer}>
            <View style={styles.answersModalHeader}>
              <TouchableOpacity onPress={() => setShowTutorial(false)} style={styles.answersModalBackButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.answersModalTitle}>How to Play</Text>
              <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.tutorialScreenContent} showsVerticalScrollIndicator={true}>
              <Text style={styles.tutorialHeading}>Goal</Text>
              <Text style={styles.tutorialText}>
                Place each word in the grid where its two categories intersect.
              </Text>

              <Text style={styles.tutorialHeading}>Example</Text>
              <Text style={styles.tutorialText}>
                If the row is &quot;Fruits&quot; and the column is &quot;Red Things&quot;, the correct word might be &quot;Apple&quot; – it belongs to both categories!
              </Text>

              <Text style={styles.tutorialHeading}>How to Play</Text>
              <Text style={styles.tutorialText}>
                1. Tap a word from the tray below the grid{"\n"}
                2. Tap a cell in the grid to place it{"\n"}
                3. Tap a placed word to remove it{"\n"}
                4. Fill all 16 cells correctly to win!
              </Text>

              <Text style={styles.tutorialHeading}>Lives</Text>
              <Text style={styles.tutorialText}>
                You have 3 lives. Each incorrect placement costs one life. Lose all lives and the game ends.
              </Text>

              <Text style={styles.tutorialHeading}>Scoring</Text>
              <Text style={styles.tutorialText}>
                • Complete the puzzle: up to 1000 points{"\n"}
                • Faster = higher score{"\n"}
                • Fewer mistakes = higher score{"\n"}
                • Compare your score with other players!
              </Text>
            </ScrollView>
          </SafeAreaView>
        </Modal>

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

        {/* Correct Answers Modal */}
        <Modal
          visible={showAnswersModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowAnswersModal(false)}
        >
          <SafeAreaView style={styles.answersModalContainer}>
            <View style={styles.answersModalHeader}>
              <TouchableOpacity onPress={() => setShowAnswersModal(false)} style={styles.answersModalBackButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.answersModalTitle}>Correct Answers</Text>
              <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.answersModalContent}>
              {todaysPuzzle && (
                <GameGrid
                  puzzle={todaysPuzzle}
                  getWordAtCell={(pos) => {
                    const rowCat = todaysPuzzle.rowCategories[pos.rowIndex];
                    const colCat = todaysPuzzle.colCategories[pos.colIndex];
                    return todaysPuzzle.words.find(w => w.correctRowId === rowCat.id && w.correctColId === colCat.id) || null;
                  }}
                  isCellCorrect={() => true}
                  selectedWordId={null}
                  onCellPress={() => {}}
                  onCellLongPress={() => {}}
                />
              )}
            </ScrollView>
          </SafeAreaView>
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
        onShowAnswersModal={() => setShowAnswersModal(true)}
        onOpenLeaderboard={openLeaderboard}
      />

      {/* Correct Answers Modal - available for game complete screen */}
      <Modal
        visible={showAnswersModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAnswersModal(false)}
      >
        <SafeAreaView style={styles.answersModalContainer}>
          <View style={styles.answersModalHeader}>
            <TouchableOpacity onPress={() => setShowAnswersModal(false)} style={styles.answersModalBackButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.answersModalTitle}>Correct Answers</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.answersModalContent}>
            {todaysPuzzle && (
              <GameGrid
                puzzle={todaysPuzzle}
                getWordAtCell={(pos) => {
                  const rowCat = todaysPuzzle.rowCategories[pos.rowIndex];
                  const colCat = todaysPuzzle.colCategories[pos.colIndex];
                  return todaysPuzzle.words.find(w => w.correctRowId === rowCat.id && w.correctColId === colCat.id) || null;
                }}
                isCellCorrect={() => true}
                selectedWordId={null}
                onCellPress={() => {}}
                onCellLongPress={() => {}}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
}

function GameContent({ puzzle, onBack, onComplete, isReviewMode = false, savedScore, userId, userRank, leaderboard, leaderboardLoaded, loadingLeaderboard, onShowAnswersModal, onOpenLeaderboard }: GameContentProps) {
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

  const [resultRank, setResultRank] = useState<number | null>(null);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
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

    // Wait a bit for the ad to fully dismiss on iOS before closing modal
    // This prevents touch blocking issues
    await new Promise(resolve => setTimeout(resolve, Platform.OS === 'ios' ? 500 : 100));

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
      setSubmittingScore(true);
      submitScore(finalScore.score, finalScore.timeSeconds, finalScore.mistakes, finalScore.correctPlacements, userId)
        .then((result) => {
          let rank: number | null = null;
          if (result) {
            rank = result.rank;
            setResultRank(result.rank);
            // Update finalScore with percentile before saving (keep for backwards compat)
            finalScore.percentile = result.percentile;
          }
          // Save completion and navigate to leaderboard
          onComplete(finalScore, rank);
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
            <Text style={styles.headerBackIcon}>‹</Text>
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
  if ((shouldShowGameOver || gameState.isSolved) && finalScore) {
    const isWin = gameState.isSolved;
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
                <Text style={styles.gameCompleteScoreValue}>{finalScore.score}</Text>
                <Text style={styles.gameCompleteScoreLabel}>Score</Text>
              </View>
              <View style={styles.gameCompleteScoreItem}>
                <Text style={styles.gameCompleteScoreValue}>{finalScore.correctPlacements}/16</Text>
                <Text style={styles.gameCompleteScoreLabel}>Correct</Text>
              </View>
              <View style={styles.gameCompleteScoreItem}>
                <Text style={styles.gameCompleteScoreValue}>{formatTime(finalScore.timeSeconds)}</Text>
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
                <Text style={styles.gameCompleteLeaderboardTitle}>Today's Leaderboard</Text>
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
                      entry.isCurrentUser && styles.leaderboardCompactRowCurrentUser,
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
                      entry.isCurrentUser && styles.leaderboardCompactNameCurrentUser,
                    ]} numberOfLines={1}>
                      {entry.displayName || 'Anonymous'}
                      {entry.isCurrentUser && ' (you)'}
                    </Text>
                    <Text style={styles.leaderboardCompactCorrect}>{entry.correctPlacements}/16</Text>
                    <Text style={[
                      styles.leaderboardCompactScore,
                      entry.isCurrentUser && styles.leaderboardCompactScoreCurrentUser,
                    ]}>
                      {entry.score}
                    </Text>
                  </View>
                ))}

                {/* Show user's rank if not in top 3 */}
                {displayRank && displayRank > 3 && (
                  <>
                    <View style={styles.leaderboardDivider}>
                      <Text style={styles.leaderboardDividerText}>•••</Text>
                    </View>
                    {leaderboard.filter(e => e.isCurrentUser).map((entry, index) => (
                      <View
                        key={`user-${index}`}
                        style={[styles.leaderboardCompactRow, styles.leaderboardCompactRowCurrentUser]}
                      >
                        <View style={styles.leaderboardCompactRank}>
                          <Text style={styles.leaderboardCompactRankText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                            #{entry.rank}
                          </Text>
                        </View>
                        <Text style={[styles.leaderboardCompactName, styles.leaderboardCompactNameCurrentUser]} numberOfLines={1}>
                          {entry.displayName || 'Anonymous'} (you)
                        </Text>
                        <Text style={styles.leaderboardCompactCorrect}>{entry.correctPlacements}/16</Text>
                        <Text style={[styles.leaderboardCompactScore, styles.leaderboardCompactScoreCurrentUser]}>
                          {entry.score}
                        </Text>
                      </View>
                    ))}
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

            <TouchableOpacity
              style={styles.gameCompleteShareButton}
              onPress={() => shareScore(finalScore, displayRank ?? null)}
            >
              <Ionicons name="share-outline" size={20} color="#4ade80" />
              <Text style={styles.gameCompleteShareButtonText}>Share Score</Text>
            </TouchableOpacity>
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
          <Text style={styles.headerBackIcon}>‹</Text>
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
      <WordTray
        words={unplacedWords}
        selectedWordId={gameState.selectedWordId}
        onWordSelect={handleWordSelect}
      />

      {/* Tutorial Modal */}
      <Modal
        visible={showTutorial}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowTutorial(false)}
      >
        <SafeAreaView style={styles.answersModalContainer}>
            <View style={styles.answersModalHeader}>
              <TouchableOpacity onPress={() => setShowTutorial(false)} style={styles.answersModalBackButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.answersModalTitle}>How to Play</Text>
              <View style={{ width: 40 }} />
            </View>
          <ScrollView contentContainerStyle={styles.tutorialScreenContent} showsVerticalScrollIndicator={true}>
            <Text style={styles.tutorialHeading}>Goal</Text>
            <Text style={styles.tutorialText}>
              Place each word in the grid where its two categories intersect.
            </Text>

            <Text style={styles.tutorialHeading}>Example</Text>
            <Text style={styles.tutorialText}>
              If the row is &quot;Fruits&quot; and the column is &quot;Red Things&quot;, the correct word might be &quot;Apple&quot; – it belongs to both categories!
            </Text>

            <Text style={styles.tutorialHeading}>How to Play</Text>
            <Text style={styles.tutorialText}>
              1. Tap a word from the tray below the grid{"\n"}
              2. Tap a cell in the grid to place it{"\n"}
              3. Tap a placed word to remove it{"\n"}
              4. Fill all 16 cells correctly to win!
            </Text>

            <Text style={styles.tutorialHeading}>Lives</Text>
            <Text style={styles.tutorialText}>
              You have 3 lives. Each incorrect placement costs one life. Lose all lives and the game ends.
            </Text>

            <Text style={styles.tutorialHeading}>Scoring</Text>
            <Text style={styles.tutorialText}>
              • Complete the puzzle: up to 1000 points{"\n"}
              • Faster = higher score{"\n"}
              • Fewer mistakes = higher score{"\n"}
              • Compare your score with other players!
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  // Home header styles
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  homeHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1a0a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  headerStreakFlame: {
    marginRight: 4,
  },
  headerStreakText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f59e0b',
  },
  headerProfileButton: {
    padding: 4,
  },
  headerProfileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4a4a8e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerProfileInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerSignInButton: {
    backgroundColor: '#2a3f5f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  headerSignInText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a9fff',
  },
  // Main menu styles
  mainMenuScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainMenu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  menuLogo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  menuSubtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 24,
  },
  menuButtons: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  playButton: {
    backgroundColor: '#2d5a3d',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  playButtonLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedButton: {
    backgroundColor: '#1a3d2d',
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  playButtonLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  playButtonDesc: {
    fontSize: 14,
    color: '#aaa',
  },
  // Completed container styles (condensed leaderboard)
  completedContainer: {
    backgroundColor: '#1a2a3e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a4a6e',
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  completedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completedRankText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffd700',
  },
  tapForDetailsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  tapForDetailsText: {
    fontSize: 12,
    color: '#666',
  },
  leaderboardSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
  },
  leaderboardEmptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 12,
  },
  leaderboardCompact: {
    gap: 4,
  },
  leaderboardCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  leaderboardCompactRowCurrentUser: {
    backgroundColor: 'rgba(106, 159, 255, 0.15)',
  },
  leaderboardCompactRank: {
    width: 32,
    alignItems: 'center',
  },
  leaderboardCompactRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  leaderboardCompactName: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
  },
  leaderboardCompactNameCurrentUser: {
    color: '#6a9fff',
    fontWeight: '600',
  },
  leaderboardCompactCorrect: {
    fontSize: 12,
    color: '#888',
    marginRight: 8,
  },
  leaderboardCompactScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ade80',
  },
  leaderboardCompactScoreCurrentUser: {
    color: '#6a9fff',
  },
  leaderboardDivider: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  leaderboardDividerText: {
    fontSize: 12,
    color: '#444',
  },
  viewFullLeaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1a2a3a',
  },
  viewFullLeaderboardText: {
    fontSize: 13,
    color: '#6a9fff',
    marginRight: 4,
  },
  viewAnswersMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a4a6e',
    backgroundColor: '#0f1a2a',
    paddingVertical: 14,
    gap: 8,
  },
  viewAnswersMainText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6a9fff',
  },
  // Answers toggle and container
  answersToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f1a2a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  answersToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  answersToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a9fff',
  },
  answersContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
  },
  // Answers Modal styles
  answersModalContainer: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  answersModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  answersModalBackButton: {
    padding: 8,
  },
  answersModalCloseButton: {
    padding: 8,
  },
  answersModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  answersModalContent: {
    alignItems: 'center',
    padding: 20,
  },
  tutorialScreenContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  // Full-screen leaderboard styles
  leaderboardScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  leaderboardScreenBackButton: {
    padding: 8,
  },
  leaderboardScreenTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderboardScreenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  leaderboardScreenContent: {
    flex: 1,
  },
  leaderboardScreenContentContainer: {
    padding: 16,
  },
  userRankBanner: {
    backgroundColor: '#1a3d2d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a5a3d',
  },
  userRankBannerText: {
    fontSize: 14,
    color: '#a0d0b0',
  },
  userRankBannerValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginTop: 4,
  },
  leaderboardFullList: {
    gap: 8,
  },
  leaderboardFullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2a3e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  leaderboardFullRowCurrentUser: {
    backgroundColor: 'rgba(106, 159, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#6a9fff',
  },
  leaderboardFullRank: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardFullRankText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  leaderboardFullInfo: {
    flex: 1,
    marginLeft: 8,
  },
  leaderboardFullName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  leaderboardFullNameCurrentUser: {
    color: '#6a9fff',
  },
  leaderboardFullMeta: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  leaderboardFullScore: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4ade80',
    marginLeft: 12,
  },
  leaderboardFullScoreCurrentUser: {
    color: '#6a9fff',
  },
  leaderboardScreenActions: {
    marginTop: 24,
    gap: 12,
  },
  leaderboardScreenActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6a9fff',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  leaderboardScreenActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6a9fff',
  },
  leaderboardScreenShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 8,
  },
  leaderboardScreenShareText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ade80',
  },
  // Share score button
  shareScoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  shareScoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ade80',
  },
  // Leaderboard card styles
  leaderboardCard: {
    backgroundColor: '#1a2a3e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2a4a6e',
  },
  leaderboardCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardCardIcon: {
    marginRight: 0,
  },
  leaderboardCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  leaderboardCardDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  // Leaderboard preview styles (on card)
  leaderboardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderboardPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  leaderboardPreviewScore: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  leaderboardPreviewScoreCurrentUser: {
    color: '#6a9fff',
  },
  // How to play button
  howToPlayButton: {
    marginTop: 16,
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a4a6e',
    backgroundColor: '#0f1a2a',
    paddingVertical: 14,
    gap: 8,
  },
  howToPlayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6a9fff',
  },
  // Sign in banner styles
  signInBanner: {
    backgroundColor: '#1a2a3e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a4a6e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signInBannerText: {
    flex: 1,
  },
  signInBannerTitle: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
  },
  signInBannerButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  signInBannerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  signInBannerDismiss: {
    padding: 8,
    marginLeft: 4,
  },
  signInBannerDismissText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '300',
  },
  // Account section (for signed in users)
  accountSection: {
    marginTop: 24,
    alignItems: 'center',
    gap: 4,
  },
  accountSectionEmail: {
    fontSize: 13,
    color: '#666',
  },
  accountSectionSignOut: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  scoreSummary: {
    alignItems: 'center',
  },
  scoreSummaryLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  playButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  playButtonLoadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  scoreSummaryText: {
    fontSize: 16,
    color: '#4ade80',
    fontWeight: '600',
    marginBottom: 4,
  },
  percentileText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a3d2d',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 13,
    color: '#4ade80',
    fontWeight: '600',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    gap: 12,
  },
  footerLinkText: {
    fontSize: 13,
    color: '#555',
  },
  footerLinkDivider: {
    fontSize: 13,
    color: '#333',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2a1a0a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  streakFlame: {
    fontSize: 18,
    marginRight: 6,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  // Sign in styles
  signInButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  signInText: {
    fontSize: 14,
    color: '#6a9fff',
  },
  accountContainer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 4,
  },
  accountDisplayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6a9fff',
    marginBottom: 2,
  },
  accountEmail: {
    fontSize: 13,
    color: '#666',
  },
  signOutText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  // Display name modal styles
  displayNameModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    maxWidth: 360,
    width: '100%',
    alignItems: 'center',
  },
  displayNameTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  displayNameSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  displayNameInput: {
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a3a6e',
  },
  displayNameSaveButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  displayNameSaveButtonDisabled: {
    backgroundColor: '#2a4a3a',
  },
  displayNameSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  displayNameCancelButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  displayNameCancelText: {
    fontSize: 15,
    color: '#888',
  },
  signInModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    maxWidth: 360,
    width: '100%',
    alignItems: 'center',
  },
  signInModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  signInModalSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  appleButton: {
    width: '100%',
    height: 48,
    marginBottom: 16,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  signInCancelButton: {
    paddingVertical: 12,
  },
  signInCancelText: {
    fontSize: 16,
    color: '#888',
  },
  // Profile menu modal styles
  profileMenuModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    maxWidth: 320,
    width: '100%',
  },
  profileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 12,
  },
  profileMenuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4a4a8e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMenuAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  profileMenuInfo: {
    flex: 1,
  },
  profileMenuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  profileMenuEmail: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: '#2a2a4e',
    marginVertical: 8,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  profileMenuItemIcon: {
    marginRight: 0,
  },
  profileMenuItemText: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
  },
  profileMenuItemTextDanger: {
    fontSize: 15,
    color: '#ef4444',
  },
  // Toggle switch styles
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3a3a5e',
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#4ade80',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleThumbOn: {
    transform: [{ translateX: 22 }],
  },
  // Menu links row
  menuLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  menuLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  menuLinkText: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'underline',
  },
  menuLinkDivider: {
    fontSize: 16,
    color: '#555',
  },
  // Leaderboard modal styles
  leaderboardModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    maxHeight: '80%',
    width: '100%',
  },
  leaderboardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  leaderboardEmpty: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 40,
  },
  leaderboardList: {
    // Removed maxHeight since it's now inside a ScrollView
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  leaderboardRowCurrentUser: {
    backgroundColor: 'rgba(106, 159, 255, 0.15)',
    borderRadius: 8,
  },
  leaderboardRowSeparated: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    borderStyle: 'dashed',
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardRankText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: 8,
  },
  leaderboardName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  leaderboardNameCurrentUser: {
    color: '#6a9fff',
  },
  leaderboardTime: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  leaderboardScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ade80',
    marginLeft: 12,
  },
  leaderboardScoreCurrentUser: {
    color: '#6a9fff',
  },
  leaderboardCloseButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#2a3a5a',
    borderRadius: 8,
    alignItems: 'center',
  },
  leaderboardCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Enhanced leaderboard modal styles
  leaderboardScrollView: {
    maxHeight: '100%',
  },
  leaderboardUserScore: {
    backgroundColor: '#1a2e1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a4a3a',
  },
  leaderboardUserScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaderboardUserScoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ade80',
  },
  leaderboardUserRankBadge: {
    backgroundColor: '#2a4a3a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  leaderboardUserRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4ade80',
  },
  leaderboardUserScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  leaderboardUserScoreItem: {
    alignItems: 'center',
  },
  leaderboardUserScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  leaderboardUserScoreLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  leaderboardUserPercentile: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
  },
  leaderboardShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4ade80',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 16,
  },
  leaderboardShareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ade80',
  },
  leaderboardViewAnswersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6a9fff',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
  },
  leaderboardViewAnswersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a9fff',
  },
  // Tutorial modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tutorialModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    maxHeight: '80%',
    width: '100%',
  },
  tutorialTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  tutorialHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ade80',
    marginTop: 16,
    marginBottom: 8,
  },
  tutorialText: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  tutorialCloseButton: {
    backgroundColor: '#2d5a3d',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  tutorialCloseText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
    minHeight: 44,
  },
  headerBackButton: {
    padding: 8,
    width: 44,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 44,
  },
  headerHelpButton: {
    padding: 8,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerHelpIcon: {
    color: '#888',
    fontSize: 14,
    fontWeight: '700',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  headerBackIcon: {
    color: 'white',
    fontSize: 28,
  },
  livesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  livesLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  heart: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  heartFilled: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  heartEmpty: {
    backgroundColor: '#3a3a5e',
    borderWidth: 1,
    borderColor: '#4a4a6e',
  },
  instructions: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  // Result header with back arrow
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  // Result scroll content
  resultScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // Game over styles
  gameOverText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 24,
  },
  percentileCardGameOver: {
    backgroundColor: '#3d2d2d',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  percentileValueGameOver: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  percentileLabelGameOver: {
    fontSize: 14,
    color: '#d0a0a0',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ff6b6b',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shareButtonText: {
    color: '#ff6b6b',
    fontWeight: '600',
    fontSize: 18,
  },
  tryAgainButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
  },
  tryAgainText: {
    color: '#0f0f1a',
    fontWeight: '600',
    fontSize: 18,
  },
  // Win overlay styles
  winOverlayTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: '#1a2e1f',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  noScoreText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  noScoreSubtext: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  calculatingText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  // Loading result screen styles
  loadingResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingResultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingResultText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
  },
  percentileCard: {
    backgroundColor: '#2d5a3d',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  percentileValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  percentileLabel: {
    fontSize: 14,
    color: '#a0d0b0',
    marginTop: 4,
  },
  // Rank card styles (win screen)
  rankCardWin: {
    backgroundColor: '#2d5a3d',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  rankValueWin: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  rankLabelWin: {
    fontSize: 14,
    color: '#a0d0b0',
    marginTop: 4,
  },
  // Rank card styles (game over screen)
  rankCard: {
    backgroundColor: '#3d2d2d',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  rankValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  rankLabel: {
    fontSize: 14,
    color: '#d0a0a0',
    marginTop: 4,
  },
  shareButtonWin: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4ade80',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shareButtonWinText: {
    color: '#4ade80',
    fontWeight: '600',
    fontSize: 18,
  },
  menuButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
  },
  menuButtonText: {
    color: '#0f0f1a',
    fontWeight: '600',
    fontSize: 18,
  },
  // Review mode styles
  reviewScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  reviewShareButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4ade80',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
  },
  reviewShareButtonText: {
    color: '#4ade80',
    fontWeight: '600',
    fontSize: 16,
  },
  reviewHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerPlaceholder: {
    width: 44,
  },
  reviewPercentileRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a3a4a',
    alignItems: 'center',
  },
  reviewPercentileText: {
    fontSize: 18,
    color: '#f59e0b',
    fontWeight: '600',
  },
  reviewSubtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 24,
    marginBottom: 12,
  },
  reviewGridContainer: {
    alignItems: 'center',
  },
  // Grid container
  gridContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  // Game complete result screen styles (embedded leaderboard)
  gameCompleteScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  gameCompleteHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gameCompleteTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameCompleteRankText: {
    fontSize: 18,
    color: '#ffd700',
    fontWeight: '600',
    marginTop: 8,
  },
  gameCompleteScoreCard: {
    backgroundColor: '#1a2a3e',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    marginBottom: 16,
  },
  gameCompleteScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gameCompleteScoreItem: {
    alignItems: 'center',
  },
  gameCompleteScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameCompleteScoreLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  gameCompleteLeaderboardCard: {
    backgroundColor: '#1a2a3e',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a4a6e',
  },
  gameCompleteLeaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gameCompleteLeaderboardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameCompleteLeaderboardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  gameCompleteActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
  },
  gameCompleteActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a2a3e',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a4a6e',
  },
  gameCompleteActionButtonText: {
    color: '#6a9fff',
    fontWeight: '600',
    fontSize: 14,
  },
  gameCompleteShareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a3d2d',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d5a3d',
  },
  gameCompleteShareButtonText: {
    color: '#4ade80',
    fontWeight: '600',
    fontSize: 14,
  },
  gameCompleteBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  gameCompleteBackButtonText: {
    color: '#888',
    fontSize: 14,
  },
});
