import { CellPosition, Word } from '@/types/game';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface GameCellProps {
  position: CellPosition;
  word: Word | null;
  isCorrect: boolean | null;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  size: number;
}

export function GameCell({
  word,
  isCorrect,
  isSelected,
  onPress,
  onLongPress,
  size,
}: GameCellProps) {
  const getCellStyle = () => {
    if (!word) {
      return isSelected ? styles.cellEmpty : styles.cellEmpty;
    }
    if (isCorrect === true) {
      return styles.cellCorrect;
    }
    if (isCorrect === false) {
      return styles.cellIncorrect;
    }
    return styles.cellFilled;
  };

  const fontSize = Math.max(12, Math.min(size / 5, 18));

  return (
    <TouchableOpacity
      style={[
        styles.cell, 
        getCellStyle(), 
        isSelected && styles.cellHighlight,
        { width: size, height: size }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {word ? (
        <Text 
          style={[styles.cellText, { fontSize }]} 
          numberOfLines={1} 
          adjustsFontSizeToFit
        >
          {word.text}
        </Text>
      ) : (
        <Text style={[styles.emptyText, { fontSize: size / 3 }]}>+</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  cellEmpty: {
    backgroundColor: '#2a2a3e',
    borderWidth: 2,
    borderColor: '#3a3a5e',
    borderStyle: 'dashed',
  },
  cellFilled: {
    backgroundColor: '#4a4a6e',
  },
  cellCorrect: {
    backgroundColor: '#2d5a3d',
  },
  cellIncorrect: {
    backgroundColor: '#5a2d2d',
  },
  cellHighlight: {
    borderColor: '#6a9fff',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  cellText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
  },
});
