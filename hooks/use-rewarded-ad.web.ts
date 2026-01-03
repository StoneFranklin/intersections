import { useRewardedAdWebBase, type AdResult, type UseRewardedAdReturn } from './use-rewarded-ad-web-base';

export type { AdResult, UseRewardedAdReturn };

/**
 * Hook to manage rewarded ads (extra life) on web platform
 * Uses Google AdSense Ad Placements API (adBreak) for rewarded ads
 * Falls back to simulation if AdSense is not available
 */
export function useRewardedAd(): UseRewardedAdReturn {
  return useRewardedAdWebBase('extra-life');
}
