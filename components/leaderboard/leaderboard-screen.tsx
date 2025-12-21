import { styles } from '@/app/(tabs)/index.styles';
import type { LeaderboardEntry } from '@/data/puzzleApi';
import type { GameScore } from '@/types/game';
import { formatTime, shareScore } from '@/utils/share';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
}: LeaderboardScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.leaderboardScreenTitleContainer}>
          <MaterialCommunityIcons name="trophy" size={24} color="#ffd700" />
          <Text style={styles.leaderboardScreenTitle}>Today&apos;s Leaderboard</Text>
        </View>
        <TouchableOpacity
          style={styles.leaderboardScreenRefreshButton}
          onPress={onRefresh}
          disabled={isRefreshing || loadingFullLeaderboard}
        >
          <Ionicons
            name="refresh"
            size={22}
            color={isRefreshing || loadingFullLeaderboard ? '#666' : '#A855F7'}
          />
        </TouchableOpacity>
      </View>

      {loadingFullLeaderboard && !fullLeaderboardLoaded && fullLeaderboard.length === 0 && (
        <View style={styles.leaderboardScreenLoadingOverlay}>
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={styles.leaderboardScreenLoadingText}>Loading rankings...</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {isRefreshing && fullLeaderboard.length > 0 && (
          <View style={styles.leaderboardScreenRefreshingOverlay}>
            <ActivityIndicator size="small" color="#A855F7" />
          </View>
        )}

        <FlatList
          style={styles.leaderboardScreenContent}
          contentContainerStyle={styles.leaderboardScreenContentContainer}
          data={fullLeaderboard}
          keyExtractor={(item, index) => `${item.rank}-${index}`}
          onEndReached={() => {
            if (fullLeaderboardHasMore && !loadingFullLeaderboard) {
              onLoadMore();
            }
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <>
              {userRank && (
                <View style={styles.userRankBanner}>
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
              )}

              {savedScore && (
                <View style={styles.leaderboardScreenActions}>
                  <TouchableOpacity
                    style={styles.leaderboardScreenShareButton}
                    onPress={() => shareScore(savedScore, userRank)}
                  >
                    <Ionicons name="share-outline" size={20} color="#4ade80" />
                    <Text style={styles.leaderboardScreenShareText}>Share Score</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            loadingFullLeaderboard ? (
              <ActivityIndicator size="large" color="#A855F7" style={{ marginVertical: 40 }} />
            ) : (
              <Text style={styles.leaderboardEmpty}>No scores yet today. Be the first!</Text>
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
                  <MaterialCommunityIcons name="medal" size={28} color="#ffd700" />
                ) : entry.rank === 2 ? (
                  <MaterialCommunityIcons name="medal" size={28} color="#c0c0c0" />
                ) : entry.rank === 3 ? (
                  <MaterialCommunityIcons name="medal" size={28} color="#cd7f32" />
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
                  {entry.correctPlacements}/16 correct - {formatTime(entry.timeSeconds)}
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
            loadingFullLeaderboard && fullLeaderboardLoaded ? (
              <ActivityIndicator size="small" color="#A855F7" style={{ marginVertical: 16 }} />
            ) : fullLeaderboardHasMore && fullLeaderboardLoaded ? (
              <TouchableOpacity
                style={styles.leaderboardCloseButton}
                onPress={onLoadMore}
                disabled={loadingFullLeaderboard}
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
