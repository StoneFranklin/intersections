import { AdFallbackScreen } from '@/components/ads/ad-fallback-screen';
import { DoubleXPModal } from '@/components/ads/double-xp-modal';
import { RewardedAdModal } from '@/components/ads/rewarded-ad-modal';
import { GameGrid, LeaveGameModal, WordTray } from '@/components/game';
import { SignInBenefitsCard } from '@/components/game/sign-in-benefits-card';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { useXP } from '@/contexts/xp-context';
import { useAuth } from '@/contexts/auth-context';
import { SignInForXPPrompt } from '@/components/xp/sign-in-for-xp-prompt';
import { XPProgressBar } from '@/components/xp/xp-progress-bar';
import { LeaderboardEntry, submitScore } from '@/data/puzzleApi';
import { useGameState } from '@/hooks/use-game-state';
import { useRewardedAd } from '@/hooks/use-rewarded-ad';
import { useDoubleXPAd } from '@/hooks/use-double-xp-ad';
import { CellPosition, GameScore, Puzzle } from '@/types/game';
import { haptics } from '@/utils/haptics';
import { logger } from '@/utils/logger';
import { formatTime, shareScore } from '@/utils/share';
import { calculateXP } from '@/utils/xp';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeScheme } from '@/contexts/theme-context';

import { createStyles } from '../index.styles';

export interface GameContentProps {
  puzzle: Puzzle;
  onBack: () => void;
  onComplete: (score: GameScore, rank: number | null) => void;
  isReviewMode?: boolean;
  savedScore?: GameScore | null;
  displayName?: string | null;
  userId?: string;
  userRank?: number | null;
  leaderboard: LeaderboardEntry[];
  leaderboardLoaded: boolean;
  loadingLeaderboard: boolean;
  onShowSignIn: () => void;
  gameEnded: boolean;
}

export function GameContent({
  puzzle,
  onBack,
  onComplete,
  isReviewMode = false,
  savedScore,
  displayName,
  userId,
  userRank,
  leaderboard,
  leaderboardLoaded,
  loadingLeaderboard,
  onShowSignIn,
  gameEnded,
}: GameContentProps) {
  const { colorScheme } = useThemeScheme();
  const router = useRouter();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);
  const {
    gameState,
    unplacedWords,
    getWordAtCell,
    selectWord,
    placeWordAtCell,
    removeWordFromCell,
    isCellCorrect,
    grantExtraLife,
    elapsedTime,
    finalScore,
  } = useGameState(puzzle);

  const [resultRank, setResultRank] = useState<number | null>(null);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [showRewardedAdModal, setShowRewardedAdModal] = useState(false);
  const [hasShownAdOffer, setHasShownAdOffer] = useState(false);
  const [adOfferDeclined, setAdOfferDeclined] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [gracefulFallback, setGracefulFallback] = useState<{ type: 'extra-life' | 'double-xp'; countdown: number } | null>(null);

  // XP state
  const { awardPuzzleXP, level, totalXP, progress } = useXP();
  const [showDoubleXPModal, setShowDoubleXPModal] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [leveledUp, setLeveledUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);
  const doubleXPAd = useDoubleXPAd();
  const rewardedAd = useRewardedAd();

  const isGameOver = gameState.lives <= 0;
  const shouldShowGameOver = isGameOver && (adOfferDeclined || !showRewardedAdModal) && hasShownAdOffer && !gracefulFallback;
  const isGameActive = !isReviewMode && !gameState.isSolved && !isGameOver && !gameEnded;

  const isCurrentUserEntry = (entry: LeaderboardEntry): boolean => {
    if (entry.isCurrentUser) return true;
    if (!userId && userRank) {
      return entry.rank === userRank;
    }
    return false;
  };

  const getDisplayName = (entry: LeaderboardEntry) =>
    (isCurrentUserEntry(entry) && displayName) ? displayName : (entry.displayName || 'Anonymous');

  useEffect(() => {
    if (isGameOver && !hasShownAdOffer && !isReviewMode) {
      setShowRewardedAdModal(true);
      setHasShownAdOffer(true);
    }
  }, [isGameOver, hasShownAdOffer, isReviewMode]);

  useEffect(() => {
    setHasShownAdOffer(false);
    setAdOfferDeclined(false);
    setGracefulFallback(null);
  }, [puzzle]);


  // Countdown timer for graceful fallback
  useEffect(() => {
    if (!gracefulFallback) return;

    if (gracefulFallback.countdown <= 0) {
      // Grant the reward and close modal
      if (gracefulFallback.type === 'extra-life') {
        setShowRewardedAdModal(false);
        grantExtraLife();
        setAdOfferDeclined(false);
        setHasShownAdOffer(false); // Allow another ad offer if they lose again
      } else {
        // double-xp fallback - award base XP
        setShowDoubleXPModal(false);
        awardPuzzleXP(finalScore?.score ?? 0, true, false).then((xpResult) => {
          if (xpResult) {
            setXpGained(xpResult.xpGained);
            setLeveledUp(xpResult.leveledUp);
            setPreviousLevel(xpResult.previousLevel);
          }
          setXpAwarded(true);
        });
      }
      setGracefulFallback(null);
      haptics.notification(Haptics.NotificationFeedbackType.Success);
      return;
    }

    const timer = setTimeout(() => {
      setGracefulFallback(prev => prev ? { ...prev, countdown: prev.countdown - 1 } : null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gracefulFallback, grantExtraLife, awardPuzzleXP, finalScore]);

  const handleWatchAd = async () => {
    // Close the modal - the ad loading state will show in the modal while loading
    const result = await rewardedAd.loadAndShow();

    setShowRewardedAdModal(false);

    if (result.success && result.rewarded) {
      // User watched the ad and earned the reward
      grantExtraLife();
      setAdOfferDeclined(false);
      setHasShownAdOffer(false); // Allow another ad offer if they lose again
      haptics.notification(Haptics.NotificationFeedbackType.Success);
    } else {
      // Either ad failed to load/show, or user didn't complete it
      // Go to graceful fallback - don't punish them
      setGracefulFallback({ type: 'extra-life', countdown: 3 });
    }
  };

  const handleDeclineAd = () => {
    setShowRewardedAdModal(false);
    setAdOfferDeclined(true);
  };

  // Calculate base XP for display
  const baseXP = finalScore ? calculateXP(finalScore.score, true) : 0;

  // Handle double XP ad
  const handleWatchDoubleXPAd = async () => {
    const result = await doubleXPAd.loadAndShow();
    setShowDoubleXPModal(false);

    if (result.success && result.rewarded) {
      // User watched the ad - award double XP
      const xpResult = await awardPuzzleXP(finalScore?.score ?? 0, true, true);
      if (xpResult) {
        setXpGained(xpResult.xpGained);
        setLeveledUp(xpResult.leveledUp);
        setPreviousLevel(xpResult.previousLevel);
      }
      setXpAwarded(true);
      haptics.notification(Haptics.NotificationFeedbackType.Success);
    } else {
      // Ad failed to load/show or user didn't complete it - award base XP
      const xpResult = await awardPuzzleXP(finalScore?.score ?? 0, true, false);
      if (xpResult) {
        setXpGained(xpResult.xpGained);
        setLeveledUp(xpResult.leveledUp);
        setPreviousLevel(xpResult.previousLevel);
      }
      setXpAwarded(true);
      haptics.notification(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeclineDoubleXP = async () => {
    setShowDoubleXPModal(false);
    // Award base XP
    const xpResult = await awardPuzzleXP(finalScore?.score ?? 0, true, false);
    if (xpResult) {
      setXpGained(xpResult.xpGained);
      setLeveledUp(xpResult.leveledUp);
      setPreviousLevel(xpResult.previousLevel);
    }
    setXpAwarded(true);
  };

  // Show double XP modal when game ends (after score submission completes)
  // Only show to authenticated users since anonymous users can't earn XP
  useEffect(() => {
    if (user && gameEnded && finalScore && !xpAwarded && !showDoubleXPModal && resultRank !== null) {
      // Small delay to let results screen render first
      const timer = setTimeout(() => {
        setShowDoubleXPModal(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, gameEnded, finalScore, xpAwarded, showDoubleXPModal, resultRank]);


  // Handle leave game confirmation
  const handleLeaveRequest = useCallback(() => {
    if (isGameActive) {
      setShowLeaveModal(true);
    } else {
      onBack();
    }
  }, [isGameActive, onBack]);

  const handleConfirmLeave = useCallback(() => {
    setShowLeaveModal(false);
    onBack();
  }, [onBack]);

  const handleCancelLeave = useCallback(() => {
    setShowLeaveModal(false);
  }, []);

  // Browser back/navigation prevention (web only)
  useEffect(() => {
    if (Platform.OS !== 'web' || !isGameActive) return;

    // Handle browser beforeunload (tab close, refresh)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    // Handle browser back button via popstate
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // Push state back to prevent actual navigation
      window.history.pushState(null, '', window.location.href);
      setShowLeaveModal(true);
    };

    // Push initial state so we can catch back button
    window.history.pushState(null, '', window.location.href);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isGameActive]);

  useEffect(() => {
    if (isReviewMode) return;

    const didEnd = gameState.isSolved || shouldShowGameOver;
    if (didEnd && finalScore && !submittingScore && resultRank === null) {
      onComplete(finalScore, null);

      setSubmittingScore(true);
      submitScore(
        finalScore.score,
        finalScore.timeSeconds,
        finalScore.mistakes,
        finalScore.correctPlacements,
        userId
      )
        .then((result) => {
          if (result) {
            setResultRank(result.rank);
            finalScore.percentile = result.percentile;
            finalScore.scoreId = result.scoreId;
            onComplete(finalScore, result.rank);
          }
        })
        .catch((e) => logger.error('Error submitting score:', e))
        .finally(() => setSubmittingScore(false));
    }
  }, [
    gameState.isSolved,
    shouldShowGameOver,
    finalScore,
    submittingScore,
    resultRank,
    onComplete,
    userId,
    isReviewMode,
  ]);

  const handleCellPress = (position: CellPosition) => {
    if (isReviewMode || isGameOver || gameState.isSolved) return;

    const existingWord = getWordAtCell(position);

    if (existingWord) {
      removeWordFromCell(position);
      haptics.impact(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    if (gameState.selectedWordId) {
      const success = placeWordAtCell(position);
      if (success) {
        haptics.impact(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const handleCellLongPress = (position: CellPosition) => {
    if (isReviewMode || isGameOver || gameState.isSolved) return;

    const word = getWordAtCell(position);
    if (word) {
      removeWordFromCell(position);
      haptics.impact(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleWordSelect = (wordId: string | null) => {
    if (isReviewMode) return;
    selectWord(wordId);
    if (wordId) {
      haptics.selection();
    }
  };

  // Full-screen fallback when ad couldn't load but user wanted to watch
  // IMPORTANT: Check this BEFORE other conditions to ensure it always displays
  if (gracefulFallback) {
    return (
      <AdFallbackScreen
        countdown={gracefulFallback.countdown}
        title={gracefulFallback.type === 'extra-life' ? 'Getting Your Extra Life' : 'Getting Your Double XP'}
        iconName={gracefulFallback.type === 'extra-life' ? 'heart-plus' : 'star-circle'}
        description="Thanks for your patience!"
      />
    );
  }

  if (isReviewMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={onBack} style={styles.headerBackButton} iconSize={28} />
          <View style={styles.headerCenter}>
            <Text style={styles.reviewHeaderTitle}>Your Results</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.reviewScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {savedScore ? (
            <>
              {!userId && <Text style={styles.reviewSubtitle}>Your score</Text>}
              <View style={styles.scoreCard}>
                <View style={styles.scoreRow}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreValue}>{savedScore.score}</Text>
                    <Text style={styles.scoreLabel}>Score</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreValue}>{savedScore.correctPlacements}/16</Text>
                    <Text style={styles.scoreLabel}>Correct</Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreValue}>{formatTime(savedScore.timeSeconds)}</Text>
                    <Text style={styles.scoreLabel}>Time</Text>
                  </View>
                </View>
                {userId && userRank && (
                  <View style={styles.reviewPercentileRow}>
                    <Text style={styles.reviewPercentileText}>Ranked #{userRank} today</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.scoreCard}>
              <Text style={styles.noScoreText}>Score data not available</Text>
              <Text style={styles.noScoreSubtext}>Completed before scoring was added</Text>
            </View>
          )}

          {savedScore && (
            <TouchableOpacity
              style={styles.reviewShareButton}
              onPress={() => shareScore(savedScore, userId ? userRank ?? null : null)}
            >
              <Text style={styles.reviewShareButtonText}>Share</Text>
            </TouchableOpacity>
          )}
          {!userId && (
            <View style={styles.reviewPercentileRow}>
              <Text style={styles.reviewPercentileText}>
                Sign in to see your global ranking and today&apos;s leaderboard
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (gameEnded) {
    const displayScore = finalScore || savedScore;
    const isWin = finalScore ? gameState.isSolved : savedScore?.completed ?? false;
    const displayRank = userId ? (resultRank || userRank) : null;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isWin ? colorScheme.successBg : colorScheme.errorBg }]} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.gameCompleteScrollContent}>
          <View style={styles.gameCompleteHeader}>
            {isWin ? (
              <MaterialCommunityIcons name="party-popper" size={64} color={colorScheme.success} style={{ marginBottom: 12 }} />
            ) : (
              <MaterialCommunityIcons name="heart-broken" size={64} color={colorScheme.errorLight} style={{ marginBottom: 12 }} />
            )}
            <Text style={[styles.gameCompleteTitle, { color: isWin ? colorScheme.success : colorScheme.errorLight }]}>
              {isWin ? 'Puzzle Solved!' : 'Game Over'}
            </Text>
            {displayRank && <Text style={styles.gameCompleteRankText}>#{displayRank} in the world</Text>}
          </View>

          <View style={styles.gameCompleteScoreCard}>
            <View style={styles.gameCompleteScoreRow}>
              <View style={styles.gameCompleteScoreItem}>
                <Text style={styles.gameCompleteScoreValue}>{displayScore?.score ?? 0}</Text>
                <Text style={styles.gameCompleteScoreLabel}>Score</Text>
              </View>
              <View style={styles.gameCompleteScoreItem}>
                <Text style={styles.gameCompleteScoreValue}>{displayScore?.correctPlacements ?? 0}/16</Text>
                <Text style={styles.gameCompleteScoreLabel}>Correct</Text>
              </View>
              <View style={styles.gameCompleteScoreItem}>
                <Text style={styles.gameCompleteScoreValue}>{formatTime(displayScore?.timeSeconds ?? 0)}</Text>
                <Text style={styles.gameCompleteScoreLabel}>Time</Text>
              </View>
            </View>
          </View>

          {/* XP Gained Card */}
          {user && xpAwarded && xpGained !== null && (
            <View style={[styles.gameCompleteScoreCard, { marginTop: 0 }]}>
              <View style={styles.xpGainedRow}>
                <MaterialCommunityIcons name="star-circle" size={24} color={colorScheme.gold} />
                <Text style={[styles.gameCompleteScoreValue, { color: colorScheme.gold, marginLeft: 8 }]}>
                  +{xpGained} XP
                </Text>
              </View>
              {leveledUp && previousLevel !== null && (
                <View style={styles.levelUpRow}>
                  <MaterialCommunityIcons name="arrow-up-circle" size={20} color={colorScheme.success} />
                  <Text style={[styles.levelUpText, { color: colorScheme.success }]}>
                    Level Up! You are now Level {level}
                  </Text>
                </View>
              )}
              <XPProgressBar currentLevel={level} progress={progress} leveledUp={leveledUp} />
            </View>
          )}

          {userId ? (
            <TouchableOpacity style={styles.gameCompleteLeaderboardCard} onPress={() => router.push('/leaderboard' as any)} activeOpacity={0.8}>
              <View style={styles.gameCompleteLeaderboardHeader}>
                <View style={styles.gameCompleteLeaderboardHeaderLeft}>
                  <MaterialCommunityIcons name="trophy" size={20} color={colorScheme.gold} />
                  <Text style={styles.gameCompleteLeaderboardTitle}>Today&apos;s Leaderboard</Text>
                </View>
              </View>

              {loadingLeaderboard && !leaderboardLoaded ? (
                <ActivityIndicator size="small" color={colorScheme.brandPrimary} style={{ marginVertical: 16 }} />
              ) : leaderboard.length === 0 ? (
                <Text style={styles.leaderboardEmptyText}>No scores yet</Text>
              ) : (
                <View style={styles.leaderboardCompact}>
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
                          <MaterialCommunityIcons name="medal" size={20} color={colorScheme.gold} />
                        ) : entry.rank === 2 ? (
                          <MaterialCommunityIcons name="medal" size={20} color={colorScheme.textSecondary} />
                        ) : (
                          <MaterialCommunityIcons name="medal" size={20} color={colorScheme.warning} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.leaderboardCompactName,
                          isCurrentUserEntry(entry) && styles.leaderboardCompactNameCurrentUser,
                        ]}
                        numberOfLines={1}
                      >
                        {getDisplayName(entry)}
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

                  {displayRank && displayRank > 3 && displayScore && (
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
                            #{displayRank}
                          </Text>
                        </View>
                        <Text style={[styles.leaderboardCompactName, styles.leaderboardCompactNameCurrentUser]} numberOfLines={1}>
                          {displayName || 'Anonymous'} (you)
                        </Text>
                        <Text style={styles.leaderboardCompactCorrect}>{displayScore.correctPlacements}/16</Text>
                        <Text style={[styles.leaderboardCompactScore, styles.leaderboardCompactScoreCurrentUser]}>
                          {displayScore.score}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              )}

              <View style={styles.tapForDetailsHint}>
                <Text style={styles.tapForDetailsText}>Tap for full leaderboard</Text>
                <Ionicons name="chevron-forward" size={14} color={colorScheme.textMuted} />
              </View>
            </TouchableOpacity>
          ) : (
            <SignInBenefitsCard onSignInPress={onShowSignIn} />
          )}

          <View style={styles.gameCompleteActions}>
            {displayScore && (
              <TouchableOpacity
                style={styles.gameCompleteShareButton}
                onPress={() => shareScore(displayScore, displayRank ?? null)}
              >
                <Ionicons name="share-outline" size={20} color={colorScheme.warmBlack} />
                <Text style={styles.gameCompleteShareButtonText}>Share Score</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button
            text="Back to Menu"
            onPress={onBack}
            icon="chevron-left"
            backgroundColor={colorScheme.backgroundSecondary}
            textColor={colorScheme.textPrimary}
            iconColor={colorScheme.textPrimary}
            style={{ marginTop: 16, width: '100%', maxWidth: 400 }}
          />
        </ScrollView>

        <DoubleXPModal
          visible={showDoubleXPModal}
          baseXP={baseXP}
          isLoading={doubleXPAd.isLoading}
          isShowing={doubleXPAd.isShowing}
          onWatchAd={handleWatchDoubleXPAd}
          onDecline={handleDeclineDoubleXP}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <View style={styles.headerCenter}>
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.gridContainer}>
        <GameGrid
          puzzle={puzzle}
          getWordAtCell={getWordAtCell}
          isCellCorrect={isCellCorrect}
          selectedWordId={gameState.selectedWordId}
          onCellPress={handleCellPress}
          onCellLongPress={handleCellLongPress}
        />
      </View>

      <View style={styles.livesContainer}>
        <Text style={styles.livesLabel}>Lives</Text>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.heart, i <= gameState.lives ? styles.heartFilled : styles.heartEmpty]} />
        ))}
      </View>

      {unplacedWords.length > 0 && (
        <WordTray words={unplacedWords} selectedWordId={gameState.selectedWordId} onWordSelect={handleWordSelect} />
      )}

      <RewardedAdModal
        visible={showRewardedAdModal}
        isLoading={rewardedAd.isLoading}
        isShowing={rewardedAd.isShowing}
        onWatchAd={handleWatchAd}
        onDecline={handleDeclineAd}
      />

      <LeaveGameModal
        visible={showLeaveModal}
        onStay={handleCancelLeave}
        onLeave={handleConfirmLeave}
      />
    </SafeAreaView>
  );
}

