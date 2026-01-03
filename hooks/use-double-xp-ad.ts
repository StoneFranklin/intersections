import { TestIds } from 'react-native-google-mobile-ads';
import { useRewardedAdBase, type AdResult } from './use-rewarded-ad-base';

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

export type { AdResult };

export type UseDoubleXPAdReturn = ReturnType<typeof useDoubleXPAd>;

/**
 * Hook to manage double XP rewarded ads on iOS and Android
 * Loads ad on-demand when user requests to watch
 */
export function useDoubleXPAd() {
  return useRewardedAdBase(DOUBLE_XP_AD_UNIT_IDS, 'double-xp');
}
