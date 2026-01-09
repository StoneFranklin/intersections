import { Button } from '@/components/ui/button';
import { useThemeScheme } from '@/contexts/theme-context';
import { PracticeCompletion } from '@/types/archive';
import { formatPuzzleTitle, getPuzzleNumber } from '@/utils/archive';
import { formatTime } from '@/utils/share';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface PracticePreviewModalProps {
  visible: boolean;
  puzzleDate: string;
  formattedDate: string;
  previousCompletion: PracticeCompletion | null;
  onPlay: () => void;
  onCancel: () => void;
}

export function PracticePreviewModal({
  visible,
  puzzleDate,
  formattedDate,
  previousCompletion,
  onPlay,
  onCancel,
}: PracticePreviewModalProps) {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createStyles(colorScheme), [colorScheme]);

  const [puzzleNumber, setPuzzleNumber] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPuzzleNumber() {
      if (visible && puzzleDate) {
        const number = await getPuzzleNumber(puzzleDate);
        setPuzzleNumber(number);
      }
    }
    fetchPuzzleNumber();
  }, [visible, puzzleDate]);

  // Only show modal once puzzle number is loaded
  const shouldShowModal = visible && puzzleNumber !== null;

  return (
    <Modal
      visible={shouldShowModal}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color={colorScheme.textSecondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={48}
              color={colorScheme.brandPrimary}
            />
            <Text style={styles.title}>
              {formatPuzzleTitle(puzzleNumber!)}
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          {previousCompletion ? (
            <>
              <View style={styles.bestPerformanceSection}>
                <Text style={styles.sectionTitle}>Your Best Performance</Text>
                <View style={styles.statsCard}>
                  <View style={styles.statRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{previousCompletion.score}</Text>
                      <Text style={styles.statLabel}>Score</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {previousCompletion.correctPlacements}/16
                      </Text>
                      <Text style={styles.statLabel}>Correct</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {formatTime(previousCompletion.timeSeconds)}
                      </Text>
                      <Text style={styles.statLabel}>Time</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="trophy" size={20} color={colorScheme.warning} />
                <Text style={styles.infoText}>
                  Try to beat your best score!
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={colorScheme.info} />
              <Text style={styles.infoText}>
                This is your first time playing this puzzle
              </Text>
            </View>
          )}

          <Button
            text={previousCompletion ? 'Play Again' : 'Start Puzzle'}
            icon="play"
            iconSize={24}
            backgroundColor={colorScheme.brandPrimary}
            textColor={colorScheme.textPrimary}
            onPress={onPlay}
            style={{ width: '100%', marginBottom: 16 }}
            textStyle={{ fontSize: 18 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const createStyles = (colorScheme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colorScheme.backgroundPrimary,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      padding: 4,
      zIndex: 10,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colorScheme.textPrimary,
      marginTop: 12,
      marginBottom: 4,
    },
    date: {
      fontSize: 14,
      color: colorScheme.textSecondary,
    },
    bestPerformanceSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme.textPrimary,
      marginBottom: 12,
      textAlign: 'center',
    },
    statsCard: {
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colorScheme.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      color: colorScheme.textMuted,
      marginTop: 4,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colorScheme.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colorScheme.textSecondary,
      lineHeight: 20,
    },
    practiceInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    practiceInfoText: {
      fontSize: 12,
      color: colorScheme.textMuted,
    },
  });
