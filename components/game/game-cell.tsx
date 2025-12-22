import { ColorScheme } from '@/constants/theme';
import { useThemeScheme } from '@/contexts/theme-context';
import { CellPosition, Word } from '@/types/game';
import React, { memo, useEffect, useMemo, useRef } from 'react';
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
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
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

  // Calculate font size based on text length and cell size
  const calculateFontSize = () => {
    if (!word) return size / 3;

    const baseSize = Math.max(12, Math.min(size / 5, 18));
    const textLength = word.text.length;

    // Find the longest word to ensure it fits on a single line
    const words = word.text.split(/\s+/);
    const longestWord = Math.max(...words.map(w => w.length));

    // Estimate how much space we need
    // Approximate characters per line based on cell width (accounting for padding)
    const availableWidth = size - 8; // subtract padding
    const charsPerLine = Math.floor(availableWidth / (baseSize * 0.6)); // rough estimate

    // If the longest word is too long for one line, scale down to fit it
    let adjustedFontSize = baseSize;
    if (longestWord > charsPerLine) {
      const wordScaleFactor = Math.max(0.3, charsPerLine / longestWord);
      adjustedFontSize = baseSize * wordScaleFactor;
    }

    // Recalculate with adjusted font size
    const adjustedCharsPerLine = Math.floor(availableWidth / (adjustedFontSize * 0.6));
    const estimatedLines = Math.ceil(textLength / adjustedCharsPerLine);

    // If text would overflow 3 lines, scale down further
    if (estimatedLines > 3) {
      const scaleFactor = Math.max(0.3, 3 / estimatedLines);
      adjustedFontSize = adjustedFontSize * scaleFactor;
    }

    return Math.max(adjustedFontSize, baseSize * 0.3); // minimum 30% of base
  };

  const fontSize = calculateFontSize();

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
            numberOfLines={3}
            adjustsFontSizeToFit
            minimumFontScale={0.3}
            allowFontScaling={false}
            ellipsizeMode="tail"
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

const createStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  cell: {
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  cellEmpty: {
    backgroundColor: colorScheme.cellEmpty,
    borderWidth: 2,
    borderColor: colorScheme.borderSecondary,
    borderStyle: 'dashed',
  },
  cellFilled: {
    backgroundColor: colorScheme.cellFilled,
  },
  cellCorrect: {
    backgroundColor: colorScheme.cellCorrect,
  },
  cellIncorrect: {
    backgroundColor: colorScheme.cellIncorrect,
  },
  cellHighlight: {
    borderColor: colorScheme.borderAccent,
    borderWidth: 2,
    borderStyle: 'solid',
  },
  cellText: {
    color: colorScheme.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  emptyText: {
    color: colorScheme.textMuted,
  },
});
