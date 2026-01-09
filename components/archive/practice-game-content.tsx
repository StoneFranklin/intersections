import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyles as createGameStyles } from '@/app/(tabs)/index.styles';
import { DoubleXPModal } from '@/components/ads/double-xp-modal';
import { RewardedAdModal } from '@/components/ads/rewarded-ad-modal';
import { GameGrid, SignInBenefitsCard, WordTray } from '@/components/game';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { XPProgressBar } from '@/components/xp/xp-progress-bar';
import { useAuth } from '@/contexts/auth-context';
import { useThemeScheme } from '@/contexts/theme-context';
import { useXP } from '@/contexts/xp-context';
import { useGameState } from '@/hooks/use-game-state';
import { useRewardedAd } from '@/hooks/use-rewarded-ad';
import { PracticeCompletion } from '@/types/archive';
import { CellPosition, GameScore, Puzzle } from '@/types/game';
import { formatPuzzleTitle, getPuzzleNumber } from '@/utils/archive';
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
  const { user } = useAuth();
  const gameStyles = useMemo(() => createGameStyles(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  const [showRewardedAdModal, setShowRewardedAdModal] = useState(false);
  const [hasShownAdOffer, setHasShownAdOffer] = useState(false);
  const [adOfferDeclined, setAdOfferDeclined] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Puzzle number state
  const [puzzleNumber, setPuzzleNumber] = useState<number>(0);

  // XP state
  const { awardPuzzleXP, level, progress } = useXP();
  const [showDoubleXPModal, setShowDoubleXPModal] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [leveledUp, setLeveledUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);
  const doubleXPAd = useRewardedAd();
  const rewardedAd = useRewardedAd();

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
  } = useGameState(puzzle, {
    persistTimer: false,
    isPaused: rewardedAd.isShowing || doubleXPAd.isShowing,
  });

  const isGameOver = gameState.lives <= 0;
  const shouldShowGameOver = isGameOver && (adOfferDeclined || !showRewardedAdModal) && hasShownAdOffer;
  const isGameActive = !gameState.isSolved && !isGameOver && !gameEnded;

  // Fetch puzzle number
  useEffect(() => {
    async function fetchPuzzleNumber() {
      if (puzzleDate) {
        const number = await getPuzzleNumber(puzzleDate);
        setPuzzleNumber(number);
      }
    }
    fetchPuzzleNumber();
  }, [puzzleDate]);

  // Show ad offer when game is over
  useEffect(() => {
    if (isGameOver && !hasShownAdOffer) {
      setShowRewardedAdModal(true);
      setHasShownAdOffer(true);
    }
  }, [isGameOver, hasShownAdOffer]);

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

    // Grant extra life whether ad succeeded or failed - don't punish the user
    grantExtraLife();
    setAdOfferDeclined(false);
    setHasShownAdOffer(false);
    haptics.notification(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeclineAd = () => {
    setShowRewardedAdModal(false);
    setAdOfferDeclined(true);
  };

  // Calculate base XP for display (archive gives 50% XP)
  const baseXP = finalScore ? calculateXP(finalScore.score, false) : 0;

  // Handle double XP ad for archive
  const handleWatchDoubleXPAd = async () => {
    // Mark XP as awarded immediately to prevent modal from reopening
    setXpAwarded(true);

    await doubleXPAd.loadAndShow();
    setShowDoubleXPModal(false);

    // Award double XP whether ad succeeded or failed - don't punish the user
    const xpResult = await awardPuzzleXP(finalScore?.score ?? 0, false, true);
    if (xpResult) {
      setXpGained(xpResult.xpGained);
      setLeveledUp(xpResult.leveledUp);
      setPreviousLevel(xpResult.previousLevel);
    }
    haptics.notification(Haptics.NotificationFeedbackType.Success);
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
  // Only show to authenticated users since anonymous users can't earn XP
  useEffect(() => {
    if (user && gameEnded && savedScore && !xpAwarded && !showDoubleXPModal) {
      // Small delay to let results screen render first
      const timer = setTimeout(() => {
        setShowDoubleXPModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, gameEnded, savedScore, xpAwarded, showDoubleXPModal]);


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

  // Show results screen when game ends
  if (gameEnded && savedScore) {
    const isWin = gameState.isSolved;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isWin ? colorScheme.successBg : colorScheme.errorBg }]} edges={['top', 'left', 'right', 'bottom']}>
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
              <Text style={styles.practiceBadgeText}>
                {puzzleNumber > 0 ? formatPuzzleTitle(puzzleNumber) : 'Practice Mode'}
              </Text>
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
          {user && xpAwarded && xpGained !== null && (
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
              <XPProgressBar currentLevel={level} progress={progress} leveledUp={leveledUp} />
            </View>
          )}

          {/* Sign-in benefits card for anonymous users */}
          {!user && <SignInBenefitsCard onSignInPress={() => router.push('/(tabs)')} />}

          <View style={styles.actionButtons}>
            {!isWin && (
              <Button
                text="Try Again"
                onPress={onRetry}
                icon="refresh"
                backgroundColor={colorScheme.brandPrimary}
                textColor={colorScheme.backgroundPrimary}
                iconColor={colorScheme.backgroundPrimary}
              />
            )}
            <Button
              text="Back to Archive"
              onPress={onBack}
              icon="chevron-left"
              backgroundColor={colorScheme.backgroundSecondary}
              textColor={colorScheme.textPrimary}
              iconColor={colorScheme.textPrimary}
            />
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
        <BackButton onPress={handleLeaveRequest} style={gameStyles.headerBackButton} iconSize={28} />
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
      flexGrow: 1,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 32,
      paddingBottom: 40,
    },
    resultsHeader: {
      alignItems: 'center',
      marginBottom: 28,
    },
    resultsTitle: {
      fontSize: 32,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: -1,
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
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colorScheme.borderPrimary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    scoreRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    scoreItem: {
      alignItems: 'center',
    },
    scoreValue: {
      fontSize: 28,
      fontWeight: '800',
      color: colorScheme.textPrimary,
      letterSpacing: -0.5,
    },
    scoreLabel: {
      fontSize: 13,
      color: colorScheme.textTertiary,
      marginTop: 6,
      fontWeight: '500',
      letterSpacing: 0.2,
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
      maxWidth: 400,
    },
  });

export default PracticeGameContent;
