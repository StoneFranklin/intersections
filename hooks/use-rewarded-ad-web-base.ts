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
      console.log('[H5 Ads] adBreak not available - granting reward immediately');
      console.log('[H5 Ads] window.adBreak:', typeof window !== 'undefined' ? typeof window.adBreak : 'window undefined');
      console.log('[H5 Ads] Checking for adsbygoogle script...');
      const adsScript = document.querySelector('script[src*="adsbygoogle.js"]');
      console.log('[H5 Ads] Script element found:', !!adsScript);
      if (adsScript) {
        console.log('[H5 Ads] Script src:', adsScript.getAttribute('src'));
      }
      console.log('[H5 Ads] window.adsbygoogle:', typeof (window as any).adsbygoogle);
      // Fallback: grant reward immediately if ads not available
      return { success: true, rewarded: true };
    }

    console.log('[H5 Ads] Calling adBreak for rewarded ad...');
    return new Promise((resolve) => {
      setIsLoading(true);

      window.adBreak?.({
        type: 'reward',
        name: 'extra-life',
        beforeAd: () => {
          console.log('[H5 Ads] beforeAd - Ad is about to show');
          setIsLoading(false);
          setIsShowing(true);
          // Game is already paused via isPaused prop in useGameState
        },
        afterAd: () => {
          console.log('[H5 Ads] afterAd - Ad finished or closed');
          setIsShowing(false);
          // Game will automatically resume when isShowing becomes false
        },
        adBreakDone: (placementInfo) => {
          console.log('[H5 Ads] adBreakDone - Status:', placementInfo.breakStatus);
          console.log('[H5 Ads] Full placement info:', placementInfo);
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
