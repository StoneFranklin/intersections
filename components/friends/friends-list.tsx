import { useThemeScheme } from '@/contexts/theme-context';
import { Friend } from '@/types/friends';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
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
  resetKey?: number;
}

export function FriendsList({
  friends,
  loading,
  onRemove,
  onRefresh,
  isRefreshing,
  removingId,
  resetKey,
}: FriendsListProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);

  // Reset expanded state when resetKey changes (e.g., on screen focus)
  React.useEffect(() => {
    setExpandedId(null);
    setFriendToRemove(null);
  }, [resetKey]);

  const handleRemovePress = useCallback((friend: Friend) => {
    setFriendToRemove(friend);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (friendToRemove) {
      onRemove(friendToRemove.friendshipId);
      setFriendToRemove(null);
      setExpandedId(null);
    }
  }, [friendToRemove, onRemove]);

  const handleCancelRemove = useCallback(() => {
    setFriendToRemove(null);
  }, []);

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
          {item.avatarUrl ? (
            <Image
              source={{ uri: item.avatarUrl }}
              style={styles.friendAvatarImage}
            />
          ) : (
            <Text style={styles.friendAvatarText}>
              {(item.displayName || 'A').charAt(0).toUpperCase()}
            </Text>
          )}
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
    <>
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

      {/* Remove Friend Confirmation Modal */}
      <Modal
        visible={!!friendToRemove}
        animationType="fade"
        transparent
        onRequestClose={handleCancelRemove}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="person-remove" size={32} color={colorScheme.error} />
            </View>
            <Text style={styles.modalTitle}>Remove Friend</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove{' '}
              <Text style={styles.modalFriendName}>
                {friendToRemove?.displayName || 'this friend'}
              </Text>
              ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelRemove}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalRemoveButton}
                onPress={handleConfirmRemove}
              >
                <Text style={styles.modalRemoveText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  friendAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: colorScheme.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colorScheme.backgroundSecondary,
    borderRadius: 16,
    padding: 24,
    maxWidth: 320,
    width: '100%',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colorScheme.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colorScheme.textPrimary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: colorScheme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalFriendName: {
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colorScheme.backgroundTertiary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colorScheme.textSecondary,
  },
  modalRemoveButton: {
    flex: 1,
    backgroundColor: colorScheme.error,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalRemoveText: {
    fontSize: 15,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
});
