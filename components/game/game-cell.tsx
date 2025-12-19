import { CellPosition, Word } from '@/types/game';
import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface GameCellProps {
  position: CellPosition;
  word: Word | null;
  isCorrect: boolean | null;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  size: number;
}

export const GameCell = memo(function GameCell({
  position,
  word,
  isCorrect,
  isSelected,
  onPress,
  onLongPress,
  size,
}: GameCellProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const prevIsCorrect = useRef<boolean | null>(null);

  // Animate on correct/incorrect placement
  useEffect(() => {
    if (isCorrect !== null && prevIsCorrect.current === null) {
      if (isCorrect) {
        // Pop animation for correct
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Flash green
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      } else {
        // Shake animation for incorrect
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
    }
    prevIsCorrect.current = isCorrect;
  }, [isCorrect, scaleAnim, shakeAnim, flashAnim]);

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

  const flashBackgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', 'rgba(74, 222, 128, 0.4)'],
  });

  // Generate accessibility label
  const getAccessibilityLabel = () => {
    const cellPosition = `Row ${position.rowIndex + 1}, Column ${position.colIndex + 1}`;
    if (!word) {
      return `${cellPosition}. Empty cell. ${isSelected ? 'Ready to place word.' : 'Tap to place selected word.'}`;
    }
    const status = isCorrect === true ? 'Correct' : isCorrect === false ? 'Incorrect' : 'Placed';
    return `${cellPosition}. ${word.text}. ${status}. ${isCorrect !== true ? 'Long press to remove.' : ''}`;
  };

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          { translateX: shakeAnim },
        ],
      }}
    >
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
        accessibilityRole="button"
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityState={{
          selected: isSelected,
          disabled: isCorrect === true,
        }}
      >
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            { backgroundColor: flashBackgroundColor, borderRadius: 6 }
          ]} 
        />
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
    </Animated.View>
  );
});

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
