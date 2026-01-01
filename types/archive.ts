/**
 * Types for the puzzle archive/practice system
 */

export interface PracticeCompletion {
  puzzleDate: string; // YYYY-MM-DD
  completedAt: string; // ISO timestamp
  score: number;
  timeSeconds: number;
  mistakes: number;
  correctPlacements: number;
  completed: boolean;
}

export interface ArchivePuzzleInfo {
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  isAvailable: boolean; // Past puzzles are available, future are not
  isToday: boolean;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  practiceCompleted: boolean;
  correctPlacements?: number; // How many they got right (0-16)
  score?: number; // Their score for this puzzle
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-11
  days: CalendarDay[];
}
