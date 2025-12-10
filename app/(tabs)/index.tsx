import { GameGrid, WordTray } from '@/components/game';
import { useAuth } from '@/contexts/auth-context';
import { generateDailyPuzzle } from '@/data/puzzle-generator';
import { fetchTodaysPuzzle, getOrCreateProfile, getPercentile, getTodayLeaderboard, getUserStreak, getUserTodayScore, hasUserCompletedToday, LeaderboardEntry, submitScore, updateDisplayName, updateUserStreak } from '@/data/puzzleApi';
import { useGameState } from '@/hooks/use-game-state';
import { CellPosition, GameScore, Puzzle } from '@/types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Format seconds into MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Generate share text for score
function generateShareText(score: GameScore, percentile: number | null): string {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  let text = `Intersections - ${today}\n\n`;
  text += `My score today: ${score.score}\n\n`;
  
  if (percentile !== null) {
    text += `Top ${100 - percentile}% of players`;
  }
  
  text += `\n\nPlay at: stonefranklin.github.io/intersections`;
  
  return text;
}

// Share score function
async function shareScore(score: GameScore, percentile: number | null) {
  const text = generateShareText(score, percentile);
  
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
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  // Display name state
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [signInBannerDismissed, setSignInBannerDismissed] = useState(true); // Start hidden until we check

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

  const openLeaderboard = async () => {
    setShowLeaderboard(true);
    setLoadingLeaderboard(true);
    try {
      const data = await getTodayLeaderboard(user?.id);
      setLeaderboard(data);
    } catch (e) {
      console.error('Error loading leaderboard:', e);
    } finally {
      setLoadingLeaderboard(false);
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
          const dbCompleted = await hasUserCompletedToday(user.id);
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

  const handleComplete = async (score: GameScore) => {
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
    } catch (e) {
      console.log('Error saving completion:', e);
    }
  };

  const handleBack = () => {
    setIsPlaying(false);
    setIsReviewMode(false);
  };

  // Show main menu
  if (!isPlaying || !puzzle) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.homeHeader}>
          <View style={styles.homeHeaderLeft}>
            {streak > 0 && (
              <View style={styles.headerStreakBadge}>
                <Text style={styles.headerStreakFlame}>🔥</Text>
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
            
            <View style={styles.menuButtons}>
              <TouchableOpacity
                style={[styles.playButton, dailyCompleted && styles.completedButton]}
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
                    {fetchingPuzzle ? 'Loading...' : dailyCompleted ? '✓ Completed' : "Today's Puzzle"}
                  </Text>
                  {dailyCompleted && savedScore ? (
                    <View style={styles.scoreSummary}>
                      <Text style={styles.scoreSummaryText}>
                        {savedScore.score} pts • {savedScore.correctPlacements}/16 • {formatTime(savedScore.timeSeconds)}
                      </Text>
                      {savedScore.percentile !== undefined && (
                        <Text style={styles.percentileText}>Top {100 - savedScore.percentile}% of players</Text>
                      )}
                      <Text style={styles.playButtonDesc}>Tap to review</Text>
                    </View>
                  ) : dailyCompleted && !savedScore ? (
                    <View style={styles.scoreSummaryLoading}>
                      <ActivityIndicator size="small" color="#4ade80" />
                      <Text style={styles.playButtonDesc}>Loading score...</Text>
                    </View>
                  ) : (
                    <Text style={styles.playButtonDesc}>
                      {fetchingPuzzle ? 'Fetching puzzle' : 'New puzzle every day'}
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>

            {/* Leaderboard Card */}
            <TouchableOpacity
              style={styles.leaderboardCard}
              onPress={openLeaderboard}
            >
              <View style={styles.leaderboardCardLeft}>
                <Text style={styles.leaderboardCardIcon}>🏆</Text>
                <View>
                  <Text style={styles.leaderboardCardTitle}>Leaderboard</Text>
                  <Text style={styles.leaderboardCardDesc}>See how you rank today</Text>
                </View>
              </View>
              <Text style={styles.leaderboardCardArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.howToPlayButton}
            onPress={() => setShowTutorial(true)}
          >
            <Text style={styles.howToPlayText}>How to Play</Text>
          </TouchableOpacity>

          {loading ? null : (
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          )}
          </View>
        </ScrollView>

        {/* Tutorial Modal */}
        <Modal
          visible={showTutorial}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowTutorial(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.tutorialModal}>
              <ScrollView showsVerticalScrollIndicator={true}>
                <Text style={styles.tutorialTitle}>How to Play</Text>
                
                <Text style={styles.tutorialHeading}>Goal</Text>
                <Text style={styles.tutorialText}>
                  Place each word in the grid where its two categories intersect.
                </Text>

                <Text style={styles.tutorialHeading}>Example</Text>
                <Text style={styles.tutorialText}>
                  If the row is "Fruits" and the column is "Red Things", the correct word might be "Apple" — it belongs to both categories!
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

              <TouchableOpacity 
                style={styles.tutorialCloseButton}
                onPress={() => setShowTutorial(false)}
              >
                <Text style={styles.tutorialCloseText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </View>
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
                <Text style={styles.googleButtonText}>
                  {signingIn ? 'Signing in...' : '🔵 Continue with Google'}
                </Text>
              </TouchableOpacity>

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
                <Text style={styles.profileMenuItemIcon}>✏️</Text>
                <Text style={styles.profileMenuItemText}>Edit Display Name</Text>
              </TouchableOpacity>

              <View style={styles.profileMenuDivider} />

              <TouchableOpacity 
                style={styles.profileMenuItem}
                onPress={() => {
                  setShowProfileMenu(false);
                  signOut();
                }}
              >
                <Text style={styles.profileMenuItemIcon}>🚪</Text>
                <Text style={styles.profileMenuItemTextDanger}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Leaderboard Modal */}
        <Modal
          visible={showLeaderboard}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowLeaderboard(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.leaderboardModal}>
              <Text style={styles.leaderboardTitle}>🏆 Today's Leaderboard</Text>
              
              {loadingLeaderboard ? (
                <ActivityIndicator size="large" color="#6a9fff" style={{ marginVertical: 40 }} />
              ) : leaderboard.length === 0 ? (
                <Text style={styles.leaderboardEmpty}>No scores yet today. Be the first!</Text>
              ) : (
                <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={true}>
                  {leaderboard.map((entry, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.leaderboardRow,
                        entry.isCurrentUser && styles.leaderboardRowCurrentUser,
                        entry.rank > 10 && styles.leaderboardRowSeparated,
                      ]}
                    >
                      <Text style={styles.leaderboardRank}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                      </Text>
                      <View style={styles.leaderboardInfo}>
                        <Text style={[
                          styles.leaderboardName,
                          entry.isCurrentUser && styles.leaderboardNameCurrentUser,
                        ]}>
                          {entry.displayName || 'Anonymous'}
                          {entry.isCurrentUser && ' (you)'}
                        </Text>
                        <Text style={styles.leaderboardTime}>
                          {formatTime(entry.timeSeconds)}
                        </Text>
                      </View>
                      <Text style={[
                        styles.leaderboardScore,
                        entry.isCurrentUser && styles.leaderboardScoreCurrentUser,
                      ]}>
                        {entry.score}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.leaderboardCloseButton}
                onPress={() => setShowLeaderboard(false)}
              >
                <Text style={styles.leaderboardCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    <GameContent 
      puzzle={puzzle} 
      onBack={handleBack}
      onComplete={handleComplete}
      isReviewMode={isReviewMode}
      savedScore={savedScore}
      userId={user?.id}
    />
  );
}

interface GameContentProps {
  puzzle: Puzzle;
  onBack: () => void;
  onComplete: (score: GameScore) => void;
  isReviewMode?: boolean;
  savedScore?: GameScore | null;
  userId?: string;
}

function GameContent({ puzzle, onBack, onComplete, isReviewMode = false, savedScore, userId }: GameContentProps) {
  const {
    gameState,
    unplacedWords,
    getWordAtCell,
    selectWord,
    placeWordAtCell,
    removeWordFromCell,
    isCellCorrect,
    elapsedTime,
    mistakes,
    finalScore,
  } = useGameState(puzzle);

  const [percentile, setPercentile] = useState<number | null>(null);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const isGameOver = gameState.lives <= 0;

  // Submit score when puzzle is solved OR game over (only if not in review mode)
  useEffect(() => {
    if (isReviewMode) return;
    
    const gameEnded = gameState.isSolved || isGameOver;
    if (gameEnded && finalScore && !submittingScore && percentile === null) {
      setSubmittingScore(true);
      submitScore(finalScore.score, finalScore.timeSeconds, finalScore.mistakes, finalScore.correctPlacements, userId)
        .then((result) => {
          if (result) {
            setPercentile(result.percentile);
          }
          // Save completion for both win and game over
          onComplete(finalScore);
        })
        .catch(console.error)
        .finally(() => setSubmittingScore(false));
    }
  }, [gameState.isSolved, isGameOver, finalScore, submittingScore, percentile, onComplete]);

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
              {savedScore.percentile !== undefined && (
                <View style={styles.reviewPercentileRow}>
                  <Text style={styles.reviewPercentileText}>Top {100 - savedScore.percentile}% of players</Text>
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
              onPress={() => shareScore(savedScore, savedScore.percentile ?? null)}
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

  // Full screen game over overlay with score
  if (isGameOver && finalScore) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#1a0a0a' }]}>
        {/* Header with back arrow */}
        <View style={styles.resultHeader}>
          <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
            <Text style={styles.headerBackIcon}>‹</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.gameOverEmoji}>💔</Text>
          <Text style={styles.gameOverText}>Game Over!</Text>
          
          <View style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{finalScore.score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{finalScore.correctPlacements}/16</Text>
                <Text style={styles.scoreLabel}>Correct</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{formatTime(finalScore.timeSeconds)}</Text>
                <Text style={styles.scoreLabel}>Time</Text>
              </View>
            </View>
          </View>

          {submittingScore && (
            <Text style={styles.calculatingText}>Calculating rank...</Text>
          )}
          
          {percentile !== null && (
            <View style={styles.percentileCardGameOver}>
              <Text style={styles.percentileValueGameOver}>Top {100 - percentile}%</Text>
              <Text style={styles.percentileLabelGameOver}>of players today</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={() => shareScore(finalScore, percentile)}
          >
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Full screen win overlay
  if (gameState.isSolved && finalScore) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0a1a0f' }]}>
        {/* Header with back arrow */}
        <View style={styles.resultHeader}>
          <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
            <Text style={styles.headerBackIcon}>‹</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.winEmoji}>🎉</Text>
          <Text style={styles.winOverlayTitle}>Puzzle Solved!</Text>
          
          <View style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{finalScore.score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{formatTime(finalScore.timeSeconds)}</Text>
                <Text style={styles.scoreLabel}>Time</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{finalScore.mistakes}</Text>
                <Text style={styles.scoreLabel}>Mistakes</Text>
              </View>
            </View>
          </View>

          {submittingScore && (
            <Text style={styles.calculatingText}>Calculating rank...</Text>
          )}
          
          {percentile !== null && (
            <View style={styles.percentileCard}>
              <Text style={styles.percentileValue}>Top {100 - percentile}%</Text>
              <Text style={styles.percentileLabel}>of players today</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.shareButtonWin} 
            onPress={() => shareScore(finalScore, percentile)}
          >
            <Text style={styles.shareButtonWinText}>Share</Text>
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
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTutorial(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tutorialModal}>
            <ScrollView showsVerticalScrollIndicator={true}>
              <Text style={styles.tutorialTitle}>How to Play</Text>
              
              <Text style={styles.tutorialHeading}>Goal</Text>
              <Text style={styles.tutorialText}>
                Place each word in the grid where its two categories intersect.
              </Text>

              <Text style={styles.tutorialHeading}>Example</Text>
              <Text style={styles.tutorialText}>
                If the row is "Fruits" and the column is "Red Things", the correct word might be "Apple" — it belongs to both categories!
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

            <TouchableOpacity 
              style={styles.tutorialCloseButton}
              onPress={() => setShowTutorial(false)}
            >
              <Text style={styles.tutorialCloseText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 14,
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
    marginBottom: 50,
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
    fontSize: 28,
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
  leaderboardCardArrow: {
    fontSize: 24,
    color: '#6a9fff',
    fontWeight: '300',
  },
  // How to play button
  howToPlayButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  howToPlayText: {
    fontSize: 15,
    color: '#888',
    textDecorationLine: 'underline',
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
  dateText: {
    marginTop: 40,
    fontSize: 16,
    color: '#666',
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
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    fontSize: 18,
  },
  profileMenuItemText: {
    fontSize: 15,
    color: '#fff',
  },
  profileMenuItemTextDanger: {
    fontSize: 15,
    color: '#ef4444',
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
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  leaderboardEmpty: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 40,
  },
  leaderboardList: {
    maxHeight: 400,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
    width: 40,
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
    marginTop: 20,
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
  gameOverEmoji: {
    fontSize: 80,
    marginBottom: 16,
    marginTop: 20,
  },
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
  winEmoji: {
    fontSize: 80,
    marginBottom: 16,
    marginTop: 20,
  },
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
});
