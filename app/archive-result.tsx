import { createStyles } from '@/app/(tabs)/index.styles';
import { LeaderboardTab, LeaderboardTabToggle } from '@/components/leaderboard/leaderboard-tab-toggle';
import { useAuth } from '@/contexts/auth-context';
import { useThemeScheme } from '@/contexts/theme-context';
import type { LeaderboardEntry } from '@/data/puzzleApi';
import {
  getFriendIds,
  getFriendsLeaderboardPageForDate,
  getLeaderboardForDate,
  getLeaderboardPageForDate,
} from '@/data/puzzleApi';
import { formatPuzzleTitle, getPuzzleNumber } from '@/utils/archive';
import { formatTime } from '@/utils/share';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ArchiveResultScreen() {
  const { colorScheme } = useThemeScheme();
  const sharedStyles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const styles = useMemo(() => createLocalStyles(colorScheme), [colorScheme]);
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ date: string }>();
  const puzzleDate = params.date;

  const [puzzleNumber, setPuzzleNumber] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Global leaderboard state
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [globalLoaded, setGlobalLoaded] = useState(false);
  const [globalFrom, setGlobalFrom] = useState(0);
  const [globalHasMore, setGlobalHasMore] = useState(true);

  // Friends leaderboard state
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendsLoaded, setFriendsLoaded] = useState(false);
  const [friendsFrom, setFriendsFrom] = useState(0);
  const [friendsHasMore, setFriendsHasMore] = useState(true);

  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>('global');
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isCurrentUserEntry = useCallback((entry: LeaderboardEntry): boolean => {
    return entry.isCurrentUser;
  }, []);

  // Load initial data
  useEffect(() => {
    if (!puzzleDate || !user?.id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [number, ids, leaderboardData] = await Promise.all([
          getPuzzleNumber(puzzleDate),
          getFriendIds(user.id),
          getLeaderboardForDate(puzzleDate, user.id),
        ]);

        setPuzzleNumber(number);
        setFriendIds(ids);

        // Find user's rank from initial data
        const userEntry = leaderboardData.find(e => e.isCurrentUser);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }

        // Load first page of global leaderboard
        await loadGlobalLeaderboard({ reset: true });
      } catch (e) {
        console.error('Error loading archive result:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [puzzleDate, user?.id]);

  const loadGlobalLeaderboard = useCallback(async (opts?: { reset?: boolean }) => {
    if (!puzzleDate || !user?.id) return;
    if (loadingGlobal) return;
    if (!globalHasMore && !opts?.reset) return;

    setLoadingGlobal(true);
    try {
      const from = opts?.reset ? 0 : globalFrom;
      const page = await getLeaderboardPageForDate({
        puzzleDate,
        from,
        pageSize: 50,
        currentUserId: user.id,
      });
      setGlobalLeaderboard(prev => (opts?.reset ? page.entries : [...prev, ...page.entries]));
      setGlobalFrom(page.nextFrom);
      setGlobalHasMore(page.hasMore);
      setGlobalLoaded(true);
    } catch (e) {
      console.error('Error loading global leaderboard:', e);
    } finally {
      setLoadingGlobal(false);
    }
  }, [puzzleDate, user?.id, loadingGlobal, globalHasMore, globalFrom]);

  const loadFriendsLeaderboard = useCallback(async (opts?: { reset?: boolean }) => {
    if (!puzzleDate || !user?.id) return;
    if (loadingFriends) return;
    if (!friendsHasMore && !opts?.reset) return;

    setLoadingFriends(true);
    try {
      const from = opts?.reset ? 0 : friendsFrom;
      const page = await getFriendsLeaderboardPageForDate({
        puzzleDate,
        userId: user.id,
        from,
        pageSize: 50,
      });
      setFriendsLeaderboard(prev => (opts?.reset ? page.entries : [...prev, ...page.entries]));
      setFriendsFrom(page.nextFrom);
      setFriendsHasMore(page.hasMore);
      setFriendsLoaded(true);
    } catch (e) {
      console.error('Error loading friends leaderboard:', e);
    } finally {
      setLoadingFriends(false);
    }
  }, [puzzleDate, user?.id, loadingFriends, friendsHasMore, friendsFrom]);

  const refreshLeaderboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      setGlobalFrom(0);
      setGlobalHasMore(true);
      await loadGlobalLeaderboard({ reset: true });

      if (friendsLoaded) {
        setFriendsFrom(0);
        setFriendsHasMore(true);
        await loadFriendsLeaderboard({ reset: true });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [friendsLoaded, loadGlobalLeaderboard, loadFriendsLeaderboard]);

  const handleTabChange = useCallback(async (tab: LeaderboardTab) => {
    setLeaderboardTab(tab);
    if (tab === 'friends' && !friendsLoaded) {
      await loadFriendsLeaderboard({ reset: true });
    }
  }, [friendsLoaded, loadFriendsLeaderboard]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Determine which data to show based on active tab
  const isGlobalTab = leaderboardTab === 'global';
  const currentData = isGlobalTab ? globalLeaderboard : friendsLeaderboard;
  const currentLoading = isGlobalTab ? loadingGlobal : loadingFriends;
  const currentLoaded = isGlobalTab ? globalLoaded : friendsLoaded;
  const currentHasMore = isGlobalTab ? globalHasMore : friendsHasMore;
  const currentLoadMore = isGlobalTab ? () => loadGlobalLeaderboard() : () => loadFriendsLeaderboard();

  if (loading) {
    return (
      <SafeAreaView style={sharedStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorScheme.brandPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sharedStyles.container}>
      {/* Header */}
      <View style={sharedStyles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={handleBack} style={sharedStyles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={sharedStyles.leaderboardScreenTitleContainer}>
          <MaterialCommunityIcons name="calendar" size={24} color={colorScheme.brandPrimary} />
          <Text style={sharedStyles.leaderboardScreenTitle}>
            {puzzleNumber > 0 ? formatPuzzleTitle(puzzleNumber) : 'Archive Puzzle'}
          </Text>
        </View>
        <TouchableOpacity
          style={sharedStyles.leaderboardScreenRefreshButton}
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

      {/* Tab toggle */}
      {friendIds.length > 0 && (
        <LeaderboardTabToggle
          activeTab={leaderboardTab}
          onTabChange={handleTabChange}
        />
      )}

      <View style={{ flex: 1 }}>
        {(isRefreshing || (currentLoading && !currentLoaded)) && (
          <View style={sharedStyles.leaderboardScreenRefreshingOverlay}>
            <ActivityIndicator size="small" color={colorScheme.brandPrimary} />
          </View>
        )}

        <FlatList
          style={sharedStyles.leaderboardScreenContent}
          contentContainerStyle={sharedStyles.leaderboardScreenContentContainer}
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
                <View style={sharedStyles.userRankBanner}>
                  <View style={sharedStyles.userRankBannerContent}>
                    <Text style={sharedStyles.userRankBannerText}>You are ranked</Text>
                    <Text
                      style={sharedStyles.userRankBannerValue}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      #{userRank} in the world
                    </Text>
                  </View>
                </View>
              )}
              {!isGlobalTab && friendsLoaded && (() => {
                const friendsRank = friendsLeaderboard.find(e => isCurrentUserEntry(e))?.rank;
                return friendsRank ? (
                  <View style={sharedStyles.userRankBanner}>
                    <View style={sharedStyles.userRankBannerContent}>
                      <Text style={sharedStyles.userRankBannerText}>You are ranked</Text>
                      <Text
                        style={sharedStyles.userRankBannerValue}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
                        #{friendsRank} among friends
                      </Text>
                    </View>
                  </View>
                ) : null;
              })()}
            </>
          }
          ListEmptyComponent={
            currentLoading ? null : (
              <Text style={sharedStyles.leaderboardEmpty}>
                {isGlobalTab ? 'No scores yet for this puzzle.' : 'No friends have played this puzzle yet.'}
              </Text>
            )
          }
          renderItem={({ item: entry }) => (
            <View
              style={[
                sharedStyles.leaderboardFullRow,
                isCurrentUserEntry(entry) && sharedStyles.leaderboardFullRowCurrentUser,
              ]}
            >
              <View style={sharedStyles.leaderboardFullRank}>
                {entry.rank === 1 ? (
                  <MaterialCommunityIcons name="medal" size={28} color={colorScheme.gold} />
                ) : entry.rank === 2 ? (
                  <MaterialCommunityIcons name="medal" size={28} color={colorScheme.textSecondary} />
                ) : entry.rank === 3 ? (
                  <MaterialCommunityIcons name="medal" size={28} color={colorScheme.orange} />
                ) : (
                  <Text
                    style={sharedStyles.leaderboardFullRankText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    #{entry.rank}
                  </Text>
                )}
              </View>
              <View style={sharedStyles.leaderboardAvatar}>
                {entry.avatarUrl ? (
                  <Image
                    source={{ uri: entry.avatarUrl }}
                    style={sharedStyles.leaderboardAvatarImage}
                  />
                ) : (
                  <Text style={sharedStyles.leaderboardAvatarText}>
                    {(entry.displayName || 'A').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={sharedStyles.leaderboardFullInfo}>
                <View style={sharedStyles.leaderboardFullNameRow}>
                  {entry.level && (
                    <View style={sharedStyles.leaderboardLevelBadge}>
                      <Text style={sharedStyles.leaderboardLevelText}>Lv {entry.level}</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      sharedStyles.leaderboardFullName,
                      isCurrentUserEntry(entry) && sharedStyles.leaderboardFullNameCurrentUser,
                    ]}
                    numberOfLines={1}
                  >
                    {entry.displayName || 'Anonymous'}
                    {isCurrentUserEntry(entry) && ' (you)'}
                  </Text>
                </View>
                <Text style={sharedStyles.leaderboardFullMeta}>
                  {entry.correctPlacements}/16 correct · {entry.mistakes} {entry.mistakes === 1 ? 'mistake' : 'mistakes'} · {formatTime(entry.timeSeconds)}
                </Text>
              </View>
              <Text
                style={[
                  sharedStyles.leaderboardFullScore,
                  isCurrentUserEntry(entry) && sharedStyles.leaderboardFullScoreCurrentUser,
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
                style={sharedStyles.leaderboardCloseButton}
                onPress={currentLoadMore}
                disabled={currentLoading}
              >
                <Text style={sharedStyles.leaderboardCloseText}>Load more</Text>
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

const createLocalStyles = (colorScheme: any) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
