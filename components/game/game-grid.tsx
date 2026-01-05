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

  // Calculate font size for category headers (similar to game-cell logic)
  const calculateHeaderFontSize = (text: string, width: number): number => {
    // Allow larger font sizes on tablets
    const maxHeaderFontSize = width > 120 ? 20 : 16;
    const baseSize = Math.max(10, Math.min(width / 5, maxHeaderFontSize));

    // Find the longest word to ensure it fits on a single line
    const words = text.split(/\s+/);
    const longestWord = Math.max(...words.map(w => w.length));

    // Estimate how much space we need
    const availableWidth = width - 8; // subtract padding
    const charsPerLine = Math.floor(availableWidth / (baseSize * 0.6));

    // If the longest word is too long for one line, scale down to fit it
    let adjustedFontSize = baseSize;
    if (longestWord > charsPerLine) {
      const wordScaleFactor = Math.max(0.3, charsPerLine / longestWord);
      adjustedFontSize = baseSize * wordScaleFactor;
    }

    // Recalculate with adjusted font size
    const adjustedCharsPerLine = Math.floor(availableWidth / (adjustedFontSize * 0.6));
    const estimatedLines = Math.ceil(text.length / adjustedCharsPerLine);

    // If text would overflow 2 lines (headers have max 2 lines), scale down further
    if (estimatedLines > 2) {
      const scaleFactor = Math.max(0.3, 2 / estimatedLines);
      adjustedFontSize = adjustedFontSize * scaleFactor;
    }

    return Math.max(adjustedFontSize, baseSize * 0.3); // minimum 30% of base
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
              style={[styles.colHeaderText, { fontSize: calculateHeaderFontSize(col.label, cellSize) }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.3}
              allowFontScaling={false}
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
              style={[styles.rowHeaderText, { fontSize: calculateHeaderFontSize(row.label, headerWidth) }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.3}
              allowFontScaling={false}
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
