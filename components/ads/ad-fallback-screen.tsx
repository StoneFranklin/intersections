import { useThemeScheme } from '@/contexts/theme-context';
import { ColorScheme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AdFallbackScreenProps {
  /** Countdown seconds remaining before granting reward */
  countdown: number;
  /** Title text for the fallback screen */
  title?: string;
  /** Icon name from MaterialCommunityIcons */
  iconName?: string;
  /** Description text for the fallback screen */
  description?: string;
}

/**
 * Full-screen fallback shown when ad fails to load but user wanted to watch.
 * Shows a countdown before automatically granting the reward.
 * Reusable for different reward types (extra life, double XP, etc).
 */
export function AdFallbackScreen({
  countdown,
  title = 'Getting Your Extra Life',
  iconName = 'heart-plus',
  description = 'Thanks for your patience!'
}: AdFallbackScreenProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={iconName as any} size={80} color={colorScheme.success} />
        </View>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            {countdown > 0 ? `${countdown}...` : 'Done!'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme.backgroundPrimary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colorScheme.textPrimary,
    marginBottom: 32,
    textAlign: 'center',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colorScheme.success,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    color: colorScheme.textSecondary,
    textAlign: 'center',
  },
});
