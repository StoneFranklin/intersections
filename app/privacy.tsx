import { Link } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeScheme } from '@/contexts/theme-context';

export default function PrivacyPolicyPage() {
  const { colorScheme } = useThemeScheme();
  const lastUpdated = "December 17, 2025";

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
              <Ionicons name="arrow-back" size={20} color={colorScheme.brandPrimary} />
              <Text style={[styles.backButtonText, { color: colorScheme.brandPrimary }]}>Back to Game</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colorScheme.textPrimary }]}>Privacy Policy</Text>
          <Text style={[styles.lastUpdated, { color: colorScheme.textTertiary }]}>Last updated: {lastUpdated}</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Welcome to Intersections ("we," "our," or "us"). This Privacy Policy explains how we
            collect, use, and share information when you use Intersections (the "Service"),
            including our iOS/Android apps and our web version.
          </Text>
        </View>

        {/* Information We Collect */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Information We Collect</Text>

          <Text style={[styles.subheading, { color: colorScheme.textSecondary }]}>Account Information</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            When you sign in with Google, we collect:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Your email address</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Your Google account ID (for authentication)</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Display name (if you choose to set one)</Text>
          </View>

          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            If you use Apple Sign In (where available), we receive a similar account identifier and may receive your
            name and email depending on your Apple settings.
          </Text>

          <Text style={[styles.subheading, { color: colorScheme.textSecondary }]}>Game Data</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We collect information about your gameplay, including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Puzzle scores and completion times</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Daily streak information</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Number of correct and incorrect placements</Text>
          </View>

          <Text style={[styles.subheading, { color: colorScheme.textSecondary }]}>Automatically Collected Information</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            When you use Intersections, we may automatically collect:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Device type and browser information</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- General location (country/region)</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Usage patterns and preferences</Text>
          </View>

          <Text style={[styles.subheading, { color: colorScheme.textSecondary }]}>Advertising and Analytics</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We use Google advertising services to display ads and measure their performance (Google AdMob on iOS/Android
            and, where enabled, Google AdSense on web). These services may collect and use information about your device,
            browser, and app usage to provide ads (which may be personalized depending on your settings, your region, and
            applicable law). This may include:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Advertising ID (a unique identifier for advertising purposes)</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Device information (model, OS version)</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- App usage data and interactions with ads</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- IP address and general location information</Text>
          </View>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Google AdMob is operated by Google LLC and is subject to Google's Privacy Policy.
            You can learn more about how Google uses data at{' '}
            <Text style={[styles.link, { color: colorScheme.brandPrimary }]}>https://policies.google.com/privacy</Text>. You can usually opt out of personalized
            advertising by visiting your device's ad settings. On iOS, the advertising identifier (IDFA) is only
            available to apps if you allow tracking in your device settings.
          </Text>

          <Text style={[styles.subheading, { color: colorScheme.textSecondary }]}>Notifications</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            If you enable reminders, we request permission to send notifications and schedule local notifications on your
            device. We store your reminder preference on your device.
          </Text>
        </View>

        {/* How We Use Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>How We Use Your Information</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Provide and maintain the game service</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Save your progress and sync across devices</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Display leaderboards and rankings</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Track your daily streak</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Improve the game experience</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Display relevant advertisements through Google AdMob</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Analyze app usage and performance</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Communicate important updates</Text>
          </View>
        </View>

        {/* Data Storage */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Data Storage and Security</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Your data is stored securely using Supabase, a trusted cloud database provider.
            We implement appropriate technical and organizational measures to protect your
            personal information against unauthorized access, alteration, disclosure, or
            destruction.
          </Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            If you play without signing in, your game data is stored locally on your device
            (or in your browser on web) and is not synced to our servers.
          </Text>
        </View>

        {/* Data Sharing */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Data Sharing</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We do not sell your personal information. We may share limited data in the
            following circumstances:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - <Text style={[styles.bold, { color: colorScheme.textPrimary, fontWeight: '600' }]}>Leaderboards:</Text> Your display name (if set) and
              scores are visible to other players on the leaderboard
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - <Text style={[styles.bold, { color: colorScheme.textPrimary, fontWeight: '600' }]}>Advertising Partners:</Text> We share information with
              Google AdMob to display advertisements. AdMob may share data with advertising
              partners as described in Google's privacy policy
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - <Text style={[styles.bold, { color: colorScheme.textPrimary, fontWeight: '600' }]}>Service Providers:</Text> We use third-party services
              (Supabase, Google Authentication, Google AdMob) that process data on our behalf
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - <Text style={[styles.bold, { color: colorScheme.textPrimary, fontWeight: '600' }]}>Legal Requirements:</Text> We may disclose information
              if required by law
            </Text>
          </View>
        </View>

        {/* Cookies */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Cookies and Local Storage</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We use local storage and cookies to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Remember your authentication status</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Store game progress locally</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Remember your preferences</Text>
          </View>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            You can clear this data by clearing the app's storage or your browser's storage, though this may reset local
            game progress.
          </Text>
        </View>

        {/* Advertising Choices */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Advertising Choices</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Depending on your device and region, you may be able to control personalized advertising through your device
            settings (for example, resetting or limiting your advertising ID) and/or your Google account settings.
          </Text>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Your Rights</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Access the personal data we hold about you</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Request correction of inaccurate data</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Request deletion of your account and data</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Opt out of marketing communications</Text>
          </View>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            To exercise any of these rights, please contact us using the information below.
          </Text>
        </View>

        {/* Children */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Children's Privacy</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Intersections is not directed at children under 13 years of age. We do not
            knowingly collect personal information from children under 13. If you believe
            we have collected information from a child under 13, please contact us
            immediately.
          </Text>
        </View>

        {/* Changes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Changes to This Policy</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of
            any significant changes by posting the new policy on this page and updating
            the Last updated date.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>Contact Us</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            If you have any questions about this Privacy Policy or our practices, please
            contact us at:
          </Text>
          <View style={[styles.contactBox, { backgroundColor: colorScheme.backgroundSecondary }]}>
            <Text style={[styles.contactText, { color: colorScheme.brandPrimary }]}>intersections.game@gmail.com</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colorScheme.borderPrimary }]}>
          <Link href={"/about" as any} asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>About</Text>
            </TouchableOpacity>
          </Link>
          <Text style={[styles.footerDivider, { color: colorScheme.textSecondary }]}>|</Text>
          <Link href={"/contact" as any} asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>Contact</Text>
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
  lastUpdated: {
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subheading: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
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
  bold: {
    fontWeight: '600',
  },
  link: {
    textDecorationLine: 'underline',
  },
  contactBox: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  contactText: {
    fontSize: 16,
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




