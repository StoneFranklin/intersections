import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';

interface SignInForXPPromptProps {
  /** Optional callback when user taps sign in */
  onSignInPress?: () => void;
}

/**
 * Component that encourages anonymous users to sign in to start earning XP and leveling up
 */
export function SignInForXPPrompt({ onSignInPress }: SignInForXPPromptProps) {
  const router = useRouter();

  const handleSignIn = () => {
    if (onSignInPress) {
      onSignInPress();
    } else {
      // Navigate back to home if no callback provided
      router.push('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Earning XP!</Text>
      <Text style={styles.description}>
        Sign in to track your progress and level up
      </Text>
      <Button
        text="Sign In"
        onPress={handleSignIn}
        glow
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    fontWeight: '400',
  },
});
