import { createStyles as createSharedStyles } from '@/app/(tabs)/index.styles';
import { useThemeScheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HowToPlayPage() {
  const { colorScheme } = useThemeScheme();
  const sharedStyles = useMemo(() => createSharedStyles(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={sharedStyles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={handleBack} style={sharedStyles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={sharedStyles.leaderboardScreenTitleContainer}>
          <Text style={sharedStyles.leaderboardScreenTitle}>How to Play</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Goal</Text>
          <Text style={styles.paragraph}>
            Place all 16 words into the 4x4 grid. Each word must belong to BOTH its row category AND column category.
          </Text>
        </View>

        {/* How to Play */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Play</Text>
          <Text style={styles.paragraph}>
            1. Tap a word from the bottom tray{'\n'}
            2. Tap a grid cell to place it{'\n'}
            3. Fill all 16 cells to win
          </Text>
        </View>

        {/* Lives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lives</Text>
          <Text style={styles.paragraph}>
            You have 3 lives. Each incorrect placement costs one life. Lose all 3 and the game ends.
          </Text>
        </View>

        {/* Scoring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scoring</Text>
          <Text style={styles.paragraph}>
            Your score is based on speed and accuracy. Maximum: 1000 points.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: any) => StyleSheet.create({
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
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colorScheme.textPrimary,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: colorScheme.textSecondary,
    marginBottom: 16,
  },
  exampleBox: {
    backgroundColor: colorScheme.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colorScheme.success,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colorScheme.success,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exampleText: {
    fontSize: 16,
    lineHeight: 24,
    color: colorScheme.textSecondary,
  },
  highlight: {
    color: colorScheme.textPrimary,
    fontWeight: '600',
  },
  step: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colorScheme.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colorScheme.textPrimary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colorScheme.textPrimary,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 15,
    lineHeight: 22,
    color: colorScheme.textMuted,
  },
  livesBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  livesIcons: {
    fontSize: 32,
    marginBottom: 8,
    color: colorScheme.error,
  },
  livesText: {
    fontSize: 16,
    color: colorScheme.error,
    fontWeight: '500',
  },
  tipBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    color: colorScheme.textSecondary,
  },
  scoreFactors: {
    gap: 16,
    marginBottom: 16,
  },
  scoreFactor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colorScheme.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  scoreFactorIcon: {
    fontSize: 28,
    color: colorScheme.textPrimary,
  },
  scoreFactorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
  scoreFactorDesc: {
    fontSize: 14,
    color: colorScheme.textMuted,
  },
  tipsList: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipItemIcon: {
    fontSize: 20,
    color: colorScheme.textSecondary,
  },
  tipItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colorScheme.textSecondary,
  },
  ctaSection: {
    backgroundColor: colorScheme.backgroundSecondary,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colorScheme.borderPrimary,
  },
  ctaText: {
    fontSize: 20,
    fontWeight: '600',
    color: colorScheme.textPrimary,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: colorScheme.brandPrimary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
});
