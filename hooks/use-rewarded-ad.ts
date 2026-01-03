import { TestIds } from 'react-native-google-mobile-ads';
import { useRewardedAdBase, type AdResult, type UseRewardedAdReturn } from './use-rewarded-ad-base';

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

export type { AdResult, UseRewardedAdReturn };

/**
 * Hook to manage rewarded ads (extra life) on iOS and Android
 * Loads ad on-demand when user requests to watch
 */
export function useRewardedAd(): UseRewardedAdReturn {
  return useRewardedAdBase(REWARDED_AD_UNIT_IDS, 'rewarded');
}
