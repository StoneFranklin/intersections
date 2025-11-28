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
    <View style={styles.container}>
      <ThemeProvider value={customDarkTheme}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: '#0f0f1a' } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
});
