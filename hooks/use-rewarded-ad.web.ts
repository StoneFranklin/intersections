import { useState } from 'react';

export interface UseRewardedAdReturn {
  /** Whether the ad is currently loading */
  isLoading: boolean;
  /** Whether the ad is ready to show */
  isReady: boolean;
  /** Whether an ad is currently being shown */
  isShowing: boolean;
  /** Show the rewarded ad */
  show: () => Promise<boolean>;
  /** Error message if ad failed to load */
  error: string | null;
}

/**
 * Hook to manage rewarded ads on web platform
 * Uses Google AdSense Ad Placements API (adBreak) for rewarded ads
 * Falls back to simulation if AdSense is not available
 */
export function useRewardedAd(): UseRewardedAdReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(true); // Always ready on web
  const [isShowing, setIsShowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const show = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        // Check if AdSense Ad Placements API is available
        if (typeof window !== 'undefined' && (window as any).adBreak) {
          const adBreak = (window as any).adBreak;

          setIsShowing(true);
          adBreak({
            type: 'reward',
            name: 'extra-life',
            beforeReward: (showAdFn: () => void) => {
              // Called before showing the ad - user must call showAdFn to proceed
              showAdFn();
            },
            adDismissed: () => {
              // User dismissed the ad before completion
              setIsShowing(false);
              console.log('AdSense: Ad dismissed before completion');
              resolve(false);
            },
            adViewed: () => {
              // User watched the full ad - grant reward
              setIsShowing(false);
              console.log('AdSense: Ad viewed - Reward granted!');
              resolve(true);
            },
            adBreakDone: (placementInfo: any) => {
              // Called when ad break is complete
              setIsShowing(false);

              // If we haven't resolved yet (no adViewed/adDismissed callback)
              // Check the breakStatus
              if (placementInfo?.breakStatus === 'viewed') {
                resolve(true);
              } else if (placementInfo?.breakStatus === 'dismissed') {
                resolve(false);
              }
              // Other statuses: 'notReady', 'timeout', 'error', 'frequencyCapped'
            },
          });
        } else {
          // Fallback: simulate ad for development/testing
          console.log('AdSense not available, simulating rewarded ad');
          setIsShowing(true);

          // Simulate a 3-second video ad
          setTimeout(() => {
            setIsShowing(false);
            console.log('Simulated ad completed - Reward granted!');
            resolve(true);
          }, 3000);
        }
      } catch (err) {
        console.error('Web ad error:', err);
        setIsShowing(false);
        setError('Failed to show ad');
        resolve(false);
      }
    });
  };

  return {
    isLoading,
    isReady,
    isShowing,
    show,
    error,
  };
}
