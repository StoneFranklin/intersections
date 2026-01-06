import { useCallback, useState } from 'react';

export type AdResult =
  | { success: true; rewarded: boolean }
  | { success: false; reason: 'load_failed' | 'show_failed' | 'timeout' };

export interface UseRewardedAdReturn {
  isLoading: boolean;
  isShowing: boolean;
  loadAndShow: () => Promise<AdResult>;
}

/**
 * Web implementation - no ads for now, just grants reward immediately.
 * TODO: Integrate a proper rewarded ad SDK for web (e.g., Google Ad Manager, ayeT-Studios)
 */
export function useRewardedAdWebBase(_zoneId: string): UseRewardedAdReturn {
  const [isLoading] = useState(false);
  const [isShowing] = useState(false);

  const loadAndShow = useCallback(async (): Promise<AdResult> => {
    // No ads on web for now - just grant the reward immediately
    return { success: true, rewarded: true };
  }, []);

  return {
    isLoading,
    isShowing,
    loadAndShow,
  };
}
