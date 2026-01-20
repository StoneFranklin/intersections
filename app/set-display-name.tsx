import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useThemeScheme } from '@/contexts/theme-context';
import { useXP } from '@/contexts/xp-context';
import { updateDisplayName } from '@/data/puzzleApi';
import { validateDisplayName } from '@/utils/displayNameValidation';
import { logger } from '@/utils/logger';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyles as createSharedStyles } from './(tabs)/index.styles';
import { createStyles } from './settings';

export default function SetDisplayNameScreen() {
  const { colorScheme } = useThemeScheme();
  const { user } = useAuth();
  const { displayName, setDisplayName } = useXP();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const sharedStyles = useMemo(() => createSharedStyles(colorScheme), [colorScheme]);

  const [displayNameInput, setDisplayNameInput] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const displayNameInputRef = useRef<TextInput>(null);

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      displayNameInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = useCallback(() => {
    // Only allow going back if they already have a display name
    if (displayName) {
      router.back();
    }
  }, [router, displayName]);

  const onSaveDisplayName = useCallback(async () => {
    if (!user) return;
    if (!displayNameInput.trim()) return;

    setSavingDisplayName(true);
    setDisplayNameError('');

    try {
      const validation = validateDisplayName(displayNameInput);
      if (!validation.ok) {
        setDisplayNameError(validation.error || 'Invalid display name');
        return;
      }

      const result = await updateDisplayName(user.id, displayNameInput);

      if (result.success) {
        // Update local state
        setDisplayName(validation.normalized);
        // Navigate to home if this was their first time setting display name, otherwise go back
        if (displayName) {
          router.back();
        } else {
          router.replace('/(tabs)' as any);
        }
      } else {
        if (result.error === 'invalid') {
          setDisplayNameError('This display name is not allowed');
        } else if (result.error === 'taken') {
          setDisplayNameError('This display name is already taken');
        } else {
          setDisplayNameError('Failed to update display name. Please try again.');
        }
      }
    } catch (e) {
      logger.error('Error saving display name:', e);
      setDisplayNameError('Failed to update display name. Please try again.');
    } finally {
      setSavingDisplayName(false);
    }
  }, [user, displayNameInput, setDisplayName, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={sharedStyles.leaderboardScreenHeader}>
        {displayName ? (
          <TouchableOpacity onPress={handleBack} style={sharedStyles.leaderboardScreenBackButton}>
            <Ionicons name="arrow-back" size={24} color={colorScheme.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={sharedStyles.leaderboardScreenTitleContainer}>
          <Ionicons name="person" size={24} color={colorScheme.brandPrimary} />
          <Text style={sharedStyles.leaderboardScreenTitle}>
            {displayName ? 'Edit Display Name' : 'Set Display Name'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.setDisplayNameContent}>
          <View style={styles.setDisplayNameCard}>
            <Ionicons
              name="person-circle"
              size={64}
              color={colorScheme.brandPrimary}
              style={{ alignSelf: 'center', marginBottom: 24 }}
            />

            <Text style={styles.displayNameTitle}>
              {displayName ? 'Change Your Display Name' : 'Choose Your Display Name'}
            </Text>
            <Text style={styles.displayNameSubtitle}>
              This name will appear on the leaderboard and be visible to other players
            </Text>

            <TextInput
              ref={displayNameInputRef}
              style={styles.displayNameInput}
              value={displayNameInput}
              onChangeText={setDisplayNameInput}
              placeholder="Enter display name"
              placeholderTextColor="#666"
              maxLength={20}
              returnKeyType="done"
              onSubmitEditing={onSaveDisplayName}
              accessibilityLabel="Display name input"
              accessibilityHint="Enter a name to show on the leaderboard"
            />

            {!!displayNameError && (
              <Text style={styles.displayNameErrorText}>{displayNameError}</Text>
            )}

            <Button
              text={savingDisplayName ? 'Saving...' : 'Save'}
              onPress={onSaveDisplayName}
              disabled={!displayNameInput.trim() || savingDisplayName}
              loading={savingDisplayName}
              backgroundColor={colorScheme.success}
              textColor={colorScheme.textPrimary}
              style={{ width: '100%', marginTop: 8 }}
            />

            {displayName && (
              <Button
                text="Cancel"
                onPress={handleBack}
                variant="text"
                backgroundColor={colorScheme.textTertiary}
                style={{ width: '100%', marginTop: 12 }}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
