import { useCallback, useState } from 'react';

export type AdResult =
  | { success: true; rewarded: boolean }
  | { success: false; reason: 'load_failed' | 'show_failed' | 'timeout' };

export interface UseRewardedAdReturn {
  isLoading: boolean;
  isShowing: boolean;
  loadAndShow: () => Promise<AdResult>;
}

// Declare global adBreak function from H5 Games Ads
declare global {
  interface Window {
    adBreak?: (config: {
      type: 'start' | 'pause' | 'next' | 'browse' | 'reward';
      name: string;
      beforeAd?: () => void;
      afterAd?: () => void;
      adBreakDone?: (placementInfo: { breakType: string; breakName: string; breakFormat: string; breakStatus: 'notReady' | 'timeout' | 'invalid' | 'error' | 'noAdPreloaded' | 'frequencyCapped' | 'ignored' | 'other' | 'dismissed' | 'viewed' }) => void;
    }) => void;
  }
}

/**
 * Web implementation using H5 Games Ads for rewarded ads (extra lives)
 */
export function useRewardedAdWebBase(_zoneId: string): UseRewardedAdReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowing, setIsShowing] = useState(false);

  const loadAndShow = useCallback(async (): Promise<AdResult> => {
    // Check if H5 Games Ads (adBreak) is available
    if (typeof window === 'undefined' || !window.adBreak) {
      // Fallback: grant reward immediately if ads not available
      return { success: true, rewarded: true };
    }

    return new Promise((resolve) => {
      setIsLoading(true);

      window.adBreak?.({
        type: 'reward',
        name: 'extra-life',
        beforeAd: () => {
          setIsLoading(false);
          setIsShowing(true);
          // Game is already paused via isPaused prop in useGameState
        },
        afterAd: () => {
          setIsShowing(false);
          // Game will automatically resume when isShowing becomes false
        },
        adBreakDone: (placementInfo) => {
          setIsLoading(false);
          setIsShowing(false);

          // Grant reward if ad was viewed successfully
          if (placementInfo.breakStatus === 'viewed') {
            resolve({ success: true, rewarded: true });
          } else {
            // Still grant reward for other statuses to not punish the user
            // (notReady, timeout, frequencyCapped, etc.)
            resolve({ success: true, rewarded: true });
          }
        },
      });
    });
  }, []);

  return {
    isLoading,
    isShowing,
    loadAndShow,
  };
}
