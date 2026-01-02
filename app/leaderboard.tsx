import { createStyles } from '@/app/(tabs)/index.styles';
import { useAuth } from '@/contexts/auth-context';
import { useThemeScheme } from '@/contexts/theme-context';
import type { LeaderboardEntry } from '@/data/puzzleApi';
import {
    getFriendIds,
    getFriendsLeaderboardPage,
    getPercentile,
    getTodayLeaderboard,
    getTodayLeaderboardPage,
    getUserTodayScore,
} from '@/data/puzzleApi';
import type { GameScore } from '@/types/game';
import { formatTime, shareScore } from '@/utils/share';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LeaderboardTab = 'global' | 'friends';

export default function LeaderboardPage() {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const { user } = useAuth();
  const router = useRouter();

  // Leaderboard state
  const [fullLeaderboard, setFullLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingFullLeaderboard, setLoadingFullLeaderboard] = useState(false);
  const [fullLeaderboardLoaded, setFullLeaderboardLoaded] = useState(false);
  const [fullLeaderboardFrom, setFullLeaderboardFrom] = useState(0);
  const [fullLeaderboardHasMore, setFullLeaderboardHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [savedScore, setSavedScore] = useState<GameScore | null>(null);

  // Friends state
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>('global');
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingFriendsLeaderboard, setLoadingFriendsLeaderboard] = useState(false);
  const [friendsLeaderboardLoaded, setFriendsLeaderboardLoaded] = useState(false);
  const [friendsLeaderboardFrom, setFriendsLeaderboardFrom] = useState(0);
  const [friendsLeaderboardHasMore, setFriendsLeaderboardHasMore] = useState(true);

  const isCurrentUserEntry = useCallback((entry: LeaderboardEntry): boolean => {
    if (entry.isCurrentUser) return true;
    if (!user && userRank) {
      return entry.rank === userRank;
    }
    return false;
  }, [user, userRank]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;

      try {
        // Load friend IDs and user's score in parallel
        const [ids, leaderboardData, dbScore] = await Promise.all([
          getFriendIds(user.id),
          getTodayLeaderboard(user.id),
          getUserTodayScore(user.id),
        ]);

        setFriendIds(ids);

        // Find user's rank from leaderboard data
        const userEntry = leaderboardData.find(e => e.isCurrentUser);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }

        // Set saved score for sharing
        if (dbScore) {
          const freshPercentile = await getPercentile(dbScore.score);
          setSavedScore({
            score: dbScore.score,
            timeSeconds: dbScore.timeSeconds,
            mistakes: dbScore.mistakes,
            correctPlacements: dbScore.correctPlacements,
            completed: dbScore.correctPlacements === 16,
            percentile: freshPercentile,
          });
        }

        // Load full leaderboard
        await loadFullLeaderboard({ reset: true });
      } catch (e) {
        console.error('Error loading initial data:', e);
      }
    };

    loadInitialData();
  }, [user]);

  const loadFullLeaderboard = useCallback(async (opts?: { reset?: boolean }) => {
    if (!user) return;
    if (loadingFullLeaderboard) return;
    if (!fullLeaderboardHasMore && !opts?.reset) return;

    setLoadingFullLeaderboard(true);
    try {
      const from = opts?.reset ? 0 : fullLeaderboardFrom;
      const page = await getTodayLeaderboardPage({ from, pageSize: 50, currentUserId: user.id });
      setFullLeaderboard(prev => (opts?.reset ? page.entries : [...prev, ...page.entries]));
      setFullLeaderboardFrom(page.nextFrom);
      setFullLeaderboardHasMore(page.hasMore);
      setFullLeaderboardLoaded(true);
    } catch (e) {
      console.error('Error loading full leaderboard:', e);
    } finally {
      setLoadingFullLeaderboard(false);
    }
  }, [user, loadingFullLeaderboard, fullLeaderboardHasMore, fullLeaderboardFrom]);

  const loadFriendsLeaderboard = useCallback(async (opts?: { reset?: boolean }) => {
    if (!user) return;
    if (loadingFriendsLeaderboard) return;
    if (!friendsLeaderboardHasMore && !opts?.reset) return;

    setLoadingFriendsLeaderboard(true);
    try {
      const from = opts?.reset ? 0 : friendsLeaderboardFrom;
      const page = await getFriendsLeaderboardPage({ userId: user.id, from, pageSize: 50 });
      setFriendsLeaderboard(prev => (opts?.reset ? page.entries : [...prev, ...page.entries]));
      setFriendsLeaderboardFrom(page.nextFrom);
      setFriendsLeaderboardHasMore(page.hasMore);
      setFriendsLeaderboardLoaded(true);
    } catch (e) {
      console.error('Error loading friends leaderboard:', e);
    } finally {
      setLoadingFriendsLeaderboard(false);
    }
  }, [user, loadingFriendsLeaderboard, friendsLeaderboardHasMore, friendsLeaderboardFrom]);

  const refreshLeaderboard = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      // Reset and reload both leaderboards
      setFullLeaderboardFrom(0);
      setFullLeaderboardHasMore(true);
      await loadFullLeaderboard({ reset: true });

      if (friendsLeaderboardLoaded) {
        setFriendsLeaderboardFrom(0);
        setFriendsLeaderboardHasMore(true);
        await loadFriendsLeaderboard({ reset: true });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [user, friendsLeaderboardLoaded, loadFullLeaderboard, loadFriendsLeaderboard]);

  const handleTabChange = useCallback(async (tab: LeaderboardTab) => {
    setLeaderboardTab(tab);
    if (tab === 'friends' && !friendsLeaderboardLoaded) {
      await loadFriendsLeaderboard({ reset: true });
    }
  }, [friendsLeaderboardLoaded, loadFriendsLeaderboard]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Determine which data to show based on active tab
  const isGlobalTab = leaderboardTab === 'global';
  const currentData = isGlobalTab ? fullLeaderboard : friendsLeaderboard;
  const currentLoading = isGlobalTab ? loadingFullLeaderboard : loadingFriendsLeaderboard;
  const currentLoaded = isGlobalTab ? fullLeaderboardLoaded : friendsLeaderboardLoaded;
  const currentHasMore = isGlobalTab ? fullLeaderboardHasMore : friendsLeaderboardHasMore;
  const currentLoadMore = isGlobalTab ? () => loadFullLeaderboard() : () => loadFriendsLeaderboard();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.leaderboardScreenTitleContainer}>
          <MaterialCommunityIcons name="trophy" size={24} color={colorScheme.gold} />
          <Text style={styles.leaderboardScreenTitle}>Today&apos;s Leaderboard</Text>
        </View>
        <TouchableOpacity
          style={styles.leaderboardScreenRefreshButton}
          onPress={refreshLeaderboard}
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
      {friendIds.length > 0 && (
        <View style={styles.leaderboardTabBar}>
          <TouchableOpacity
            style={[styles.leaderboardTab, isGlobalTab && styles.leaderboardTabActive]}
            onPress={() => handleTabChange('global')}
          >
            <Text style={[styles.leaderboardTabText, isGlobalTab && styles.leaderboardTabTextActive]}>
              Global
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.leaderboardTab, !isGlobalTab && styles.leaderboardTabActive]}
            onPress={() => handleTabChange('friends')}
          >
            <Text style={[styles.leaderboardTabText, !isGlobalTab && styles.leaderboardTabTextActive]}>
              Friends
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {(isRefreshing || (currentLoading && !currentLoaded)) && (
          <View style={styles.leaderboardScreenRefreshingOverlay}>
            <ActivityIndicator size="small" color={colorScheme.brandPrimary} />
          </View>
        )}

        <FlatList
          style={styles.leaderboardScreenContent}
          contentContainerStyle={styles.leaderboardScreenContentContainer}
          data={currentData}
          keyExtractor={(item, index) => `${leaderboardTab}-${item.rank}-${index}`}
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
            currentLoading ? null : (
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
              {entry.level && (
                <View style={styles.leaderboardLevelBadge}>
                  <Text style={styles.leaderboardLevelText}>Lv {entry.level}</Text>
                </View>
              )}
              <View style={styles.leaderboardFullInfo}>
                <View style={styles.leaderboardFullNameRow}>
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
                </View>
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
            currentLoading && currentLoaded && !isRefreshing ? (
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
