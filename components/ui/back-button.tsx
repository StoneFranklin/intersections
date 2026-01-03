import { useThemeScheme } from '@/contexts/theme-context';
import { ColorScheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface BackButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  iconSize?: number;
}

export function BackButton({
  onPress,
  style,
  iconSize = 24,
}: BackButtonProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      activeOpacity={0.6}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={iconSize} color={colorScheme.textPrimary} />
    </TouchableOpacity>
  );
}

const createStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  button: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
