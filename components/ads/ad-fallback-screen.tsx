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
}

/**
 * Full-screen fallback shown when ad fails to load but user wanted to watch.
 * Shows a countdown before automatically granting the extra life.
 */
export function AdFallbackScreen({ countdown }: AdFallbackScreenProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="heart-plus" size={80} color={colorScheme.success} />
        </View>

        <Text style={styles.title}>Getting Your Extra Life</Text>

        <View style={styles.countdownContainer}>
          <ActivityIndicator size="large" color={colorScheme.success} />
          <Text style={styles.countdownText}>
            {countdown > 0 ? `${countdown}...` : 'Done!'}
          </Text>
        </View>

        <Text style={styles.description}>
          Thanks for your patience!
        </Text>
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
