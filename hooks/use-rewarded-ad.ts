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

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000;

// Error messages that indicate a no-fill situation
const NO_FILL_ERROR_PATTERNS = [
  'no fill',
  'no ad',
  'no ads',
  'empty response',
  'ad failed to load',
  'ERROR_CODE_NO_FILL',
];

function isNoFillError(errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  return NO_FILL_ERROR_PATTERNS.some(pattern => lowerMessage.includes(pattern.toLowerCase()));
}

export interface UseRewardedAdReturn {
  /** Whether the ad is currently loading */
  isLoading: boolean;
  /** Whether the ad is ready to show */
  isReady: boolean;
  /** Whether an ad is currently being shown */
  isShowing: boolean;
  /** Show the rewarded ad */
  show: () => Promise<boolean>;
  /** Manually retry loading the ad */
  retry: () => void;
  /** Error message if ad failed to load */
  error: string | null;
  /** Whether the error is a no-fill error (no ads available) */
  isNoFill: boolean;
}

/**
 * Hook to manage rewarded ads on iOS and Android
 * Uses Google Mobile Ads (AdMob) with automatic retry on failure
 */
export function useRewardedAd(): UseRewardedAdReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNoFill, setIsNoFill] = useState(false);
  const rewardedAdRef = useRef<RewardedAd | null>(null);
  const cleanupFnRef = useRef<(() => void) | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize AdMob on first launch
  useEffect(() => {
    MobileAds().initialize().catch((err) => {
      logger.error('Failed to initialize AdMob:', err);
    });
  }, []);

  const loadAd = useCallback((isRetry = false) => {
    // Clean up previous ad listeners before creating a new one
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
      cleanupFnRef.current = null;
    }

    // Clear any pending retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Reset retry count if this is a fresh load (not a retry)
    if (!isRetry) {
      retryCountRef.current = 0;
    }

    setIsLoading(true);
    setError(null);
    setIsNoFill(false);

    const adUnitId =
      Platform.OS === 'ios' ? REWARDED_AD_UNIT_IDS.ios : REWARDED_AD_UNIT_IDS.android;

    const ad = RewardedAd.createForAdRequest(adUnitId);

    const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsLoading(false);
      setIsReady(true);
      retryCountRef.current = 0; // Reset retry count on success
      rewardedAdRef.current = ad;
    });

    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (err) => {
        const errorMessage = err.message || 'Failed to load ad';
        const noFill = isNoFillError(errorMessage);

        logger.error('Rewarded ad error:', err);

        // If we haven't exceeded max retries, try again with exponential backoff
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCountRef.current - 1);
          logger.log(`Retrying ad load (attempt ${retryCountRef.current}/${MAX_RETRIES}) in ${delay}ms`);

          retryTimeoutRef.current = setTimeout(() => {
            loadAd(true);
          }, delay);
        } else {
          // Max retries exceeded, show error to user
          setIsLoading(false);
          setIsNoFill(noFill);
          setError(
            noFill
              ? 'No ads available right now. Please try again later.'
              : errorMessage
          );
        }
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
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
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

  // Manual retry function for user-initiated retries
  const retry = useCallback(() => {
    retryCountRef.current = 0;
    loadAd();
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
    retry,
    error,
    isNoFill,
  };
}
