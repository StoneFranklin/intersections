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

import { createStyles as createSharedStyles } from '@/app/(tabs)/index.styles';
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
  const sharedStyles = useMemo(() => createSharedStyles(colorScheme), [colorScheme]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

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
      <View style={sharedStyles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={handleBack} style={sharedStyles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={sharedStyles.leaderboardScreenTitleContainer}>
          <MaterialCommunityIcons name="calendar" size={24} color={colorScheme.brandPrimary} />
          <Text style={sharedStyles.leaderboardScreenTitle}>Puzzle Archive</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
                  <Text style={[
                    styles.statValue,
                    {
                      color: availableCount > 0
                        ? (() => {
                            const percentage = Math.round((completedCount / availableCount) * 100);
                            return percentage >= 100 ? '#4ade80' : // green
                                   percentage >= 75 ? '#facc15' : // yellow
                                   percentage >= 50 ? '#fb923c' : // orange
                                   '#ef4444'; // red
                          })()
                        : colorScheme.textPrimary
                    }
                  ]}>
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
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 60,
      maxWidth: 800,
      alignSelf: 'center',
      width: '100%',
    },
    header: {
      marginBottom: 20,
    },
    backButton: {
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    backButtonText: {
      fontSize: 16,
      color: colorScheme.brandPrimary,
    },
    titleSection: {
      marginBottom: 40,
      paddingTop: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colorScheme.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: colorScheme.textSecondary,
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
