import { FriendsManagementScreen } from '@/components/friends/friends-management-screen';
import { useAuth } from '@/contexts/auth-context';
import { getFriendIds, getPendingRequestCount } from '@/data/puzzleApi';
import { Redirect, useRouter } from 'expo-router';
import { useCallback } from 'react';

export default function FriendsScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show nothing while auth is loading
  if (loading) {
    return null;
  }

  // Redirect to home if not logged in (using Redirect component instead of router.replace)
  if (!user) {
    return <Redirect href="/" />;
  }

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

  return (
    <FriendsManagementScreen
      userId={user.id}
      onBack={handleBack}
      onFriendsChanged={handleFriendsChanged}
    />
  );
}
