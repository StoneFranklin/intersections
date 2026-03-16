import { createStyles as createSharedStyles } from '@/app/(tabs)/index.styles';
import { Button } from '@/components/ui/button';
import { useThemeScheme } from '@/contexts/theme-context';
import { formatPuzzleTitle, getPuzzleNumber } from '@/utils/archive';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PracticePreviewScreenProps {
  puzzleDate: string;
  formattedDate: string;
  onPlay: () => void;
  onBack: () => void;
}

export function PracticePreviewScreen({
  puzzleDate,
  formattedDate,
  onPlay,
  onBack,
}: PracticePreviewScreenProps) {
  const { colorScheme } = useThemeScheme();
  const sharedStyles = useMemo(() => createSharedStyles(colorScheme), [colorScheme]);
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  const [puzzleNumber, setPuzzleNumber] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPuzzleNumber() {
      if (puzzleDate) {
        const number = await getPuzzleNumber(puzzleDate);
        setPuzzleNumber(number);
      }
    }
    fetchPuzzleNumber();
  }, [puzzleDate]);

  return (
    <SafeAreaView style={sharedStyles.container}>
      {/* Header - same as archive-result */}
      <View style={sharedStyles.leaderboardScreenHeader}>
        <TouchableOpacity onPress={onBack} style={sharedStyles.leaderboardScreenBackButton}>
          <Ionicons name="arrow-back" size={24} color={colorScheme.textPrimary} />
        </TouchableOpacity>
        <View style={sharedStyles.leaderboardScreenTitleContainer}>
          <MaterialCommunityIcons name="calendar" size={24} color={colorScheme.brandPrimary} />
          <Text style={sharedStyles.leaderboardScreenTitle}>
            {puzzleNumber !== null ? formatPuzzleTitle(puzzleNumber) : 'Archive Puzzle'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Button
          text="Start Puzzle"
          icon="play"
          iconSize={24}
          backgroundColor={colorScheme.brandPrimary}
          textColor={colorScheme.textPrimary}
          onPress={onPlay}
          style={{ width: '100%' }}
          textStyle={{ fontSize: 18 }}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: any) =>
  StyleSheet.create({
    content: {
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 24,
    },
    dateText: {
      fontSize: 15,
      color: colorScheme.textSecondary,
      marginBottom: 24,
    },
  });
