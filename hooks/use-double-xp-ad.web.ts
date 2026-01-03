import { useRewardedAdWebBase, type AdResult } from './use-rewarded-ad-web-base';

export type { AdResult };

export type UseDoubleXPAdReturn = ReturnType<typeof useDoubleXPAd>;

/**
 * Hook to manage double XP rewarded ads on web platform
 * Uses Google AdSense Ad Placements API (adBreak) for rewarded ads
 * Falls back to simulation if AdSense is not available
 */
export function useDoubleXPAd() {
  return useRewardedAdWebBase('double-xp');
}
