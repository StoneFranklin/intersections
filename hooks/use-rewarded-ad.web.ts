import { useCallback, useState } from 'react';

export type AdResult =
  | { success: true; rewarded: boolean }  // Ad shown, rewarded indicates if user completed it
  | { success: false; reason: 'load_failed' | 'show_failed' | 'timeout' };

export interface UseRewardedAdReturn {
  /** Whether the ad is currently loading */
  isLoading: boolean;
  /** Whether an ad is currently being shown */
  isShowing: boolean;
  /** Load and show the rewarded ad. Returns result of the attempt. */
  loadAndShow: () => Promise<AdResult>;
}

/**
 * Hook to manage rewarded ads on web platform
 * Uses Google AdSense Ad Placements API (adBreak) for rewarded ads
 * Falls back to simulation if AdSense is not available
 */
export function useRewardedAd(): UseRewardedAdReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowing, setIsShowing] = useState(false);

  const loadAndShow = useCallback(async (): Promise<AdResult> => {
    return new Promise((resolve) => {
      try {
        // Check if AdSense Ad Placements API is available
        if (typeof window !== 'undefined' && (window as any).adBreak) {
          const adBreak = (window as any).adBreak;

          setIsLoading(true);

          let resolved = false;

          adBreak({
            type: 'reward',
            name: 'extra-life',
            beforeReward: (showAdFn: () => void) => {
              // Called before showing the ad - user must call showAdFn to proceed
              setIsLoading(false);
              setIsShowing(true);
              showAdFn();
            },
            adDismissed: () => {
              // User dismissed the ad before completion
              if (resolved) return;
              resolved = true;
              setIsShowing(false);
              console.log('AdSense: Ad dismissed before completion');
              resolve({ success: true, rewarded: false });
            },
            adViewed: () => {
              // User watched the full ad - grant reward
              if (resolved) return;
              resolved = true;
              setIsShowing(false);
              console.log('AdSense: Ad viewed - Reward granted!');
              resolve({ success: true, rewarded: true });
            },
            adBreakDone: (placementInfo: any) => {
              // Called when ad break is complete
              setIsLoading(false);
              setIsShowing(false);

              if (resolved) return;
              resolved = true;

              // Check the breakStatus
              if (placementInfo?.breakStatus === 'viewed') {
                resolve({ success: true, rewarded: true });
              } else if (placementInfo?.breakStatus === 'dismissed') {
                resolve({ success: true, rewarded: false });
              } else {
                // Other statuses: 'notReady', 'timeout', 'error', 'frequencyCapped'
                resolve({ success: false, reason: 'load_failed' });
              }
            },
          });
        } else {
          // Fallback: simulate ad for development/testing
          console.log('AdSense not available, simulating rewarded ad');
          setIsLoading(true);

          // Simulate loading
          setTimeout(() => {
            setIsLoading(false);
            setIsShowing(true);

            // Simulate a 3-second video ad
            setTimeout(() => {
              setIsShowing(false);
              console.log('Simulated ad completed - Reward granted!');
              resolve({ success: true, rewarded: true });
            }, 3000);
          }, 500);
        }
      } catch (err) {
        console.error('Web ad error:', err);
        setIsLoading(false);
        setIsShowing(false);
        resolve({ success: false, reason: 'show_failed' });
      }
    });
  }, []);

  return {
    isLoading,
    isShowing,
    loadAndShow,
  };
}
