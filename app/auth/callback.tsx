import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the full URL to extract the tokens
        const url = await Linking.getInitialURL();
        
        if (url) {
          // Parse the URL to get fragments (tokens come after #)
          const parsedUrl = Linking.parse(url);
          
          // Check for tokens in the hash fragment
          if (parsedUrl.queryParams) {
            const accessToken = parsedUrl.queryParams.access_token as string;
            const refreshToken = parsedUrl.queryParams.refresh_token as string;

            if (accessToken && refreshToken) {
              // Set the session with the tokens from the URL
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) {
                console.error('Error setting session:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
      } finally {
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
