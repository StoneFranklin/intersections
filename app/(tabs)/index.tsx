import { GameGrid, WordTray } from '@/components/game';
import { generateDailyPuzzle, generatePuzzle } from '@/data/puzzle-generator';
import { useGameState } from '@/hooks/use-game-state';
import { CellPosition, Difficulty, Puzzle } from '@/types/game';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
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

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '⭐ Easy',
  medium: '⭐⭐ Medium', 
  hard: '⭐⭐⭐ Hard',
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy: 'Match 2 categories (left + top)',
  medium: 'Match 3 categories (left + top + right)',
  hard: 'Match 4 categories (left + top + right + bottom)',
};

export default function GameScreen() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  
  // Generate puzzle when difficulty is selected
  useEffect(() => {
    if (selectedDifficulty) {
      setPuzzle(generateDailyPuzzle(selectedDifficulty));
    }
  }, [selectedDifficulty]);

  // Show difficulty selector
  if (!selectedDifficulty || !puzzle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.difficultySelector}>
          <Text style={styles.selectorTitle}>Fenceposts</Text>
          <Text style={styles.selectorSubtitle}>Daily Puzzles</Text>
          
          <View style={styles.difficultyButtons}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton,
                  diff === 'easy' && styles.easyButton,
                  diff === 'medium' && styles.mediumButton,
                  diff === 'hard' && styles.hardButton,
                ]}
                onPress={() => setSelectedDifficulty(diff)}
              >
                <Text style={styles.difficultyButtonLabel}>
                  {DIFFICULTY_LABELS[diff]}
                </Text>
                <Text style={styles.difficultyButtonDesc}>
                  {DIFFICULTY_DESCRIPTIONS[diff]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GameContent 
      puzzle={puzzle} 
      setPuzzle={setPuzzle}
      difficulty={selectedDifficulty}
      onBack={() => setSelectedDifficulty(null)}
    />
  );
}

interface GameContentProps {
  puzzle: Puzzle;
  setPuzzle: (p: Puzzle) => void;
  difficulty: Difficulty;
  onBack: () => void;
}

function GameContent({ puzzle, setPuzzle, difficulty, onBack }: GameContentProps) {
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

  const handleNewPuzzle = useCallback(() => {
    const newPuzzle = generatePuzzle(difficulty);
    setPuzzle(newPuzzle);
  }, [setPuzzle, difficulty]);

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
          <TouchableOpacity style={styles.tryAgainButton} onPress={handleNewPuzzle}>
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back to Menu</Text>
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
          <Text style={styles.title}>{DIFFICULTY_LABELS[difficulty]}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>
          {DIFFICULTY_DESCRIPTIONS[difficulty]}
        </Text>
        <Text style={[styles.livesText, gameState.lives <= 1 && styles.livesTextDanger]}>
          {'❤️'.repeat(gameState.lives)}
        </Text>
      </View>

      {/* Win Banner */}
      {gameState.isSolved && (
        <View style={styles.winBanner}>
          <Text style={styles.winText}>Puzzle Solved!</Text>
          <TouchableOpacity style={styles.playAgainButton} onPress={handleNewPuzzle}>
            <Text style={styles.playAgainText}>New Puzzle</Text>
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

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newPuzzleButton} onPress={handleNewPuzzle}>
          <Text style={styles.newPuzzleText}>New Puzzle</Text>
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
  // Difficulty selector styles
  difficultySelector: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectorTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  selectorSubtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 40,
  },
  difficultyButtons: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  difficultyButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  easyButton: {
    backgroundColor: '#2d5a3d',
  },
  mediumButton: {
    backgroundColor: '#5a4a2d',
  },
  hardButton: {
    backgroundColor: '#5a2d3d',
  },
  difficultyButtonLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  difficultyButtonDesc: {
    fontSize: 14,
    color: '#ccc',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
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
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
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
  newPuzzleButton: {
    backgroundColor: '#3a5a8a',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  newPuzzleText: {
    color: '#fff',
    fontWeight: '600',
  },
});
