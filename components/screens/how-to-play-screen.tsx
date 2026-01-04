import { createStyles } from '@/app/(tabs)/index.styles';
import { useThemeScheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  const { colorScheme } = useThemeScheme();
  const sharedStyles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const styles = useMemo(() => createComponentStyles(colorScheme), [colorScheme]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={sharedStyles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={onBack} style={sharedStyles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={sharedStyles.leaderboardScreenTitleContainer}>
          <Text style={sharedStyles.leaderboardScreenTitle}>How to Play</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Goal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Goal</Text>
          <Text style={styles.paragraph}>
            Place each word in the grid where its <Text style={styles.highlight}>two categories intersect</Text>.
          </Text>
        </View>

        {/* How to Play Section */}
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
              <Text style={styles.stepText}>Tap a cell in the grid to place it</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Tap a placed word to remove it</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Fill all 16 cells correctly to win</Text>
            </View>
          </View>
        </View>

        {/* Lives Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lives</Text>
          <Text style={styles.paragraph}>
            You have 3 lives. Each incorrect placement costs one life. Lose all lives and the game ends.
          </Text>
        </View>

        {/* Scoring Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scoring</Text>
          <Text style={styles.paragraph}>
            Your score is based on <Text style={styles.highlight}>speed</Text> and <Text style={styles.highlight}>accuracy</Text>. Up to <Text style={styles.highlight}>1000 points</Text>.
          </Text>
        </View>

        {/* Example Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Example</Text>
          <Text style={styles.paragraph}>
            If the row is <Text style={styles.highlight}>"Fruits"</Text> and the column is <Text style={styles.highlight}>"Red Things"</Text>, the correct word is <Text style={styles.highlight}>"Apple"</Text> — it belongs to both!
          </Text>
        </View>

        {/* Info Links Section */}
        <View style={styles.linksSection}>
          <Link href={'/about' as any} asChild>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="information-circle-outline" size={20} color={colorScheme.textTertiary} />
              <Text style={styles.linkText}>About</Text>
              <Ionicons name="chevron-forward" size={18} color={colorScheme.textTertiary} />
            </TouchableOpacity>
          </Link>
          <Link href={'/contact' as any} asChild>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="mail-outline" size={20} color={colorScheme.textTertiary} />
              <Text style={styles.linkText}>Contact</Text>
              <Ionicons name="chevron-forward" size={18} color={colorScheme.textTertiary} />
            </TouchableOpacity>
          </Link>
          <Link href={'/privacy' as any} asChild>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="shield-outline" size={20} color={colorScheme.textTertiary} />
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={18} color={colorScheme.textTertiary} />
            </TouchableOpacity>
          </Link>
          <Link href={'/terms' as any} asChild>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="document-text-outline" size={20} color={colorScheme.textTertiary} />
              <Text style={styles.linkText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={18} color={colorScheme.textTertiary} />
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createComponentStyles = (colorScheme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.backgroundPrimary,
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
    // Links section
    linksSection: {
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: colorScheme.border,
      paddingTop: 24,
    },
    linkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      gap: 12,
    },
    linkText: {
      flex: 1,
      fontSize: 15,
      color: colorScheme.textSecondary,
    },
  });

