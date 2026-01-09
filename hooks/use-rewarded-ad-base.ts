import { logger } from '@/utils/logger';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import MobileAds, {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Timeout for loading ad (in ms)
const AD_LOAD_TIMEOUT_MS = 30000;

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

interface AdUnitIds {
  ios: string;
  android: string;
}

/**
 * Generic base hook for managing rewarded ads on iOS and Android.
 * Loads ad on-demand when user requests to watch.
 *
 * @param adUnitIds - Platform-specific ad unit IDs (ios and android)
 * @param adName - Name of the ad type for logging purposes (e.g., "rewarded", "double-xp")
 */
export function useRewardedAdBase(adUnitIds: AdUnitIds, adName: string = 'rewarded'): UseRewardedAdReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const cleanupFnRef = useRef<(() => void) | null>(null);
  const adMobInitialized = useRef(false);

  // Initialize AdMob on first launch
  useEffect(() => {
    if (!adMobInitialized.current) {
      adMobInitialized.current = true;
      MobileAds().initialize().catch((err) => {
        logger.error('Failed to initialize AdMob:', err);
      });
    }

    return () => {
      // Cleanup on unmount
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
        cleanupFnRef.current = null;
      }
    };
  }, []);

  const loadAndShow = useCallback(async (): Promise<AdResult> => {
    // Clean up any previous ad
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
      cleanupFnRef.current = null;
    }

    setIsLoading(true);

    const adUnitId =
      Platform.OS === 'ios' ? adUnitIds.ios : adUnitIds.android;

    const ad = RewardedAd.createForAdRequest(adUnitId);

    return new Promise<AdResult>((resolve) => {
      let resolved = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        ad.removeAllListeners();
      };

      cleanupFnRef.current = cleanup;

      // Set up timeout
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          setIsLoading(false);
          cleanup();
          logger.error(`${adName} ad load timed out`);
          resolve({ success: false, reason: 'timeout' });
        }
      }, AD_LOAD_TIMEOUT_MS);

      // Handle ad loaded - show it immediately
      const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        if (resolved) return;

        // Clear timeout immediately when ad loads successfully
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        setIsLoading(false);
        setIsShowing(true);

        let earnedReward = false;

        const unsubscribeEarned = ad.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward) => {
            logger.log(`User earned ${adName} reward:`, reward);
            earnedReward = true;
          }
        );

        const unsubscribeClosed = ad.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            if (resolved) return;
            resolved = true;
            setIsShowing(false);
            unsubscribeEarned();
            unsubscribeClosed();
            cleanup();
            resolve({ success: true, rewarded: earnedReward });
          }
        );

        try {
          ad.show();
        } catch (err) {
          if (resolved) return;
          resolved = true;
          logger.error(`Failed to show ${adName} ad:`, err);
          setIsShowing(false);
          unsubscribeEarned();
          unsubscribeClosed();
          cleanup();
          resolve({ success: false, reason: 'show_failed' });
        }
      });

      // Handle load error
      const unsubscribeError = ad.addAdEventListener(
        AdEventType.ERROR,
        (err) => {
          if (resolved) return;
          resolved = true;
          logger.error(`${adName} ad error:`, err);
          setIsLoading(false);
          unsubscribeLoaded();
          unsubscribeError();
          cleanup();
          resolve({ success: false, reason: 'load_failed' });
        }
      );

      // Start loading
      ad.load();
    });
  }, [adName, adUnitIds]);

  return {
    isLoading,
    isShowing,
    loadAndShow,
  };
}
