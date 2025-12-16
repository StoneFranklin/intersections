import { AuthProvider } from '@/contexts/auth-context';
import { requestNotificationPermissions, scheduleNotificationForToday } from '@/utils/notificationService';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
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

// Custom dark theme with our background color
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0f0f1a',
    card: '#0f0f1a',
  },
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
    <AuthProvider>
      <SafeAreaProvider>
        <View style={styles.container}>
          <ThemeProvider value={customDarkTheme}>
            <Stack screenOptions={{ contentStyle: { backgroundColor: '#0f0f1a' } }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="about" options={{ headerShown: false, title: 'About Intersections' }} />
              <Stack.Screen name="how-to-play" options={{ headerShown: false, title: 'How to Play' }} />
              <Stack.Screen name="privacy" options={{ headerShown: false, title: 'Privacy Policy' }} />
              <Stack.Screen name="terms" options={{ headerShown: false, title: 'Terms of Service' }} />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
});
