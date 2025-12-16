import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  /** Error message if ad failed */
  error?: string | null;
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
  error,
}: RewardedAdModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Heart Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="heart-plus" size={64} color="#ff6b6b" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Out of Lives!</Text>

          {/* Description */}
          <Text style={styles.description}>
            Watch a short ad to get an extra life and continue playing
          </Text>

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4ade80" />
              <Text style={styles.loadingText}>Loading ad...</Text>
            </View>
          )}

          {/* Showing ad indicator */}
          {isShowing && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Showing ad...</Text>
            </View>
          )}

          {/* Action buttons */}
          {!isLoading && !isShowing && (
            <View style={styles.buttonContainer}>
              {/* Watch Ad Button */}
              <TouchableOpacity
                style={[styles.button, styles.watchButton]}
                onPress={onWatchAd}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="play-circle"
                  size={24}
                  color="#ffffff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.watchButtonText}>Watch Ad</Text>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
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
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#b0b0c0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#b0b0c0',
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
    backgroundColor: '#4ade80',
  },
  buttonIcon: {
    marginRight: 8,
  },
  watchButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#404050',
  },
  declineButtonText: {
    color: '#b0b0c0',
    fontSize: 16,
    fontWeight: '600',
  },
});
