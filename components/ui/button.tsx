import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface ButtonProps {
  /** Button label text */
  text: string;
  /** Called when button is pressed */
  onPress: () => void;
  /** Background color - defaults to #FFD700 (gold) */
  backgroundColor?: string;
  /** Text color - defaults to #000000 */
  textColor?: string;
  /** Icon name from MaterialCommunityIcons */
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Icon color - defaults to textColor */
  iconColor?: string;
  /** Icon size - defaults to 20 */
  iconSize?: number;
  /** Button variant - defaults to 'filled' */
  variant?: 'filled' | 'outlined' | 'text';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Enable glowing shadow effect matching backgroundColor */
  glow?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Custom text style */
  textStyle?: TextStyle;
}

/**
 * Unified button component used throughout the app.
 * Based on the sign-in button design with customizable text, color, icon, and action.
 */
export function Button({
  text,
  onPress,
  backgroundColor = '#FFD700',
  textColor = '#000000',
  icon,
  iconColor,
  iconSize = 20,
  variant = 'filled',
  disabled = false,
  loading = false,
  glow = false,
  style,
  textStyle,
}: ButtonProps) {
  const computedIconColor = iconColor || textColor;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === 'filled' && [
          styles.filledButton,
          { backgroundColor },
          glow && {
            shadowColor: backgroundColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          },
        ],
        variant === 'outlined' && [
          styles.outlinedButton,
          { borderColor: backgroundColor },
        ],
        variant === 'text' && styles.textButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={computedIconColor} />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={iconSize}
              color={computedIconColor}
            />
          )}
          <Text
            style={[
              styles.buttonText,
              { color: textColor },
              variant === 'outlined' && { color: backgroundColor },
              variant === 'text' && { color: backgroundColor },
              textStyle,
            ]}
          >
            {text}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  filledButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
