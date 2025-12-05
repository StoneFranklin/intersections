import { GameGrid, WordTray } from '@/components/game';
import { generateDailyPuzzle } from '@/data/puzzle-generator';
import { fetchTodaysPuzzle, submitScore } from '@/data/puzzleApi';
import { useGameState } from '@/hooks/use-game-state';
import { CellPosition, GameScore, Puzzle } from '@/types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Platform,
    SafeAreaView,
    Share,
    StyleSheet,
    Text,
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

export default function GameScreen() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [savedScore, setSavedScore] = useState<GameScore | null>(null);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if today's puzzle was already completed
  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const todayKey = getTodayKey();
        const completed = await AsyncStorage.getItem(`completed-${todayKey}`);
        setDailyCompleted(completed === 'true');
        
        // Load saved score if completed
        if (completed === 'true') {
          const scoreData = await AsyncStorage.getItem(`score-${todayKey}`);
          if (scoreData) {
            setSavedScore(JSON.parse(scoreData));
          }
        }
      } catch (e) {
        console.log('Error checking completion:', e);
      }
      setLoading(false);
    };
    checkCompletion();
  }, []);

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
      await AsyncStorage.setItem(`completed-${todayKey}`, 'true');
      await AsyncStorage.setItem(`score-${todayKey}`, JSON.stringify(score));
      setDailyCompleted(true);
      setSavedScore(score);
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
              disabled={fetchingPuzzle}
            >
              <Text style={styles.playButtonLabel}>
                {fetchingPuzzle ? 'Loading...' : dailyCompleted ? '✓ Completed' : "Today's Puzzle"}
              </Text>
              {dailyCompleted && savedScore ? (
                <View style={styles.scoreSummary}>
                  <Text style={styles.scoreSummaryText}>
                    {savedScore.score} pts • {savedScore.completed ? '16/16' : `${savedScore.correctPlacements}/16`} • {formatTime(savedScore.timeSeconds)}
                  </Text>
                  <Text style={styles.playButtonDesc}>Tap to review</Text>
                </View>
              ) : (
                <Text style={styles.playButtonDesc}>
                  {fetchingPuzzle ? 'Fetching puzzle' : dailyCompleted ? 'Tap to review your answers' : 'New puzzle every day'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

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
    />
  );
}

interface GameContentProps {
  puzzle: Puzzle;
  onBack: () => void;
  onComplete: (score: GameScore) => void;
  isReviewMode?: boolean;
  savedScore?: GameScore | null;
}

function GameContent({ puzzle, onBack, onComplete, isReviewMode = false, savedScore }: GameContentProps) {
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

  const isGameOver = gameState.lives <= 0;

  // Submit score when puzzle is solved OR game over (only if not in review mode)
  useEffect(() => {
    if (isReviewMode) return;
    
    const gameEnded = gameState.isSolved || isGameOver;
    if (gameEnded && finalScore && !submittingScore && percentile === null) {
      setSubmittingScore(true);
      submitScore(finalScore.score, finalScore.timeSeconds, finalScore.mistakes)
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
        <View style={styles.reviewOverlay}>
          <Text style={styles.reviewTitle}>Your Results</Text>
          
          {savedScore ? (
            <View style={styles.scoreCard}>
              <View style={styles.scoreRow}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>{savedScore.score}</Text>
                  <Text style={styles.scoreLabel}>Score</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>{savedScore.completed ? '16/16' : `${savedScore.correctPlacements}/16`}</Text>
                  <Text style={styles.scoreLabel}>Correct</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreValue}>{formatTime(savedScore.timeSeconds)}</Text>
                  <Text style={styles.scoreLabel}>Time</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.scoreCard}>
              <Text style={styles.noScoreText}>Score data not available</Text>
              <Text style={styles.noScoreSubtext}>Completed before scoring was added</Text>
            </View>
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

          <TouchableOpacity style={styles.menuButton} onPress={onBack}>
            <Text style={styles.menuButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Full screen game over overlay with score
  if (isGameOver && finalScore) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameOverOverlay}>
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

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={() => shareScore(finalScore, percentile)}
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tryAgainButton} onPress={onBack}>
              <Text style={styles.tryAgainText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Full screen win overlay
  if (gameState.isSolved && finalScore) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.winOverlay}>
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

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.shareButtonWin} 
              onPress={() => shareScore(finalScore, percentile)}
            >
              <Text style={styles.shareButtonWinText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={onBack}>
              <Text style={styles.menuButtonText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
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
        <View style={styles.headerRight} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  // Main menu styles
  mainMenu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  scoreSummary: {
    alignItems: 'center',
  },
  scoreSummaryText: {
    fontSize: 16,
    color: '#4ade80',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    marginTop: 40,
    fontSize: 16,
    color: '#666',
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
  // Game over styles
  gameOverOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a0a0a',
    padding: 20,
  },
  gameOverEmoji: {
    fontSize: 80,
    marginBottom: 16,
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
  // Win overlay styles (full screen)
  winOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a1a0f',
    padding: 20,
  },
  winEmoji: {
    fontSize: 80,
    marginBottom: 16,
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
  reviewOverlay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
    padding: 20,
    paddingTop: 40,
  },
  reviewTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
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
