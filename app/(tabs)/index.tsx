import { GameGrid, WordTray } from '@/components/game';
import { generateDailyPuzzle } from '@/data/puzzle-generator';
import { useGameState } from '@/hooks/use-game-state';
import { CellPosition, Puzzle } from '@/types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

  const handlePlayDaily = () => {
    setPuzzle(generateDailyPuzzle());
    setIsPlaying(true);
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
          <Text style={styles.menuTitle}>Fenceposts</Text>
          <Text style={styles.menuSubtitle}>A Daily Word Puzzle</Text>
          
          <View style={styles.menuButtons}>
            <TouchableOpacity
              style={[styles.playButton, dailyCompleted && styles.completedButton]}
              onPress={handlePlayDaily}
            >
              <Text style={styles.playButtonLabel}>
                {dailyCompleted ? '✓ Daily Puzzle' : "Today's Puzzle"}
              </Text>
              <Text style={styles.playButtonDesc}>
                {dailyCompleted ? 'Completed!' : 'New puzzle every day'}
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
    resetGame,
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

  const handleReset = () => {
    Alert.alert(
      'Reset Puzzle',
      'Are you sure you want to reset the puzzle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetGame();
            haptics.notification(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
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
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
            <Text style={styles.headerBackText}>← Menu</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Fenceposts</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>
          Place words where categories intersect
        </Text>
        <Text style={[styles.livesText, gameState.lives <= 1 && styles.livesTextDanger]}>
          {'❤️'.repeat(gameState.lives)}
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

      {/* Word Tray */}
      <WordTray
        words={unplacedWords}
        selectedWordId={gameState.selectedWordId}
        onWordSelect={handleWordSelect}
      />

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 8,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  headerBackButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerBackText: {
    color: '#888',
    fontSize: 14,
  },
  headerSpacer: {
    width: 60,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  livesText: {
    fontSize: 20,
    marginTop: 8,
    color: '#fff',
  },
  livesTextDanger: {
    opacity: 0.8,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Footer styles
  footer: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  resetButton: {
    backgroundColor: '#3a3a5e',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetText: {
    color: '#aaa',
    fontWeight: '600',
  },
});
