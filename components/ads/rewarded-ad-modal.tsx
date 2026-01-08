import { useThemeScheme } from '@/contexts/theme-context';
import { ColorScheme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';

interface RewardedAdModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Whether the ad is currently loading */
  isLoading: boolean;
  /** Whether the ad is currently showing */
  isShowing: boolean;
  /** Called when user chooses to watch an ad */
  onWatchAd: () => void;
  /** Called when user declines to watch an ad */
  onDecline: () => void;
}

/**
 * Modal that prompts the user to watch a rewarded ad for an extra life
 */
export function RewardedAdModal({
  visible,
  isLoading,
  isShowing,
  onWatchAd,
  onDecline,
}: RewardedAdModalProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onDecline}
    >
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* Heart Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="heart-plus" size={64} color={colorScheme.errorLight} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Get an Extra Life!</Text>

          {/* Description */}
          <Text style={styles.description}>
            Continue playing by watching a short ad
          </Text>

          {/* Loading indicator - shown while ad is loading */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colorScheme.success} />
              <Text style={styles.loadingText}>Loading ad...</Text>
            </View>
          )}

          {/* Showing ad indicator */}
          {isShowing && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Showing ad...</Text>
            </View>
          )}

          {/* Action buttons - show when not loading/showing */}
          {!isLoading && !isShowing && (
            <View style={styles.buttonContainer}>
              {/* Watch Ad Button */}
              <Button
                text="Continue Playing"
                icon="play-circle"
                iconSize={24}
                backgroundColor={colorScheme.success}
                textColor={colorScheme.textPrimary}
                onPress={onWatchAd}
              />

              {/* Decline Button */}
              <Button
                text="No Thanks"
                variant="outlined"
                backgroundColor={colorScheme.borderSecondary}
                textColor={colorScheme.textSecondary}
                onPress={onDecline}
                textStyle={{ fontSize: 16, fontWeight: '600' }}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colorScheme.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colorScheme.backgroundSecondary,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colorScheme.backgroundPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colorScheme.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colorScheme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: colorScheme.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
});
