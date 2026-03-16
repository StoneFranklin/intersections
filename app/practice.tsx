import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PracticeGameContent, PracticePreviewScreen } from '@/components/archive';
import { useAuth } from '@/contexts/auth-context';
import { useThemeScheme } from '@/contexts/theme-context';
import {
  fetchPuzzleForDate,
  submitArchiveScore,
} from '@/data/puzzleApi';
import { GameScore, Puzzle } from '@/types/game';

export default function PracticeScreen() {
  const { colorScheme } = useThemeScheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ date: string }>();
  const puzzleDate = params.date;

  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [savedScore, setSavedScore] = useState<GameScore | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const loadPuzzle = useCallback(async () => {
    if (!puzzleDate) {
      setError('No puzzle date specified');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const puzzleData = await fetchPuzzleForDate(puzzleDate);

      if (!puzzleData) {
        setError('Puzzle not found for this date');
        setLoading(false);
        return;
      }

      setPuzzle(puzzleData);
    } catch (e) {
      console.error('Error loading puzzle:', e);
      setError('Failed to load puzzle');
    } finally {
      setLoading(false);
    }
  }, [puzzleDate]);

  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  const handleComplete = useCallback(async (score: GameScore) => {
    if (!puzzleDate) return;

    await submitArchiveScore(
      puzzleDate,
      score.score,
      score.timeSeconds,
      score.mistakes,
      score.correctPlacements,
      user?.id
    );

    setSavedScore(score);
    setGameEnded(true);
  }, [puzzleDate, user?.id]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const formattedDate = useMemo(() => {
    if (!puzzleDate) return '';
    const date = new Date(puzzleDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [puzzleDate]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorScheme.brandPrimary} />
          <Text style={styles.loadingText}>Loading puzzle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !puzzle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Unknown error'}</Text>
          <Text style={styles.errorSubtext}>
            Unable to load the puzzle for {formattedDate}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isPlaying) {
    return (
      <PracticePreviewScreen
        puzzleDate={puzzleDate || ''}
        formattedDate={formattedDate}
        onPlay={handlePlay}
        onBack={handleBack}
      />
    );
  }

  return (
    <PracticeGameContent
      puzzle={puzzle}
      puzzleDate={puzzleDate}
      formattedDate={formattedDate}
      onBack={handleBack}
      onComplete={handleComplete}
      gameEnded={gameEnded}
      savedScore={savedScore}
    />
  );
}

const createStyles = (colorScheme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.backgroundPrimary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      color: colorScheme.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      gap: 12,
    },
    errorText: {
      fontSize: 18,
      fontWeight: '600',
      color: colorScheme.error,
      textAlign: 'center',
    },
    errorSubtext: {
      fontSize: 14,
      color: colorScheme.textSecondary,
      textAlign: 'center',
    },
  });
