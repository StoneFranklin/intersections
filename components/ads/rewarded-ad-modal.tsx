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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RewardedAdModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Whether the ad is currently loading */
  isLoading: boolean;
  /** Whether the ad is currently showing */
  isShowing: boolean;
  /** Whether the ad is ready to show */
  isAdReady: boolean;
  /** Called when user chooses to watch an ad */
  onWatchAd: () => void;
  /** Called when user declines to watch an ad */
  onDecline: () => void;
  /** Called when user wants to retry loading an ad */
  onRetry: () => void;
  /** Error message if ad failed */
  error?: string | null;
  /** Whether the error is specifically a no-fill error */
  isNoFill?: boolean;
  /** Whether we're in graceful fallback mode (granting reward due to ad error) */
  isGracefulFallback?: boolean;
  /** Countdown seconds remaining before auto-granting reward */
  fallbackCountdown?: number;
}

/**
 * Modal that prompts the user to watch a rewarded ad for an extra life
 */
export function RewardedAdModal({
  visible,
  isLoading,
  isShowing,
  isAdReady,
  onWatchAd,
  onDecline,
  onRetry,
  error,
  isNoFill,
  isGracefulFallback,
  fallbackCountdown,
}: RewardedAdModalProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  const hasError = !!error && !isGracefulFallback;

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
          <Text style={styles.title}>Out of Lives!</Text>

          {/* Description */}
          <Text style={styles.description}>
            Watch a short ad to get an extra life and continue playing
          </Text>

          {/* Loading indicator */}
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

          {/* Graceful fallback - granting reward due to ad unavailability */}
          {isGracefulFallback && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colorScheme.success} />
              <Text style={styles.loadingText}>
                Granting extra life{fallbackCountdown !== undefined ? ` in ${fallbackCountdown}...` : '...'}
              </Text>
            </View>
          )}

          {/* Error state with retry option */}
          {hasError && !isLoading && !isShowing && (
            <View style={styles.errorStateContainer}>
              <View style={styles.errorIconContainer}>
                <MaterialCommunityIcons
                  name={isNoFill ? "video-off" : "alert-circle"}
                  size={32}
                  color={colorScheme.textSecondary}
                />
              </View>
              <Text style={styles.errorTitle}>
                {isNoFill ? "No Ads Available" : "Failed to Load Ad"}
              </Text>
              <Text style={styles.errorDescription}>
                {isNoFill
                  ? "There are no ads to show right now. Try again in a moment."
                  : error}
              </Text>
              <View style={styles.buttonContainer}>
                {/* Retry Button */}
                <TouchableOpacity
                  style={[styles.button, styles.retryButton]}
                  onPress={onRetry}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="refresh"
                    size={24}
                    color={colorScheme.textPrimary}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.watchButtonText}>Try Again</Text>
                </TouchableOpacity>

                {/* Decline Button */}
                <TouchableOpacity
                  style={[styles.button, styles.declineButton]}
                  onPress={onDecline}
                  activeOpacity={0.7}
                >
                  <Text style={styles.declineButtonText}>No Thanks</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action buttons - only show when ad is ready */}
          {!isLoading && !isShowing && !hasError && (
            <View style={styles.buttonContainer}>
              {/* Watch Ad Button */}
              <TouchableOpacity
                style={[styles.button, styles.watchButton, !isAdReady && styles.buttonDisabled]}
                onPress={onWatchAd}
                activeOpacity={0.7}
                disabled={!isAdReady}
              >
                <MaterialCommunityIcons
                  name="play-circle"
                  size={24}
                  color={isAdReady ? colorScheme.textPrimary : colorScheme.textSecondary}
                  style={styles.buttonIcon}
                />
                <Text style={[styles.watchButtonText, !isAdReady && styles.buttonTextDisabled]}>
                  Watch Ad
                </Text>
              </TouchableOpacity>

              {/* Decline Button */}
              <TouchableOpacity
                style={[styles.button, styles.declineButton]}
                onPress={onDecline}
                activeOpacity={0.7}
              >
                <Text style={styles.declineButtonText}>No Thanks</Text>
              </TouchableOpacity>
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
  errorStateContainer: {
    alignItems: 'center',
    width: '100%',
  },
  errorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colorScheme.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colorScheme.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 14,
    color: colorScheme.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
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
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  watchButton: {
    backgroundColor: colorScheme.success,
  },
  retryButton: {
    backgroundColor: colorScheme.brandPrimary,
  },
  buttonDisabled: {
    backgroundColor: colorScheme.backgroundPrimary,
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: colorScheme.textSecondary,
  },
  buttonIcon: {
    marginRight: 8,
  },
  watchButtonText: {
    color: colorScheme.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colorScheme.borderSecondary,
  },
  declineButtonText: {
    color: colorScheme.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
