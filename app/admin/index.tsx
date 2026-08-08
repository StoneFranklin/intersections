import { useThemeScheme } from '@/contexts/theme-context';
import { deleteDailyPuzzle, getAllPuzzleDatesForAdmin, getTodayDateString } from '@/data/puzzleApi';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createAdminStyles } from './admin.styles';
import { AdminHeader } from './admin-header';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function AdminPuzzleListScreen() {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createAdminStyles(colorScheme), [colorScheme]);
  const router = useRouter();
  const today = getTodayDateString();

  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState(today);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  const loadDates = useCallback(async () => {
    setLoading(true);
    const availableDates = await getAllPuzzleDatesForAdmin();
    setDates(availableDates);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDates();
    }, [loadDates])
  );

  const dateIsValid = DATE_PATTERN.test(newDate);
  const dateAlreadyExists = dates.includes(newDate);

  const handleDelete = useCallback((date: string) => {
    Alert.alert('Delete Puzzle', `Delete the puzzle for ${date}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingDate(date);
          const result = await deleteDailyPuzzle(date);
          setDeletingDate(null);
          if (!result.success) {
            Alert.alert('Error', result.error || 'Failed to delete puzzle.');
            return;
          }
          loadDates();
        },
      },
    ]);
  }, [loadDates]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AdminHeader title="Puzzle Admin" subtitle="Manage daily puzzles" onBack={() => router.replace('/')} />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create New Puzzle</Text>
          <View style={styles.newPuzzleRow}>
            <TextInput
              style={[styles.dateInput, newDate.length > 0 && !dateIsValid && styles.inputError]}
              value={newDate}
              onChangeText={setNewDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colorScheme.textMuted}
            />
            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderRadius: 10,
                backgroundColor: dateIsValid ? colorScheme.brandPrimary : colorScheme.backgroundTertiary,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
              disabled={!dateIsValid}
              onPress={() => router.push(`/admin/${newDate}` as any)}
            >
              <Ionicons name={dateAlreadyExists ? 'create-outline' : 'add'} size={18} color={colorScheme.textPrimary} />
              <Text style={{ color: colorScheme.textPrimary, fontWeight: '700', fontSize: 15 }}>
                {dateAlreadyExists ? 'Edit' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            {!newDate
              ? 'Enter a date to create or edit a puzzle.'
              : !dateIsValid
              ? 'Date must be in YYYY-MM-DD format.'
              : dateAlreadyExists
              ? `A puzzle already exists for ${newDate} — this will open it for editing.`
              : `No puzzle exists for ${newDate} yet — this will create a new one.`}
          </Text>
        </View>

        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Existing Puzzles</Text>
          {!loading && <Text style={styles.countBadge}>{dates.length} total</Text>}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colorScheme.brandPrimary} style={{ marginTop: 20 }} />
        ) : dates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={36} color={colorScheme.textMuted} />
            <Text style={styles.emptyText}>No puzzles yet.{'\n'}Create one above to get started.</Text>
          </View>
        ) : (
          <FlatList
            data={dates}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.puzzleRow}>
                <TouchableOpacity
                  style={styles.puzzleRowMain}
                  onPress={() => router.push(`/admin/${item}` as any)}
                >
                  <View style={styles.puzzleRowIcon}>
                    <Ionicons name="document-text-outline" size={18} color={colorScheme.brandPrimary} />
                  </View>
                  <View style={styles.puzzleRowTextGroup}>
                    <Text style={styles.puzzleRowText}>{item}</Text>
                    {item === today && <Text style={styles.puzzleRowSubtext}>Today&apos;s puzzle</Text>}
                    {item > today && <Text style={styles.puzzleRowSubtext}>Scheduled</Text>}
                  </View>
                  {item === today && (
                    <View style={styles.todayPill}>
                      <Text style={styles.todayPillText}>TODAY</Text>
                    </View>
                  )}
                  {item > today && (
                    <View style={styles.scheduledPill}>
                      <Text style={styles.scheduledPillText}>UPCOMING</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color={colorScheme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  style={styles.deleteButton}
                  disabled={deletingDate === item}
                >
                  {deletingDate === item ? (
                    <ActivityIndicator size="small" color={colorScheme.error} />
                  ) : (
                    <Ionicons name="trash-outline" size={20} color={colorScheme.error} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
