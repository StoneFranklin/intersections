import { useThemeScheme } from '@/contexts/theme-context';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export interface XPProgressBarProps {
  /** Current level (0-indexed) */
  currentLevel: number;
  /** Progress to next level (0-1) */
  progress: number;
  /** Whether the user just leveled up */
  leveledUp?: boolean;
}

/**
 * Reusable XP progress bar component that shows current level and progress to next level
 * with smooth animations.
 */
export function XPProgressBar({
  currentLevel,
  progress,
  leveledUp = false,
}: XPProgressBarProps) {
  const { colorScheme } = useThemeScheme();
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    levelText: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme.textSecondary,
      minWidth: 60,
    },
    progressBarContainer: {
      flex: 1,
      height: 10,
      backgroundColor: colorScheme.backgroundTertiary,
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colorScheme.gold,
      borderRadius: 5,
    },
  });

  const xpBarWidth = useRef(new Animated.Value(0)).current;
  const xpBarScale = useRef(new Animated.Value(1)).current;

  // Animate XP bar whenever progress changes
  useEffect(() => {
    // Animate the width
    Animated.spring(xpBarWidth, {
      toValue: progress,
      useNativeDriver: false,
      tension: 20,
      friction: 10,
    }).start();

    // Add a subtle pulse effect when leveling up
    if (leveledUp) {
      Animated.sequence([
        Animated.spring(xpBarScale, {
          toValue: 1.05,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
        Animated.spring(xpBarScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
      ]).start();
    }
  }, [progress, leveledUp, xpBarWidth, xpBarScale]);

  return (
    <View style={styles.container}>
      <Text style={styles.levelText}>Level {currentLevel}</Text>
      <Animated.View
        style={[
          styles.progressBarContainer,
          { transform: [{ scaleY: xpBarScale }] },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: xpBarWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </Animated.View>
      <Text style={styles.levelText}>Level {currentLevel + 1}</Text>
    </View>
  );
}
