import { Link } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeScheme } from '@/contexts/theme-context';

export default function TermsOfServicePage() {
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
              <Text style={[styles.backButtonText, { color: colorScheme.brandPrimary }]}>← Back to Game</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colorScheme.textPrimary }]}>Terms of Service</Text>
          <Text style={[styles.lastUpdated, { color: colorScheme.textTertiary }]}>Last updated: {lastUpdated}</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Welcome to Intersections! These Terms of Service ("Terms") govern your access
            to and use of the Intersections word puzzle game ("Service"). By accessing or
            using our Service, you agree to be bound by these Terms.
          </Text>
        </View>

        {/* Acceptance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            By accessing or using Intersections, you confirm that you:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Are at least 13 years of age</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Have read and understood these Terms</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Agree to be legally bound by these Terms</Text>
          </View>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            If you do not agree with any part of these Terms, you must not use our Service.
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>2. Description of Service</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            Intersections is a free-to-play daily word puzzle game where players place
            words into a grid based on category intersections. The Service includes:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Daily puzzles released at midnight</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Score tracking and leaderboards</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Optional user accounts for progress syncing</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Streak tracking for consecutive daily play</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Advertisement-supported gameplay</Text>
          </View>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            The Service is free to use and is supported by advertisements (for example, Google AdMob on iOS/Android and,
            where enabled, Google AdSense on web). Some features may offer an optional rewarded ad (for example, to earn
            an in-game benefit) which you can choose to watch or decline.
          </Text>
        </View>

        {/* User Accounts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>3. User Accounts</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            You may use Intersections without creating an account. However, to access
            certain features like leaderboards and cross-device syncing, you may sign
            in using Google authentication.
          </Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            When you create an account, you agree to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Provide accurate information</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Maintain the security of your account</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Accept responsibility for all activities under your account</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Notify us of any unauthorized use</Text>
          </View>
        </View>

        {/* User Conduct */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>4. User Conduct</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            When using Intersections, you agree not to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Use automated systems or bots to play the game</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Attempt to manipulate scores or leaderboards</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Use offensive or inappropriate display names</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Interfere with or disrupt the Service</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Attempt to access other users' accounts</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Reverse engineer or decompile the game</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Block, interfere with, or manipulate advertisements</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Use ad-blocking software or techniques to avoid viewing ads</Text>
          </View>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We reserve the right to suspend or terminate accounts that violate these rules.
          </Text>
        </View>

        {/* Intellectual Property */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>5. Intellectual Property</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            All content in Intersections, including but not limited to puzzles, graphics,
            logos, and software, is owned by us or our licensors and is protected by
            intellectual property laws.
          </Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            You are granted a limited, non-exclusive, non-transferable license to access
            and use the Service for personal, non-commercial purposes only.
          </Text>
        </View>

        {/* Third-Party Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>6. Third-Party Services and Advertising</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            The Service may display third-party advertisements through Google advertising services (such as Google AdMob
            and, where enabled, Google AdSense). Ads are provided by third-party advertisers and ad networks.
          </Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We do not encourage or request users to click on advertisements. Any optional rewarded ad is presented as a
            choice, and you can continue using the Service even if you decline.
          </Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            By using the Service, you acknowledge that:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - We do not control the content of third-party advertisements
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - We are not responsible for the content, accuracy, or practices of advertisers
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - Third-party advertisers may collect data as described in their own privacy policies
            </Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>
              - Your interaction with advertisements is governed by the advertiser's terms
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We encourage you to review Google's Privacy Policy and related terms to understand how data may be used for
            advertising purposes:{' '}
            <Text style={[styles.link, { color: colorScheme.brandPrimary }]}>https://policies.google.com/privacy</Text>.
          </Text>
        </View>

        {/* Disclaimers */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>7. Disclaimers</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY
            KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- The Service will be uninterrupted or error-free</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- Defects will be corrected</Text>
            <Text style={[styles.bulletItem, { color: colorScheme.textSecondary }]}>- The Service is free of viruses or harmful components</Text>
          </View>
        </View>

        {/* Limitation of Liability */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>8. Limitation of Liability</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY
            LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR
            ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </Text>
        </View>

        {/* Modifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>9. Modifications to Service</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We reserve the right to modify, suspend, or discontinue the Service (or any
            part thereof) at any time, with or without notice. We shall not be liable to
            you or any third party for any modification, suspension, or discontinuation
            of the Service.
          </Text>
        </View>

        {/* Changes to Terms */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>10. Changes to Terms</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            We may revise these Terms from time to time. The most current version will
            always be available on this page. By continuing to use the Service after
            revisions become effective, you agree to be bound by the revised Terms.
          </Text>
        </View>

        {/* Governing Law */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>11. Governing Law</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            These Terms shall be governed by and construed in accordance with the laws
            of the jurisdiction in which we operate, without regard to its conflict of
            law provisions.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.textPrimary }]}>12. Contact Information</Text>
          <Text style={[styles.paragraph, { color: colorScheme.textSecondary }]}>
            If you have any questions about these Terms, please contact us at:
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
          <Link href={"/privacy" as any} asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colorScheme.brandPrimary }]}>Privacy Policy</Text>
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
  lastUpdated: {
    fontSize: 14,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  link: {
    textDecorationLine: 'underline',
  },
  bulletList: {
    gap: 6,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 8,
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
