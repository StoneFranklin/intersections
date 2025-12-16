import { useEffect, useState } from 'react';

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
 * Uses Google AdSense rewarded ads with fallback simulation
 */
export function useRewardedAd(): UseRewardedAdReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(true); // Always ready on web
  const [isShowing, setIsShowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const show = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          // Show AdSense rewarded ad
          const adBreak = (window as any).adBreak;
          if (adBreak) {
            setIsShowing(true);
            adBreak({
              type: 'reward',
              name: 'extra-life',
              beforeAd: () => {
                setIsShowing(true);
              },
              afterAd: () => {
                setIsShowing(false);
              },
              adBreakDone: (placementInfo: any) => {
                setIsShowing(false);
                // Check if user watched the full ad
                const rewarded = placementInfo?.breakStatus === 'viewed';
                resolve(rewarded);
              },
            });
          } else {
            // Fallback: simulate ad for testing on web
            console.log('AdSense rewarded ads not available, simulating ad');
            setIsShowing(true);
            setTimeout(() => {
              setIsShowing(false);
              resolve(true); // Simulate successful ad view
            }, 2000);
          }
        } else {
          // No AdSense available, simulate for testing
          console.log('AdSense not available, simulating ad');
          setIsShowing(true);
          setTimeout(() => {
            setIsShowing(false);
            resolve(true);
          }, 2000);
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
