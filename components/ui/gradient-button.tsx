import { useThemeScheme } from '@/contexts/theme-context';
import { useResponsiveDimensions } from '@/hooks/use-responsive-dimensions';
import { ColorScheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
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
  const { colorScheme } = useThemeScheme();
  const { isTablet } = useResponsiveDimensions();
  const styles = useMemo(() => createStyles(colorScheme, isTablet), [colorScheme, isTablet]);

  // Logo-aligned gradient colors using theme
  const gradients = {
    primary: ['#FFEB3B', '#FFD700', '#FFC400'] as const,
    secondary: [colorScheme.brandPrimary, colorScheme.brandSecondary] as const,
    success: [colorScheme.success, colorScheme.successDark] as const,
  };

  const disabledGradient = [colorScheme.backgroundTertiary, colorScheme.backgroundSecondary] as const;
  const gradientColors = gradients[variant];

  return (
    <View style={[styles.shadowWrapper, style]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <LinearGradient
          colors={disabled ? disabledGradient : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colorScheme.textPrimary} />
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
    </View>
  );
}

const createStyles = (colorScheme: ColorScheme, isTablet: boolean) => StyleSheet.create({
  shadowWrapper: {
    borderRadius: 16,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: isTablet ? 32 : 24,
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
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: colorScheme.textPrimary,
    marginBottom: 4,
  },
  labelDark: {
    color: colorScheme.warmBlack,
  },
  description: {
    fontSize: isTablet ? 16 : 14,
    color: colorScheme.textSecondary,
  },
  descriptionDark: {
    color: colorScheme.warmGray,
  },
});
