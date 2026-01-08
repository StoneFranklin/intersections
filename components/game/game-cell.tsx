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

    // Allow larger font sizes on tablets (up to 24px when cells are 150px)
    const maxFontSize = size > 120 ? 24 : 18;
    const baseSize = Math.max(12, Math.min(size / 5, maxFontSize));
    const textLength = word.text.length;

    // Find the longest word to ensure it fits on a single line
    const words = word.text.split(/\s+/);
    const longestWord = Math.max(...words.map(w => w.length));

    // Estimate how much space we need
    // Approximate characters per line based on cell width (accounting for padding)
    const availableWidth = size - 8; // subtract padding
    // Use 0.65 average char width ratio - accounts for wider characters like 'm', 'w', uppercase
    const charsPerLine = Math.floor(availableWidth / (baseSize * 0.65));

    // If the longest word is too long for one line, scale down to fit it
    let adjustedFontSize = baseSize;
    if (longestWord > charsPerLine) {
      // Add 10% buffer to ensure it actually fits
      const wordScaleFactor = Math.max(0.25, (charsPerLine / longestWord) * 0.9);
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
            style={[styles.cellText, { fontSize, maxWidth: size - 8 }]}
            numberOfLines={word.text.includes(' ') ? 3 : 1}
            adjustsFontSizeToFit
            minimumFontScale={0.2}
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
