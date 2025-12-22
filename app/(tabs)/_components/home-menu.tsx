import { GradientButton } from '@/components/ui/gradient-button';
import { LeaderboardEntry } from '@/data/puzzleApi';
import { GameScore } from '@/types/game';
import { logger } from '@/utils/logger';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import { Link } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeScheme } from '@/contexts/theme-context';

import { createStyles } from '../index.styles';

export interface HomeMenuProps {
  user: User | null;
  displayName: string | null;
  streak: number;
  loading: boolean;
  dailyCompleted: boolean;
  fetchingPuzzle: boolean;

  leaderboard: LeaderboardEntry[];
  loadingLeaderboard: boolean;
  leaderboardLoaded: boolean;
  userRank: number | null;
  savedScore: GameScore | null;
  isRefreshing: boolean;
  puzzleFetchError: string | null;

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
  onOpenLeaderboard: () => void;
  onRefreshLeaderboard: () => void;
  onShowAnswers: () => void;
  onShowTutorial: () => void;

  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;

  showEntranceAnimations?: boolean;
}

export function HomeMenu({
  user,
  displayName,
  streak,
  loading,
  dailyCompleted,
  fetchingPuzzle,
  leaderboard,
  loadingLeaderboard,
  leaderboardLoaded,
  userRank,
  savedScore,
  isRefreshing,
  puzzleFetchError,
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
  onOpenLeaderboard,
  onRefreshLeaderboard,
  onShowAnswers,
  onShowTutorial,
  signInWithGoogle,
  signInWithApple,
  signOut,
  showEntranceAnimations = false,
}: HomeMenuProps) {
  const displayNameInputRef = useRef<TextInput>(null);
  const lottieRef = useRef<LottieView>(null);
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'loop' | 'tap'>('intro');
  const hasStarted = useRef(false);
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  // Entrance animations
  const logoOpacity = useRef(new Animated.Value(showEntranceAnimations ? 0 : 1)).current;
  const logoScale = useRef(new Animated.Value(showEntranceAnimations ? 0.8 : 1)).current;
  const subtitleOpacity = useRef(new Animated.Value(showEntranceAnimations ? 0 : 1)).current;
  const subtitleTranslateY = useRef(new Animated.Value(showEntranceAnimations ? 20 : 0)).current;
  const dateRowOpacity = useRef(new Animated.Value(showEntranceAnimations ? 0 : 1)).current;
  const dateRowTranslateY = useRef(new Animated.Value(showEntranceAnimations ? 20 : 0)).current;
  const buttonsOpacity = useRef(new Animated.Value(showEntranceAnimations ? 0 : 1)).current;
  const buttonsTranslateY = useRef(new Animated.Value(showEntranceAnimations ? 30 : 0)).current;
  const footerOpacity = useRef(new Animated.Value(showEntranceAnimations ? 0 : 1)).current;

  useEffect(() => {
    if (!showDisplayNameModal) return;
    const focusTimer = setTimeout(() => {
      displayNameInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(focusTimer);
  }, [showDisplayNameModal]);

  // Entrance animations effect
  useEffect(() => {
    if (showEntranceAnimations) {
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
    }
  }, [showEntranceAnimations]);

  // Start loop animation on mount (skip the intro animation)
  useEffect(() => {
    if (hasStarted.current) return;

    // Start immediately to avoid showing frame 0
    if (lottieRef.current) {
      hasStarted.current = true;
      setAnimationPhase('loop');
      // Start with the loop animation immediately
      lottieRef.current.play(79, 148);
      setTimeout(() => {
        lottieRef.current?.play();
      }, 50);
    }
  }, []);

  // Play the appropriate segment when phase changes (except intro which plays on mount)
  useEffect(() => {
    if (animationPhase === 'intro' || !hasStarted.current) return;

    const timer = setTimeout(() => {
      if (lottieRef.current) {
        if (animationPhase === 'loop') {
          lottieRef.current.play(79, 148);
          setTimeout(() => {
            lottieRef.current?.play();
          }, 50);
        } else if (animationPhase === 'tap') {
          lottieRef.current.play(149, 182);
          setTimeout(() => {
            lottieRef.current?.play();
          }, 50);
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [animationPhase]);

  const handleAnimationFinish = () => {
    if (animationPhase === 'intro') {
      setAnimationPhase('loop');
    } else if (animationPhase === 'tap') {
      setAnimationPhase('loop');
    } else if (animationPhase === 'loop') {
      // Loop keeps replaying
      setTimeout(() => {
        if (lottieRef.current) {
          lottieRef.current.play(79, 148);
          setTimeout(() => {
            lottieRef.current?.play();
          }, 50);
        }
      }, 50);
    }
  };

  const handleLogoPress = () => {
    if (animationPhase === 'loop' && lottieRef.current) {
      // Pause current animation and reset before playing tap animation
      lottieRef.current.pause();
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
            <TouchableOpacity style={styles.headerProfileButton} onPress={() => setShowProfileMenu(true)}>
              <View style={styles.headerProfileIcon}>
                <Text style={styles.headerProfileInitial}>
                  {(displayName || user.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
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
              <LottieView
                ref={lottieRef}
                source={require('@/assets/lottie/anim_full_intersections.json')}
                style={styles.menuLogo}
                autoPlay={false}
                loop={false}
                onAnimationFinish={handleAnimationFinish}
              />
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
                    onPress={onOpenLeaderboard}
                    activeOpacity={0.8}
                  >
                    <View style={styles.completedHeader}>
                      <View style={styles.completedHeaderContent}>
                        <View style={styles.completedHeaderTitleRow}>
                          <MaterialCommunityIcons name="trophy" size={20} color="#ffd700" />
                          <Text style={styles.completedTitle}>Today&apos;s Leaderboard</Text>
                        </View>
                        {userRank && <Text style={styles.completedRankText}>#{userRank} in the world</Text>}
                      </View>
                      <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          onRefreshLeaderboard();
                        }}
                        disabled={isRefreshing || loadingLeaderboard}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="refresh" size={18} color={isRefreshing ? '#666' : '#6a9fff'} />
                      </TouchableOpacity>
                    </View>

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

                <TouchableOpacity style={styles.viewAnswersMainButton} onPress={onShowAnswers} activeOpacity={0.85}>
                  <Ionicons name="grid-outline" size={20} color="#6a9fff" />
                  <Text style={styles.viewAnswersMainText}>View Correct Answers</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          <TouchableOpacity style={styles.howToPlayButton} onPress={onShowTutorial}>
            <Ionicons name="help-circle-outline" size={20} color="#6a9fff" />
            <Text style={styles.howToPlayText}>How to Play</Text>
          </TouchableOpacity>

          <Animated.View style={[styles.footerLinks, { opacity: footerOpacity }]}>
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
                <Text style={styles.profileMenuAvatarText}>
                  {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileMenuInfo}>
                <Text style={styles.profileMenuName}>{displayName || 'No display name'}</Text>
                <Text style={styles.profileMenuEmail}>{user?.email}</Text>
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

