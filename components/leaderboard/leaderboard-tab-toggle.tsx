import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { useThemeScheme } from '@/contexts/theme-context';

export type LeaderboardTab = 'global' | 'friends';

interface LeaderboardTabToggleProps {
  activeTab: LeaderboardTab;
  onTabChange: (tab: LeaderboardTab) => void;
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  tabActiveStyle?: ViewStyle;
  tabTextStyle?: TextStyle;
  tabTextActiveStyle?: TextStyle;
}

export function LeaderboardTabToggle({
  activeTab,
  onTabChange,
  containerStyle,
  tabStyle,
  tabActiveStyle,
  tabTextStyle,
  tabTextActiveStyle,
}: LeaderboardTabToggleProps) {
  const { colorScheme } = useThemeScheme();
  const isGlobalTab = activeTab === 'global';

  // Default styles based on theme
  const defaultContainerStyle = useMemo(
    () => ({
      flexDirection: 'row' as const,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 8,
      backgroundColor: colorScheme.backgroundTertiary,
      borderRadius: 14,
      padding: 3,
    }),
    [colorScheme]
  );

  const defaultTabStyle = useMemo(
    () => ({
      flex: 1,
      paddingVertical: 6,
      alignItems: 'center' as const,
      borderRadius: 11,
    }),
    []
  );

  const defaultTabActiveStyle = useMemo(
    () => ({
      backgroundColor: colorScheme.brandPrimary,
    }),
    [colorScheme]
  );

  const defaultTabTextStyle = useMemo(
    () => ({
      fontSize: 12,
      fontWeight: '500' as const,
      color: colorScheme.textTertiary,
    }),
    [colorScheme]
  );

  const defaultTabTextActiveStyle = useMemo(
    () => ({
      color: colorScheme.textPrimary,
      fontWeight: '600' as const,
    }),
    [colorScheme]
  );

  return (
    <View style={[defaultContainerStyle, containerStyle]}>
      <TouchableOpacity
        style={[defaultTabStyle, tabStyle, isGlobalTab && (tabActiveStyle || defaultTabActiveStyle)]}
        onPress={(e) => {
          e.stopPropagation();
          onTabChange('global');
        }}
      >
        <Text style={[defaultTabTextStyle, tabTextStyle, isGlobalTab && (tabTextActiveStyle || defaultTabTextActiveStyle)]}>
          Global
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[defaultTabStyle, tabStyle, !isGlobalTab && (tabActiveStyle || defaultTabActiveStyle)]}
        onPress={(e) => {
          e.stopPropagation();
          onTabChange('friends');
        }}
      >
        <Text style={[defaultTabTextStyle, tabTextStyle, !isGlobalTab && (tabTextActiveStyle || defaultTabTextActiveStyle)]}>
          Friends
        </Text>
      </TouchableOpacity>
    </View>
  );
}
