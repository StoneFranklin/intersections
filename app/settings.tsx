import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyles as createSharedStyles } from '@/app/(tabs)/index.styles';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useThemeScheme } from '@/contexts/theme-context';
import { useXP } from '@/contexts/xp-context';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export default function SettingsScreen() {
  const { colorScheme } = useThemeScheme();
  const { user, signOut } = useAuth();
  const { level, displayName, avatarUrl, notificationsEnabled, setNotificationsEnabled, setDisplayName } = useXP();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const sharedStyles = useMemo(() => createSharedStyles(colorScheme), [colorScheme]);

  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleToggleNotifications = useCallback(() => {
    setNotificationsEnabled(!notificationsEnabled);
  }, [notificationsEnabled, setNotificationsEnabled]);

  const handleDeleteAccount = useCallback(() => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to delete your account.');
      return;
    }
    setShowDeleteConfirmModal(true);
  }, [user]);

  const confirmDeleteAccount = useCallback(async () => {
    if (!user) return;

    setDeletingAccount(true);
    try {
      logger.log('Attempting to delete account for user:', user.id);

      const { error } = await supabase.rpc('delete_user_account', { target_user_id: user.id });

      if (error) {
        logger.error('Error deleting account:', error);
        Alert.alert('Error', `Failed to delete account: ${error.message}`);
        setDeletingAccount(false);
        setShowDeleteConfirmModal(false);
        return;
      }

      logger.log('Account deleted successfully');
      await signOut();
      router.replace('/');
    } catch (e) {
      logger.error('Error in delete account flow:', e);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
      setDeletingAccount(false);
      setShowDeleteConfirmModal(false);
    }
  }, [user, signOut, router]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (e) {
      logger.error('Error signing out:', e);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  }, [signOut, router]);

  const deleteConfirmModalContent = (
    <View style={styles.displayNameModal}>
      <Ionicons name="warning" size={48} color={colorScheme.error} style={{ alignSelf: 'center', marginBottom: 16 }} />
      <Text style={styles.displayNameTitle}>Delete Account?</Text>
      <Text style={styles.displayNameSubtitle}>
        This action cannot be undone. All your data, including scores, streaks, and progress will be permanently deleted.
      </Text>

      <Button
        text={deletingAccount ? 'Deleting...' : 'Delete Account'}
        onPress={confirmDeleteAccount}
        disabled={deletingAccount}
        loading={deletingAccount}
        backgroundColor={colorScheme.error}
        textColor={colorScheme.textPrimary}
        style={{ width: '100%', marginTop: 8 }}
      />

      <Button
        text="Cancel"
        onPress={() => setShowDeleteConfirmModal(false)}
        variant="text"
        backgroundColor={colorScheme.textTertiary}
        style={{ width: '100%', marginTop: 12 }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={sharedStyles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={handleBack} style={sharedStyles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={sharedStyles.leaderboardScreenTitleContainer}>
          <Ionicons name="settings" size={24} color={colorScheme.brandPrimary} />
          <Text style={sharedStyles.leaderboardScreenTitle}>Settings</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                {avatarUrl && !avatarLoadError ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatarImage}
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName || 'No display name'}</Text>
                <Text style={styles.profileLevel}>Level {level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/set-display-name' as any)}
            >
              <Ionicons name="pencil" size={20} color={colorScheme.brandPrimary} />
              <Text style={styles.menuItemText}>Edit Display Name</Text>
              <Ionicons name="chevron-forward" size={20} color={colorScheme.textMuted} />
            </TouchableOpacity>

            {Platform.OS !== 'web' && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleToggleNotifications}>
                  <Ionicons
                    name={notificationsEnabled ? 'notifications' : 'notifications-outline'}
                    size={20}
                    color={colorScheme.brandPrimary}
                  />
                  <Text style={styles.menuItemText}>Daily Notifications</Text>
                  <View style={[styles.toggle, notificationsEnabled && styles.toggleOn]}>
                    <View style={[styles.toggleThumb, notificationsEnabled && styles.toggleThumbOn]} />
                  </View>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteAccount}
              disabled={deletingAccount}
            >
              {deletingAccount ? (
                <>
                  <ActivityIndicator size="small" color={colorScheme.error} />
                  <Text style={styles.menuItemTextDanger}>Deleting...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color={colorScheme.error} />
                  <Text style={styles.menuItemTextDanger}>Delete Account</Text>
                  <Ionicons name="chevron-forward" size={20} color={colorScheme.textMuted} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="exit-outline" size={20} color={colorScheme.error} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      {Platform.OS === 'web' ? (
        showDeleteConfirmModal ? (
          <View style={[styles.modalOverlay, styles.modalOverlayWeb]}>
            {deleteConfirmModalContent}
          </View>
        ) : null
      ) : (
        <Modal
          visible={showDeleteConfirmModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowDeleteConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            {deleteConfirmModalContent}
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

export const createStyles = (colorScheme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.backgroundPrimary,
    },
    setDisplayNameContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    setDisplayNameCard: {
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 16,
      padding: 32,
      maxWidth: 400,
      width: '100%',
      gap: 16,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 60,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colorScheme.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    profileCard: {
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 16,
      padding: 16,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colorScheme.brandSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    avatarText: {
      fontSize: 28,
      fontWeight: '600',
      color: colorScheme.textPrimary,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 20,
      fontWeight: '600',
      color: colorScheme.textPrimary,
      marginBottom: 4,
    },
    profileLevel: {
      fontSize: 15,
      color: colorScheme.gold,
      fontWeight: '600',
    },
    card: {
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 16,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    menuItemText: {
      flex: 1,
      fontSize: 16,
      color: colorScheme.textPrimary,
    },
    menuItemTextDanger: {
      flex: 1,
      fontSize: 16,
      color: colorScheme.error,
    },
    divider: {
      height: 1,
      backgroundColor: colorScheme.backgroundTertiary,
      marginLeft: 48,
    },
    toggle: {
      width: 51,
      height: 31,
      borderRadius: 15.5,
      backgroundColor: colorScheme.backgroundTertiary,
      justifyContent: 'center',
      padding: 2,
    },
    toggleOn: {
      backgroundColor: colorScheme.success,
    },
    toggleThumb: {
      width: 27,
      height: 27,
      borderRadius: 13.5,
      backgroundColor: colorScheme.textPrimary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    toggleThumbOn: {
      transform: [{ translateX: 20 }],
    },
    signOutButton: {
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    signOutButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme.error,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 20,
    },
    modalOverlayWeb: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    displayNameModal: {
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 16,
      padding: 24,
      maxWidth: 400,
      width: '100%',
      gap: 16,
    },
    displayNameTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colorScheme.textPrimary,
      textAlign: 'center',
    },
    displayNameSubtitle: {
      fontSize: 14,
      color: colorScheme.textSecondary,
      textAlign: 'center',
    },
    displayNameInput: {
      backgroundColor: colorScheme.backgroundPrimary,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colorScheme.textPrimary,
      borderWidth: 1,
      borderColor: colorScheme.borderPrimary,
    },
    displayNameErrorText: {
      fontSize: 13,
      color: colorScheme.error,
      textAlign: 'center',
    },
  });
