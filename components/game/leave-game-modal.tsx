import { useThemeScheme } from '@/contexts/theme-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LeaveGameModalProps {
  visible: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function LeaveGameModal({
  visible,
  onStay,
  onLeave,
}: LeaveGameModalProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onStay}
    >
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="exit-run" size={56} color={colorScheme.warning} />
          </View>

          <Text style={styles.title}>Leave Game?</Text>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Your timer will keep running if you leave. You can return to continue, but the time will still count toward your score.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.stayButton]}
              onPress={onStay}
              activeOpacity={0.7}
            >
              <Text style={styles.stayButtonText}>Keep Playing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.leaveButton]}
              onPress={onLeave}
              activeOpacity={0.7}
            >
              <Text style={styles.leaveButtonText}>Leave Anyway</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colorScheme: any) => StyleSheet.create({
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
  descriptionContainer: {
    backgroundColor: colorScheme.overlayLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: colorScheme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  stayButton: {
    backgroundColor: colorScheme.brandPrimary,
  },
  stayButtonText: {
    color: colorScheme.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colorScheme.borderSecondary,
  },
  leaveButtonText: {
    color: colorScheme.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
