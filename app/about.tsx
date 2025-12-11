import { Link } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AboutPage() {
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
              <Text style={styles.backButtonText}>‹ Back to Game</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Image 
            source={require('@/assets/images/intersections-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>About Intersections</Text>
          <Text style={styles.subtitle}>A Daily Word Puzzle Game</Text>
        </View>

        {/* What is Intersections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is Intersections?</Text>
          <Text style={styles.paragraph}>
            Intersections is a unique daily word puzzle game that challenges your vocabulary 
            and categorical thinking. Each day, you're presented with a 4×4 grid where rows 
            and columns represent different categories. Your goal is to place 16 words in 
            the grid where each word belongs to both its row's category AND its column's category.
          </Text>
          <Text style={styles.paragraph}>
            Think of it as a crossword meets Sudoku meets trivia — you need to find the 
            "intersection" of two categories for each cell. For example, if a row is 
            "Fruits" and a column is "Red Things," the correct word might be "Apple" or 
            "Strawberry."
          </Text>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.featureList}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🧩</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>New Puzzle Daily</Text>
                <Text style={styles.featureDesc}>
                  A fresh puzzle is released every day at midnight. Everyone plays the same puzzle, 
                  making it perfect for competing with friends.
                </Text>
              </View>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>💡</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Think Categorically</Text>
                <Text style={styles.featureDesc}>
                  Each word must fit two categories at once. Use logic and word knowledge 
                  to find the perfect match for each cell.
                </Text>
              </View>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>❤️</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Three Lives</Text>
                <Text style={styles.featureDesc}>
                  You have three chances to make mistakes. Each incorrect placement costs 
                  a life. Lose all three and the game ends!
                </Text>
              </View>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🏆</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Compete Globally</Text>
                <Text style={styles.featureDesc}>
                  Your score is based on speed and accuracy. See how you rank against 
                  other players on the daily leaderboard.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Why Play */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Play Intersections?</Text>
          <Text style={styles.paragraph}>
            Word games keep your mind sharp. Intersections combines the satisfaction of 
            word puzzles with the strategy of category matching. It's designed to be:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.bulletBold}>Quick</Text> — Most puzzles take 3-10 minutes</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bulletBold}>Challenging</Text> — Easy to learn, hard to master</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bulletBold}>Social</Text> — Compare scores with friends</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.bulletBold}>Daily</Text> — Build a streak and come back every day</Text>
          </View>
        </View>

        {/* The Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Creator</Text>
          <Text style={styles.paragraph}>
            Intersections was created by an indie developer passionate about word games 
            and puzzles. The game is inspired by classic word games and modern daily 
            puzzle formats, combining the best of both worlds into something new and engaging.
          </Text>
          <Text style={styles.paragraph}>
            The game is continuously being improved based on player feedback. Have a 
            suggestion? We'd love to hear from you!
          </Text>
        </View>

        {/* Links */}
        <View style={styles.linksSection}>
          <Link href={"/how-to-play" as any} asChild>
            <TouchableOpacity style={styles.linkCard}>
              <Text style={styles.linkCardIcon}>📖</Text>
              <Text style={styles.linkCardText}>How to Play</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/privacy" as any} asChild>
            <TouchableOpacity style={styles.linkCard}>
              <Text style={styles.linkCardIcon}>🔒</Text>
              <Text style={styles.linkCardText}>Privacy Policy</Text>
            </TouchableOpacity>
          </Link>
          <Link href={"/terms" as any} asChild>
            <TouchableOpacity style={styles.linkCard}>
              <Text style={styles.linkCardIcon}>📜</Text>
              <Text style={styles.linkCardText}>Terms of Service</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Intersections. All rights reserved.</Text>
          <Link href="/" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Play Now →</Text>
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
  hero: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
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
  featureList: {
    gap: 20,
  },
  feature: {
    flexDirection: 'row',
    gap: 16,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 15,
    lineHeight: 22,
    color: '#aaa',
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ccc',
  },
  bulletBold: {
    fontWeight: '600',
    color: '#fff',
  },
  linksSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  linkCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  linkCardIcon: {
    fontSize: 20,
  },
  linkCardText: {
    fontSize: 15,
    color: '#6a9fff',
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    paddingTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 16,
    color: '#4ade80',
    fontWeight: '600',
  },
});
