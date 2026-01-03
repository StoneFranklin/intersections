import { LeaderboardEntry } from '@/data/puzzleApi';
import { GameScore } from '@/types/game';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useThemeScheme } from '@/contexts/theme-context';

export interface LeaderboardCompactProps {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  loaded: boolean;
  isRefreshing?: boolean;
  emptyText?: string;
  isCurrentUserEntry: (entry: LeaderboardEntry) => boolean;
  displayName?: string | null;
  avatarUrl?: string | null;
  level?: number;
  userRank?: number | null;
  savedScore?: GameScore | null;
  showUserRow?: boolean;
}

export function LeaderboardCompact({
  leaderboard,
  loading,
  loaded,
  isRefreshing = false,
  emptyText = 'No scores yet',
  isCurrentUserEntry,
  displayName,
  avatarUrl,
  level,
  userRank,
  savedScore,
  showUserRow = true,
}: LeaderboardCompactProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  if (loading && !loaded) {
    return (
      <View style={styles.leaderboardLoadingContainer}>
        <ActivityIndicator size="small" color={colorScheme.brandPrimary} />
        <Text style={styles.leaderboardLoadingText}>Loading rankings...</Text>
      </View>
    );
  }

  if (leaderboard.length === 0) {
    return <Text style={styles.leaderboardEmptyText}>{emptyText}</Text>;
  }

  return (
    <View style={styles.leaderboardCompact}>
      {isRefreshing && (
        <View style={styles.refreshingOverlay}>
          <ActivityIndicator size="small" color={colorScheme.brandPrimary} />
        </View>
      )}
      {leaderboard.slice(0, 3).map((entry, index) => (
        <View
          key={index}
          style={[
            styles.leaderboardCompactRow,
            isCurrentUserEntry(entry) && styles.leaderboardCompactRowCurrentUser,
          ]}
        >
          <View style={styles.leaderboardCompactRank}>
            {entry.rank === 1 ? (
              <MaterialCommunityIcons name="medal" size={20} color={colorScheme.gold} />
            ) : entry.rank === 2 ? (
              <MaterialCommunityIcons name="medal" size={20} color={colorScheme.textSecondary} />
            ) : entry.rank === 3 ? (
              <MaterialCommunityIcons name="medal" size={20} color={colorScheme.warning} />
            ) : (
              <Text
                style={styles.leaderboardCompactRankText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                #{entry.rank}
              </Text>
            )}
          </View>
          <View style={styles.leaderboardCompactAvatar}>
            {entry.avatarUrl ? (
              <Image
                source={{ uri: entry.avatarUrl }}
                style={styles.leaderboardCompactAvatarImage}
              />
            ) : (
              <Text style={styles.leaderboardCompactAvatarText}>
                {(entry.displayName || 'A').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          {entry.level && (
            <View style={styles.leaderboardCompactLevelBadge}>
              <Text style={styles.leaderboardCompactLevelText}>Lv {entry.level}</Text>
            </View>
          )}
          <View style={styles.leaderboardCompactNameContainer}>
            <Text
              style={[
                styles.leaderboardCompactName,
                isCurrentUserEntry(entry) && styles.leaderboardCompactNameCurrentUser,
              ]}
              numberOfLines={1}
            >
              {(isCurrentUserEntry(entry) && displayName) ? displayName : (entry.displayName || 'Anonymous')}
              {isCurrentUserEntry(entry) && ' (you)'}
            </Text>
          </View>
          <Text style={styles.leaderboardCompactCorrect}>{entry.correctPlacements}/16</Text>
          <Text
            style={[
              styles.leaderboardCompactScore,
              isCurrentUserEntry(entry) && styles.leaderboardCompactScoreCurrentUser,
            ]}
          >
            {entry.score}
          </Text>
        </View>
      ))}

      {showUserRow && userRank && userRank > 3 && savedScore && (
        <>
          <View style={styles.leaderboardDivider}>
            <Text style={styles.leaderboardDividerText}>...</Text>
          </View>
          <View style={[styles.leaderboardCompactRow, styles.leaderboardCompactRowCurrentUser]}>
            <View style={styles.leaderboardCompactRank}>
              <Text
                style={styles.leaderboardCompactRankText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                #{userRank}
              </Text>
            </View>
            <View style={styles.leaderboardCompactAvatar}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.leaderboardCompactAvatarImage}
                />
              ) : (
                <Text style={styles.leaderboardCompactAvatarText}>
                  {(displayName || 'A').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            {level && (
              <View style={styles.leaderboardCompactLevelBadge}>
                <Text style={styles.leaderboardCompactLevelText}>Lv {level}</Text>
              </View>
            )}
            <View style={styles.leaderboardCompactNameContainer}>
              <Text
                style={[styles.leaderboardCompactName, styles.leaderboardCompactNameCurrentUser]}
                numberOfLines={1}
              >
                {displayName || 'Anonymous'} (you)
              </Text>
            </View>
            <Text style={styles.leaderboardCompactCorrect}>{savedScore.correctPlacements}/16</Text>
            <Text style={[styles.leaderboardCompactScore, styles.leaderboardCompactScoreCurrentUser]}>
              {savedScore.score}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const createStyles = (colorScheme: any) => StyleSheet.create({
  leaderboardCompact: {
    gap: 4,
  },
  leaderboardCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  leaderboardCompactRowCurrentUser: {
    backgroundColor: colorScheme.overlayLight,
  },
  leaderboardCompactRank: {
    width: 32,
    alignItems: 'center',
  },
  leaderboardCompactRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: colorScheme.textTertiary,
  },
  leaderboardCompactAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colorScheme.brandSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  leaderboardCompactAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  leaderboardCompactAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
  leaderboardCompactNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 0,
  },
  leaderboardCompactName: {
    fontSize: 14,
    color: colorScheme.textSecondary,
    flexShrink: 1,
  },
  leaderboardCompactNameCurrentUser: {
    color: colorScheme.brandPrimary,
    fontWeight: '600',
  },
  leaderboardCompactLevelBadge: {
    backgroundColor: colorScheme.gold + '20',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colorScheme.gold,
    marginRight: 8,
  },
  leaderboardCompactLevelText: {
    fontSize: 9,
    fontWeight: '700',
    color: colorScheme.gold,
  },
  leaderboardCompactCorrect: {
    fontSize: 12,
    color: colorScheme.textTertiary,
    marginRight: 8,
  },
  leaderboardCompactScore: {
    fontSize: 14,
    fontWeight: '700',
    color: colorScheme.success,
  },
  leaderboardCompactScoreCurrentUser: {
    color: colorScheme.brandPrimary,
  },
  leaderboardDivider: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  leaderboardDividerText: {
    fontSize: 12,
    color: colorScheme.textMuted,
  },
  refreshingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colorScheme.overlayMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  leaderboardLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  leaderboardLoadingText: {
    fontSize: 14,
    color: colorScheme.textTertiary,
  },
  leaderboardEmptyText: {
    fontSize: 14,
    color: colorScheme.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
