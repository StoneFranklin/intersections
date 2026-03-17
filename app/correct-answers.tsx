import { CorrectAnswersScreen } from '@/components/screens/correct-answers-screen';
import { fetchPuzzleForDate, fetchTodaysPuzzle } from '@/data/puzzleApi';
import type { Puzzle } from '@/types/game';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

export default function CorrectAnswersPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    try {
      const data = params.date
        ? await fetchPuzzleForDate(params.date)
        : await fetchTodaysPuzzle();
      setPuzzle(data);
    } catch (e) {
      console.error('Error loading puzzle for correct answers:', e);
    } finally {
      setLoading(false);
    }
  }, [params.date]);

  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  return (
    <CorrectAnswersScreen
      puzzle={loading ? null : puzzle}
      onBack={() => router.back()}
      onRetry={loadPuzzle}
    />
  );
}
