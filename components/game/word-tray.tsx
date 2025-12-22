import { ColorScheme } from '@/constants/theme';
import { useThemeScheme } from '@/contexts/theme-context';
import { Word } from '@/types/game';
import React, { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WordTrayProps {
  words: Word[];
  selectedWordId: string | null;
  onWordSelect: (wordId: string | null) => void;
}

export const WordTray = memo(function WordTray({ words, selectedWordId, onWordSelect }: WordTrayProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  if (words.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>All words placed!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tap a word, then tap a cell to place it:</Text>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.wordsContainer}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {words.map((word) => {
          const isSelected = selectedWordId === word.id;
          return (
            <TouchableOpacity
              key={word.id}
              style={[styles.wordChip, isSelected && styles.wordChipSelected]}
              onPress={() => onWordSelect(isSelected ? null : word.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${word.text}. ${isSelected ? 'Selected. Tap to deselect.' : 'Tap to select and place on grid.'}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.wordText, isSelected && styles.wordTextSelected]}>
                {word.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const createStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: colorScheme.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colorScheme.borderPrimary,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    color: colorScheme.textTertiary,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 12,
  },
  wordChip: {
    backgroundColor: colorScheme.backgroundTertiary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wordChipSelected: {
    backgroundColor: colorScheme.cellSelected,
    borderColor: colorScheme.borderAccent,
  },
  wordText: {
    color: colorScheme.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  wordTextSelected: {
    color: colorScheme.textPrimary,
    fontWeight: '700',
  },
  emptyText: {
    color: colorScheme.brandPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
