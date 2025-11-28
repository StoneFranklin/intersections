import { GameGrid, WordTray } from '@/components/game';
import { generateDailyPuzzle } from '@/data/puzzle-generator';
import { fetchTodaysPuzzle } from '@/data/puzzleApi';
import { useGameState } from '@/hooks/use-game-state';
import { CellPosition, Puzzle } from '@/types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if today's puzzle was already completed
  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const todayKey = getTodayKey();
        const completed = await AsyncStorage.getItem(`completed-${todayKey}`);
        setDailyCompleted(completed === 'true');
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
      setIsPlaying(true);
    } catch (e) {
      console.error('Error fetching puzzle:', e);
      // Fallback to static puzzle on error
      setPuzzle(generateDailyPuzzle());
      setIsPlaying(true);
    } finally {
      setFetchingPuzzle(false);
    }
  };

  const handleComplete = async () => {
    try {
      const todayKey = getTodayKey();
      await AsyncStorage.setItem(`completed-${todayKey}`, 'true');
      setDailyCompleted(true);
    } catch (e) {
      console.log('Error saving completion:', e);
    }
  };

  // Show main menu
  if (!isPlaying || !puzzle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.mainMenu}>
          <Text style={styles.menuTitle}>Intersections</Text>
          <Text style={styles.menuSubtitle}>A Daily Word Puzzle</Text>
          
          <View style={styles.menuButtons}>
            <TouchableOpacity
              style={[styles.playButton, dailyCompleted && styles.completedButton]}
              onPress={handlePlayDaily}
              disabled={fetchingPuzzle}
            >
              <Text style={styles.playButtonLabel}>
                {fetchingPuzzle ? 'Loading...' : dailyCompleted ? '✓ Daily Puzzle' : "Today's Puzzle"}
              </Text>
              <Text style={styles.playButtonDesc}>
                {fetchingPuzzle ? 'Fetching puzzle' : dailyCompleted ? 'Completed!' : 'New puzzle every day'}
              </Text>
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
      onBack={() => setIsPlaying(false)}
      onComplete={handleComplete}
    />
  );
}

interface GameContentProps {
  puzzle: Puzzle;
  onBack: () => void;
  onComplete: () => void;
}

function GameContent({ puzzle, onBack, onComplete }: GameContentProps) {
  const {
    gameState,
    unplacedWords,
    getWordAtCell,
    selectWord,
    placeWordAtCell,
    removeWordFromCell,
    isCellCorrect,
  } = useGameState(puzzle);

  const isGameOver = gameState.lives <= 0;

  const handleCellPress = (position: CellPosition) => {
    if (isGameOver || gameState.isSolved) return;
    
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
    if (isGameOver || gameState.isSolved) return;
    
    const word = getWordAtCell(position);
    if (word) {
      removeWordFromCell(position);
      haptics.impact(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleWordSelect = (wordId: string | null) => {
    selectWord(wordId);
    if (wordId) {
      haptics.selection();
    }
  };

  // Full screen game over overlay
  if (isGameOver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverEmoji}>💔</Text>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <TouchableOpacity style={styles.tryAgainButton} onPress={onBack}>
            <Text style={styles.tryAgainText}>Back to Menu</Text>
          </TouchableOpacity>
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
        <Text style={styles.instructions}>
          Place words where categories intersect
        </Text>
      </View>

      {/* Win Banner */}
      {gameState.isSolved && (
        <View style={styles.winBanner}>
          <Text style={styles.winText}>Puzzle Solved!</Text>
          <TouchableOpacity style={styles.playAgainButton} onPress={() => { onComplete(); onBack(); }}>
            <Text style={styles.playAgainText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      )}
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
  dateText: {
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  // Header styles
  header: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
    minHeight: 44,
    position: 'relative',
  },
  headerBackButton: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: '-50%' }],
    padding: 8,
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
  },
  gameOverEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 24,
  },
  tryAgainButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: 12,
  },
  tryAgainText: {
    color: '#0f0f1a',
    fontWeight: '600',
    fontSize: 18,
  },
  // Win banner styles
  winBanner: {
    backgroundColor: '#2d5a3d',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  winText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 8,
  },
  playAgainButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playAgainText: {
    color: '#0f0f1a',
    fontWeight: '600',
  },
  // Grid container
  gridContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
});
