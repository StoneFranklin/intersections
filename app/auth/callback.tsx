import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const getCallbackUrl = async (): Promise<string | null> => {
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            return window.location.href;
          }
          return Linking.getInitialURL();
        };

        const urlString = await getCallbackUrl();
        if (!urlString) return;

        // Handle implicit-flow tokens in the URL hash: #access_token=...&refresh_token=...
        const hashIndex = urlString.indexOf('#');
        const hashPart = hashIndex !== -1 ? urlString.substring(hashIndex + 1) : '';
        if (hashPart) {
          const hashParams = new URLSearchParams(hashPart);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Error setting session:', error);
            }
          } else if (accessToken) {
            console.warn('Access token received without refresh token');
          }
        }

        // Handle PKCE flow code in querystring: ?code=...
        try {
          const url = new URL(urlString);
          const code = url.searchParams.get('code');
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('Error exchanging code for session:', error);
            }
          }
        } catch (e) {
          console.error('Error parsing callback URL:', e);
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
      } finally {
        // Clean up the URL on web so tokens/code aren't left in the address bar.
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, '/intersections/');
        }

        // Navigate back to the main app
        router.replace('/(tabs)');
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});
