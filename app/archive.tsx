import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ArchiveCalendar } from '@/components/archive';
import { useAuth } from '@/contexts/auth-context';
import { useThemeScheme } from '@/contexts/theme-context';
import {
  getAvailablePuzzleDates,
  getPracticeCompletionDates,
  getTodayDateString,
} from '@/data/puzzleApi';

export default function ArchiveScreen() {
  const { colorScheme } = useThemeScheme();
  const { user } = useAuth();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [completedPuzzles, setCompletedPuzzles] = useState<Map<string, { correctPlacements: number; score: number }>>(new Map());
  const [loading, setLoading] = useState(true);

  const todayDate = getTodayDateString();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [available, completed] = await Promise.all([
        getAvailablePuzzleDates(),
        getPracticeCompletionDates(user?.id),
      ]);
      setAvailableDates(new Set(available));
      setCompletedPuzzles(completed);
    } catch (error) {
      console.error('Error loading archive data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePreviousMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth]);

  const canGoNext = useMemo(() => {
    const todayDate = new Date();
    return (
      currentYear < todayDate.getFullYear() ||
      (currentYear === todayDate.getFullYear() && currentMonth < todayDate.getMonth())
    );
  }, [currentYear, currentMonth]);

  const handleSelectDate = useCallback((date: string) => {
    if (date === todayDate) {
      // Today's puzzle - go to regular game
      router.push('/');
    } else {
      // Past puzzle - go to practice mode
      router.push(`/practice?date=${date}` as any);
    }
  }, [router, todayDate]);

  const completedCount = Array.from(completedPuzzles.values()).filter(
    puzzle => puzzle.correctPlacements === 16
  ).length;
  const availableCount = availableDates.size;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
          <Ionicons name="arrow-back" size={20} color={colorScheme.brandPrimary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <MaterialCommunityIcons name="archive" size={40} color={colorScheme.brandPrimary} />
          <Text style={styles.title}>Puzzle Archive</Text>
          <Text style={styles.subtitle}>
            Practice with past puzzles. No leaderboard, no streaks - just for fun!
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colorScheme.brandPrimary} />
            <Text style={styles.loadingText}>Loading archive...</Text>
          </View>
        ) : (
          <>
            {user && (
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{availableCount}</Text>
                  <Text style={styles.statLabel}>Available</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: colorScheme.success }]}>{completedCount}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {availableCount > 0 ? Math.round((completedCount / availableCount) * 100) : 0}%
                  </Text>
                  <Text style={styles.statLabel}>Progress</Text>
                </View>
              </View>
            )}

            <View style={styles.calendarContainer}>
              <ArchiveCalendar
                year={currentYear}
                month={currentMonth}
                availableDates={availableDates}
                completedPuzzles={completedPuzzles}
                todayDate={todayDate}
                onSelectDate={handleSelectDate}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
                canGoNext={canGoNext}
              />
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Ionicons name="information-circle-outline" size={20} color={colorScheme.info} />
                <Text style={styles.infoText}>
                  {user
                    ? "Tap any available date to play that day's puzzle. Your practice scores won't affect your streak or leaderboard ranking."
                    : "Sign in to track your practice progress across devices. You can still play practice puzzles without signing in."}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.backgroundPrimary,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    backButtonText: {
      fontSize: 16,
      color: colorScheme.brandPrimary,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
      maxWidth: 600,
      alignSelf: 'center',
      width: '100%',
    },
    titleSection: {
      alignItems: 'center',
      marginBottom: 24,
      gap: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colorScheme.textPrimary,
      marginTop: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colorScheme.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      fontSize: 14,
      color: colorScheme.textSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colorScheme.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      color: colorScheme.textMuted,
      marginTop: 4,
    },
    calendarContainer: {
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 16,
      paddingVertical: 8,
      marginBottom: 24,
    },
    infoSection: {
      marginBottom: 20,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 3,
      borderLeftColor: colorScheme.info,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colorScheme.textSecondary,
      lineHeight: 20,
    },
  });
