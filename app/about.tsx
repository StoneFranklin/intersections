import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeScheme } from '@/contexts/theme-context';

export default function AboutPage() {
  const { colorScheme } = useThemeScheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.backgroundPrimary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
            <Ionicons name="arrow-back" size={20} color={colorScheme.brandPrimary} />
            <Text style={[styles.backButtonText, { color: colorScheme.brandPrimary }]}>Back to Game</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colorScheme.textPrimary }]}>About Intersections</Text>
          <Text style={[styles.subtitle, { color: colorScheme.textSecondary }]}>
            A daily word puzzle game
          </Text>
        </View>

        {/* What is Intersections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>What is Intersections?</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Intersections is a daily word puzzle game that challenges your vocabulary and category knowledge.
            Each day, you're presented with a fresh 4x4 grid where you must place 16 words based on how
            categories intersect.
          </Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Think of it as a crossword meets trivia meets Sudoku - you need to figure out which word
            belongs at each intersection of two categories. It's simple to learn but challenging to master.
          </Text>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>How It Works</Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - A new puzzle is available every day at midnight
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - Place words where row and column categories intersect
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - You have 3 lives - incorrect placements cost a life
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - Compete on daily leaderboards based on time and accuracy
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - Build your streak by playing every day
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Features</Text>
          <View style={styles.topicGrid}>
            <View style={[styles.topicCard, { backgroundColor: colorScheme.backgroundSecondary }]}>
              <Text style={[styles.topicTitle, { color: colorScheme.textPrimary }]}>Daily Puzzles</Text>
              <Text style={[styles.topicDesc, { color: colorScheme.textSecondary }]}>
                A new challenge every day.
              </Text>
            </View>
            <View style={[styles.topicCard, { backgroundColor: colorScheme.backgroundSecondary }]}>
              <Text style={[styles.topicTitle, { color: colorScheme.textPrimary }]}>Leaderboards</Text>
              <Text style={[styles.topicDesc, { color: colorScheme.textSecondary }]}>
                See how you rank globally.
              </Text>
            </View>
            <View style={[styles.topicCard, { backgroundColor: colorScheme.backgroundSecondary }]}>
              <Text style={[styles.topicTitle, { color: colorScheme.textPrimary }]}>Streaks</Text>
              <Text style={[styles.topicDesc, { color: colorScheme.textSecondary }]}>
                Track your daily playing streak.
              </Text>
            </View>
            <View style={[styles.topicCard, { backgroundColor: colorScheme.backgroundSecondary }]}>
              <Text style={[styles.topicTitle, { color: colorScheme.textPrimary }]}>Cross-Platform</Text>
              <Text style={[styles.topicDesc, { color: colorScheme.textSecondary }]}>
                Play on iOS, Android, or web.
              </Text>
            </View>
            <View style={[styles.topicCard, { backgroundColor: colorScheme.backgroundSecondary }]}>
              <Text style={[styles.topicTitle, { color: colorScheme.textPrimary }]}>Cloud Sync</Text>
              <Text style={[styles.topicDesc, { color: colorScheme.textSecondary }]}>
                Sign in to sync progress across devices.
              </Text>
            </View>
            <View style={[styles.topicCard, { backgroundColor: colorScheme.backgroundSecondary }]}>
              <Text style={[styles.topicTitle, { color: colorScheme.textPrimary }]}>Free to Play</Text>
              <Text style={[styles.topicDesc, { color: colorScheme.textSecondary }]}>
                No purchase required.
              </Text>
            </View>
          </View>
        </View>

        {/* Version & Updates */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Stay Updated</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We regularly update Intersections with new features, bug fixes, and improvements.
            Make sure you have the latest version for the best experience.
          </Text>
        </View>

        {/* Contact CTA */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Get in Touch</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Have questions, feedback, or suggestions? We'd love to hear from you!
          </Text>
          <TouchableOpacity
            style={[styles.emailBox, { backgroundColor: colorScheme.backgroundSecondary }]}
            onPress={() => router.push('/contact')}
          >
            <Text style={[styles.emailLabel, { color: colorScheme.textTertiary }]}>Reach us via:</Text>
            <Text style={[styles.emailText, { color: colorScheme.brandPrimary }]}>Contact Page</Text>
            <Text style={[styles.tapHint, { color: colorScheme.textTertiary }]}>Tap to open contact options</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colorScheme.borderPrimary }]}>
          <TouchableOpacity onPress={() => router.push('/contact')}>
            <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>Contact</Text>
          </TouchableOpacity>
          <Text style={[styles.footerDivider, { color: colorScheme.textSecondary }]}>|</Text>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={[styles.footerDivider, { color: colorScheme.textSecondary }]}>|</Text>
          <TouchableOpacity onPress={() => router.push('/terms')}>
            <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={[styles.footerDivider, { color: colorScheme.textSecondary }]}>|</Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>Play Game</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  titleSection: {
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 12,
  },
  bulletList: {
    gap: 8,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 24,
    paddingLeft: 8,
  },
  emailBox: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  emailLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  tapHint: {
    fontSize: 12,
  },
  topicGrid: {
    gap: 12,
  },
  topicCard: {
    borderRadius: 8,
    padding: 16,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  topicDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 24,
    marginTop: 20,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  footerLink: {
    fontSize: 14,
  },
  footerDivider: {
    fontSize: 14,
  },
});









