import { useAuth } from '@/contexts/auth-context';
import { useThemeScheme } from '@/contexts/theme-context';
import { isUserAdmin } from '@/data/puzzleApi';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

export default function AdminLayout() {
  const { colorScheme } = useThemeScheme();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/');
      return;
    }

    if (authLoading) return;

    if (!user) {
      router.replace('/');
      return;
    }

    let cancelled = false;
    isUserAdmin(user.id).then((admin) => {
      if (cancelled) return;
      setIsAdmin(admin);
      setCheckingAdmin(false);
      if (!admin) {
        router.replace('/');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, router]);

  if (Platform.OS !== 'web' || authLoading || checkingAdmin || !isAdmin) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colorScheme.backgroundPrimary }]}>
        <ActivityIndicator size="large" color={colorScheme.brandPrimary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colorScheme.backgroundPrimary },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[date]" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
