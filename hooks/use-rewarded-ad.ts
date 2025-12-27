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
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_AD_UNIT,
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_AD_UNIT,
};

// Use production IDs if available, otherwise fall back to test IDs
const REWARDED_AD_UNIT_IDS = {
  ios: PRODUCTION_AD_UNIT_IDS.ios || TestIds.REWARDED,
  android: PRODUCTION_AD_UNIT_IDS.android || TestIds.REWARDED,
};

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
 * Hook to manage rewarded ads on iOS and Android
 * Uses Google Mobile Ads (AdMob)
 */
export function useRewardedAd(): UseRewardedAdReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rewardedAdRef = useRef<RewardedAd | null>(null);
  const cleanupFnRef = useRef<(() => void) | null>(null);

  // Initialize AdMob on first launch
  useEffect(() => {
    MobileAds().initialize().catch((err) => {
      logger.error('Failed to initialize AdMob:', err);
    });
  }, []);

  const loadAd = useCallback(() => {
    // Clean up previous ad listeners before creating a new one
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
      cleanupFnRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    const adUnitId =
      Platform.OS === 'ios' ? REWARDED_AD_UNIT_IDS.ios : REWARDED_AD_UNIT_IDS.android;

    const ad = RewardedAd.createForAdRequest(adUnitId);

    const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsLoading(false);
      setIsReady(true);
      rewardedAdRef.current = ad;
    });

    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (err) => {
        setIsLoading(false);
        setError(err.message || 'Failed to load ad');
        logger.error('Rewarded ad error:', err);
      }
    );

    ad.load();

    // Store cleanup function
    cleanupFnRef.current = () => {
      unsubscribeLoaded();
      unsubscribeError();
      ad.removeAllListeners();
    };
  }, []);

  // Load the ad when component mounts
  useEffect(() => {
    loadAd();

    return () => {
      // Cleanup on unmount
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
        cleanupFnRef.current = null;
      }
      if (rewardedAdRef.current) {
        rewardedAdRef.current.removeAllListeners();
        rewardedAdRef.current = null;
      }
    };
  }, [loadAd]);

  const show = async (): Promise<boolean> => {
    const rewardedAd = rewardedAdRef.current;
    if (!rewardedAd || !isReady) {
      setError('Ad is not ready yet');
      return false;
    }

    return new Promise((resolve) => {
      setIsShowing(true);
      let earnedReward = false;

      const unsubscribeEarned = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          logger.log('User earned reward:', reward);
          earnedReward = true;
          // Don't resolve here - wait for CLOSED event to ensure ad is fully dismissed
        }
      );

      const unsubscribeDismissed = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          // Clean up both listeners
          unsubscribeEarned();
          unsubscribeDismissed();
          setIsShowing(false);
          setIsReady(false);
          // Preload next ad
          loadAd();
          // Resolve with whether the user earned a reward
          resolve(earnedReward);
        }
      );

      try {
        rewardedAd.show();
      } catch (err) {
        logger.error('Failed to show ad:', err);
        unsubscribeEarned();
        unsubscribeDismissed();
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
