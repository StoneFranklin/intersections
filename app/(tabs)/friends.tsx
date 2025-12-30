import { FriendsManagementScreen } from '@/components/friends/friends-management-screen';
import { useAuth } from '@/contexts/auth-context';
import { getFriendIds, getPendingRequestCount } from '@/data/puzzleApi';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

export default function FriendsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFriendsChanged = useCallback(async () => {
    if (!user) return;
    // Reload friend data - this will be fresh on next navigation anyway
    // but we refresh here for immediate feedback
    try {
      await Promise.all([
        getPendingRequestCount(user.id),
        getFriendIds(user.id),
      ]);
    } catch (e) {
      // Silently fail - data will refresh on next navigation
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <FriendsManagementScreen
      userId={user.id}
      onBack={handleBack}
      onFriendsChanged={handleFriendsChanged}
    />
  );
}
