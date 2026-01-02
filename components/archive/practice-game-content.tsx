import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyles as createGameStyles } from '@/app/(tabs)/index.styles';
import { AdFallbackScreen } from '@/components/ads/ad-fallback-screen';
import { DoubleXPModal } from '@/components/ads/double-xp-modal';
import { RewardedAdModal } from '@/components/ads/rewarded-ad-modal';
import { GameGrid, WordTray } from '@/components/game';
import { useThemeScheme } from '@/contexts/theme-context';
import { useXP } from '@/contexts/xp-context';
import { useGameState } from '@/hooks/use-game-state';
import { useRewardedAd } from '@/hooks/use-rewarded-ad';
import { PracticeCompletion } from '@/types/archive';
import { CellPosition, GameScore, Puzzle } from '@/types/game';
import { haptics } from '@/utils/haptics';
import { formatTime } from '@/utils/share';
import { calculateXP } from '@/utils/xp';

interface PracticeGameContentProps {
  puzzle: Puzzle;
  puzzleDate: string;
  formattedDate: string;
  onBack: () => void;
  onComplete: (score: GameScore) => void;
  onRetry: () => void;
  previousCompletion: PracticeCompletion | null;
  gameEnded: boolean;
  savedScore: GameScore | null;
}

export function PracticeGameContent({
  puzzle,
  puzzleDate,
  formattedDate,
  onBack,
  onComplete,
  onRetry,
  previousCompletion,
  gameEnded,
  savedScore,
}: PracticeGameContentProps) {
  const { colorScheme } = useThemeScheme();
  const router = useRouter();
  const gameStyles = useMemo(() => createGameStyles(colorScheme), [colorScheme]);
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
  } = useGameState(puzzle, { persistTimer: false });

  const [showRewardedAdModal, setShowRewardedAdModal] = useState(false);
  const [hasShownAdOffer, setHasShownAdOffer] = useState(false);
  const [adOfferDeclined, setAdOfferDeclined] = useState(false);
  const [isGracefulFallback, setIsGracefulFallback] = useState(false);
  const [fallbackCountdown, setFallbackCountdown] = useState(3);
  const [hasCompleted, setHasCompleted] = useState(false);

  // XP state
  const { awardPuzzleXP, level, progress } = useXP();
  const [showDoubleXPModal, setShowDoubleXPModal] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [leveledUp, setLeveledUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);
  const doubleXPAd = useRewardedAd();

  // XP bar animation
  const xpBarWidth = useRef(new Animated.Value(0)).current;
  const xpBarScale = useRef(new Animated.Value(1)).current;

  const rewardedAd = useRewardedAd();

  const isGameOver = gameState.lives <= 0;
  const shouldShowGameOver = isGameOver && (adOfferDeclined || !showRewardedAdModal) && hasShownAdOffer && !isGracefulFallback;
  const isGameActive = !gameState.isSolved && !isGameOver && !gameEnded;

  // Show ad offer when game is over
  useEffect(() => {
    if (isGameOver && !hasShownAdOffer) {
      setShowRewardedAdModal(true);
      setHasShownAdOffer(true);
    }
  }, [isGameOver, hasShownAdOffer]);

  // Countdown for graceful fallback
  useEffect(() => {
    if (!isGracefulFallback) return;

    if (fallbackCountdown <= 0) {
      setShowRewardedAdModal(false);
      setIsGracefulFallback(false);
      grantExtraLife();
      setAdOfferDeclined(false);
      setHasShownAdOffer(false);
      haptics.notification(Haptics.NotificationFeedbackType.Success);
      return;
    }

    const timer = setTimeout(() => {
      setFallbackCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isGracefulFallback, fallbackCountdown, grantExtraLife]);

  // Handle game completion
  useEffect(() => {
    const didEnd = gameState.isSolved || shouldShowGameOver;
    if (didEnd && finalScore && !hasCompleted) {
      setHasCompleted(true);
      onComplete(finalScore);
    }
  }, [gameState.isSolved, shouldShowGameOver, finalScore, hasCompleted, onComplete]);

  const handleWatchAd = async () => {
    const result = await rewardedAd.loadAndShow();
    setShowRewardedAdModal(false);

    if (result.success && result.rewarded) {
      grantExtraLife();
      setAdOfferDeclined(false);
      setHasShownAdOffer(false);
      haptics.notification(Haptics.NotificationFeedbackType.Success);
    } else {
      setIsGracefulFallback(true);
      setFallbackCountdown(3);
    }
  };

  const handleDeclineAd = () => {
    setShowRewardedAdModal(false);
    setAdOfferDeclined(true);
  };

  // Calculate base XP for display (archive gives 50% XP)
  const baseXP = finalScore ? calculateXP(finalScore.score, false) : 0;

  // Handle double XP ad for archive
  const handleWatchDoubleXPAd = async () => {
    const result = await doubleXPAd.loadAndShow();
    setShowDoubleXPModal(false);

    if (result.success && result.rewarded) {
      // User watched the ad - award double XP (still 50% base for archive)
      const xpResult = await awardPuzzleXP(finalScore?.score ?? 0, false, true);
      if (xpResult) {
        setXpGained(xpResult.xpGained);
        setLeveledUp(xpResult.leveledUp);
        setPreviousLevel(xpResult.previousLevel);
      }
      setXpAwarded(true);
      haptics.notification(Haptics.NotificationFeedbackType.Success);
    } else {
      // Ad failed or was dismissed - still award base XP
      const xpResult = await awardPuzzleXP(finalScore?.score ?? 0, false, false);
      if (xpResult) {
        setXpGained(xpResult.xpGained);
        setLeveledUp(xpResult.leveledUp);
        setPreviousLevel(xpResult.previousLevel);
      }
      setXpAwarded(true);
    }
  };

  const handleDeclineDoubleXP = async () => {
    setShowDoubleXPModal(false);
    // Award base XP
    const xpResult = await awardPuzzleXP(finalScore?.score ?? 0, false, false);
    if (xpResult) {
      setXpGained(xpResult.xpGained);
      setLeveledUp(xpResult.leveledUp);
      setPreviousLevel(xpResult.previousLevel);
    }
    setXpAwarded(true);
  };

  // Show double XP modal when game ends
  useEffect(() => {
    if (gameEnded && savedScore && !xpAwarded && !showDoubleXPModal) {
      // Small delay to let results screen render first
      const timer = setTimeout(() => {
        setShowDoubleXPModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameEnded, savedScore, xpAwarded, showDoubleXPModal]);

  // Animate XP bar whenever progress changes
  useEffect(() => {
    // Animate the width
    Animated.spring(xpBarWidth, {
      toValue: progress,
      useNativeDriver: false,
      tension: 20,
      friction: 10,
    }).start();

    // Add a subtle pulse effect when leveling up
    if (leveledUp) {
      Animated.sequence([
        Animated.spring(xpBarScale, {
          toValue: 1.05,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
        Animated.spring(xpBarScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
      ]).start();
    }
  }, [progress, leveledUp, xpBarWidth, xpBarScale]);

  const handleLeaveRequest = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleCellPress = (position: CellPosition) => {
    if (isGameOver || gameState.isSolved || gameEnded) return;

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
    if (isGameOver || gameState.isSolved || gameEnded) return;

    const word = getWordAtCell(position);
    if (word) {
      removeWordFromCell(position);
      haptics.impact(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleWordSelect = (wordId: string | null) => {
    selectWord(wordId);
    if (wordId) {
      haptics.selection();
    }
  };

  // Show graceful fallback screen
  if (isGracefulFallback) {
    return <AdFallbackScreen countdown={fallbackCountdown} />;
  }

  // Show results screen when game ends
  if (gameEnded && savedScore) {
    const isWin = gameState.isSolved;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isWin ? colorScheme.successBg : colorScheme.errorBg }]}>
        <ScrollView contentContainerStyle={styles.resultsScrollContent}>
          <View style={styles.resultsHeader}>
            {isWin ? (
              <MaterialCommunityIcons name="party-popper" size={64} color={colorScheme.success} style={{ marginBottom: 12 }} />
            ) : (
              <MaterialCommunityIcons name="heart-broken" size={64} color={colorScheme.errorLight} style={{ marginBottom: 12 }} />
            )}
            <Text style={[styles.resultsTitle, { color: isWin ? colorScheme.success : colorScheme.errorLight }]}>
              {isWin ? 'Puzzle Solved!' : 'Game Over'}
            </Text>
            <View style={styles.practiceBadge}>
              <MaterialCommunityIcons name="school" size={16} color={colorScheme.brandPrimary} />
              <Text style={styles.practiceBadgeText}>Practice Mode</Text>
            </View>
            <Text style={styles.resultsDate}>{formattedDate}</Text>
          </View>

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
          </View>

          {/* XP Gained Card */}
          {xpAwarded && xpGained !== null && (
            <View style={[styles.scoreCard, { marginTop: 0 }]}>
              <View style={gameStyles.xpGainedRow}>
                <MaterialCommunityIcons name="star-circle" size={24} color={colorScheme.gold} />
                <Text style={[styles.scoreValue, { color: colorScheme.gold, marginLeft: 8 }]}>
                  +{xpGained} XP
                </Text>
              </View>
              {leveledUp && previousLevel !== null && (
                <View style={gameStyles.levelUpRow}>
                  <MaterialCommunityIcons name="arrow-up-circle" size={20} color={colorScheme.success} />
                  <Text style={[gameStyles.levelUpText, { color: colorScheme.success }]}>
                    Level Up! You are now Level {level}
                  </Text>
                </View>
              )}
              <View style={gameStyles.xpProgressContainer}>
                <Animated.View 
                  style={[
                    gameStyles.xpProgressBar,
                    { transform: [{ scaleY: xpBarScale }] }
                  ]}
                >
                  <Animated.View 
                    style={[
                      gameStyles.xpProgressFill, 
                      { 
                        width: xpBarWidth.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      }
                    ]} 
                  />
                </Animated.View>
                <Text style={gameStyles.xpLevelText}>Level {level + 1}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colorScheme.info} />
            <Text style={styles.infoText}>
              Practice scores don't affect your streak or leaderboard ranking. Play as many times as you like!
            </Text>
          </View>

          <View style={styles.actionButtons}>
            {!isWin && (
              <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Ionicons name="refresh" size={20} color={colorScheme.backgroundPrimary} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={20} color={colorScheme.brandPrimary} />
              <Text style={styles.backButtonText}>Back to Archive</Text>
            </TouchableOpacity>
          </View>
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

  // Show active game
  return (
    <SafeAreaView style={gameStyles.container}>
      <View style={gameStyles.header}>
        <TouchableOpacity onPress={handleLeaveRequest} style={gameStyles.headerBackButton}>
          <Ionicons name="chevron-back" size={28} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={gameStyles.headerCenter}>
          <Text style={gameStyles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>
        <View style={gameStyles.headerPlaceholder} />
      </View>

      <View style={gameStyles.gridContainer}>
        <GameGrid
          puzzle={puzzle}
          getWordAtCell={getWordAtCell}
          isCellCorrect={isCellCorrect}
          selectedWordId={gameState.selectedWordId}
          onCellPress={handleCellPress}
          onCellLongPress={handleCellLongPress}
        />
      </View>

      <View style={gameStyles.livesContainer}>
        <Text style={gameStyles.livesLabel}>Lives</Text>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[gameStyles.heart, i <= gameState.lives ? gameStyles.heartFilled : gameStyles.heartEmpty]} />
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
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme.backgroundPrimary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    headerBackButton: {
      padding: 8,
    },
    headerCenter: {
      alignItems: 'center',
    },
    headerPlaceholder: {
      width: 44,
    },
    timerText: {
      fontSize: 24,
      fontWeight: '700',
      color: colorScheme.textPrimary,
      fontVariant: ['tabular-nums'],
    },
    gridContainer: {
      alignItems: 'center',
      paddingTop: 8,
    },
    livesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
    },
    livesLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme.textSecondary,
      marginRight: 4,
    },
    heart: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    heartFilled: {
      backgroundColor: colorScheme.error,
    },
    heartEmpty: {
      backgroundColor: colorScheme.backgroundTertiary,
      borderWidth: 2,
      borderColor: colorScheme.error,
    },
    // Results screen styles
    resultsScrollContent: {
      padding: 24,
      paddingBottom: 40,
    },
    resultsHeader: {
      alignItems: 'center',
      marginBottom: 24,
    },
    resultsTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    practiceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colorScheme.backgroundSecondary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginBottom: 8,
    },
    practiceBadgeText: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme.brandPrimary,
    },
    resultsDate: {
      fontSize: 14,
      color: colorScheme.textSecondary,
    },
    scoreCard: {
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    scoreRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    scoreItem: {
      alignItems: 'center',
    },
    scoreValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colorScheme.textPrimary,
    },
    scoreLabel: {
      fontSize: 12,
      color: colorScheme.textMuted,
      marginTop: 4,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderLeftWidth: 3,
      borderLeftColor: colorScheme.info,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colorScheme.textSecondary,
      lineHeight: 20,
    },
    actionButtons: {
      gap: 12,
      width: '100%',
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      backgroundColor: colorScheme.brandPrimary,
      borderRadius: 12,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme.backgroundPrimary,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
    },
    backButtonText: {
      fontSize: 16,
      color: colorScheme.brandPrimary,
      fontWeight: '600',
    },
  });

export default PracticeGameContent;
