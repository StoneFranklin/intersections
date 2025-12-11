import { AuthProvider } from '@/contexts/auth-context';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

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
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
});
