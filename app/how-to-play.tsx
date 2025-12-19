import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HowToPlayPage() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back to Game</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>How to Play Intersections</Text>
          <Text style={styles.subtitle}>Master the daily word puzzle in minutes</Text>
        </View>

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
              If the row category is <Text style={styles.highlight}>{'"Fruits"'}</Text> and 
              the column category is <Text style={styles.highlight}>{'"Red Things"'}</Text>, 
              the correct word might be <Text style={styles.highlight}>{'"Apple"'}</Text> or 
              <Text style={styles.highlight}>{'"Strawberry"'}</Text> - they&apos;re both fruits AND red!
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
                Once placed, tap the <Text style={styles.highlight}>{'"Check"'}</Text> button to verify if your placements are correct. 
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
              <Text style={styles.scoreFactorIcon}>TIME</Text>
              <View>
                <Text style={styles.scoreFactorTitle}>Time</Text>
                <Text style={styles.scoreFactorDesc}>Faster completion = higher score</Text>
              </View>
            </View>
            <View style={styles.scoreFactor}>
              <Text style={styles.scoreFactorIcon}>ACC</Text>
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
          <Link href="/" asChild>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Play Today&apos;s Puzzle</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Link href={"/privacy" as any} asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.footerDivider}>|</Text>
          <Link href={"/terms" as any} asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of Service</Text>
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
    backgroundColor: '#0f0f1a',
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
    color: '#6a9fff',
  },
  titleSection: {
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: '#ccc',
    marginBottom: 16,
  },
  exampleBox: {
    backgroundColor: '#1a2a3e',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4ade80',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ade80',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exampleText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ccc',
  },
  highlight: {
    color: '#fff',
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
    backgroundColor: '#4a4a8e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 15,
    lineHeight: 22,
    color: '#aaa',
  },
  livesBox: {
    backgroundColor: '#2a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4a2a2a',
  },
  livesIcons: {
    fontSize: 32,
    marginBottom: 8,
  },
  livesText: {
    fontSize: 16,
    color: '#f87171',
    fontWeight: '500',
  },
  tipBox: {
    backgroundColor: '#2a2a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4a4a2a',
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
    color: '#ccc',
  },
  scoreFactors: {
    gap: 16,
    marginBottom: 16,
  },
  scoreFactor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
  },
  scoreFactorIcon: {
    fontSize: 28,
  },
  scoreFactorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  scoreFactorDesc: {
    fontSize: 14,
    color: '#888',
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
  },
  tipItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#ccc',
  },
  ctaSection: {
    backgroundColor: '#1a2a2a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#2a4a4a',
  },
  ctaText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#4ade80',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f0f1a',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  footerLink: {
    fontSize: 14,
    color: '#6a9fff',
  },
  footerDivider: {
    fontSize: 14,
    color: '#444',
  },
});
