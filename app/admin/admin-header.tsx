import { useThemeScheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createAdminStyles } from './admin.styles';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  /** If provided, back button navigates here instead of router.back() */
  onBack?: () => void;
}

export function AdminHeader({ title, subtitle, onBack }: AdminHeaderProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createAdminStyles(colorScheme), [colorScheme]);
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={onBack ?? (() => router.back())}
        >
          <Ionicons name="arrow-back" size={20} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Ionicons name="shield-checkmark" size={22} color={colorScheme.brandPrimary} />
    </View>
  );
}
