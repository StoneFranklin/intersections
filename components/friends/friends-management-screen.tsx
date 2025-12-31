import { useThemeScheme } from '@/contexts/theme-context';
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  getFriendRequests,
  getFriends,
  getPendingRequestCount,
  removeFriend,
} from '@/data/puzzleApi';
import { Friend, FriendRequest } from '@/types/friends';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ColorScheme } from '@/constants/theme';
import { FriendRequestsList } from './friend-requests-list';
import { FriendsList } from './friends-list';
import { UserSearchModal } from './user-search-modal';

interface FriendsManagementScreenProps {
  userId: string;
  onBack: () => void;
  onFriendsChanged?: () => void;
}

type TabType = 'friends' | 'requests';

export function FriendsManagementScreen({
  userId,
  onBack,
  onFriendsChanged,
}: FriendsManagementScreenProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [focusKey, setFocusKey] = useState(0);

  // Reset to friends tab and reset child component state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setActiveTab('friends');
      setFocusKey(prev => prev + 1);
    }, [])
  );

  // Friends data
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [isRefreshingFriends, setIsRefreshingFriends] = useState(false);
  const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);

  // Requests data
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isRefreshingRequests, setIsRefreshingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const loadFriends = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshingFriends(true);
    } else {
      setLoadingFriends(true);
    }

    try {
      const friendsData = await getFriends(userId);
      setFriends(friendsData);
    } finally {
      setLoadingFriends(false);
      setIsRefreshingFriends(false);
    }
  }, [userId]);

  const loadRequests = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshingRequests(true);
    } else {
      setLoadingRequests(true);
    }

    try {
      const [requestsData, count] = await Promise.all([
        getFriendRequests(userId),
        getPendingRequestCount(userId),
      ]);
      setIncomingRequests(requestsData.incoming);
      setOutgoingRequests(requestsData.outgoing);
      setPendingCount(count);
    } finally {
      setLoadingRequests(false);
      setIsRefreshingRequests(false);
    }
  }, [userId]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([loadFriends(true), loadRequests(true)]);
  }, [loadFriends, loadRequests]);

  const isRefreshing = activeTab === 'friends' ? isRefreshingFriends : isRefreshingRequests;

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, [loadFriends, loadRequests]);

  const handleAcceptRequest = useCallback(async (friendshipId: string) => {
    setProcessingRequestId(friendshipId);
    try {
      const result = await acceptFriendRequest(friendshipId, userId);
      if (result.success) {
        await Promise.all([loadFriends(), loadRequests()]);
        onFriendsChanged?.();
      }
    } finally {
      setProcessingRequestId(null);
    }
  }, [userId, loadFriends, loadRequests, onFriendsChanged]);

  const handleDeclineRequest = useCallback(async (friendshipId: string) => {
    setProcessingRequestId(friendshipId);
    try {
      const result = await declineFriendRequest(friendshipId, userId);
      if (result.success) {
        await loadRequests();
      }
    } finally {
      setProcessingRequestId(null);
    }
  }, [userId, loadRequests]);

  const handleCancelRequest = useCallback(async (friendshipId: string) => {
    setProcessingRequestId(friendshipId);
    try {
      const result = await cancelFriendRequest(friendshipId, userId);
      if (result.success) {
        await loadRequests();
      }
    } finally {
      setProcessingRequestId(null);
    }
  }, [userId, loadRequests]);

  const handleRemoveFriend = useCallback(async (friendshipId: string) => {
    setRemovingFriendId(friendshipId);
    try {
      const result = await removeFriend(friendshipId, userId);
      if (result.success) {
        await loadFriends();
        onFriendsChanged?.();
      }
    } finally {
      setRemovingFriendId(null);
    }
  }, [userId, loadFriends, onFriendsChanged]);

  const handleRequestSent = useCallback(async () => {
    await loadRequests();
  }, [loadRequests]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="people" size={24} color={colorScheme.brandPrimary} />
          <Text style={styles.headerTitle}>Friends</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.refreshButton}
            disabled={isRefreshing}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={isRefreshing ? colorScheme.textMuted : colorScheme.brandPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSearchModal(true)}
            style={styles.addButton}
          >
            <Ionicons name="person-add" size={22} color={colorScheme.success} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Requests
          </Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'friends' ? (
          <FriendsList
            friends={friends}
            loading={loadingFriends}
            onRemove={handleRemoveFriend}
            onRefresh={() => loadFriends(true)}
            isRefreshing={isRefreshingFriends}
            removingId={removingFriendId}
            resetKey={focusKey}
          />
        ) : (
          <FriendRequestsList
            incoming={incomingRequests}
            outgoing={outgoingRequests}
            loading={loadingRequests}
            processingId={processingRequestId}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
            onCancel={handleCancelRequest}
          />
        )}
      </View>

      {/* Search Modal */}
      <UserSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        currentUserId={userId}
        onRequestSent={handleRequestSent}
      />
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colorScheme.borderPrimary,
  },
  backButton: {
    padding: 8,
    width: 44,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshButton: {
    padding: 8,
  },
  addButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colorScheme.borderPrimary,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colorScheme.brandPrimary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: colorScheme.textTertiary,
  },
  tabTextActive: {
    color: colorScheme.brandPrimary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colorScheme.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
  content: {
    flex: 1,
  },
});
