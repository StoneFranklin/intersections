import { Link } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TermsOfServicePage() {
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
              <Text style={styles.backButtonText}>‹ Back to Game</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            Welcome to Intersections! These Terms of Service (“Terms”) govern your access 
            to and use of the Intersections word puzzle game (“Service”). By accessing or 
            using our Service, you agree to be bound by these Terms.
          </Text>
        </View>

        {/* Acceptance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using Intersections, you confirm that you:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Are at least 13 years of age</Text>
            <Text style={styles.bulletItem}>• Have read and understood these Terms</Text>
            <Text style={styles.bulletItem}>• Agree to be legally bound by these Terms</Text>
          </View>
          <Text style={styles.paragraph}>
            If you do not agree with any part of these Terms, you must not use our Service.
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Intersections is a free-to-play daily word puzzle game where players place
            words into a grid based on category intersections. The Service includes:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Daily puzzles released at midnight</Text>
            <Text style={styles.bulletItem}>• Score tracking and leaderboards</Text>
            <Text style={styles.bulletItem}>• Optional user accounts for progress syncing</Text>
            <Text style={styles.bulletItem}>• Streak tracking for consecutive daily play</Text>
            <Text style={styles.bulletItem}>• Advertisement-supported gameplay</Text>
          </View>
          <Text style={styles.paragraph}>
            The Service is free to use and is supported by advertisements (for example, Google AdMob on iOS/Android and,
            where enabled, Google AdSense on web). Some features may offer an optional rewarded ad (for example, to earn
            an in-game benefit) which you can choose to watch or decline.
          </Text>
        </View>

        {/* User Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You may use Intersections without creating an account. However, to access 
            certain features like leaderboards and cross-device syncing, you may sign 
            in using Google authentication.
          </Text>
          <Text style={styles.paragraph}>
            When you create an account, you agree to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide accurate information</Text>
            <Text style={styles.bulletItem}>• Maintain the security of your account</Text>
            <Text style={styles.bulletItem}>• Accept responsibility for all activities under your account</Text>
            <Text style={styles.bulletItem}>• Notify us of any unauthorized use</Text>
          </View>
        </View>

        {/* User Conduct */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.paragraph}>
            When using Intersections, you agree not to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Use automated systems or bots to play the game</Text>
            <Text style={styles.bulletItem}>• Attempt to manipulate scores or leaderboards</Text>
            <Text style={styles.bulletItem}>• Use offensive or inappropriate display names</Text>
            <Text style={styles.bulletItem}>• Interfere with or disrupt the Service</Text>
            <Text style={styles.bulletItem}>• Attempt to access other users’ accounts</Text>
            <Text style={styles.bulletItem}>• Reverse engineer or decompile the game</Text>
            <Text style={styles.bulletItem}>• Block, interfere with, or manipulate advertisements</Text>
            <Text style={styles.bulletItem}>• Use ad-blocking software or techniques to avoid viewing ads</Text>
          </View>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate accounts that violate these rules.
          </Text>
        </View>

        {/* Intellectual Property */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content in Intersections, including but not limited to puzzles, graphics, 
            logos, and software, is owned by us or our licensors and is protected by 
            intellectual property laws.
          </Text>
          <Text style={styles.paragraph}>
            You are granted a limited, non-exclusive, non-transferable license to access 
            and use the Service for personal, non-commercial purposes only.
          </Text>
        </View>

        {/* Third-Party Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Third-Party Services and Advertising</Text>
          <Text style={styles.paragraph}>
            The Service may display third-party advertisements through Google advertising services (such as Google AdMob
            and, where enabled, Google AdSense). Ads are provided by third-party advertisers and ad networks.
          </Text>
          <Text style={styles.paragraph}>
            We do not encourage or request users to click on advertisements. Any optional rewarded ad is presented as a
            choice, and you can continue using the Service even if you decline.
          </Text>
          <Text style={styles.paragraph}>
            By using the Service, you acknowledge that:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • We do not control the content of third-party advertisements
            </Text>
            <Text style={styles.bulletItem}>
              • We are not responsible for the content, accuracy, or practices of advertisers
            </Text>
            <Text style={styles.bulletItem}>
              • Third-party advertisers may collect data as described in their own privacy policies
            </Text>
            <Text style={styles.bulletItem}>
              • Your interaction with advertisements is governed by the advertiser’s terms
            </Text>
          </View>
          <Text style={styles.paragraph}>
            We encourage you to review Google’s Privacy Policy and related terms to understand how data may be used for
            advertising purposes:{' '}
            <Text style={styles.link}>https://policies.google.com/privacy</Text>.
          </Text>
        </View>

        {/* Disclaimers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Disclaimers</Text>
          <Text style={styles.paragraph}>
            THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY 
            KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• The Service will be uninterrupted or error-free</Text>
            <Text style={styles.bulletItem}>• Defects will be corrected</Text>
            <Text style={styles.bulletItem}>• The Service is free of viruses or harmful components</Text>
          </View>
        </View>

        {/* Limitation of Liability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY 
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY 
            LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR 
            ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </Text>
        </View>

        {/* Modifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Modifications to Service</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify, suspend, or discontinue the Service (or any 
            part thereof) at any time, with or without notice. We shall not be liable to 
            you or any third party for any modification, suspension, or discontinuation 
            of the Service.
          </Text>
        </View>

        {/* Changes to Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may revise these Terms from time to time. The most current version will 
            always be available on this page. By continuing to use the Service after 
            revisions become effective, you agree to be bound by the revised Terms.
          </Text>
        </View>

        {/* Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws 
            of the jurisdiction in which we operate, without regard to its conflict of 
            law provisions.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>intersections.game@gmail.com</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Link href={"/privacy" as any} asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.footerDivider}>•</Text>
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
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#aaa',
    marginBottom: 12,
  },
  link: {
    color: '#6a9fff',
    textDecorationLine: 'underline',
  },
  bulletList: {
    gap: 6,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#aaa',
    paddingLeft: 8,
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
