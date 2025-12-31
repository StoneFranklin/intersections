import { useThemeScheme } from '@/contexts/theme-context';
import { searchUsers, sendFriendRequest } from '@/data/puzzleApi';
import { UserSearchResult } from '@/types/friends';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ColorScheme } from '@/constants/theme';

interface UserSearchModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserId: string;
  onRequestSent: () => void;
}

export function UserSearchModal({
  visible,
  onClose,
  currentUserId,
  onRequestSent,
}: UserSearchModalProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const results = await searchUsers(currentUserId, searchQuery.trim());
      setSearchResults(results);
    } catch (e) {
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, searchQuery]);

  const handleSendRequest = useCallback(async (userId: string) => {
    setSendingTo(userId);
    setError(null);

    try {
      const result = await sendFriendRequest(currentUserId, userId);
      if (result.success) {
        // Update local state to show pending
        setSearchResults(prev =>
          prev.map(user =>
            user.id === userId
              ? { ...user, friendshipStatus: 'pending_outgoing' as const }
              : user
          )
        );
        onRequestSent();
      } else {
        setError(result.error || 'Failed to send request');
      }
    } catch (e) {
      setError('Failed to send friend request');
    } finally {
      setSendingTo(null);
    }
  }, [currentUserId, onRequestSent]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setSearchPerformed(false);
    onClose();
  }, [onClose]);

  const renderStatusButton = useCallback((user: UserSearchResult) => {
    const isSending = sendingTo === user.id;

    switch (user.friendshipStatus) {
      case 'accepted':
        return (
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colorScheme.success} />
            <Text style={styles.statusBadgeText}>Friends</Text>
          </View>
        );
      case 'pending_outgoing':
        return (
          <View style={styles.statusBadgePending}>
            <Ionicons name="time" size={16} color={colorScheme.warning} />
            <Text style={styles.statusBadgePendingText}>Pending</Text>
          </View>
        );
      case 'pending_incoming':
        return (
          <View style={styles.statusBadgeIncoming}>
            <Ionicons name="mail" size={16} color={colorScheme.brandPrimary} />
            <Text style={styles.statusBadgeIncomingText}>Wants to add you</Text>
          </View>
        );
      default:
        return (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleSendRequest(user.id)}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colorScheme.textPrimary} />
            ) : (
              <>
                <Ionicons name="person-add" size={16} color={colorScheme.textPrimary} />
                <Text style={styles.addButtonText}>Add</Text>
              </>
            )}
          </TouchableOpacity>
        );
    }
  }, [colorScheme, handleSendRequest, sendingTo, styles]);

  const renderUserItem = useCallback(({ item }: { item: UserSearchResult }) => (
    <View style={styles.userItem}>
      <View style={styles.userAvatar}>
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={styles.userAvatarImage}
          />
        ) : (
          <Text style={styles.userAvatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <Text style={styles.userName} numberOfLines={1}>
        {item.displayName}
      </Text>
      {renderStatusButton(item)}
    </View>
  ), [renderStatusButton, styles]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Friend</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colorScheme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Search by display name</Text>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Enter display name..."
              placeholderTextColor={colorScheme.textMuted}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={!searchQuery.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colorScheme.textPrimary} />
              ) : (
                <Ionicons name="search" size={20} color={colorScheme.textPrimary} />
              )}
            </TouchableOpacity>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              renderItem={renderUserItem}
              style={styles.resultsList}
              contentContainerStyle={styles.resultsContent}
            />
          )}

          {searchPerformed && !loading && searchResults.length === 0 && (
            <Text style={styles.emptyText}>
              No users found matching &quot;{searchQuery}&quot;
            </Text>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colorScheme: ColorScheme) => StyleSheet.create({
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
    padding: 20,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colorScheme.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colorScheme.textTertiary,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colorScheme.backgroundTertiary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colorScheme.textPrimary,
    borderWidth: 1,
    borderColor: colorScheme.borderSecondary,
  },
  searchButton: {
    backgroundColor: colorScheme.brandPrimary,
    borderRadius: 8,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: colorScheme.backgroundTertiary,
  },
  errorText: {
    color: colorScheme.error,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultsList: {
    maxHeight: 300,
    marginTop: 4,
  },
  resultsContent: {
    paddingBottom: 4,
  },
  emptyText: {
    color: colorScheme.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme.backgroundTertiary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: colorScheme.textPrimary,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme.successBg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 13,
    color: colorScheme.success,
    fontWeight: '500',
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme.warningBg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgePendingText: {
    fontSize: 13,
    color: colorScheme.warning,
    fontWeight: '500',
  },
  statusBadgeIncoming: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme.brandLight + '20',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeIncomingText: {
    fontSize: 13,
    color: colorScheme.brandPrimary,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: colorScheme.textTertiary,
  },
});
