import { useThemeScheme } from '@/contexts/theme-context';
import { Friend } from '@/types/friends';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorScheme } from '@/constants/theme';

interface FriendsListProps {
  friends: Friend[];
  loading: boolean;
  onRemove: (friendshipId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  removingId: string | null;
}

export function FriendsList({
  friends,
  loading,
  onRemove,
  onRefresh,
  isRefreshing,
  removingId,
}: FriendsListProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRemovePress = (friend: Friend) => {
    if (Platform.OS === 'web') {
      // Simple confirm on web
      if (confirm(`Remove ${friend.displayName || 'this friend'}?`)) {
        onRemove(friend.friendshipId);
      }
    } else {
      Alert.alert(
        'Remove Friend',
        `Are you sure you want to remove ${friend.displayName || 'this friend'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => onRemove(friend.friendshipId) },
        ]
      );
    }
  };

  if (loading && friends.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorScheme.brandPrimary} />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={48} color={colorScheme.textMuted} />
        <Text style={styles.emptyText}>No friends yet</Text>
        <Text style={styles.emptySubtext}>
          Add friends to see their scores on the leaderboard
        </Text>
      </View>
    );
  }

  const renderFriend = ({ item }: { item: Friend }) => {
    const isExpanded = expandedId === item.id;
    const isRemoving = removingId === item.friendshipId;

    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.friendAvatar}>
          <Text style={styles.friendAvatarText}>
            {(item.displayName || 'A').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName} numberOfLines={1}>
            {item.displayName || 'Anonymous'}
          </Text>
        </View>

        {isRemoving ? (
          <ActivityIndicator size="small" color={colorScheme.error} />
        ) : isExpanded ? (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemovePress(item)}
          >
            <Ionicons name="person-remove" size={18} color={colorScheme.error} />
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colorScheme.textMuted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={friends}
      keyExtractor={item => item.id}
      renderItem={renderFriend}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colorScheme.brandPrimary}
          colors={[colorScheme.brandPrimary]}
        />
      }
      ListHeaderComponent={
        <Text style={styles.listHeader}>
          {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
        </Text>
      }
    />
  );
}

const createStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: colorScheme.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colorScheme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colorScheme.textMuted,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  listHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colorScheme.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colorScheme.borderPrimary,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colorScheme.brandSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: colorScheme.textPrimary,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme.errorBg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colorScheme.error,
  },
});
