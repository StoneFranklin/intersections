import { GameGrid, WordTray } from '@/components/game';
import { generatePuzzle } from '@/data/puzzle-generator';
import { useGameState } from '@/hooks/use-game-state';
import { CellPosition, Puzzle } from '@/types/game';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function GameScreen() {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle());
  
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

  const handleNewPuzzle = useCallback(() => {
    const newPuzzle = generatePuzzle();
    setPuzzle(newPuzzle);
  }, []);

  const handleCellPress = (position: CellPosition) => {
    const existingWord = getWordAtCell(position);
    
    if (existingWord) {
      // Cell has a word - remove it
      removeWordFromCell(position);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    if (gameState.selectedWordId) {
      // Place selected word
      const success = placeWordAtCell(position);
      if (success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const handleCellLongPress = (position: CellPosition) => {
    const word = getWordAtCell(position);
    if (word) {
      removeWordFromCell(position);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleWordSelect = (wordId: string | null) => {
    selectWord(wordId);
    if (wordId) {
      Haptics.selectionAsync();
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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{puzzle.title}</Text>
        <Text style={styles.subtitle}>
          Place each word where its row and column categories meet
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
  header: {
    padding: 16,
    paddingTop: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
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
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
