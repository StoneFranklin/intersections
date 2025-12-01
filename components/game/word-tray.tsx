import { Word } from '@/types/game';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WordTrayProps {
  words: Word[];
  selectedWordId: string | null;
  onWordSelect: (wordId: string | null) => void;
}

export function WordTray({ words, selectedWordId, onWordSelect }: WordTrayProps) {
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
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    color: '#888',
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
    backgroundColor: '#2a3a5a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wordChipSelected: {
    backgroundColor: '#3a5a8a',
    borderColor: '#6a9fff',
  },
  wordText: {
    color: '#ddd',
    fontSize: 15,
    fontWeight: '500',
  },
  wordTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    color: '#6a9fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
