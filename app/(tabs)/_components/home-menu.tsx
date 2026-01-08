import { SignInBenefitsCard } from '@/components/game';
import { LeaderboardCompact } from '@/components/leaderboard/leaderboard-compact';
import { LeaderboardTab, LeaderboardTabToggle } from '@/components/leaderboard/leaderboard-tab-toggle';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { LeaderboardEntry } from '@/data/puzzleApi';
import { GameScore } from '@/types/game';
import { logger } from '@/utils/logger';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeScheme } from '@/contexts/theme-context';

import { createStyles } from '../index.styles';

let hasPlayedEntranceAnimations = false;

export interface HomeMenuProps {
  user: User | null;
  displayName: string | null;
  avatarUrl: string | null;
  streak: number;
  loading: boolean;
  dailyCompleted: boolean;
  fetchingPuzzle: boolean;
  level: number;

  leaderboard: LeaderboardEntry[];
  loadingLeaderboard: boolean;
  leaderboardLoaded: boolean;
  userRank: number | null;
  savedScore: GameScore | null;
  isRefreshing: boolean;
  puzzleFetchError: string | null;

  // Friends leaderboard
  friendsLeaderboard: LeaderboardEntry[];
  loadingFriendsLeaderboard: boolean;
  friendsLeaderboardLoaded: boolean;
  hasFriends: boolean;
  onLoadFriendsLeaderboard: () => void;

  showSignIn: boolean;
  setShowSignIn: (show: boolean) => void;
  signingIn: boolean;
  setSigningIn: (signingIn: boolean) => void;
  signingInWithApple: boolean;
  setSigningInWithApple: (signingIn: boolean) => void;

  showProfileMenu: boolean;
  setShowProfileMenu: (show: boolean) => void;

  showDisplayNameModal: boolean;
  setShowDisplayNameModal: (show: boolean) => void;
  displayNameInput: string;
  setDisplayNameInput: (value: string) => void;
  displayNameError: string | null;
  savingDisplayName: boolean;
  onSaveDisplayName: () => void;

  notificationsEnabled: boolean;
  onToggleNotifications: () => void;

  signInBannerDismissed: boolean;
  onDismissSignInBanner: () => void;

  isCurrentUserEntry: (entry: LeaderboardEntry) => boolean;

  onPlayDaily: () => void;
  onRefreshLeaderboard: () => void;

  pendingFriendRequestCount: number;

  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;

  showEntranceAnimations?: boolean;
  archiveCompletionPercentage: number | null;
}

export function HomeMenu({
  user,
  displayName,
  avatarUrl,
  streak,
  loading,
  dailyCompleted,
  fetchingPuzzle,
  level,
  leaderboard,
  loadingLeaderboard,
  leaderboardLoaded,
  userRank,
  savedScore,
  isRefreshing,
  puzzleFetchError,
  friendsLeaderboard,
  loadingFriendsLeaderboard,
  friendsLeaderboardLoaded,
  hasFriends,
  onLoadFriendsLeaderboard,
  showSignIn,
  setShowSignIn,
  signingIn,
  setSigningIn,
  signingInWithApple,
  setSigningInWithApple,
  showProfileMenu,
  setShowProfileMenu,
  showDisplayNameModal,
  setShowDisplayNameModal,
  displayNameInput,
  setDisplayNameInput,
  displayNameError,
  savingDisplayName,
  onSaveDisplayName,
  notificationsEnabled,
  onToggleNotifications,
  signInBannerDismissed,
  onDismissSignInBanner,
  isCurrentUserEntry,
  onPlayDaily,
  onRefreshLeaderboard,
  pendingFriendRequestCount,
  signInWithGoogle,
  signInWithApple,
  signOut,
  showEntranceAnimations = false,
  archiveCompletionPercentage,
}: HomeMenuProps) {
  const router = useRouter();
  const displayNameInputRef = useRef<TextInput>(null);
  const [homeLeaderboardTab, setHomeLeaderboardTab] = useState<LeaderboardTab>('global');
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const { colorScheme } = useThemeScheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const logoSize = Math.min(Math.max(width * 0.6, 180), 250);
  const logoFrameHeight = Math.round(logoSize * 0.8);

  const shouldPlayEntranceAnimations = showEntranceAnimations && !hasPlayedEntranceAnimations;

  // Entrance animations
  const logoOpacity = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0 : 1)).current;
  const logoScale = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0.8 : 1)).current;
  const subtitleOpacity = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0 : 1)).current;
  const subtitleTranslateY = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 20 : 0)).current;
  const dateRowOpacity = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0 : 1)).current;
  const dateRowTranslateY = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 20 : 0)).current;
  const buttonsOpacity = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0 : 1)).current;
  const buttonsTranslateY = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 30 : 0)).current;

  useEffect(() => {
    if (!showDisplayNameModal) return;
    const focusTimer = setTimeout(() => {
      displayNameInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(focusTimer);
  }, [showDisplayNameModal]);

  // Reset avatar error state when avatarUrl changes
  useEffect(() => {
    setAvatarLoadError(false);
  }, [avatarUrl]);

  // Entrance animations effect
  useEffect(() => {
    if (shouldPlayEntranceAnimations) {
      // Stagger the entrance animations
      const animations = Animated.stagger(100, [
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(subtitleTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dateRowOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dateRowTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(buttonsOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(buttonsTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]);

      animations.start();
      hasPlayedEntranceAnimations = true;
    }
  }, [shouldPlayEntranceAnimations]);

  const handleLogoPress = () => {
    // Logo press handler - can be used for future interactions
  };

  const displayNameModalContent = (
    <View style={styles.displayNameModal}>
      <Text style={styles.displayNameTitle}>
        {displayName ? 'Edit Display Name' : 'Set Your Display Name'}
      </Text>
      <Text style={styles.displayNameSubtitle}>This name will appear on the leaderboard</Text>

      <TextInput
        ref={displayNameInputRef}
        style={styles.displayNameInput}
        value={displayNameInput}
        onChangeText={setDisplayNameInput}
        placeholder="Enter display name"
        placeholderTextColor="#666"
        maxLength={20}
        autoFocus
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
        style={{ width: '100%' }}
      />

      {displayName && (
        <Button
          text="Cancel"
          onPress={() => {
            setShowDisplayNameModal(false);
            setDisplayNameInput('');
          }}
          variant="text"
          backgroundColor={colorScheme.textTertiary}
          style={{ width: '100%', marginTop: 12 }}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('@/assets/images/background_full.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
        }}
      />
      <View style={styles.homeHeader}>
        <View style={styles.homeHeaderLeft}>
          {user && streak > 0 && (
            <View style={styles.headerStreakBadge}>
              <Ionicons name="flame" size={14} color="#f59e0b" style={styles.headerStreakFlame} />
              <Text style={styles.headerStreakText}>{streak}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.headerHelpButton} onPress={() => router.push('/how-to-play')}>
            <Ionicons name="help-circle-outline" size={28} color={colorScheme.textTertiary} />
          </TouchableOpacity>
        </View>
        <View style={styles.homeHeaderRight}>
          {user ? (
            <>
              <TouchableOpacity style={styles.headerFriendsButton} onPress={() => router.push('/friends')}>
                <Ionicons name="people" size={22} color={colorScheme.brandPrimary} />
                {pendingFriendRequestCount > 0 && (
                  <View style={styles.headerFriendsBadge}>
                    <Text style={styles.headerFriendsBadgeText}>{pendingFriendRequestCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {user && (
                <View style={styles.headerLevelBadge}>
                  <Text style={styles.headerLevelText}>Lv {level}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.headerProfileButton} onPress={() => setShowProfileMenu(true)}>
                <View style={styles.headerProfileIcon}>
                  {avatarUrl && !avatarLoadError ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.headerProfileImage}
                      onError={() => setAvatarLoadError(true)}
                    />
                  ) : (
                    <Text style={styles.headerProfileInitial}>
                      {(displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <Button
              text="Sign In"
              onPress={() => setShowSignIn(true)}
              style={{ paddingHorizontal: 16, paddingVertical: 8 }}
              textStyle={{ fontSize: 14 }}
              glow
            />
          )}
        </View>
      </View>

      {!user && !signInBannerDismissed && (
        <View style={styles.signInBanner}>
          <View style={styles.signInBannerContent}>
            <View style={styles.signInBannerText}>
              <Text style={styles.signInBannerTitle}>
                Sign in to see your global ranking, compete on the leaderboard, and sync across devices
              </Text>
            </View>
            <Button
              text="Sign In"
              onPress={() => setShowSignIn(true)}
              style={{ paddingHorizontal: 20, paddingVertical: 10 }}
              textStyle={{ fontSize: 14 }}
              glow
            />
          </View>
          <TouchableOpacity style={styles.signInBannerDismiss} onPress={onDismissSignInBanner}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.mainMenuScroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.mainMenu}>
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.8}>
              <View style={[styles.menuLogoFrame, { width: logoSize, height: logoFrameHeight }]}>
                <Image
                  source={require('@/assets/images/intersections-splash.png')}
                  style={[styles.menuLogo, { width: logoSize, height: logoSize }]}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
          <Animated.Text
            style={[
              styles.menuSubtitle,
              {
                opacity: subtitleOpacity,
                transform: [{ translateY: subtitleTranslateY }],
              },
            ]}
          >
            A Daily Trivia Puzzle
          </Animated.Text>
          {!loading && (
            <Animated.View
              style={[
                styles.dateRow,
                {
                  opacity: dateRowOpacity,
                  transform: [{ translateY: dateRowTranslateY }],
                },
              ]}
            >
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              {dailyCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              )}
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.menuButtons,
              {
                opacity: buttonsOpacity,
                transform: [{ translateY: buttonsTranslateY }],
              },
            ]}
          >
            {!dailyCompleted ? (
              <>
                <GradientButton
                  onPress={onPlayDaily}
                  label={loading ? 'Loading...' : fetchingPuzzle ? 'Loading...' : "Today's Puzzle"}
                  description={loading ? '' : fetchingPuzzle ? 'Fetching puzzle' : 'New puzzle every day'}
                  disabled={fetchingPuzzle || loading}
                  loading={loading}
                  variant="primary"
                />
                {!!puzzleFetchError && (
                  <Text style={styles.playButtonError}>{puzzleFetchError}</Text>
                )}
              </>
            ) : (
              <>
                {user ? (
                  <TouchableOpacity
                    style={styles.completedContainer}
                    onPress={() => router.push('/leaderboard' as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.completedHeader}>
                      <View style={styles.completedHeaderContent}>
                        <View style={styles.completedHeaderTitleRow}>
                          <MaterialCommunityIcons name="trophy" size={20} color="#ffd700" />
                          <Text style={styles.completedTitle}>Today&apos;s Leaderboard</Text>
                        </View>
                        {hasFriends && (
                          <LeaderboardTabToggle
                            activeTab={homeLeaderboardTab}
                            onTabChange={(tab) => {
                              setHomeLeaderboardTab(tab);
                              if (tab === 'friends' && !friendsLeaderboardLoaded && !loadingFriendsLeaderboard) {
                                onLoadFriendsLeaderboard();
                              }
                            }}
                            containerStyle={{ width: '80%', padding: 2 }}
                            tabStyle={{ paddingVertical: 3 }}
                            tabTextStyle={{ fontSize: 13 }}
                          />
                        )}
                        {homeLeaderboardTab === 'global' && userRank && (
                          <Text style={styles.completedRankText}>#{userRank} in the world</Text>
                        )}
                        {homeLeaderboardTab === 'friends' && friendsLeaderboardLoaded && (() => {
                          const friendsRank = friendsLeaderboard.find(e => isCurrentUserEntry(e))?.rank;
                          return friendsRank ? (
                            <Text style={styles.completedRankText}>#{friendsRank} among friends</Text>
                          ) : null;
                        })()}
                      </View>
                      <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          onRefreshLeaderboard();
                        }}
                        disabled={isRefreshing || loadingLeaderboard || loadingFriendsLeaderboard}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="refresh" size={18} color={isRefreshing ? colorScheme.textMuted : colorScheme.brandPrimary} />
                      </TouchableOpacity>
                    </View>

                    {homeLeaderboardTab === 'global' ? (
                      <LeaderboardCompact
                        leaderboard={leaderboard}
                        loading={loadingLeaderboard || (user && leaderboardLoaded && leaderboard.length > 0 && userRank === null)}
                        loaded={leaderboardLoaded}
                        isRefreshing={isRefreshing}
                        isCurrentUserEntry={isCurrentUserEntry}
                        displayName={displayName}
                        avatarUrl={avatarUrl}
                        level={level}
                        userRank={userRank}
                        savedScore={savedScore}
                        showUserRow={true}
                      />
                    ) : (
                      <LeaderboardCompact
                        leaderboard={friendsLeaderboard}
                        loading={loadingFriendsLeaderboard}
                        loaded={friendsLeaderboardLoaded}
                        isRefreshing={isRefreshing}
                        emptyText="No friends have played yet"
                        isCurrentUserEntry={isCurrentUserEntry}
                        displayName={displayName}
                        avatarUrl={avatarUrl}
                        level={level}
                        showUserRow={false}
                      />
                    )}

                    <View style={styles.tapForDetailsHint}>
                      <Text style={styles.tapForDetailsText}>Tap for details</Text>
                      <Ionicons name="chevron-forward" size={14} color="#666" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={{ paddingHorizontal: 16, marginTop: 8, alignItems: 'center' }}>
                    <SignInBenefitsCard onSignInPress={() => setShowSignIn(true)} />
                  </View>
                )}
              </>
            )}
          </Animated.View>

          <View style={styles.secondaryButtonsRow}>
            <Button
              text="Play Past Puzzles"
              onPress={() => router.push('/archive')}
              variant="outlined"
              backgroundColor={colorScheme.brandPrimary}
              textColor={colorScheme.brandPrimary}
              icon="calendar"
              iconColor={colorScheme.brandPrimary}
              iconSize={20}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showSignIn}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSignIn(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.signInModal}>
            <Text style={styles.signInModalTitle}>Sign In</Text>
            <Text style={styles.signInModalSubtitle}>Sync your scores and streaks across devices</Text>

            <Button
              text={signingIn ? 'Signing in...' : 'Continue with Google'}
              icon="google"
              backgroundColor="#FFFFFF"
              textColor="#000000"
              iconColor="#4285f4"
              onPress={async () => {
                setSigningIn(true);
                try {
                  await signInWithGoogle();
                  setShowSignIn(false);
                } catch (e) {
                  logger.error('Sign in error:', e);
                } finally {
                  setSigningIn(false);
                }
              }}
              disabled={signingIn}
              loading={signingIn}
              style={{ width: '100%', marginBottom: 12 }}
            />

            {Platform.OS === 'ios' && (
              <Button
                text={signingInWithApple ? 'Signing in...' : 'Continue with Apple'}
                icon="apple"
                backgroundColor="#000000"
                textColor="#FFFFFF"
                onPress={async () => {
                  setSigningInWithApple(true);
                  try {
                    await signInWithApple();
                    setShowSignIn(false);
                  } catch (e) {
                    logger.error('Apple sign in error:', e);
                  } finally {
                    setSigningInWithApple(false);
                  }
                }}
                disabled={signingInWithApple}
                loading={signingInWithApple}
                style={{ width: '100%', marginBottom: 12 }}
              />
            )}

            <Button
              text="Cancel"
              variant="text"
              backgroundColor={colorScheme.textSecondary}
              onPress={() => setShowSignIn(false)}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showProfileMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowProfileMenu(false)}>
          <View style={styles.profileMenuModal}>
            <View style={styles.profileMenuHeader}>
              <View style={styles.profileMenuAvatar}>
                {avatarUrl && !avatarLoadError ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.profileMenuAvatarImage}
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  <Text style={styles.profileMenuAvatarText}>
                    {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.profileMenuInfo}>
                <Text style={styles.profileMenuName}>{displayName || 'No display name'}</Text>
                <Text style={styles.profileMenuLevel}>Level {level}</Text>
              </View>
            </View>

            <View style={styles.profileMenuDivider} />

            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setShowProfileMenu(false);
                setDisplayNameInput(displayName || '');
                setShowDisplayNameModal(true);
              }}
            >
              <Ionicons name="pencil" size={18} color="#6a9fff" style={styles.profileMenuItemIcon} />
              <Text style={styles.profileMenuItemText}>Edit Display Name</Text>
            </TouchableOpacity>

            <View style={styles.profileMenuDivider} />

            {Platform.OS !== 'web' && (
              <>
                <TouchableOpacity style={styles.profileMenuItem} onPress={onToggleNotifications}>
                  <Ionicons
                    name={notificationsEnabled ? 'notifications' : 'notifications-outline'}
                    size={18}
                    color="#6a9fff"
                    style={styles.profileMenuItemIcon}
                  />
                  <Text style={styles.profileMenuItemText}>Daily Notifications</Text>
                  <View style={[styles.toggle, notificationsEnabled && styles.toggleOn]}>
                    <View style={[styles.toggleThumb, notificationsEnabled && styles.toggleThumbOn]} />
                  </View>
                </TouchableOpacity>
                <View style={styles.profileMenuDivider} />
              </>
            )}

            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setShowProfileMenu(false);
                signOut();
              }}
            >
              <Ionicons name="exit-outline" size={18} color="#ef4444" style={styles.profileMenuItemIcon} />
              <Text style={styles.profileMenuItemTextDanger}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {Platform.OS === 'web' ? (
        showDisplayNameModal ? (
          <View style={[styles.modalOverlay, styles.modalOverlayWeb]}>
            {displayNameModalContent}
          </View>
        ) : null
      ) : (
        <Modal
          visible={showDisplayNameModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowDisplayNameModal(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            {displayNameModalContent}
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

