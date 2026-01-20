import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './auth-context';
import { addUserXP, getUserXP, getOrCreateProfile } from '@/data/puzzleApi';
import { calculateXP, getLevelProgress, levelFromXP } from '@/utils/xp';
import { logger } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { areNotificationsEnabled, setNotificationsEnabled as setNotificationsEnabledService } from '@/utils/notificationService';

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
  displayName: string | null;
  avatarUrl: string | null;
  notificationsEnabled: boolean;
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
  setDisplayName: (name: string | null) => void;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export function XPProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);

  const levelProgress = getLevelProgress(totalXP);

  // Load XP and profile on mount and when user changes
  const loadXP = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        // Logged in - fetch from server
        const [xpData, profile] = await Promise.all([
          getUserXP(user.id),
          getOrCreateProfile(user.id)
        ]);

        if (xpData) {
          setTotalXP(xpData.totalXP);
          setLevel(xpData.level);
        }

        if (profile) {
          setDisplayNameState(profile.displayName || null);
          setAvatarUrl(profile.avatarUrl || null);
        }

        // Load notification settings (non-web only)
        if (Platform.OS !== 'web') {
          const notifEnabled = await areNotificationsEnabled();
          setNotificationsEnabledState(notifEnabled);
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
        setDisplayNameState(null);
        setAvatarUrl(null);
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
      // Anonymous users don't earn XP
      if (!user) {
        return null;
      }

      // Calculate base XP
      let xpGained = calculateXP(score, isDaily);

      // Apply double XP if user watched an ad
      if (doubled) {
        xpGained *= 2;
      }

      if (xpGained <= 0) {
        // Return result with 0 XP to show progress bar even when earning no XP
        return {
          xpGained: 0,
          newTotalXP: totalXP,
          newLevel: level,
          leveledUp: false,
          previousLevel: level,
        };
      }

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
    } catch (e) {
      logger.error('Error awarding XP:', e);
      return null;
    }
  }, [user, level]);

  const refreshXP = useCallback(async () => {
    await loadXP();
  }, [loadXP]);

  const setDisplayName = useCallback((name: string | null) => {
    setDisplayNameState(name);
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    if (Platform.OS !== 'web') {
      await setNotificationsEnabledService(enabled);
    }
  }, []);

  return (
    <XPContext.Provider
      value={{
        totalXP,
        level,
        currentLevelXP: levelProgress.currentLevelXP,
        xpForNextLevel: levelProgress.xpForNextLevel,
        progress: levelProgress.progress,
        loading,
        displayName,
        avatarUrl,
        notificationsEnabled,
        awardPuzzleXP,
        refreshXP,
        setDisplayName,
        setNotificationsEnabled,
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
