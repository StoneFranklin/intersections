import { useThemeScheme } from '@/contexts/theme-context';
import { FriendRequest } from '@/types/friends';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorScheme } from '@/constants/theme';

interface FriendRequestsListProps {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
  loading: boolean;
  processingId: string | null;
  onAccept: (friendshipId: string) => void;
  onDecline: (friendshipId: string) => void;
  onCancel: (friendshipId: string) => void;
}

export function FriendRequestsList({
  incoming,
  outgoing,
  loading,
  processingId,
  onAccept,
  onDecline,
  onCancel,
}: FriendRequestsListProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorScheme.brandPrimary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  if (incoming.length === 0 && outgoing.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="mail-outline" size={48} color={colorScheme.textMuted} />
        <Text style={styles.emptyText}>No pending friend requests</Text>
      </View>
    );
  }

  const renderIncomingRequest = ({ item }: { item: FriendRequest }) => {
    const isProcessing = processingId === item.id;
    return (
      <View style={styles.requestItem}>
        <View style={styles.userAvatar}>
          {item.user.avatarUrl ? (
            <Image
              source={{ uri: item.user.avatarUrl }}
              style={styles.userAvatarImage}
            />
          ) : (
            <Text style={styles.userAvatarText}>
              {(item.user.displayName || 'U').charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.user.displayName || 'Anonymous'}
          </Text>
          <Text style={styles.requestMeta}>Wants to be your friend</Text>
        </View>
        <View style={styles.requestActions}>
          {isProcessing ? (
            <ActivityIndicator size="small" color={colorScheme.brandPrimary} />
          ) : (
            <>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => onAccept(item.id)}
              >
                <Ionicons name="checkmark" size={20} color={colorScheme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => onDecline(item.id)}
              >
                <Ionicons name="close" size={20} color={colorScheme.error} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderOutgoingRequest = ({ item }: { item: FriendRequest }) => {
    const isProcessing = processingId === item.id;
    return (
      <View style={styles.requestItem}>
        <View style={styles.userAvatar}>
          {item.user.avatarUrl ? (
            <Image
              source={{ uri: item.user.avatarUrl }}
              style={styles.userAvatarImage}
            />
          ) : (
            <Text style={styles.userAvatarText}>
              {(item.user.displayName || 'U').charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.user.displayName || 'Anonymous'}
          </Text>
          <Text style={styles.requestMeta}>Request pending</Text>
        </View>
        <View style={styles.requestActions}>
          {isProcessing ? (
            <ActivityIndicator size="small" color={colorScheme.brandPrimary} />
          ) : (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => onCancel(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      ListHeaderComponent={
        <>
          {incoming.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Incoming ({incoming.length})
              </Text>
              {incoming.map(request => (
                <View key={request.id}>
                  {renderIncomingRequest({ item: request })}
                </View>
              ))}
            </View>
          )}

          {outgoing.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Sent ({outgoing.length})
              </Text>
              {outgoing.map(request => (
                <View key={request.id}>
                  {renderOutgoingRequest({ item: request })}
                </View>
              ))}
            </View>
          )}
        </>
      }
      contentContainerStyle={styles.listContent}
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
    gap: 12,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colorScheme.textMuted,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colorScheme.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colorScheme.borderPrimary,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colorScheme.brandSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
  userAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  requestInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: colorScheme.textPrimary,
  },
  requestMeta: {
    fontSize: 13,
    color: colorScheme.textTertiary,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colorScheme.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colorScheme.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colorScheme.backgroundTertiary,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: colorScheme.textSecondary,
    fontWeight: '500',
  },
});
