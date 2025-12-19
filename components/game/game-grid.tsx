import { CellPosition, Puzzle, Word } from '@/types/game';
import React, { memo, useCallback, useEffect, useState } from 'react';
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
  const cellSize = Math.min(maxCellWidth, maxCellHeight, Platform.OS === 'web' ? 90 : 90);
  
  // Header cells are slightly wider for labels
  const headerWidth = cellSize * 1.3;
  const fontSize = Math.max(10, Math.min(cellSize / 6, 16));

  // Logo size to fit perfectly in corner cell (accounting for margin)
  const cornerWidth = headerWidth - 4; // subtract margin
  const cornerHeight = cellSize * 0.8 - 4; // subtract margin
  const logoSize = Math.min(cornerWidth, cornerHeight);

  return (
    <View style={styles.container}>
      {/* Column headers (top) */}
      <View style={styles.headerRow}>
        <View style={[styles.cornerCell, { width: headerWidth, height: cellSize * 0.8 }]}>
          <Image 
            source={require('@/assets/images/intersections-logo.png')} 
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
            <Text style={[styles.headerText, { fontSize }]} numberOfLines={2}>
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
            <Text style={[styles.headerText, { fontSize }]} numberOfLines={2}>
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

const styles = StyleSheet.create({
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
    backgroundColor: '#2a3a5a',
    borderRadius: 8,
  },
  colHeader: {
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3a5a8a',
    borderRadius: 8,
    padding: 4,
  },
  gridRow: {
    flexDirection: 'row',
  },
  rowHeader: {
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5a3a8a',
    borderRadius: 8,
    padding: 4,
  },
  headerText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
