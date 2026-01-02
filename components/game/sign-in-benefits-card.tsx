import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SignInBenefitsCardProps {
  onSignInPress: () => void;
}

/**
 * Component that shows benefits of signing in for anonymous users on game completion
 */
export function SignInBenefitsCard({ onSignInPress }: SignInBenefitsCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
          <Text style={styles.title}>Unlock the Full Experience</Text>
        </View>

        <View style={styles.benefitsList}>
          <View style={styles.benefit}>
            <MaterialCommunityIcons name="earth" size={20} color="#6a9fff" />
            <Text style={styles.benefitText}>Compete on global leaderboards</Text>
          </View>

          <View style={styles.benefit}>
            <MaterialCommunityIcons name="account-group" size={20} color="#6a9fff" />
            <Text style={styles.benefitText}>Challenge friends and see their scores</Text>
          </View>

          <View style={styles.benefit}>
            <MaterialCommunityIcons name="star-circle" size={20} color="#FFD700" />
            <Text style={styles.benefitText}>Earn XP and level up</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={onSignInPress}
        >
          <MaterialCommunityIcons name="login" size={20} color="#000000" />
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 16,
    marginBottom: 24,
    width: '100%',
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.85,
    fontWeight: '500',
    lineHeight: 20,
    flex: 1,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
