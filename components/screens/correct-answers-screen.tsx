import { styles } from '@/app/(tabs)/index.styles';
import type { Puzzle } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameGrid } from '../game/game-grid';

interface CorrectAnswersScreenProps {
  puzzle: Puzzle | null;
  onBack: () => void;
}

export function CorrectAnswersScreen({ puzzle, onBack }: CorrectAnswersScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.leaderboardScreenTitleContainer}>
          <Text style={styles.leaderboardScreenTitle}>Correct Answers</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.answersModalContent}>
        {puzzle && (
          <GameGrid
            puzzle={puzzle}
            getWordAtCell={(pos) => {
              const rowCat = puzzle.rowCategories[pos.rowIndex];
              const colCat = puzzle.colCategories[pos.colIndex];
              return (
                puzzle.words.find(
                  (w) => w.correctRowId === rowCat.id && w.correctColId === colCat.id
                ) || null
              );
            }}
            isCellCorrect={() => true}
            selectedWordId={null}
            onCellPress={() => {}}
            onCellLongPress={() => {}}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

