import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import MobileAds, {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Test unit IDs for development
const REWARDED_AD_UNIT_IDS = {
  ios: TestIds.REWARDED,
  android: TestIds.REWARDED,
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
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  // Initialize AdMob on first launch
  useEffect(() => {
    MobileAds().initialize().catch((err) => {
      console.error('Failed to initialize AdMob:', err);
    });
  }, []);

  // Load the ad when component mounts
  useEffect(() => {
    loadAd();

    return () => {
      // Cleanup
      if (rewardedAd) {
        rewardedAd.removeAllListeners();
      }
    };
  }, []);

  const loadAd = () => {
    setIsLoading(true);
    setError(null);

    const adUnitId =
      Platform.OS === 'ios' ? REWARDED_AD_UNIT_IDS.ios : REWARDED_AD_UNIT_IDS.android;

    const ad = RewardedAd.createForAdRequest(adUnitId);

    const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsLoading(false);
      setIsReady(true);
      setRewardedAd(ad);
    });

    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        setIsLoading(false);
        setError(error.message || 'Failed to load ad');
        console.error('Rewarded ad error:', error);
      }
    );

    ad.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
    };
  };

  const show = async (): Promise<boolean> => {
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
          console.log('User earned reward:', reward);
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
        console.error('Failed to show ad:', err);
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
