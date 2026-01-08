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
  // Requirements: all text visible, no truncation, no mid-word breaks, max size possible
  const calculateFontSize = () => {
    if (!word) return size / 3;

    const maxFontSize = size > 120 ? 24 : 18;
    const baseSize = Math.max(12, Math.min(size / 5, maxFontSize));
    const maxLines = 4;

    const wordList = word.text.split(/\s+/);
    const longestWordLength = Math.max(...wordList.map(w => w.length));
    const availableWidth = size - 12; // subtract padding more conservatively
    const availableHeight = size - 8;
    const lineHeight = 1.3;

    let fontSize = baseSize;

    // Iteratively reduce font size until everything fits
    for (let i = 0; i < 15; i++) {
      // Check if longest word fits on one line (use conservative 0.7 ratio)
      const longestWordWidth = longestWordLength * fontSize * 0.7;
      if (longestWordWidth > availableWidth) {
        fontSize *= 0.9;
        continue;
      }

      // Calculate how many lines we need with word wrapping
      const charsPerLine = Math.floor(availableWidth / (fontSize * 0.7));
      let linesNeeded = 0;
      let currentLineChars = 0;

      for (const w of wordList) {
        if (currentLineChars === 0) {
          currentLineChars = w.length;
          linesNeeded = 1;
        } else if (currentLineChars + 1 + w.length <= charsPerLine) {
          currentLineChars += 1 + w.length;
        } else {
          linesNeeded++;
          currentLineChars = w.length;
        }
      }

      const textHeight = linesNeeded * fontSize * lineHeight;
      if (linesNeeded <= maxLines && textHeight <= availableHeight) {
        break;
      }
      fontSize *= 0.9;
    }

    return Math.max(fontSize, 8);
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
            allowFontScaling={false}
            textBreakStrategy="simple"
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
