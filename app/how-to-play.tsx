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
            Your objective is simple: place all 16 words into the 4x4 grid correctly.
            Each word must be placed in a cell where it belongs to BOTH the row&apos;s category
            AND the column&apos;s category.
          </Text>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>Example</Text>
            <Text style={styles.exampleText}>
              If the row category is <Text style={styles.highlight}>&quot;Fruits&quot;</Text> and
              the column category is <Text style={styles.highlight}>&quot;Red Things&quot;</Text>,
              the correct word might be <Text style={styles.highlight}>&quot;Apple&quot;</Text> or
              <Text style={styles.highlight}> &quot;Strawberry&quot;</Text> - they&apos;re both fruits AND red!
            </Text>
          </View>
        </View>

        {/* Step by Step */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step-by-Step Guide</Text>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Read the Categories</Text>
              <Text style={styles.stepDesc}>
                Look at the row categories on the left and column categories at the top.
                Each cell is the intersection of one row and one column category.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Select a Word</Text>
              <Text style={styles.stepDesc}>
                Tap on any word from the word tray at the bottom of the screen.
                The selected word will be highlighted.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Place the Word</Text>
              <Text style={styles.stepDesc}>
                Tap on a cell in the grid to place your selected word there.
                Think about which categories the word fits into.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Check Your Answer</Text>
              <Text style={styles.stepDesc}>
                Once placed, tap the <Text style={styles.highlight}>&quot;Check&quot;</Text> button to verify if your placements are correct.
                Correct words turn green, incorrect ones cost you a life.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Complete the Grid</Text>
              <Text style={styles.stepDesc}>
                Fill all 16 cells correctly to win! Your score is based on how fast
                you complete the puzzle and how few mistakes you make.
              </Text>
            </View>
          </View>
        </View>

        {/* Lives System */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lives System</Text>
          <View style={styles.livesBox}>
            <Text style={styles.livesIcons}>♥ ♥ ♥</Text>
            <Text style={styles.livesText}>You start with 3 lives</Text>
          </View>
          <Text style={styles.paragraph}>
            Each time you place a word incorrectly, you lose one life. If you lose all
            three lives, the game ends and you won&apos;t be able to complete that day&apos;s puzzle.
          </Text>
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              Don&apos;t guess randomly! Take your time to think through each placement.
              It&apos;s better to be slow and accurate than fast and wrong.
            </Text>
          </View>
        </View>

        {/* Scoring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scoring System</Text>
          <Text style={styles.paragraph}>
            Your score is calculated based on two factors:
          </Text>
          <View style={styles.scoreFactors}>
            <View style={styles.scoreFactor}>
              <Text style={styles.scoreFactorIcon}>⏱</Text>
              <View>
                <Text style={styles.scoreFactorTitle}>Time</Text>
                <Text style={styles.scoreFactorDesc}>Faster completion = higher score</Text>
              </View>
            </View>
            <View style={styles.scoreFactor}>
              <Text style={styles.scoreFactorIcon}>✓</Text>
              <View>
                <Text style={styles.scoreFactorTitle}>Accuracy</Text>
                <Text style={styles.scoreFactorDesc}>Fewer mistakes = higher score</Text>
              </View>
            </View>
          </View>
          <Text style={styles.paragraph}>
            The maximum possible score is 1000 points for a perfect, fast completion.
            Compare your score with other players on the daily leaderboard!
          </Text>
        </View>

        {/* Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Streaks</Text>
          <Text style={styles.paragraph}>
            Play every day to build your streak! Your streak increases each consecutive
            day you complete (or attempt) the puzzle. Miss a day and your streak resets to zero.
          </Text>
          <Text style={styles.paragraph}>
            Sign in with your Google account to save your streak across devices and
            never lose your progress.
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips & Strategies</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipItemIcon}>•</Text>
              <Text style={styles.tipItemText}>
                Start with the words you&apos;re most confident about - they&apos;ll help narrow
                down the remaining options.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipItemIcon}>•</Text>
              <Text style={styles.tipItemText}>
                Look for unique intersections - some category combinations only have
                one possible answer.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipItemIcon}>•</Text>
              <Text style={styles.tipItemText}>
                Think about all the categories a word could belong to, not just the
                obvious ones.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipItemIcon}>•</Text>
              <Text style={styles.tipItemText}>
                You can remove a placed word by tapping it again - rearrange freely
                before checking!
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>Ready to play?</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handleBack}>
            <Text style={styles.ctaButtonText}>Back to Game</Text>
          </TouchableOpacity>
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
