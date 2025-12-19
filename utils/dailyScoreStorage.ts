import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameScore } from '@/types/game';

export type DailyScoreOwnerId = string | null;

export interface StoredDailyScore extends GameScore {
  /**
   * User ID associated with the local play session.
   * - `null` means anonymous play on this device.
   */
  localUserId: DailyScoreOwnerId;
  /**
   * Back-compat for older builds that stored `localUserId` as `odak`.
   * Safe to remove once all active installs have migrated.
   */
  odak?: DailyScoreOwnerId;
}

export function dailyScoreKey(dateKey: string) {
  return `score-${dateKey}`;
}

export function dailyCompletedKey(dateKey: string) {
  return `completed-${dateKey}`;
}

export function dailyRankKey(dateKey: string) {
  return `rank-${dateKey}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getStoredLocalUserId(value: unknown): DailyScoreOwnerId | undefined {
  if (!isRecord(value)) return undefined;
  const localUserId = value.localUserId;
  if (typeof localUserId === 'string' || localUserId === null) return localUserId;

  const odak = value.odak;
  if (typeof odak === 'string' || odak === null) return odak;

  return undefined;
}

export function normalizeStoredDailyScore(value: unknown): StoredDailyScore | null {
  if (!isRecord(value)) return null;

  const gameScore = coerceGameScore(value);
  if (!gameScore) {
    return null;
  }

  const localUserId = getStoredLocalUserId(value) ?? null;

  return {
    ...gameScore,
    localUserId,
    odak: localUserId,
  };
}

export function serializeStoredDailyScore(score: GameScore, localUserId: DailyScoreOwnerId): StoredDailyScore {
  return {
    ...score,
    localUserId,
    odak: localUserId,
  };
}

export function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function coerceGameScore(value: unknown): GameScore | null {
  if (!isRecord(value)) return null;

  const score = value.score;
  const timeSeconds = value.timeSeconds;
  const mistakes = value.mistakes;
  const correctPlacements = value.correctPlacements;

  if (
    typeof score !== 'number' ||
    typeof timeSeconds !== 'number' ||
    typeof mistakes !== 'number' ||
    typeof correctPlacements !== 'number'
  ) {
    return null;
  }

  const completed =
    typeof value.completed === 'boolean' ? value.completed : correctPlacements === 16;
  const percentile = typeof value.percentile === 'number' ? value.percentile : undefined;
  const scoreId = typeof value.scoreId === 'string' ? value.scoreId : undefined;

  return { score, timeSeconds, mistakes, correctPlacements, completed, percentile, scoreId };
}

export async function loadStoredDailyScore(dateKey: string): Promise<StoredDailyScore | null> {
  const raw = await AsyncStorage.getItem(dailyScoreKey(dateKey));
  if (!raw) return null;
  return normalizeStoredDailyScore(safeJsonParse(raw));
}

export interface ClaimableAnonymousScore {
  scoreId: string;
  score: number;
  timeSeconds: number;
  mistakes: number;
  correctPlacements: number;
}

export function extractClaimableAnonymousScore(value: unknown): ClaimableAnonymousScore | null {
  if (!isRecord(value)) return null;

  const localUserId = getStoredLocalUserId(value) ?? null;
  if (localUserId !== null) return null;

  const scoreId = value.scoreId;
  const score = value.score;
  const timeSeconds = value.timeSeconds;
  const mistakes = value.mistakes;
  const correctPlacements = value.correctPlacements;

  if (
    typeof scoreId !== 'string' ||
    typeof score !== 'number' ||
    typeof timeSeconds !== 'number' ||
    typeof mistakes !== 'number' ||
    typeof correctPlacements !== 'number'
  ) {
    return null;
  }

  return { scoreId, score, timeSeconds, mistakes, correctPlacements };
}
