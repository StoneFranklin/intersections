import { useCallback, useState } from 'react';

export type AdResult =
  | { success: true; rewarded: boolean }  // Ad shown, rewarded indicates if user completed it
  | { success: false; reason: 'load_failed' | 'show_failed' | 'timeout' };

export interface UseRewardedAdReturn {
  /** Whether the ad is currently loading */
  isLoading: boolean;
  /** Whether an ad is currently being shown */
  isShowing: boolean;
  /** Load and show the rewarded ad. Returns result of the attempt. */
  loadAndShow: () => Promise<AdResult>;
}

// Monetag SDK show function result type
interface MontagShowResult {
  reward_event_type: 'valued' | 'not_valued';
  estimated_price?: number;
  sub_zone_id?: number;
  zone_id?: number;
  request_var?: string;
  ymid?: string;
}

// Extend Window interface to include Monetag SDK functions
declare global {
  interface Window {
    monetag_sdk_loaded?: boolean;
    [key: `show_${string}`]: ((options?: { type?: string }) => Promise<MontagShowResult>) | undefined;
  }
}

/**
 * Generic base hook for managing full-screen ads on web platform.
 * Uses Monetag Vignette Banner with SDK mode for manual triggering.
 *
 * @param zoneId - The Monetag zone ID for this ad placement
 */
export function useRewardedAdWebBase(zoneId: string): UseRewardedAdReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowing, setIsShowing] = useState(false);

  const showFunctionName = `show_${zoneId}` as const;

  // Helper function to load the Monetag SDK script on-demand
  const loadMonetag = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !zoneId) {
        resolve(false);
        return;
      }

      // If already loaded and show function exists, resolve immediately
      if (window.monetag_sdk_loaded && typeof window[showFunctionName] === 'function') {
        resolve(true);
        return;
      }

      // Check if script is already in DOM but function not yet available
      const existingScript = document.querySelector(`script[data-zone="${zoneId}"]`);
      if (existingScript) {
        // Wait for the function to become available
        const checkInterval = setInterval(() => {
          if (typeof window[showFunctionName] === 'function') {
            clearInterval(checkInterval);
            window.monetag_sdk_loaded = true;
            resolve(true);
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          if (typeof window[showFunctionName] !== 'function') {
            resolve(false);
          }
        }, 5000);
        return;
      }

      try {
        const script = document.createElement('script');
        script.dataset.zone = zoneId;
        // Use data-sdk to get a callable function instead of auto-showing
        script.dataset.sdk = showFunctionName;
        // Disable auto-show completely: 0 ads / 0 hours / 0 interval / 0 delay / 0 cap
        script.dataset.auto = '0/0/0/0/0';
        script.src = 'https://gizokraijaw.net/vignette.min.js';
        script.async = true;

        script.onload = () => {
          // Wait for the SDK function to become available on window
          const checkInterval = setInterval(() => {
            if (typeof window[showFunctionName] === 'function') {
              clearInterval(checkInterval);
              window.monetag_sdk_loaded = true;
              console.log(`Monetag SDK loaded for zone ${zoneId}`);
              resolve(true);
            }
          }, 100);

          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            if (typeof window[showFunctionName] !== 'function') {
              console.error(`Monetag SDK function not available for zone ${zoneId}`);
              resolve(false);
            }
          }, 5000);
        };

        script.onerror = () => {
          console.error(`Failed to load Monetag SDK for zone ${zoneId}`);
          resolve(false);
        };

        const target = document.body || document.documentElement;
        if (target) {
          target.appendChild(script);
        } else {
          resolve(false);
        }
      } catch (err) {
        console.error('Error loading Monetag script:', err);
        resolve(false);
      }
    });
  }, [zoneId, showFunctionName]);

  const loadAndShow = useCallback(async (): Promise<AdResult> => {
    try {
      if (!zoneId) {
        console.error('Monetag zone ID not configured');
        return { success: false, reason: 'load_failed' };
      }

      setIsLoading(true);

      // Load the Monetag SDK script when user explicitly requests to watch an ad
      const loaded = await loadMonetag();

      if (!loaded) {
        setIsLoading(false);
        return { success: false, reason: 'load_failed' };
      }

      const showFunction = window[showFunctionName];
      if (typeof showFunction !== 'function') {
        console.error(`Monetag show function not found for zone ${zoneId}`);
        setIsLoading(false);
        return { success: false, reason: 'load_failed' };
      }

      setIsLoading(false);
      setIsShowing(true);

      try {
        // Call the SDK function to show the ad with a timeout
        // If the ad never shows or hangs, we timeout after 8 seconds
        const AD_TIMEOUT_MS = 5000;

        const adPromise = showFunction({ type: 'end' });
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Ad timeout')), AD_TIMEOUT_MS);
        });

        const result = await Promise.race([adPromise, timeoutPromise]);

        setIsShowing(false);
        console.log(`Monetag ad for zone ${zoneId} completed:`, result);

        // Grant reward if the ad was valued (user watched it)
        const rewarded = result.reward_event_type === 'valued';
        return { success: true, rewarded };
      } catch (adError) {
        // User may have closed ad early, ad timed out, or failed
        // This is expected behavior - still grant the reward
        const isTimeout = adError instanceof Error && adError.message === 'Ad timeout';
        console.warn(`Monetag ad ${isTimeout ? 'timed out' : 'closed early or failed'} for zone ${zoneId}`);
        setIsShowing(false);
        // Still grant reward on error to not punish user
        return { success: true, rewarded: true };
      }

    } catch (err) {
      console.error(`Monetag error for zone ${zoneId}:`, err);
      setIsLoading(false);
      setIsShowing(false);
      return { success: false, reason: 'show_failed' };
    }
  }, [zoneId, showFunctionName, loadMonetag]);

  return {
    isLoading,
    isShowing,
    loadAndShow,
  };
}
