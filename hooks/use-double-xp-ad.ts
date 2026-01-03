import { logger } from '@/utils/logger';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import MobileAds, {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Production ad unit IDs from environment variables
const PRODUCTION_AD_UNIT_IDS = {
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_DOUBLE_XP_AD_UNIT,
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_DOUBLE_XP_AD_UNIT,
};

// Use production IDs if available, otherwise fall back to test IDs
const DOUBLE_XP_AD_UNIT_IDS = {
  ios: PRODUCTION_AD_UNIT_IDS.ios || TestIds.REWARDED,
  android: PRODUCTION_AD_UNIT_IDS.android || TestIds.REWARDED,
};

// Timeout for loading ad (in ms)
const AD_LOAD_TIMEOUT_MS = 10000;

export type AdResult =
  | { success: true; rewarded: boolean }  // Ad shown, rewarded indicates if user completed it
  | { success: false; reason: 'load_failed' | 'show_failed' | 'timeout' };

export interface UseDoubleXPAdReturn {
  /** Whether the ad is currently loading */
  isLoading: boolean;
  /** Whether an ad is currently being shown */
  isShowing: boolean;
  /** Load and show the double XP rewarded ad. Returns result of the attempt. */
  loadAndShow: () => Promise<AdResult>;
}

/**
 * Hook to manage double XP rewarded ads on iOS and Android
 * Loads ad on-demand when user requests to watch
 */
export function useDoubleXPAd(): UseDoubleXPAdReturn {
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
      Platform.OS === 'ios' ? DOUBLE_XP_AD_UNIT_IDS.ios : DOUBLE_XP_AD_UNIT_IDS.android;

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
          logger.error('Double XP ad load timed out');
          resolve({ success: false, reason: 'timeout' });
        }
      }, AD_LOAD_TIMEOUT_MS);

      // Handle ad loaded - show it immediately
      const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        if (resolved) return;

        setIsLoading(false);
        setIsShowing(true);

        let earnedReward = false;

        const unsubscribeEarned = ad.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward) => {
            logger.log('User earned double XP reward:', reward);
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
          logger.error('Failed to show double XP ad:', err);
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
          logger.error('Double XP ad error:', err);
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
  }, []);

  return {
    isLoading,
    isShowing,
    loadAndShow,
  };
}
