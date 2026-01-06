import { useRewardedAdWebBase, type AdResult, type UseRewardedAdReturn } from './use-rewarded-ad-web-base';

export type { AdResult, UseRewardedAdReturn };

/**
 * Hook to manage rewarded ads (extra life) on web platform
 * Currently disabled - grants reward immediately without showing ads
 */
export function useRewardedAd(): UseRewardedAdReturn {
  return useRewardedAdWebBase('');
}
