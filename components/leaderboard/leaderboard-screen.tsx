import { createStyles } from '@/app/(tabs)/index.styles';
import { useThemeScheme } from '@/contexts/theme-context';
import type { LeaderboardEntry } from '@/data/puzzleApi';
import type { GameScore } from '@/types/game';
import { formatTime, shareScore } from '@/utils/share';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LeaderboardTab = 'global' | 'friends';

interface LeaderboardScreenProps {
  fullLeaderboard: LeaderboardEntry[];
  loadingFullLeaderboard: boolean;
  fullLeaderboardLoaded: boolean;
  fullLeaderboardHasMore: boolean;
  isRefreshing: boolean;
  userRank: number | null;
  savedScore: GameScore | null;
  onBack: () => void;
  onRefresh: () => void;
  onLoadMore: () => void;
  isCurrentUserEntry: (entry: LeaderboardEntry) => boolean;
  // Friends leaderboard props
  showFriendsToggle: boolean;
  activeTab: LeaderboardTab;
  onTabChange: (tab: LeaderboardTab) => void;
  friendsLeaderboard: LeaderboardEntry[];
  loadingFriendsLeaderboard: boolean;
  friendsLeaderboardLoaded: boolean;
  friendsLeaderboardHasMore: boolean;
  onLoadMoreFriends: () => void;
}

export function LeaderboardScreen({
  fullLeaderboard,
  loadingFullLeaderboard,
  fullLeaderboardLoaded,
  fullLeaderboardHasMore,
  isRefreshing,
  userRank,
  savedScore,
  onBack,
  onRefresh,
  onLoadMore,
  isCurrentUserEntry,
  showFriendsToggle,
  activeTab,
  onTabChange,
  friendsLeaderboard,
  loadingFriendsLeaderboard,
  friendsLeaderboardLoaded,
  friendsLeaderboardHasMore,
  onLoadMoreFriends,
}: LeaderboardScreenProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  // Determine which data to show based on active tab
  const isGlobalTab = activeTab === 'global';
  const currentData = isGlobalTab ? fullLeaderboard : friendsLeaderboard;
  const currentLoading = isGlobalTab ? loadingFullLeaderboard : loadingFriendsLeaderboard;
  const currentLoaded = isGlobalTab ? fullLeaderboardLoaded : friendsLeaderboardLoaded;
  const currentHasMore = isGlobalTab ? fullLeaderboardHasMore : friendsLeaderboardHasMore;
  const currentLoadMore = isGlobalTab ? onLoadMore : onLoadMoreFriends;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.leaderboardScreenTitleContainer}>
          <MaterialCommunityIcons name="trophy" size={24} color={colorScheme.gold} />
          <Text style={styles.leaderboardScreenTitle}>Today&apos;s Leaderboard</Text>
        </View>
        <TouchableOpacity
          style={styles.leaderboardScreenRefreshButton}
          onPress={onRefresh}
          disabled={isRefreshing || currentLoading}
        >
          <Ionicons
            name="refresh"
            size={22}
            color={isRefreshing || currentLoading ? colorScheme.textMuted : colorScheme.brandPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Tab Bar for Global/Friends */}
      {showFriendsToggle && (
        <View style={styles.leaderboardTabBar}>
          <TouchableOpacity
            style={[styles.leaderboardTab, isGlobalTab && styles.leaderboardTabActive]}
            onPress={() => onTabChange('global')}
          >
            <Text style={[styles.leaderboardTabText, isGlobalTab && styles.leaderboardTabTextActive]}>
              Global
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.leaderboardTab, !isGlobalTab && styles.leaderboardTabActive]}
            onPress={() => onTabChange('friends')}
          >
            <Text style={[styles.leaderboardTabText, !isGlobalTab && styles.leaderboardTabTextActive]}>
              Friends
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {currentLoading && !currentLoaded && currentData.length === 0 && (
        <View style={styles.leaderboardScreenLoadingOverlay}>
          <ActivityIndicator size="large" color={colorScheme.brandPrimary} />
          <Text style={styles.leaderboardScreenLoadingText}>Loading rankings...</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {isRefreshing && currentData.length > 0 && (
          <View style={styles.leaderboardScreenRefreshingOverlay}>
            <ActivityIndicator size="small" color={colorScheme.brandPrimary} />
          </View>
        )}

        <FlatList
          style={styles.leaderboardScreenContent}
          contentContainerStyle={styles.leaderboardScreenContentContainer}
          data={currentData}
          keyExtractor={(item, index) => `${activeTab}-${item.rank}-${index}`}
          onEndReached={() => {
            if (currentHasMore && !currentLoading) {
              currentLoadMore();
            }
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <>
              {isGlobalTab && userRank && (
                <View style={styles.userRankBanner}>
                  <View style={styles.userRankBannerContent}>
                    <Text style={styles.userRankBannerText}>You are ranked</Text>
                    <Text
                      style={styles.userRankBannerValue}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      #{userRank} in the world
                    </Text>
                  </View>
                  {savedScore && (
                    <TouchableOpacity
                      style={styles.userRankShareButton}
                      onPress={() => shareScore(savedScore, userRank)}
                    >
                      <Ionicons name="share-outline" size={18} color={colorScheme.success} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {!isGlobalTab && friendsLeaderboardLoaded && (() => {
                const friendsRank = friendsLeaderboard.find(e => isCurrentUserEntry(e))?.rank;
                return friendsRank ? (
                  <View style={styles.userRankBanner}>
                    <View style={styles.userRankBannerContent}>
                      <Text style={styles.userRankBannerText}>You are ranked</Text>
                      <Text
                        style={styles.userRankBannerValue}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
                        #{friendsRank} among friends
                      </Text>
                    </View>
                    {savedScore && (
                      <TouchableOpacity
                        style={styles.userRankShareButton}
                        onPress={() => shareScore(savedScore, userRank)}
                      >
                        <Ionicons name="share-outline" size={18} color={colorScheme.success} />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null;
              })()}
            </>
          }
          ListEmptyComponent={
            currentLoading ? (
              <ActivityIndicator size="large" color={colorScheme.brandPrimary} style={{ marginVertical: 40 }} />
            ) : (
              <Text style={styles.leaderboardEmpty}>
                {isGlobalTab ? 'No scores yet today. Be the first!' : 'No friends have played today yet.'}
              </Text>
            )
          }
          renderItem={({ item: entry }) => (
            <View
              style={[
                styles.leaderboardFullRow,
                isCurrentUserEntry(entry) && styles.leaderboardFullRowCurrentUser,
              ]}
            >
              <View style={styles.leaderboardFullRank}>
                {entry.rank === 1 ? (
                  <MaterialCommunityIcons name="medal" size={28} color={colorScheme.gold} />
                ) : entry.rank === 2 ? (
                  <MaterialCommunityIcons name="medal" size={28} color={colorScheme.textSecondary} />
                ) : entry.rank === 3 ? (
                  <MaterialCommunityIcons name="medal" size={28} color={colorScheme.orange} />
                ) : (
                  <Text
                    style={styles.leaderboardFullRankText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    #{entry.rank}
                  </Text>
                )}
              </View>
              <View style={styles.leaderboardAvatar}>
                {entry.avatarUrl ? (
                  <Image
                    source={{ uri: entry.avatarUrl }}
                    style={styles.leaderboardAvatarImage}
                  />
                ) : (
                  <Text style={styles.leaderboardAvatarText}>
                    {(entry.displayName || 'A').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.leaderboardFullInfo}>
                <Text
                  style={[
                    styles.leaderboardFullName,
                    isCurrentUserEntry(entry) && styles.leaderboardFullNameCurrentUser,
                  ]}
                  numberOfLines={1}
                >
                  {entry.displayName || 'Anonymous'}
                  {isCurrentUserEntry(entry) && ' (you)'}
                </Text>
                <Text style={styles.leaderboardFullMeta}>
                  {entry.correctPlacements}/16 correct · {entry.mistakes} {entry.mistakes === 1 ? 'mistake' : 'mistakes'} · {formatTime(entry.timeSeconds)}
                </Text>
              </View>
              <Text
                style={[
                  styles.leaderboardFullScore,
                  isCurrentUserEntry(entry) && styles.leaderboardFullScoreCurrentUser,
                ]}
              >
                {entry.score}
              </Text>
            </View>
          )}
          ListFooterComponent={
            currentLoading && currentLoaded ? (
              <ActivityIndicator size="small" color={colorScheme.brandPrimary} style={{ marginVertical: 16 }} />
            ) : currentHasMore && currentLoaded ? (
              <TouchableOpacity
                style={styles.leaderboardCloseButton}
                onPress={currentLoadMore}
                disabled={currentLoading}
              >
                <Text style={styles.leaderboardCloseText}>Load more</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ height: 12 }} />
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
