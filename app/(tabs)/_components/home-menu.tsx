import { GradientButton } from '@/components/ui/gradient-button';
import { LeaderboardEntry } from '@/data/puzzleApi';
import { GameScore } from '@/types/game';
import { logger } from '@/utils/logger';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import { Link, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

// Animation frame constants (total 182 frames at 30fps)
const TOTAL_FRAMES = 182;
const LOOP_START = 79;
const LOOP_END = 148;
const TAP_START = 149;
const TAP_END = 182;
// Normalized progress values (0-1)
const LOOP_START_PROGRESS = LOOP_START / TOTAL_FRAMES;
const LOOP_END_PROGRESS = LOOP_END / TOTAL_FRAMES;
const TAP_START_PROGRESS = TAP_START / TOTAL_FRAMES;
const TAP_END_PROGRESS = TAP_END / TOTAL_FRAMES;
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
  const lottieRef = useRef<LottieView>(null);
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'loop' | 'tap'>('intro');
  const [homeLeaderboardTab, setHomeLeaderboardTab] = useState<'global' | 'friends'>('global');
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const hasStarted = useRef(false);
  const { colorScheme } = useThemeScheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const logoSize = Math.min(Math.max(width * 0.55, 210), 320);
  const logoFrameHeight = Math.round(logoSize * 0.9);

  const isWeb = Platform.OS === 'web';
  const shouldPlayEntranceAnimations = showEntranceAnimations && !hasPlayedEntranceAnimations;

  // Progress state for mobile (more reliable than play(start, end))
  const [mobileProgress, setMobileProgress] = useState(LOOP_START_PROGRESS);
  const animationFrameRef = useRef<number | null>(null);

  // Entrance animations
  const logoOpacity = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0 : 1)).current;
  const logoScale = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0.8 : 1)).current;
  const subtitleOpacity = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0 : 1)).current;
  const subtitleTranslateY = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 20 : 0)).current;
  const dateRowOpacity = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0 : 1)).current;
  const dateRowTranslateY = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 20 : 0)).current;
  const buttonsOpacity = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0 : 1)).current;
  const buttonsTranslateY = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 30 : 0)).current;
  const footerOpacity = useRef(new Animated.Value(shouldPlayEntranceAnimations ? 0 : 1)).current;

  // Start the loop animation for mobile using requestAnimationFrame
  const startLoopAnimation = useCallback(() => {
    if (isWeb) return;

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const loopDurationMs = ((LOOP_END - LOOP_START) / 30) * 1000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressInLoop = (elapsed % loopDurationMs) / loopDurationMs;
      const progress = LOOP_START_PROGRESS + progressInLoop * (LOOP_END_PROGRESS - LOOP_START_PROGRESS);

      setMobileProgress(progress);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isWeb]);

  // Play tap animation for mobile
  const playTapAnimation = useCallback(() => {
    if (isWeb) return;

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const tapDurationMs = ((TAP_END - TAP_START) / 30) * 1000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed >= tapDurationMs) {
        setMobileProgress(TAP_END_PROGRESS);
        setAnimationPhase('loop');
        return;
      }

      const progressInTap = elapsed / tapDurationMs;
      const progress = TAP_START_PROGRESS + progressInTap * (TAP_END_PROGRESS - TAP_START_PROGRESS);

      setMobileProgress(progress);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    setMobileProgress(TAP_START_PROGRESS);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isWeb]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

  const playSegment = useCallback((start: number, end: number) => {
    if (!lottieRef.current) return;

    // Web needs segment + explicit start frame to actually begin playback.
    lottieRef.current.play(start, end);
    lottieRef.current.play(start);
  }, []);

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
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);

      animations.start();
      hasPlayedEntranceAnimations = true;
    }
  }, [shouldPlayEntranceAnimations]);

  // Start loop animation on mount (skip the intro animation)
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    setAnimationPhase('loop');

    const timer = setTimeout(() => {
      if (isWeb) {
        playSegment(LOOP_START, LOOP_END);
      } else {
        startLoopAnimation();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isWeb, playSegment, startLoopAnimation]);

  // Play the appropriate segment when phase changes (except intro which plays on mount)
  useEffect(() => {
    if (animationPhase === 'intro' || !hasStarted.current) return;

    const timer = setTimeout(() => {
      if (animationPhase === 'loop') {
        if (isWeb) {
          playSegment(LOOP_START, LOOP_END);
        } else {
          startLoopAnimation();
        }
      } else if (animationPhase === 'tap') {
        if (isWeb) {
          playSegment(TAP_START, TAP_END);
        } else {
          playTapAnimation();
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [animationPhase, isWeb, playSegment, startLoopAnimation, playTapAnimation]);

  // Only used for web - mobile uses Animated progress callbacks
  const handleAnimationFinish = () => {
    if (!isWeb) return;

    if (animationPhase === 'intro') {
      setAnimationPhase('loop');
    } else if (animationPhase === 'tap') {
      setAnimationPhase('loop');
    } else if (animationPhase === 'loop') {
      // Loop keeps replaying
      setTimeout(() => {
        playSegment(LOOP_START, LOOP_END);
      }, 50);
    }
  };

  const handleLogoPress = () => {
    if (animationPhase === 'loop') {
      setAnimationPhase('tap');
    }
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

      <TouchableOpacity
        style={[
          styles.displayNameSaveButton,
          (!displayNameInput.trim() || savingDisplayName) && styles.displayNameSaveButtonDisabled,
        ]}
        onPress={onSaveDisplayName}
        disabled={!displayNameInput.trim() || savingDisplayName}
        accessibilityRole="button"
        accessibilityLabel={savingDisplayName ? 'Saving display name' : 'Save display name'}
      >
        <Text style={styles.displayNameSaveText}>{savingDisplayName ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>

      {displayName && (
        <TouchableOpacity
          style={styles.displayNameCancelButton}
          onPress={() => {
            setShowDisplayNameModal(false);
            setDisplayNameInput('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Cancel editing display name"
        >
          <Text style={styles.displayNameCancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.homeHeader}>
        <View style={styles.homeHeaderLeft}>
          {user && streak > 0 && (
            <View style={styles.headerStreakBadge}>
              <Ionicons name="flame" size={14} color="#f59e0b" style={styles.headerStreakFlame} />
              <Text style={styles.headerStreakText}>{streak}</Text>
            </View>
          )}
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
              <View style={styles.headerLevelBadge}>
                <Text style={styles.headerLevelText}>Lv {level}</Text>
              </View>
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
            <TouchableOpacity style={styles.headerSignInButton} onPress={() => setShowSignIn(true)}>
              <Text style={styles.headerSignInText}>Sign In</Text>
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.signInBannerButton} onPress={() => setShowSignIn(true)}>
              <Text style={styles.signInBannerButtonText}>Sign In</Text>
            </TouchableOpacity>
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
                <LottieView
                  ref={lottieRef}
                  source={require('@/assets/lottie/anim_full_intersections_v2.json')}
                  style={[styles.menuLogo, { width: logoSize, height: logoSize }]}
                  webStyle={{ ...styles.menuLogo, width: logoSize, height: logoSize }}
                  autoPlay={false}
                  loop={false}
                  progress={isWeb ? undefined : mobileProgress}
                  onAnimationFinish={handleAnimationFinish}
                  onAnimationLoaded={() => {
                    if (!isWeb) return;
                    // Always play the loop segment when animation loads on web
                    // This handles both initial load and remount after OAuth redirect
                    if (animationPhase === 'intro' || animationPhase === 'loop') {
                      setAnimationPhase('loop');
                      playSegment(LOOP_START, LOOP_END);
                    } else if (animationPhase === 'tap') {
                      playSegment(TAP_START, TAP_END);
                    }
                  }}
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
            A Daily Word Puzzle
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
                          <View style={styles.homeLeaderboardTabBar}>
                            <TouchableOpacity
                              style={[
                                styles.homeLeaderboardTab,
                                homeLeaderboardTab === 'global' && styles.homeLeaderboardTabActive,
                              ]}
                              onPress={(e) => {
                                e.stopPropagation();
                                setHomeLeaderboardTab('global');
                              }}
                            >
                              <Text
                                style={[
                                  styles.homeLeaderboardTabText,
                                  homeLeaderboardTab === 'global' && styles.homeLeaderboardTabTextActive,
                                ]}
                              >
                                Global
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.homeLeaderboardTab,
                                homeLeaderboardTab === 'friends' && styles.homeLeaderboardTabActive,
                              ]}
                              onPress={(e) => {
                                e.stopPropagation();
                                setHomeLeaderboardTab('friends');
                                if (!friendsLeaderboardLoaded && !loadingFriendsLeaderboard) {
                                  onLoadFriendsLeaderboard();
                                }
                              }}
                            >
                              <Text
                                style={[
                                  styles.homeLeaderboardTabText,
                                  homeLeaderboardTab === 'friends' && styles.homeLeaderboardTabTextActive,
                                ]}
                              >
                                Friends
                              </Text>
                            </TouchableOpacity>
                          </View>
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
                        <Ionicons name="refresh" size={18} color={isRefreshing ? '#666' : '#6a9fff'} />
                      </TouchableOpacity>
                    </View>

                    {homeLeaderboardTab === 'global' ? (
                      <>
                        {(loadingLeaderboard && !leaderboardLoaded) ||
                        (user && leaderboardLoaded && leaderboard.length > 0 && userRank === null) ? (
                          <View style={styles.leaderboardLoadingContainer}>
                            <ActivityIndicator size="small" color="#6a9fff" />
                            <Text style={styles.leaderboardLoadingText}>Loading rankings...</Text>
                          </View>
                        ) : leaderboard.length === 0 ? (
                          <Text style={styles.leaderboardEmptyText}>No scores yet</Text>
                        ) : (
                          <View style={styles.leaderboardCompact}>
                            {isRefreshing && (
                              <View style={styles.refreshingOverlay}>
                                <ActivityIndicator size="small" color="#6a9fff" />
                              </View>
                            )}
                            {leaderboard.slice(0, 3).map((entry, index) => (
                              <View
                                key={index}
                                style={[
                                  styles.leaderboardCompactRow,
                                  isCurrentUserEntry(entry) && styles.leaderboardCompactRowCurrentUser,
                                ]}
                              >
                                <View style={styles.leaderboardCompactRank}>
                                  {entry.rank === 1 ? (
                                    <MaterialCommunityIcons name="medal" size={20} color="#ffd700" />
                                  ) : entry.rank === 2 ? (
                                    <MaterialCommunityIcons name="medal" size={20} color="#c0c0c0" />
                                  ) : (
                                    <MaterialCommunityIcons name="medal" size={20} color="#cd7f32" />
                                  )}
                                </View>
                                <View style={styles.leaderboardCompactAvatar}>
                                  {entry.avatarUrl ? (
                                    <Image
                                      source={{ uri: entry.avatarUrl }}
                                      style={styles.leaderboardCompactAvatarImage}
                                    />
                                  ) : (
                                    <Text style={styles.leaderboardCompactAvatarText}>
                                      {(entry.displayName || 'A').charAt(0).toUpperCase()}
                                    </Text>
                                  )}
                                </View>
                                <View style={styles.leaderboardCompactNameContainer}>
                                  <Text
                                    style={[
                                      styles.leaderboardCompactName,
                                      isCurrentUserEntry(entry) && styles.leaderboardCompactNameCurrentUser,
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {(isCurrentUserEntry(entry) && displayName) ? displayName : (entry.displayName || 'Anonymous')}
                                    {isCurrentUserEntry(entry) && ' (you)'}
                                  </Text>
                                  {entry.level && (
                                    <View style={styles.leaderboardCompactLevelBadge}>
                                      <Text style={styles.leaderboardCompactLevelText}>Lv {entry.level}</Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={styles.leaderboardCompactCorrect}>{entry.correctPlacements}/16</Text>
                                <Text
                                  style={[
                                    styles.leaderboardCompactScore,
                                    isCurrentUserEntry(entry) && styles.leaderboardCompactScoreCurrentUser,
                                  ]}
                                >
                                  {entry.score}
                                </Text>
                              </View>
                            ))}

                            {userRank && userRank > 3 && savedScore && (
                              <>
                                <View style={styles.leaderboardDivider}>
                                  <Text style={styles.leaderboardDividerText}>...</Text>
                                </View>
                                <View style={[styles.leaderboardCompactRow, styles.leaderboardCompactRowCurrentUser]}>
                                  <View style={styles.leaderboardCompactRank}>
                                    <Text
                                      style={styles.leaderboardCompactRankText}
                                      numberOfLines={1}
                                      adjustsFontSizeToFit
                                      minimumFontScale={0.8}
                                    >
                                      #{userRank}
                                    </Text>
                                  </View>
                                  <View style={styles.leaderboardCompactAvatar}>
                                    {avatarUrl ? (
                                      <Image
                                        source={{ uri: avatarUrl }}
                                        style={styles.leaderboardCompactAvatarImage}
                                      />
                                    ) : (
                                      <Text style={styles.leaderboardCompactAvatarText}>
                                        {(displayName || 'A').charAt(0).toUpperCase()}
                                      </Text>
                                    )}
                                  </View>
                                  <Text
                                    style={[styles.leaderboardCompactName, styles.leaderboardCompactNameCurrentUser]}
                                    numberOfLines={1}
                                  >
                                    {displayName || 'Anonymous'} (you)
                                  </Text>
                                  <Text style={styles.leaderboardCompactCorrect}>{savedScore.correctPlacements}/16</Text>
                                  <Text style={[styles.leaderboardCompactScore, styles.leaderboardCompactScoreCurrentUser]}>
                                    {savedScore.score}
                                  </Text>
                                </View>
                              </>
                            )}
                          </View>
                        )}
                      </>
                    ) : (
                      <>
                        {loadingFriendsLeaderboard && !friendsLeaderboardLoaded ? (
                          <View style={styles.leaderboardLoadingContainer}>
                            <ActivityIndicator size="small" color="#6a9fff" />
                            <Text style={styles.leaderboardLoadingText}>Loading friends...</Text>
                          </View>
                        ) : friendsLeaderboard.length === 0 ? (
                          <Text style={styles.leaderboardEmptyText}>No friends have played yet</Text>
                        ) : (
                          <View style={styles.leaderboardCompact}>
                            {isRefreshing && (
                              <View style={styles.refreshingOverlay}>
                                <ActivityIndicator size="small" color="#6a9fff" />
                              </View>
                            )}
                            {friendsLeaderboard.slice(0, 3).map((entry, index) => (
                              <View
                                key={index}
                                style={[
                                  styles.leaderboardCompactRow,
                                  isCurrentUserEntry(entry) && styles.leaderboardCompactRowCurrentUser,
                                ]}
                              >
                                <View style={styles.leaderboardCompactRank}>
                                  {entry.rank === 1 ? (
                                    <MaterialCommunityIcons name="medal" size={20} color="#ffd700" />
                                  ) : entry.rank === 2 ? (
                                    <MaterialCommunityIcons name="medal" size={20} color="#c0c0c0" />
                                  ) : entry.rank === 3 ? (
                                    <MaterialCommunityIcons name="medal" size={20} color="#cd7f32" />
                                  ) : (
                                    <Text
                                      style={styles.leaderboardCompactRankText}
                                      numberOfLines={1}
                                      adjustsFontSizeToFit
                                      minimumFontScale={0.8}
                                    >
                                      #{entry.rank}
                                    </Text>
                                  )}
                                </View>
                                <View style={styles.leaderboardCompactAvatar}>
                                  {entry.avatarUrl ? (
                                    <Image
                                      source={{ uri: entry.avatarUrl }}
                                      style={styles.leaderboardCompactAvatarImage}
                                    />
                                  ) : (
                                    <Text style={styles.leaderboardCompactAvatarText}>
                                      {(entry.displayName || 'A').charAt(0).toUpperCase()}
                                    </Text>
                                  )}
                                </View>
                                <View style={styles.leaderboardCompactNameContainer}>
                                  <Text
                                    style={[
                                      styles.leaderboardCompactName,
                                      isCurrentUserEntry(entry) && styles.leaderboardCompactNameCurrentUser,
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {(isCurrentUserEntry(entry) && displayName) ? displayName : (entry.displayName || 'Anonymous')}
                                    {isCurrentUserEntry(entry) && ' (you)'}
                                  </Text>
                                  <View style={styles.leaderboardCompactLevelBadge}>
                                    <Text style={styles.leaderboardCompactLevelText}>Lv {entry.level || 1}</Text>
                                  </View>
                                </View>
                                <Text style={styles.leaderboardCompactCorrect}>{entry.correctPlacements}/16</Text>
                                <Text
                                  style={[
                                    styles.leaderboardCompactScore,
                                    isCurrentUserEntry(entry) && styles.leaderboardCompactScoreCurrentUser,
                                  ]}
                                >
                                  {entry.score}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </>
                    )}

                    <View style={styles.tapForDetailsHint}>
                      <Text style={styles.tapForDetailsText}>Tap for details</Text>
                      <Ionicons name="chevron-forward" size={14} color="#666" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.completedContainer}
                    onPress={() => setShowSignIn(true)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.completedHeader}>
                      <View style={styles.completedHeaderContent}>
                        <View style={styles.completedHeaderTitleRow}>
                          <MaterialCommunityIcons name="trophy" size={20} color="#ffd700" />
                          <Text style={styles.completedTitle}>Today&apos;s Leaderboard</Text>
                        </View>
                      </View>
                    </View>
                    {savedScore && (
                      <View style={styles.leaderboardCompact}>
                        <View style={[styles.leaderboardCompactRow, styles.leaderboardCompactRowCurrentUser]}>
                          <View style={styles.leaderboardCompactRank}>
                            <Text style={styles.leaderboardCompactRankText}>?</Text>
                          </View>
                          <Text
                            style={[styles.leaderboardCompactName, styles.leaderboardCompactNameCurrentUser]}
                            numberOfLines={1}
                          >
                            You
                          </Text>
                          <Text style={styles.leaderboardCompactCorrect}>{savedScore.correctPlacements}/16</Text>
                          <Text style={[styles.leaderboardCompactScore, styles.leaderboardCompactScoreCurrentUser]}>
                            {savedScore.score}
                          </Text>
                        </View>
                      </View>
                    )}
                    <Text style={styles.leaderboardEmptyText}>
                      Sign in to see your global ranking and full leaderboard
                    </Text>
                    <View style={styles.tapForDetailsHint}>
                      <Text style={styles.tapForDetailsText}>Sign in to continue</Text>
                      <Ionicons name="chevron-forward" size={14} color="#666" />
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Animated.View>

          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/how-to-play')}>
              <Ionicons name="help-circle-outline" size={20} color={colorScheme.brandPrimary} />
              <Text style={styles.secondaryButtonText}>How to Play</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/archive')}>
              <Ionicons name="calendar-outline" size={20} color={colorScheme.brandPrimary} />
              <Text style={styles.secondaryButtonText}>Archive</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.footerLinks, { opacity: footerOpacity }]}>
            <Link href={'/about' as any} asChild>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>About</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.footerLinkDivider}>|</Text>
            <Link href={'/contact' as any} asChild>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>Contact</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.footerLinkDivider}>|</Text>
            <Link href={'/privacy' as any} asChild>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>Privacy</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.footerLinkDivider}>|</Text>
            <Link href={'/terms' as any} asChild>
              <TouchableOpacity>
                <Text style={styles.footerLinkText}>Terms</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
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

            <TouchableOpacity
              style={styles.googleButton}
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
            >
              <View style={styles.googleButtonContent}>
                <AntDesign name="google" size={20} color="#4285f4" style={{ marginRight: 8 }} />
                <Text style={styles.googleButtonText}>{signingIn ? 'Signing in...' : 'Continue with Google'}</Text>
              </View>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.appleButton}
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
                activeOpacity={0.8}
              >
                <View style={styles.appleButtonContent}>
                  <Ionicons name="logo-apple" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.appleButtonText}>
                    {signingInWithApple ? 'Signing in...' : 'Continue with Apple'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.signInCancelButton} onPress={() => setShowSignIn(false)}>
              <Text style={styles.signInCancelText}>Cancel</Text>
            </TouchableOpacity>
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

