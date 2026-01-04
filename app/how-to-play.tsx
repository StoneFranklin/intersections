import { createStyles as createSharedStyles } from '@/app/(tabs)/index.styles';
import { useThemeScheme } from '@/contexts/theme-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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
        {/* Goal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Goal</Text>
          <Text style={styles.paragraph}>
            Place all 16 words into the 4×4 grid. Each word must belong to <Text style={styles.highlight}>both</Text> its row category <Text style={styles.highlight}>and</Text> column category.
          </Text>
        </View>

        {/* How to Play Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Play</Text>

          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Tap a word from the tray</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Tap a grid cell to place it</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Fill all 16 cells to win</Text>
            </View>
          </View>
        </View>

        {/* Lives Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lives</Text>
          <Text style={styles.paragraph}>
            You have 3 lives. Each incorrect placement costs one life. Lose all 3 and the game ends.
          </Text>
        </View>

        {/* Scoring Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scoring</Text>
          <Text style={styles.paragraph}>
            Your score is based on <Text style={styles.highlight}>speed</Text> and <Text style={styles.highlight}>accuracy</Text>. Maximum: <Text style={styles.highlight}>1000 points</Text>.
          </Text>
        </View>

        {/* Example Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Example</Text>
          <Text style={styles.paragraph}>
            If the row is <Text style={styles.highlight}>"Fruits"</Text> and the column is <Text style={styles.highlight}>"Red Things"</Text>, the correct word is <Text style={styles.highlight}>"Apple"</Text> — it belongs to both!
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colorScheme.textPrimary,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: colorScheme.textSecondary,
  },
  highlight: {
    color: colorScheme.brandPrimary,
    fontWeight: '600',
  },
  // Steps
  stepsContainer: {
    gap: 10,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colorScheme.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: colorScheme.warmBlack,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colorScheme.textSecondary,
    lineHeight: 22,
  },
});
