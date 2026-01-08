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

interface DoubleXPModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** The base XP that would be earned */
  baseXP: number;
  /** Whether the ad is currently loading */
  isLoading: boolean;
  /** Whether the ad is currently showing */
  isShowing: boolean;
  /** Called when user chooses to watch an ad for double XP */
  onWatchAd: () => void;
  /** Called when user declines and takes the base XP */
  onDecline: () => void;
}

/**
 * Modal that prompts the user to watch a rewarded ad to double their XP
 */
export function DoubleXPModal({
  visible,
  baseXP,
  isLoading,
  isShowing,
  onWatchAd,
  onDecline,
}: DoubleXPModalProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  const doubledXP = baseXP * 2;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onDecline}
    >
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* XP Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="star-circle" size={64} color={colorScheme.gold} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Double Your XP!</Text>

          {/* XP Display */}
          <View style={styles.xpContainer}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>Base XP:</Text>
              <Text style={styles.xpValue}>+{baseXP}</Text>
            </View>
            <View style={styles.xpDivider} />
            <View style={styles.xpRow}>
              <Text style={styles.xpLabelHighlight}>With Ad:</Text>
              <Text style={styles.xpValueHighlight}>+{doubledXP}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Watch a short ad to earn double XP and level up faster!
          </Text>

          {/* Loading indicator - shown while ad is loading */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colorScheme.gold} />
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
              <Button
                text="Get Double XP"
                onPress={onWatchAd}
                backgroundColor={colorScheme.gold}
                textColor={colorScheme.warmBlack}
                icon="play-circle"
                iconColor={colorScheme.warmBlack}
                iconSize={24}
              />

              <Button
                text={`Keep +${baseXP} XP`}
                onPress={onDecline}
                variant="outlined"
                backgroundColor={colorScheme.borderSecondary}
                textColor={colorScheme.textSecondary}
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
    marginBottom: 16,
    textAlign: 'center',
  },
  xpContainer: {
    backgroundColor: colorScheme.backgroundTertiary,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  xpDivider: {
    height: 1,
    backgroundColor: colorScheme.borderPrimary,
    marginVertical: 4,
  },
  xpLabel: {
    fontSize: 16,
    color: colorScheme.textSecondary,
  },
  xpValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
  xpLabelHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: colorScheme.gold,
  },
  xpValueHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colorScheme.gold,
  },
  description: {
    fontSize: 14,
    color: colorScheme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
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
});
