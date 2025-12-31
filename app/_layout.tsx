import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/auth-context';
import { AppThemeProvider, useThemeScheme } from '@/contexts/theme-context';
import { requestNotificationPermissions, scheduleNotificationForToday } from '@/utils/notificationService';
import { parseNotificationData } from '@/utils/pushNotificationService';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

// Import global CSS for web
if (Platform.OS === 'web') {
  require('../assets/global.css');
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // Load icon fonts for all platforms including web
  const [fontsLoaded] = useFonts({
    'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
    'MaterialCommunityIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
    'AntDesign': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf'),
    'MaterialIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Initialize notifications on app start
    const initNotifications = async () => {
      if (Platform.OS !== 'web') {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          await scheduleNotificationForToday();
        }
      }
    };

    initNotifications();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      {Platform.OS === 'web' && (
        <Head>
          <title>Intersections</title>
        </Head>
      )}
      <AuthProvider>
        <AppThemeProvider>
          <SafeAreaProvider>
            <RootLayoutContent />
          </SafeAreaProvider>
        </AppThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function RootLayoutContent() {
  const { colorScheme } = useThemeScheme();
  const router = useRouter();
  const notificationResponseListener = useRef<Notifications.EventSubscription>();

  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: colorScheme.backgroundPrimary,
        card: colorScheme.backgroundPrimary,
      },
    }),
    [colorScheme]
  );

  // Handle notification responses (when user taps on a notification)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Handle notification that was tapped while app was in background/killed
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = parseNotificationData(response);
        if (data?.type === 'friend_request') {
          router.push('/friends');
        } else if (data?.type === 'puzzle_completion') {
          router.push('/explore');
        }
      }
    });

    // Handle notification taps while app is running
    notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = parseNotificationData(response);
        if (data?.type === 'friend_request') {
          router.push('/friends');
        } else if (data?.type === 'puzzle_completion') {
          router.push('/explore');
        }
      }
    );

    return () => {
      if (notificationResponseListener.current) {
        Notifications.removeNotificationSubscription(notificationResponseListener.current);
      }
    };
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.backgroundPrimary }]}>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: colorScheme.backgroundPrimary } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false, title: 'Intersections' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="how-to-play" options={{ headerShown: false, title: 'How to Play' }} />
          <Stack.Screen name="privacy" options={{ headerShown: false, title: 'Privacy Policy' }} />
          <Stack.Screen name="terms" options={{ headerShown: false, title: 'Terms of Service' }} />
          <Stack.Screen name="about" options={{ headerShown: false, title: 'About' }} />
          <Stack.Screen name="contact" options={{ headerShown: false, title: 'Contact Us' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
