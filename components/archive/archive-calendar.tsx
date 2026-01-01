import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeScheme } from '@/contexts/theme-context';
import { CalendarDay } from '@/types/archive';

interface ArchiveCalendarProps {
  year: number;
  month: number; // 0-11
  availableDates: Set<string>;
  completedPuzzles: Map<string, { correctPlacements: number; score: number }>;
  todayDate: string;
  onSelectDate: (date: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  canGoNext: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateString(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function getCalendarDays(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const todayStr = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const days: CalendarDay[] = [];

  // Previous month's trailing days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const dateStr = formatDateString(prevYear, prevMonth, day);
    const dateObj = new Date(prevYear, prevMonth, day);

    days.push({
      date: dateStr,
      dayOfMonth: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isPast: dateObj < today && dateStr !== todayStr,
      isFuture: dateObj > today,
      practiceCompleted: false,
    });
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateString(year, month, day);
    const dateObj = new Date(year, month, day);
    dateObj.setHours(0, 0, 0, 0);

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    days.push({
      date: dateStr,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isPast: dateObj < todayObj,
      isFuture: dateObj > todayObj,
      practiceCompleted: false,
    });
  }

  // Next month's leading days to complete the grid
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  for (let day = 1; day <= remainingDays; day++) {
    const dateStr = formatDateString(nextYear, nextMonth, day);
    const dateObj = new Date(nextYear, nextMonth, day);

    days.push({
      date: dateStr,
      dayOfMonth: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isPast: dateObj < today && dateStr !== todayStr,
      isFuture: dateObj > today,
      practiceCompleted: false,
    });
  }

  return days;
}

export function ArchiveCalendar({
  year,
  month,
  availableDates,
  completedPuzzles,
  todayDate,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  canGoNext,
}: ArchiveCalendarProps) {
  const { colorScheme } = useThemeScheme();
  const { width } = useWindowDimensions();

  const cellSize = Math.min((width - 48) / 7, 48);

  const days = useMemo(() => {
    const calendarDays = getCalendarDays(year, month);
    return calendarDays.map(day => {
      const puzzleData = completedPuzzles.get(day.date);
      return {
        ...day,
        practiceCompleted: !!puzzleData,
        correctPlacements: puzzleData?.correctPlacements,
        score: puzzleData?.score,
      };
    });
  }, [year, month, completedPuzzles]);

  const styles = useMemo(() => createStyles(colorScheme, cellSize), [colorScheme, cellSize]);

  const handleDayPress = (day: CalendarDay) => {
    if (day.isFuture || !day.isCurrentMonth) return;
    if (!availableDates.has(day.date) && !day.isToday) return;
    onSelectDate(day.date);
  };

  const getDayStyle = (day: CalendarDay) => {
    const isAvailable = availableDates.has(day.date);
    const puzzleData = completedPuzzles.get(day.date);
    const isFullySolved = puzzleData?.correctPlacements === 16;

    if (!day.isCurrentMonth) {
      return styles.dayOtherMonth;
    }

    if (day.isToday) {
      return styles.dayToday;
    }

    if (day.isFuture) {
      return styles.dayFuture;
    }

    if (isFullySolved) {
      return styles.dayCompleted;
    }

    if (puzzleData) {
      return styles.dayAttempted;
    }

    if (isAvailable) {
      return styles.dayAvailable;
    }

    return styles.dayUnavailable;
  };

  const getDayTextStyle = (day: CalendarDay) => {
    const isAvailable = availableDates.has(day.date);
    const puzzleData = completedPuzzles.get(day.date);
    const isFullySolved = puzzleData?.correctPlacements === 16;

    if (!day.isCurrentMonth) {
      return styles.dayTextOtherMonth;
    }

    if (day.isToday) {
      return styles.dayTextToday;
    }

    if (day.isFuture) {
      return styles.dayTextFuture;
    }

    if (isFullySolved) {
      return styles.dayTextCompleted;
    }

    if (puzzleData) {
      return styles.dayTextAttempted;
    }

    if (isAvailable) {
      return styles.dayTextAvailable;
    }

    return styles.dayTextUnavailable;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={colorScheme.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.monthYear}>
          {MONTH_NAMES[month]} {year}
        </Text>

        <TouchableOpacity
          onPress={onNextMonth}
          style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
          disabled={!canGoNext}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={canGoNext ? colorScheme.textPrimary : colorScheme.textDisabled}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map(day => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          const puzzleData = completedPuzzles.get(day.date);
          const isFullySolved = puzzleData?.correctPlacements === 16;
          
          return (
            <TouchableOpacity
              key={`${day.date}-${index}`}
              style={[styles.dayCell, getDayStyle(day)]}
              onPress={() => handleDayPress(day)}
              disabled={day.isFuture || !day.isCurrentMonth || (!availableDates.has(day.date) && !day.isToday)}
            >
              <Text style={getDayTextStyle(day)}>{day.dayOfMonth}</Text>
              {puzzleData && day.isCurrentMonth && (
                <View style={styles.scoreContainer}>
                  {isFullySolved ? (
                    <View style={styles.completedIndicator}>
                      <Ionicons name="checkmark-circle" size={14} color={colorScheme.success} />
                    </View>
                  ) : (
                    <Text style={styles.scoreText}>{puzzleData.correctPlacements}/16</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colorScheme.brandPrimary }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colorScheme.success }]} />
          <Text style={styles.legendText}>Solved</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colorScheme.warning, opacity: 0.3 }]} />
          <Text style={styles.legendText}>Attempted</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colorScheme: any, cellSize: number) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: colorScheme.textPrimary,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colorScheme.textMuted,
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayOtherMonth: {
    opacity: 0.3,
  },
  dayToday: {
    backgroundColor: colorScheme.brandPrimary,
  },
  dayFuture: {
    opacity: 0.3,
  },
  dayCompleted: {
    backgroundColor: colorScheme.successBg,
    borderWidth: 1,
    borderColor: colorScheme.success,
  },
  dayAttempted: {
    backgroundColor: colorScheme.backgroundSecondary,
    borderWidth: 1,
    borderColor: colorScheme.warning,
    opacity: 0.7,
  },
  dayAvailable: {
    backgroundColor: colorScheme.backgroundSecondary,
    borderWidth: 1,
    borderColor: colorScheme.brandPrimary,
  },
  dayUnavailable: {
    backgroundColor: colorScheme.backgroundSecondary,
    opacity: 0.5,
  },
  dayTextOtherMonth: {
    fontSize: 14,
    color: colorScheme.textMuted,
  },
  dayTextToday: {
    fontSize: 14,
    fontWeight: '700',
    color: colorScheme.textPrimary,
  },
  dayTextFuture: {
    fontSize: 14,
    color: colorScheme.textDisabled,
  },
  dayTextCompleted: {
    fontSize: 14,
    fontWeight: '600',
    color: colorScheme.success,
  },
  dayTextAttempted: {
    fontSize: 14,
    fontWeight: '500',
    color: colorScheme.warning,
  },
  dayTextAvailable: {
    fontSize: 14,
    fontWeight: '500',
    color: colorScheme.textPrimary,
  },
  dayTextUnavailable: {
    fontSize: 14,
    color: colorScheme.textMuted,
  },
  scoreContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  scoreText: {
    fontSize: 8,
    fontWeight: '700',
    color: colorScheme.warning,
  },
  completedIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
    paddingBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: colorScheme.textSecondary,
  },
});

export default ArchiveCalendar;
