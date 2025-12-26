import { Link } from 'expo-router';
import React from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeScheme } from '@/contexts/theme-context';

export default function ContactPage() {
  const { colorScheme } = useThemeScheme();
  const contactEmail = 'intersections.game@gmail.com';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contactEmail}`);
  };

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
          <Text style={[styles.title, { color: colorScheme.textPrimary }]}>Contact Us</Text>
          <Text style={[styles.subtitle, { color: colorScheme.textSecondary }]}>
            We'd love to hear from you
          </Text>
        </View>

        {/* Main Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Get in Touch</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Have a question, suggestion, or feedback about Intersections? We're here to help!
            Send us an email and we'll get back to you as soon as possible.
          </Text>

          <TouchableOpacity
            style={[styles.emailBox, { backgroundColor: colorScheme.backgroundSecondary }]}
            onPress={handleEmailPress}
          >
            <Text style={[styles.emailLabel, { color: colorScheme.textTertiary }]}>Email us at:</Text>
            <Text style={[styles.emailText, { color: colorScheme.brandPrimary }]}>{contactEmail}</Text>
            <Text style={[styles.tapHint, { color: colorScheme.textTertiary }]}>Tap to open email app</Text>
          </TouchableOpacity>
        </View>

        {/* What to Include */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>What to Include</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            To help us assist you better, please include:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - A clear description of your question or issue
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - The device you're using (iPhone, Android, Web browser)
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - Screenshots if reporting a bug (optional but helpful)
            </Text>
          </View>
        </View>

        {/* Topics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>We Can Help With</Text>
          <View style={styles.topicGrid}>
            <View style={[styles.topicCard, { backgroundColor: colorScheme.backgroundSecondary }]}>
              <Text style={[styles.topicTitle, { color: colorScheme.textPrimary }]}>Bug Reports</Text>
              <Text style={[styles.topicDesc, { color: colorScheme.textSecondary }]}>
                Something not working right? Let us know.
              </Text>
            </View>
            <View style={[styles.topicCard, { backgroundColor: colorScheme.backgroundSecondary }]}>
              <Text style={[styles.topicTitle, { color: colorScheme.textPrimary }]}>Feature Requests</Text>
              <Text style={[styles.topicDesc, { color: colorScheme.textSecondary }]}>
                Have an idea to make the game better?
              </Text>
            </View>
            <View style={[styles.topicCard, { backgroundColor: colorScheme.backgroundSecondary }]}>
              <Text style={[styles.topicTitle, { color: colorScheme.textPrimary }]}>Account Issues</Text>
              <Text style={[styles.topicDesc, { color: colorScheme.textSecondary }]}>
                Problems with sign-in or syncing?
              </Text>
            </View>
            <View style={[styles.topicCard, { backgroundColor: colorScheme.backgroundSecondary }]}>
              <Text style={[styles.topicTitle, { color: colorScheme.textPrimary }]}>General Feedback</Text>
              <Text style={[styles.topicDesc, { color: colorScheme.textSecondary }]}>
                We love hearing what you think!
              </Text>
            </View>
          </View>
        </View>

        {/* Response Time */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Response Time</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We typically respond to emails within 24-48 hours. During busy periods, it may take
            a bit longer, but we read every message and will get back to you.
          </Text>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colorScheme.borderPrimary }]}>
          <Link href={"/about" as any} asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>About</Text>
            </TouchableOpacity>
          </Link>
          <Text style={[styles.footerDivider, { color: colorScheme.textSecondary }]}>|</Text>
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
