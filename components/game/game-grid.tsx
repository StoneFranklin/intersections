import { ColorScheme } from '@/constants/theme';
import { useThemeScheme } from '@/contexts/theme-context';
import { CellPosition, Puzzle, Word } from '@/types/game';
import LottieView from 'lottie-react-native';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { GameCell } from './game-cell';

// Animation frame constants for loop animation (total 182 frames at 30fps)
const TOTAL_FRAMES = 182;
const LOOP_START = 79;
const LOOP_END = 148;
// Normalized progress values (0-1)
const LOOP_START_PROGRESS = LOOP_START / TOTAL_FRAMES;
const LOOP_END_PROGRESS = LOOP_END / TOTAL_FRAMES;

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

  const lottieRef = useRef<LottieView>(null);
  const hasStarted = useRef(false);
  const isWeb = Platform.OS === 'web';

  // Progress state for mobile (more reliable than play(start, end) on Android)
  const [mobileProgress, setMobileProgress] = useState(LOOP_START_PROGRESS);
  const animationFrameRef = useRef<number | null>(null);

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

  // Start the loop animation for mobile using requestAnimationFrame
  const startLoopAnimation = useCallback(() => {
    if (isWeb) return;

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const loopDurationMs = ((LOOP_END - LOOP_START) / 30) * 1000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressInLoop = (elapsed % loopDurationMs) / loopDurationMs;
      const progress = LOOP_START_PROGRESS + progressInLoop * (LOOP_END_PROGRESS - LOOP_START_PROGRESS);

      setMobileProgress(progress);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isWeb]);

  const playSegment = useCallback((start: number, end: number) => {
    if (!lottieRef.current) return;

    if (isWeb) {
      // Web needs segment + explicit start frame to actually begin playback.
      lottieRef.current.play(start, end);
      lottieRef.current.play(start);
    }
  }, [isWeb]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start loop animation on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const timer = setTimeout(() => {
      if (isWeb) {
        playSegment(LOOP_START, LOOP_END);
      } else {
        startLoopAnimation();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isWeb, playSegment, startLoopAnimation]);

  const handleAnimationFinish = () => {
    // Only used for web - mobile uses continuous requestAnimationFrame
    if (!isWeb) return;

    // Keep looping on web
    setTimeout(() => {
      playSegment(LOOP_START, LOOP_END);
    }, 50);
  };

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

  // Logo size to fill more of the corner cell
  // Use the larger dimension and scale up to fill the cell better
  const logoSize = Math.max(headerWidth, cellSize * 0.8) * 1.2;

  return (
    <View style={styles.container}>
      {/* Column headers (top) */}
      <View style={styles.headerRow}>
        <View style={[styles.cornerCell, { width: headerWidth, height: cellSize * 0.8 }]}>
          <LottieView
            ref={lottieRef}
            source={require('@/assets/lottie/anim_full_intersections_v2.json')}
            style={{ width: logoSize, height: logoSize }}
            webStyle={{ width: logoSize, height: logoSize }}
            autoPlay={false}
            loop={false}
            progress={isWeb ? undefined : mobileProgress}
            onAnimationFinish={handleAnimationFinish}
            onAnimationLoaded={() => {
              if (!isWeb) return;
              playSegment(LOOP_START, LOOP_END);
            }}
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
              style={[styles.headerText, { fontSize }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
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
              style={[styles.headerText, { fontSize }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
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
    backgroundColor: colorScheme.backgroundTertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorScheme.borderSecondary,
  },
  colHeader: {
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorScheme.gridHeaderColBg,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: colorScheme.borderAccent,
  },
  gridRow: {
    flexDirection: 'row',
  },
  rowHeader: {
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorScheme.gridHeaderRowBg,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: colorScheme.warning,
  },
  headerText: {
    color: colorScheme.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
