import { ColorScheme } from '@/constants/theme';
import { useThemeScheme } from '@/contexts/theme-context';
import { CellPosition, Puzzle, Word } from '@/types/game';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { GameCell } from './game-cell';

interface GameGridProps {
  puzzle: Puzzle;
  getWordAtCell: (position: CellPosition) => Word | null;
  isCellCorrect: (position: CellPosition) => boolean | null;
  selectedWordId: string | null;
  onCellPress: (position: CellPosition) => void;
  onCellLongPress: (position: CellPosition) => void;
}

export const GameGrid = memo(function GameGrid({
  puzzle,
  getWordAtCell,
  isCellCorrect,
  selectedWordId,
  onCellPress,
  onCellLongPress,
}: GameGridProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const { rowCategories, colCategories } = puzzle;

  // Use state for dimensions to properly update after hydration
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    // If dimensions are 0 or very small (SSR), use reasonable defaults
    return {
      width: width > 100 ? width : 800,
      height: height > 100 ? height : 600,
    };
  });
  
  useEffect(() => {
    // Update dimensions on mount and when they change
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      if (width > 100 && height > 100) {
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription.remove();
  }, []);

  const { width, height } = dimensions;
  
  // Calculate responsive sizes based on screen dimensions
  const horizontalMargin = Platform.OS === 'web' ? 32 : 48;
  const availableWidth = width - horizontalMargin;
  const availableHeight = height - 300;
  
  // Grid columns: left header + N cells
  const numCols = colCategories.length + 1;
  // Grid rows: top header + N cells
  const numRows = rowCategories.length + 1;
  
  // Calculate cell size to fit within available space
  const effectiveCols = numCols + 0.3; // header is 1.3x width
  const maxCellWidth = availableWidth / effectiveCols;
  const maxCellHeight = availableHeight / numRows;

  // Scale up for larger screens (tablets/iPads)
  // Max cap is higher on wider screens to utilize iPad's space
  const isLargeScreen = width > 600;
  const maxCellSize = isLargeScreen ? 150 : 90;

  const cellSize = Math.min(maxCellWidth, maxCellHeight, maxCellSize);
  
  // Header cells are slightly wider for labels
  const headerWidth = cellSize * 1.3;

  // Calculate font size for category headers
  // Requirements: all text visible, no truncation, no mid-word breaks, max size possible
  const calculateHeaderFontSize = (text: string, width: number, height: number, maxLines: number): number => {
    const maxHeaderFontSize = width > 120 ? 24 : 18;
    const baseSize = Math.max(12, Math.min(width / 5, maxHeaderFontSize));

    const words = text.split(/\s+/);
    const longestWordLength = Math.max(...words.map(w => w.length));
    const availableWidth = width - 12; // subtract padding more conservatively
    const lineHeight = 1.3;
    const availableHeight = height - 8;

    let fontSize = baseSize;

    // Iteratively reduce font size until everything fits
    for (let i = 0; i < 15; i++) {
      // Check if longest word fits on one line (use conservative 0.7 ratio)
      const longestWordWidth = longestWordLength * fontSize * 0.75;
      if (longestWordWidth > availableWidth) {
        fontSize *= 0.9;
        continue;
      }

      // Calculate how many lines we need with word wrapping
      const charsPerLine = Math.floor(availableWidth / (fontSize * 0.7));
      let linesNeeded = 0;
      let currentLineChars = 0;

      for (const word of words) {
        if (currentLineChars === 0) {
          currentLineChars = word.length;
          linesNeeded = 1;
        } else if (currentLineChars + 1 + word.length <= charsPerLine) {
          currentLineChars += 1 + word.length;
        } else {
          linesNeeded++;
          currentLineChars = word.length;
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

  // Logo size - scaled down to be less prominent
  const logoSize = Math.max(headerWidth, cellSize * 0.8) * 0.85;

  return (
    <View style={styles.container}>
      {/* Column headers (top) */}
      <View style={styles.headerRow}>
        <View style={[styles.cornerCell, { width: headerWidth, height: cellSize * 0.8 }]}>
          <Image
            source={require('@/assets/images/intersections-splash.png')}
            style={{ width: logoSize, height: logoSize }}
            resizeMode="contain"
          />
        </View>
        {colCategories.map((col) => (
          <View
            key={col.id}
            style={[
              styles.colHeader,
              { width: cellSize, height: cellSize * 0.8 }
            ]}
          >
            <Text
              style={[styles.colHeaderText, { fontSize: calculateHeaderFontSize(col.label, cellSize, cellSize * 0.8, 3) }]}
              allowFontScaling={false}
              textBreakStrategy="simple"
            >
              {col.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid rows */}
      {rowCategories.map((row, rowIndex) => (
        <View key={row.id} style={styles.gridRow}>
          {/* Left row header */}
          <View
            style={[
              styles.rowHeader,
              { width: headerWidth, height: cellSize }
            ]}
          >
            <Text
              style={[styles.rowHeaderText, { fontSize: calculateHeaderFontSize(row.label, headerWidth, cellSize, 3) }]}
              allowFontScaling={false}
              textBreakStrategy="simple"
            >
              {row.label}
            </Text>
          </View>

          {/* Cells */}
          {colCategories.map((_, colIndex) => {
            const position: CellPosition = { rowIndex, colIndex };
            const word = getWordAtCell(position);
            const isCorrect = isCellCorrect(position);

            return (
              <GameCell
                key={`${rowIndex}-${colIndex}`}
                position={position}
                word={word}
                isCorrect={isCorrect}
                isSelected={!!selectedWordId && !word}
                onPress={() => onCellPress(position)}
                onLongPress={() => onCellLongPress(position)}
                size={cellSize}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
});

const createStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    padding: 8,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cornerCell: {
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colHeader: {
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 153, 255, 0.15)', // Translucent blue center
    borderRadius: 8,
    padding: 4,
    borderWidth: 2,
    borderColor: colorScheme.gridHeaderColBg, // Bright blue border
  },
  gridRow: {
    flexDirection: 'row',
  },
  rowHeader: {
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(122, 74, 189, 0.15)', // Translucent purple center
    borderRadius: 8,
    padding: 4,
    borderWidth: 2,
    borderColor: colorScheme.gridHeaderRowBg, // Bright purple border
  },
  headerText: {
    color: colorScheme.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  colHeaderText: {
    color: colorScheme.textPrimary, // White text for better contrast
    fontWeight: '600',
    textAlign: 'center',
  },
  rowHeaderText: {
    color: colorScheme.textPrimary, // White text for better contrast
    fontWeight: '600',
    textAlign: 'center',
  },
});
