import { Link } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 17, 2025";

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
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            Welcome to Intersections (“we,” “our,” or “us”). This Privacy Policy explains how we
            collect, use, and share information when you use Intersections (the “Service”),
            including our iOS/Android apps and our web version.
          </Text>
        </View>

        {/* Information We Collect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          
          <Text style={styles.subheading}>Account Information</Text>
          <Text style={styles.paragraph}>
            When you sign in with Google, we collect:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>- Your email address</Text>
            <Text style={styles.bulletItem}>- Your Google account ID (for authentication)</Text>
            <Text style={styles.bulletItem}>- Display name (if you choose to set one)</Text>
          </View>

          <Text style={styles.paragraph}>
            If you use Apple Sign In (where available), we receive a similar account identifier and may receive your
            name and email depending on your Apple settings.
          </Text>

          <Text style={styles.subheading}>Game Data</Text>
          <Text style={styles.paragraph}>
            We collect information about your gameplay, including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>- Puzzle scores and completion times</Text>
            <Text style={styles.bulletItem}>- Daily streak information</Text>
            <Text style={styles.bulletItem}>- Number of correct and incorrect placements</Text>
          </View>

          <Text style={styles.subheading}>Automatically Collected Information</Text>
          <Text style={styles.paragraph}>
            When you use Intersections, we may automatically collect:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>- Device type and browser information</Text>
            <Text style={styles.bulletItem}>- General location (country/region)</Text>
            <Text style={styles.bulletItem}>- Usage patterns and preferences</Text>
          </View>

          <Text style={styles.subheading}>Advertising and Analytics</Text>
          <Text style={styles.paragraph}>
            We use Google advertising services to display ads and measure their performance (Google AdMob on iOS/Android
            and, where enabled, Google AdSense on web). These services may collect and use information about your device,
            browser, and app usage to provide ads (which may be personalized depending on your settings, your region, and
            applicable law). This may include:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>- Advertising ID (a unique identifier for advertising purposes)</Text>
            <Text style={styles.bulletItem}>- Device information (model, OS version)</Text>
            <Text style={styles.bulletItem}>- App usage data and interactions with ads</Text>
            <Text style={styles.bulletItem}>- IP address and general location information</Text>
          </View>
          <Text style={styles.paragraph}>
            Google AdMob is operated by Google LLC and is subject to Google’s Privacy Policy.
            You can learn more about how Google uses data at{' '}
            <Text style={styles.link}>https://policies.google.com/privacy</Text>. You can usually opt out of personalized
            advertising by visiting your device’s ad settings. On iOS, the advertising identifier (IDFA) is only
            available to apps if you allow tracking in your device settings.
          </Text>

          <Text style={styles.subheading}>Notifications</Text>
          <Text style={styles.paragraph}>
            If you enable reminders, we request permission to send notifications and schedule local notifications on your
            device. We store your reminder preference on your device.
          </Text>
        </View>

        {/* How We Use Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>- Provide and maintain the game service</Text>
            <Text style={styles.bulletItem}>- Save your progress and sync across devices</Text>
            <Text style={styles.bulletItem}>- Display leaderboards and rankings</Text>
            <Text style={styles.bulletItem}>- Track your daily streak</Text>
            <Text style={styles.bulletItem}>- Improve the game experience</Text>
            <Text style={styles.bulletItem}>- Display relevant advertisements through Google AdMob</Text>
            <Text style={styles.bulletItem}>- Analyze app usage and performance</Text>
            <Text style={styles.bulletItem}>- Communicate important updates</Text>
          </View>
        </View>

        {/* Data Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            Your data is stored securely using Supabase, a trusted cloud database provider. 
            We implement appropriate technical and organizational measures to protect your 
            personal information against unauthorized access, alteration, disclosure, or 
            destruction.
          </Text>
          <Text style={styles.paragraph}>
            If you play without signing in, your game data is stored locally on your device 
            (or in your browser on web) and is not synced to our servers.
          </Text>
        </View>

        {/* Data Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share limited data in the 
            following circumstances:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              - <Text style={styles.bold}>Leaderboards:</Text> Your display name (if set) and
              scores are visible to other players on the leaderboard
            </Text>
            <Text style={styles.bulletItem}>
              - <Text style={styles.bold}>Advertising Partners:</Text> We share information with
              Google AdMob to display advertisements. AdMob may share data with advertising
              partners as described in Google's privacy policy
            </Text>
            <Text style={styles.bulletItem}>
              - <Text style={styles.bold}>Service Providers:</Text> We use third-party services
              (Supabase, Google Authentication, Google AdMob) that process data on our behalf
            </Text>
            <Text style={styles.bulletItem}>
              - <Text style={styles.bold}>Legal Requirements:</Text> We may disclose information
              if required by law
            </Text>
          </View>
        </View>

        {/* Cookies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cookies and Local Storage</Text>
          <Text style={styles.paragraph}>
            We use local storage and cookies to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>- Remember your authentication status</Text>
            <Text style={styles.bulletItem}>- Store game progress locally</Text>
            <Text style={styles.bulletItem}>- Remember your preferences</Text>
          </View>
          <Text style={styles.paragraph}>
            You can clear this data by clearing the app’s storage or your browser’s storage, though this may reset local
            game progress.
          </Text>
        </View>

        {/* Advertising Choices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advertising Choices</Text>
          <Text style={styles.paragraph}>
            Depending on your device and region, you may be able to control personalized advertising through your device
            settings (for example, resetting or limiting your advertising ID) and/or your Google account settings.
          </Text>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>- Access the personal data we hold about you</Text>
            <Text style={styles.bulletItem}>- Request correction of inaccurate data</Text>
            <Text style={styles.bulletItem}>- Request deletion of your account and data</Text>
            <Text style={styles.bulletItem}>- Opt out of marketing communications</Text>
          </View>
          <Text style={styles.paragraph}>
            To exercise any of these rights, please contact us using the information below.
          </Text>
        </View>

        {/* Children */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children’s Privacy</Text>
          <Text style={styles.paragraph}>
            Intersections is not directed at children under 13 years of age. We do not 
            knowingly collect personal information from children under 13. If you believe 
            we have collected information from a child under 13, please contact us 
            immediately.
          </Text>
        </View>

        {/* Changes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of 
            any significant changes by posting the new policy on this page and updating 
            the Last updated date.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy or our practices, please 
            contact us at:
          </Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>intersections.game@gmail.com</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Link href={"/terms" as any} asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.footerDivider}>|</Text>
          <Link href="/" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Play Game</Text>
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
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  subheading: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ccc',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: '#aaa',
    marginBottom: 12,
  },
  bulletList: {
    gap: 8,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 24,
    color: '#aaa',
    paddingLeft: 8,
  },
  bold: {
    fontWeight: '600',
    color: '#ccc',
  },
  link: {
    color: '#6a9fff',
    textDecorationLine: 'underline',
  },
  contactBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  contactText: {
    fontSize: 16,
    color: '#6a9fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 24,
    marginTop: 20,
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
