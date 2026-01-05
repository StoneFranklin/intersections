import { useRewardedAdWebBase, type AdResult, type UseRewardedAdReturn } from './use-rewarded-ad-web-base';

export type { AdResult, UseRewardedAdReturn };

/**
 * Hook to manage full-screen ads (extra life) on web platform
 * Uses Monetag Vignette Banner for full-screen ads
 */
export function useRewardedAd(): UseRewardedAdReturn {
  const zoneId = process.env.EXPO_PUBLIC_MONETAG_EXTRA_LIFE_ZONE_ID || '10422328';
  return useRewardedAdWebBase(zoneId);
}
