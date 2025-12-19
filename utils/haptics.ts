import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Safe haptics wrapper for web
export const haptics = {
  impact: (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(style);
    }
  },
  selection: () => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  },
  notification: (type: Haptics.NotificationFeedbackType) => {
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(type);
    }
  },
};

