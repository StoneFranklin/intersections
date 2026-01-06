import { useRewardedAdWebBase, type AdResult } from './use-rewarded-ad-web-base';

export type { AdResult };

export type UseDoubleXPAdReturn = ReturnType<typeof useDoubleXPAd>;

/**
 * Hook to manage double XP ads on web platform
 * Currently disabled - grants reward immediately without showing ads
 */
export function useDoubleXPAd() {
  return useRewardedAdWebBase('');
}
