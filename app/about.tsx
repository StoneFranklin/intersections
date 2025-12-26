import { Link } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeScheme } from '@/contexts/theme-context';

export default function AboutPage() {
  const { colorScheme } = useThemeScheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme.backgroundPrimary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Text style={[styles.backButtonText, { color: colorScheme.brandPrimary }]}>← Back to Game</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colorScheme.textPrimary }]}>About Intersections</Text>
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
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - <Text style={[styles.bold, { color: colorScheme.textPrimary }]}>Daily Puzzles:</Text> A new challenge every day
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - <Text style={[styles.bold, { color: colorScheme.textPrimary }]}>Leaderboards:</Text> See how you rank globally
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - <Text style={[styles.bold, { color: colorScheme.textPrimary }]}>Streaks:</Text> Track your daily playing streak
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - <Text style={[styles.bold, { color: colorScheme.textPrimary }]}>Cross-Platform:</Text> Play on iOS, Android, or web
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - <Text style={[styles.bold, { color: colorScheme.textPrimary }]}>Cloud Sync:</Text> Sign in to sync progress across devices
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - <Text style={[styles.bold, { color: colorScheme.textPrimary }]}>Free to Play:</Text> No purchase required
            </Text>
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
          <Link href={"/contact" as any} asChild>
            <TouchableOpacity style={[styles.contactButton, { backgroundColor: colorScheme.brandPrimary }]}>
              <Text style={styles.contactButtonText}>Contact Us</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colorScheme.borderPrimary }]}>
          <Link href={"/privacy" as any} asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>Privacy Policy</Text>
            </TouchableOpacity>
          </Link>
          <Text style={[styles.footerDivider, { color: colorScheme.textSecondary }]}>|</Text>
          <Link href={"/terms" as any} asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>Terms of Service</Text>
            </TouchableOpacity>
          </Link>
          <Text style={[styles.footerDivider, { color: colorScheme.textSecondary }]}>|</Text>
          <Link href="/" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>Play Game</Text>
            </TouchableOpacity>
          </Link>
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
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 24,
    paddingLeft: 8,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
  },
  contactButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    marginTop: 20,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  footerLink: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  footerDivider: {
    fontSize: 14,
    marginHorizontal: 6,
  },
});
