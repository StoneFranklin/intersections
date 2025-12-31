import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { getExpoPushToken, setupNotificationChannels } from '@/utils/pushNotificationService';
import { registerPushToken, unregisterPushToken } from '@/data/puzzleApi';
import { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Required for expo-web-browser to properly dismiss
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ensure user has a profile row (creates one if missing)
// Also updates avatar_url from OAuth provider metadata
async function ensureProfile(userId: string, avatarUrl?: string | null) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (!data) {
      // Create profile if it doesn't exist
      await supabase.from('profiles').insert({
        id: userId,
        avatar_url: avatarUrl || null,
      });
    } else if (avatarUrl && !data.avatar_url) {
      // Update avatar_url if we have one from OAuth but profile doesn't have one yet
      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);
    }
  } catch (e) {
    logger.error('Error ensuring profile:', e);
  }
}

// Register push token for the user
async function registerUserPushToken(userId: string) {
  if (Platform.OS === 'web') return;

  try {
    // Set up notification channels for Android
    await setupNotificationChannels();

    // Get the Expo Push Token
    const pushToken = await getExpoPushToken();

    if (pushToken) {
      await registerPushToken(userId, pushToken);
    }
  } catch (e) {
    logger.error('Error registering push token:', e);
  }
}

// Unregister push token for the user (on sign out)
async function unregisterUserPushToken(userId: string) {
  if (Platform.OS === 'web') return;

  try {
    await unregisterPushToken(userId);
  } catch (e) {
    logger.error('Error unregistering push token:', e);
  }
}

// Extract session from URL (handles both hash and query params)
function extractSessionFromUrl(url: string): { accessToken: string | null; refreshToken: string | null } {
  try {
    // For exp:// URLs, we need to handle them specially
    // The hash/params might be after the path
    let hashPart = '';
    let queryPart = '';

    // Check if there's a # in the URL
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      hashPart = url.substring(hashIndex + 1);
    }

    // Check if there's a ? in the URL
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const endIndex = hashIndex !== -1 ? hashIndex : url.length;
      queryPart = url.substring(queryIndex + 1, endIndex);
    }

    // Try hash fragment first (implicit flow)
    if (hashPart) {
      const hashParams = new URLSearchParams(hashPart);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken) {
        return { accessToken, refreshToken };
      }
    }

    // Try query params (PKCE flow or alternative)
    if (queryPart) {
      const queryParams = new URLSearchParams(queryPart);
      const accessToken = queryParams.get('access_token');
      const refreshToken = queryParams.get('refresh_token');
      if (accessToken) {
        return { accessToken, refreshToken };
      }
    }

    return { accessToken: null, refreshToken: null };
  } catch (e) {
    logger.error('Error parsing URL:', e);
    return { accessToken: null, refreshToken: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!isMountedRef.current) return;

      // Handle invalid session (e.g., expired refresh token)
      if (error) {
        logger.error('Error getting initial session:', error);
        // Sign out to clear the invalid session
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Extract avatar URL from OAuth provider metadata
        const avatarUrl = session.user.user_metadata?.avatar_url ||
                         session.user.user_metadata?.picture || null;
        ensureProfile(session.user.id, avatarUrl);
        // Register push token for push notifications
        registerUserPushToken(session.user.id);
      }
      setLoading(false);
    }).catch(async (error) => {
      logger.error('Exception getting initial session:', error);
      // Clear any invalid session state
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) return;
        setSession(session);
        setUser(session?.user ?? null);
        // Create profile and register push token on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          // Extract avatar URL from OAuth provider metadata
          const avatarUrl = session.user.user_metadata?.avatar_url ||
                           session.user.user_metadata?.picture || null;
          ensureProfile(session.user.id, avatarUrl);
          // Register push token for push notifications
          registerUserPushToken(session.user.id);
        }
        setLoading(false);
      }
    );

    // Listen for deep links (for OAuth callback on native)
    const handleDeepLink = async (event: { url: string }) => {
      if (!isMountedRef.current) return;
      if (event.url.includes('auth/callback') || event.url.includes('access_token') || event.url.includes('code=')) {
        // First try PKCE code exchange (preferred)
        try {
          const url = new URL(event.url);
          const code = url.searchParams.get('code');
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              logger.error('Deep link PKCE exchange error:', error);
            }
            return;
          }
        } catch (e) {
          logger.error('Error parsing deep link URL:', e);
        }

        // Fallback to token extraction
        const { accessToken, refreshToken } = extractSessionFromUrl(event.url);
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else if (accessToken) {
          logger.error('Deep link has access token but no refresh token');
        }
      }
    };

    // Add URL listener for native
    const urlSubscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a URL (cold start)
    Linking.getInitialURL().then((url) => {
      if (!isMountedRef.current) return;
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
      urlSubscription.remove();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (Platform.OS === 'web') {
      // Web: Use OAuth redirect through Supabase
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        logger.error('Error signing in with Google:', error.message);
        throw error;
      }
    } else {
      // Native: Use Supabase OAuth with custom scheme redirect
      try {
        const redirectTo = 'intersections://auth/callback';

        // Get the OAuth URL from Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectTo,
            skipBrowserRedirect: true,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) throw error;
        if (!data.url) throw new Error('No OAuth URL returned');

        // Open browser for authentication
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        if (result.type === 'success' && result.url) {
          // Extract tokens from the redirect URL
          const { accessToken, refreshToken } = extractSessionFromUrl(result.url);

          // First, try to get code for PKCE flow (preferred on native)
          const resultUrl = new URL(result.url);
          const code = resultUrl.searchParams.get('code');

          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              logger.error('Exchange error:', exchangeError);
              Alert.alert('Sign In Error', exchangeError.message);
            }
          } else if (accessToken && refreshToken) {
            // Only use setSession if we have BOTH tokens
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              logger.error('Session error:', sessionError);
              Alert.alert('Sign In Error', sessionError.message);
            }
          } else if (accessToken) {
            // We have access token but no refresh token - this won't work well
            logger.error('Found access token but no refresh token - cannot set session properly');
            Alert.alert('Sign In Error', 'Authentication incomplete. Please try again.');
          } else {
            Alert.alert('Sign In Error', 'No authentication data received. Please try again.');
          }
        }
      } catch (error) {
        logger.error('Native sign in error:', error);
        Alert.alert('Sign In Error', 'Failed to sign in. Please try again.');
      }
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      // Sign in with Supabase using the identity token
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });

      if (error) throw error;
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in
        return;
      }
      logger.error('Apple sign in error:', e);
      Alert.alert('Sign In Error', 'Failed to sign in with Apple. Please try again.');
    }
  }, []);

  const signOut = async () => {
    // Unregister push token before signing out
    if (user) {
      await unregisterUserPushToken(user.id);
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('Error signing out:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithApple, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
