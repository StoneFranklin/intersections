import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
async function ensureProfile(userId: string) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (!data) {
      // Create profile if it doesn't exist
      await supabase.from('profiles').insert({ id: userId });
    }
  } catch (e) {
    console.error('Error ensuring profile:', e);
  }
}

// Extract session from URL (handles both hash and query params)
function extractSessionFromUrl(url: string): { accessToken: string | null; refreshToken: string | null } {
  try {
    console.log('Parsing URL for tokens:', url);
    
    // For exp:// URLs, we need to handle them specially
    // The hash/params might be after the path
    let hashPart = '';
    let queryPart = '';
    
    // Check if there's a # in the URL
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      hashPart = url.substring(hashIndex + 1);
      console.log('Hash part:', hashPart);
    }
    
    // Check if there's a ? in the URL
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const endIndex = hashIndex !== -1 ? hashIndex : url.length;
      queryPart = url.substring(queryIndex + 1, endIndex);
      console.log('Query part:', queryPart);
    }
    
    // Try hash fragment first (implicit flow)
    if (hashPart) {
      const hashParams = new URLSearchParams(hashPart);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      console.log('From hash - access_token exists:', !!accessToken);
      if (accessToken) {
        return { accessToken, refreshToken };
      }
    }
    
    // Try query params (PKCE flow or alternative)
    if (queryPart) {
      const queryParams = new URLSearchParams(queryPart);
      const accessToken = queryParams.get('access_token');
      const refreshToken = queryParams.get('refresh_token');
      console.log('From query - access_token exists:', !!accessToken);
      if (accessToken) {
        return { accessToken, refreshToken };
      }
    }
    
    console.log('No tokens found in URL');
    return { accessToken: null, refreshToken: null };
  } catch (e) {
    console.error('Error parsing URL:', e);
    return { accessToken: null, refreshToken: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Create profile on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          ensureProfile(session.user.id);
        }
        setLoading(false);
      }
    );

    // Listen for deep links (for OAuth callback on native)
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      if (event.url.includes('auth/callback') || event.url.includes('access_token')) {
        const { accessToken, refreshToken } = extractSessionFromUrl(event.url);
        if (accessToken) {
          console.log('Setting session from deep link...');
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
        }
      }
    };

    // Add URL listener for native
    const urlSubscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a URL (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
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
            ? `${window.location.origin}/intersections/`
            : undefined,
        },
      });
      if (error) {
        console.error('Error signing in with Google:', error.message);
        throw error;
      }
    } else {
      // Native: Use Supabase OAuth with custom scheme redirect
      try {
        // For development/production builds, use the custom scheme
        // This will be: intersections://auth/callback
        const redirectTo = 'intersections://auth/callback';
        console.log('Native redirect URL:', redirectTo);

        // Get the OAuth URL from Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectTo,
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;
        if (!data.url) throw new Error('No OAuth URL returned');

        console.log('Opening Supabase OAuth URL...');

        // Open browser for authentication
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );

        console.log('Auth result:', result.type);

        if (result.type === 'success' && result.url) {
          console.log('Success URL:', result.url);
          
          // Extract tokens from the redirect URL
          const { accessToken, refreshToken } = extractSessionFromUrl(result.url);
          
          if (accessToken) {
            console.log('Found access token, setting session...');
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (sessionError) {
              console.error('Session error:', sessionError);
              Alert.alert('Sign In Error', sessionError.message);
            } else {
              console.log('Session set successfully!');
            }
          } else {
            // Try to get code for PKCE flow
            const url = new URL(result.url);
            const code = url.searchParams.get('code');
            if (code) {
              console.log('Found auth code, exchanging...');
              const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
              if (exchangeError) {
                console.error('Exchange error:', exchangeError);
                Alert.alert('Sign In Error', exchangeError.message);
              }
            } else {
              console.log('No token or code found in URL');
            }
          }
        } else if (result.type === 'dismiss' || result.type === 'cancel') {
          console.log('User dismissed/cancelled');
        }
      } catch (error) {
        console.error('Native sign in error:', error);
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
        nonce: credential.user,
      });

      if (error) throw error;
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in
        return;
      }
      console.error('Apple sign in error:', e);
      Alert.alert('Sign In Error', 'Failed to sign in with Apple. Please try again.');
    }
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
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
