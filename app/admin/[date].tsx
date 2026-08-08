import { Button } from '@/components/ui/button';
import { useThemeScheme } from '@/contexts/theme-context';
import { getDailyPuzzle, upsertDailyPuzzle } from '@/data/puzzleApi';
import { IntersectionsDailyPuzzle } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createAdminStyles } from './admin.styles';
import { AdminHeader } from './admin-header';

const GRID_SIZE = 4;

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function labelize(id: string): string {
  return id
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function AdminPuzzleEditorScreen() {
  const { colorScheme } = useThemeScheme();
  const styles = useMemo(() => createAdminStyles(colorScheme), [colorScheme]);
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExisting, setIsExisting] = useState(false);

  const [rowLabels, setRowLabels] = useState(['', '', '', '']);
  const [colLabels, setColLabels] = useState(['', '', '', '']);
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => ''))
  );
  const [savedPuzzle, setSavedPuzzle] = useState<IntersectionsDailyPuzzle | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!date) return;

    getDailyPuzzle(date).then((puzzle) => {
      if (cancelled) return;
      if (puzzle) {
        setIsExisting(true);
        setRowLabels(puzzle.rowCategoryIds.map(labelize));
        setColLabels(puzzle.colCategoryIds.map(labelize));
        const newGrid = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => ''));
        puzzle.cells.forEach((cell, index) => {
          const r = Math.floor(index / GRID_SIZE);
          const c = index % GRID_SIZE;
          newGrid[r][c] = cell.word;
        });
        setGrid(newGrid);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [date]);

  const updateRowLabel = (index: number, value: string) => {
    setRowLabels((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const updateColLabel = (index: number, value: string) => {
    setColLabels((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const updateCell = (r: number, c: number, value: string) => {
    setGrid((prev) => prev.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? value : v)) : row)));
  };

  // Completion tracking for a quick "how much is left" signal
  const categoriesFilled = rowLabels.filter((l) => l.trim()).length + colLabels.filter((l) => l.trim()).length;
  const cellsFilled = grid.reduce((sum, row) => sum + row.filter((w) => w.trim()).length, 0);

  const validate = (): string | null => {
    if (!date) return 'Missing date.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Date must be in YYYY-MM-DD format.';
    if (rowLabels.some((l) => !l.trim())) return 'All 4 row categories must be filled in.';
    if (colLabels.some((l) => !l.trim())) return 'All 4 column categories must be filled in.';

    const rowIds = rowLabels.map(slugify);
    const colIds = colLabels.map(slugify);
    if (new Set(rowIds).size !== rowIds.length) return 'Row categories must be unique.';
    if (new Set(colIds).size !== colIds.length) return 'Column categories must be unique.';

    const words: string[] = [];
    for (const row of grid) {
      for (const word of row) {
        if (!word.trim()) return 'All 16 grid cells must be filled in.';
        words.push(word.trim().toLowerCase());
      }
    }
    if (new Set(words).size !== words.length) return 'All 16 words must be unique.';

    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);

    const rowCategoryIds = rowLabels.map(slugify);
    const colCategoryIds = colLabels.map(slugify);

    const cells = grid.flatMap((row, r) =>
      row.map((word, c) => ({
        word: word.trim(),
        rowCategoryId: rowCategoryIds[r],
        colCategoryId: colCategoryIds[c],
      }))
    );

    const puzzle: IntersectionsDailyPuzzle = {
      date: date!,
      rowCategoryIds,
      colCategoryIds,
      cells,
    };

    const result = await upsertDailyPuzzle(puzzle);
    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Failed to save puzzle.');
      return;
    }

    setIsExisting(true);
    setSavedPuzzle(puzzle);
  };

  const closeConfirmation = () => {
    setSavedPuzzle(null);
  };

  const backToList = () => {
    setSavedPuzzle(null);
    router.replace('/admin');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <AdminHeader title="Edit Puzzle" subtitle={date} />
        <ActivityIndicator size="large" color={colorScheme.brandPrimary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const confirmationContent = savedPuzzle && (
    <View style={styles.modalCard}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.modalIconRow}>
          <View style={styles.modalSuccessIcon}>
            <Ionicons name="checkmark" size={30} color={colorScheme.success} />
          </View>
        </View>
        <Text style={styles.modalTitle}>Puzzle Saved</Text>
        <Text style={styles.modalSubtitle}>{savedPuzzle.date} is live. Here&apos;s the resulting grid:</Text>

        <View style={styles.previewGrid}>
          <View style={styles.previewHeaderRow}>
            <View style={styles.previewCornerCell} />
            {savedPuzzle.colCategoryIds.map((id) => (
              <View key={id} style={styles.previewColHeaderCell}>
                <Text style={styles.previewColHeaderText}>{labelize(id)}</Text>
              </View>
            ))}
          </View>
          {savedPuzzle.rowCategoryIds.map((rowId, r) => (
            <View key={rowId} style={styles.previewRow}>
              <View style={styles.previewRowHeaderCell}>
                <Text style={styles.previewRowHeaderText}>{labelize(rowId)}</Text>
              </View>
              {savedPuzzle.colCategoryIds.map((colId) => {
                const cell = savedPuzzle.cells.find(
                  (c) => c.rowCategoryId === rowId && c.colCategoryId === colId
                );
                return (
                  <View key={colId} style={styles.previewCell}>
                    <Text style={styles.previewCellText}>{cell?.word || '—'}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.modalButtonGroup}>
          <Button text="Back to Puzzle List" onPress={backToList} style={{ width: '100%' }} />
          <Button
            text="Keep Editing"
            onPress={closeConfirmation}
            variant="text"
            backgroundColor={colorScheme.textTertiary}
            style={{ width: '100%' }}
          />
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <AdminHeader title={isExisting ? 'Edit Puzzle' : 'New Puzzle'} subtitle={date} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={16} color={colorScheme.brandPrimary} />
          <Text style={styles.dateBadgeText}>{date}</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.categoryColumns}>
            <View style={styles.categoryColumn}>
              <Text style={styles.categoryColumnTitle}>Row Categories</Text>
              {rowLabels.map((label, i) => (
                <View key={`row-${i}`} style={styles.categoryRow}>
                  <Text style={styles.categoryInputLabel}>Row {i + 1}</Text>
                  <TextInput
                    style={styles.input}
                    value={label}
                    onChangeText={(v) => updateRowLabel(i, v)}
                    placeholder={`e.g. Red Things`}
                    placeholderTextColor={colorScheme.textMuted}
                  />
                </View>
              ))}
            </View>
            <View style={styles.categoryColumn}>
              <Text style={styles.categoryColumnTitle}>Column Categories</Text>
              {colLabels.map((label, i) => (
                <View key={`col-${i}`} style={styles.categoryRow}>
                  <Text style={styles.categoryInputLabel}>Column {i + 1}</Text>
                  <TextInput
                    style={styles.input}
                    value={label}
                    onChangeText={(v) => updateColLabel(i, v)}
                    placeholder={`e.g. Card Games`}
                    placeholderTextColor={colorScheme.textMuted}
                  />
                </View>
              ))}
            </View>
          </View>
          <Text style={[styles.fieldCounter, categoriesFilled === 8 && styles.fieldCounterComplete]}>
            {categoriesFilled} / 8 categories filled
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Word Grid</Text>
          <Text style={styles.gridScrollHint}>Each cell is the word that belongs to that row + column intersection.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === 'web'}>
            <View style={styles.gridWrapper}>
              <View style={styles.gridHeaderRow}>
                <View style={styles.gridHeaderSpacer} />
                {colLabels.map((label, c) => (
                  <Text key={`head-${c}`} style={styles.gridHeaderCell} numberOfLines={2}>
                    {label || `Column ${c + 1}`}
                  </Text>
                ))}
              </View>
              {grid.map((row, r) => (
                <View key={`grid-row-${r}`} style={styles.gridRow}>
                  <Text style={styles.gridRowLabel} numberOfLines={2}>
                    {rowLabels[r] || `Row ${r + 1}`}
                  </Text>
                  {row.map((word, c) => (
                    <TextInput
                      key={`cell-${r}-${c}`}
                      style={[styles.input, styles.gridCellInput]}
                      value={word}
                      onChangeText={(v) => updateCell(r, c, v)}
                      placeholder="word"
                      placeholderTextColor={colorScheme.textMuted}
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
          <Text style={[styles.fieldCounter, cellsFilled === 16 && styles.fieldCounterComplete]}>
            {cellsFilled} / 16 words filled
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colorScheme.errorText} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <View style={styles.saveBar}>
          <Button
            text={saving ? 'Saving...' : 'Save Puzzle'}
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            icon={saving ? undefined : 'content-save-outline'}
            style={{ flex: 1 }}
          />
          <Button
            text="Cancel"
            onPress={() => router.back()}
            variant="text"
            backgroundColor={colorScheme.textTertiary}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      {/* Save confirmation with resulting puzzle preview */}
      {Platform.OS === 'web' ? (
        savedPuzzle ? (
          <View style={[styles.modalOverlay, styles.modalOverlayWeb]}>{confirmationContent}</View>
        ) : null
      ) : (
        <Modal visible={!!savedPuzzle} animationType="fade" transparent onRequestClose={closeConfirmation}>
          <View style={styles.modalOverlay}>{confirmationContent}</View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
