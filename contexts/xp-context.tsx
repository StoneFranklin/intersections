import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { addUserXP, getUserXP } from '@/data/puzzleApi';
import { calculateXP, getLevelProgress, levelFromXP } from '@/utils/xp';
import { logger } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const XP_STORAGE_KEY = 'user_xp_local';

interface XPGainResult {
  xpGained: number;
  newTotalXP: number;
  newLevel: number;
  leveledUp: boolean;
  previousLevel: number;
}

interface XPContextType {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  progress: number; // 0-1
  loading: boolean;
  /**
   * Award XP for completing a puzzle
   * @param score - The puzzle score (0-1000)
   * @param isDaily - Whether this is a daily puzzle (full XP) or archive (50% XP)
   * @param doubled - Whether XP should be doubled (from watching an ad)
   * @returns XP gain result or null if failed
   */
  awardPuzzleXP: (score: number, isDaily: boolean, doubled?: boolean) => Promise<XPGainResult | null>;
  /** Refresh XP data from server/storage */
  refreshXP: () => Promise<void>;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export function XPProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  const levelProgress = getLevelProgress(totalXP);

  // Load XP on mount and when user changes
  const loadXP = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        // Logged in - fetch from server
        const xpData = await getUserXP(user.id);
        if (xpData) {
          setTotalXP(xpData.totalXP);
          setLevel(xpData.level);
        }
      } else {
        // Not logged in - use local storage
        const stored = await AsyncStorage.getItem(XP_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setTotalXP(parsed.totalXP || 0);
          setLevel(levelFromXP(parsed.totalXP || 0));
        } else {
          setTotalXP(0);
          setLevel(1);
        }
      }
    } catch (e) {
      logger.error('Error loading XP:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadXP();
  }, [loadXP]);

  const awardPuzzleXP = useCallback(async (
    score: number,
    isDaily: boolean,
    doubled: boolean = false
  ): Promise<XPGainResult | null> => {
    try {
      // Calculate base XP
      let xpGained = calculateXP(score, isDaily);

      // Apply double XP if user watched an ad
      if (doubled) {
        xpGained *= 2;
      }

      if (xpGained <= 0) {
        return null;
      }

      const previousLevel = level;

      if (user) {
        // Logged in - update server
        const result = await addUserXP(user.id, xpGained, levelFromXP);
        if (result) {
          setTotalXP(result.newTotalXP);
          setLevel(result.newLevel);
          return {
            xpGained,
            newTotalXP: result.newTotalXP,
            newLevel: result.newLevel,
            leveledUp: result.leveledUp,
            previousLevel: result.previousLevel,
          };
        }
        return null;
      } else {
        // Not logged in - update local storage
        const newTotalXP = totalXP + xpGained;
        const newLevel = levelFromXP(newTotalXP);
        const leveledUp = newLevel > previousLevel;

        setTotalXP(newTotalXP);
        setLevel(newLevel);

        await AsyncStorage.setItem(XP_STORAGE_KEY, JSON.stringify({
          totalXP: newTotalXP,
        }));

        return {
          xpGained,
          newTotalXP,
          newLevel,
          leveledUp,
          previousLevel,
        };
      }
    } catch (e) {
      logger.error('Error awarding XP:', e);
      return null;
    }
  }, [user, totalXP, level]);

  const refreshXP = useCallback(async () => {
    await loadXP();
  }, [loadXP]);

  return (
    <XPContext.Provider
      value={{
        totalXP,
        level,
        currentLevelXP: levelProgress.currentLevelXP,
        xpForNextLevel: levelProgress.xpForNextLevel,
        progress: levelProgress.progress,
        loading,
        awardPuzzleXP,
        refreshXP,
      }}
    >
      {children}
    </XPContext.Provider>
  );
}

export function useXP() {
  const context = useContext(XPContext);
  if (context === undefined) {
    throw new Error('useXP must be used within an XPProvider');
  }
  return context;
}
