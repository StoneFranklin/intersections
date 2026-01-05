import { useRewardedAdWebBase, type AdResult } from './use-rewarded-ad-web-base';

export type { AdResult };

export type UseDoubleXPAdReturn = ReturnType<typeof useDoubleXPAd>;

/**
 * Hook to manage double XP full-screen ads on web platform
 * Uses Monetag Vignette Banner for full-screen ads
 * Note: Monetag Vignette only supports one zone per page, so uses same zone as extra life.
 */
export function useDoubleXPAd() {
  const zoneId = process.env.EXPO_PUBLIC_MONETAG_DOUBLE_XP_ZONE_ID || '10422328';
  return useRewardedAdWebBase(zoneId);
}
