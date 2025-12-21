import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface GradientButtonProps {
  onPress: () => void;
  label: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success';
  style?: ViewStyle;
  labelStyle?: TextStyle;
  icon?: React.ReactNode;
}

// Logo-aligned gradient colors
const GRADIENTS = {
  primary: ['#FFD700', '#FF9500'] as const,    // Yellow to Orange (logo gradient)
  secondary: ['#A855F7', '#7C3AED'] as const,  // Purple gradient (logo accent)
  success: ['#4ade80', '#22c55e'] as const,    // Green gradient
};

export function GradientButton({
  onPress,
  label,
  description,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  labelStyle,
  icon,
}: GradientButtonProps) {
  const gradientColors = GRADIENTS[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.touchable, style]}
    >
      <LinearGradient
        colors={disabled ? ['#3a3a5e', '#2a2a4e'] : gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[
              styles.label,
              labelStyle,
              variant === 'primary' && styles.labelDark,
            ]}>
              {label}
            </Text>
            {description && (
              <Text style={[
                styles.description,
                variant === 'primary' && styles.descriptionDark,
              ]}>
                {description}
              </Text>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  labelDark: {
    color: '#1a1000',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  descriptionDark: {
    color: 'rgba(26, 16, 0, 0.7)',
  },
});
