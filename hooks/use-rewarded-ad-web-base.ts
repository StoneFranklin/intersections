import { useCallback, useState, useEffect } from 'react';

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

// Extend Window interface to include Monetag Vignette
declare global {
  interface Window {
    monetag_vignette_loaded?: boolean;
  }
}

/**
 * Generic base hook for managing full-screen ads on web platform.
 * Uses Monetag Vignette Banner for full-screen ads.
 * Falls back to simulation if Monetag is not available.
 *
 * @param zoneId - The Monetag zone ID for this ad placement
 */
export function useRewardedAdWebBase(zoneId: string): UseRewardedAdReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Monetag Vignette script once
  useEffect(() => {
    if (typeof window === 'undefined' || !zoneId) return;

    // Check if already loaded
    if (window.monetag_vignette_loaded) {
      setScriptLoaded(true);
      return;
    }

    // Load the Monetag Vignette script dynamically
    try {
      const script = document.createElement('script');
      script.dataset.zone = zoneId;
      script.src = 'https://gizokraijaw.net/vignette.min.js';
      script.async = true;

      script.onload = () => {
        window.monetag_vignette_loaded = true;
        setScriptLoaded(true);
        console.log(`Monetag Vignette loaded for zone ${zoneId}`);
      };

      script.onerror = () => {
        console.error(`Failed to load Monetag Vignette for zone ${zoneId}`);
        setScriptLoaded(false);
      };

      const target = [document.documentElement, document.body].filter(Boolean).pop();
      if (target) {
        target.appendChild(script);
      }
    } catch (err) {
      console.error('Error loading Monetag script:', err);
      setScriptLoaded(false);
    }
  }, [zoneId]);

  const loadAndShow = useCallback(async (): Promise<AdResult> => {
    return new Promise((resolve) => {
      try {
        if (!zoneId) {
          console.error('Monetag zone ID not configured');
          resolve({ success: false, reason: 'load_failed' });
          return;
        }

        setIsLoading(true);

        // Monetag Vignette shows automatically after script loads
        // We'll simulate the flow since we can't detect when user closes it
        setTimeout(() => {
          setIsLoading(false);
          setIsShowing(true);

          // Simulate ad display duration (5 seconds minimum before user can close)
          // In reality, Monetag controls this
          setTimeout(() => {
            setIsShowing(false);
            console.log(`Monetag Vignette for zone ${zoneId} completed`);
            // Always grant reward since we can't detect if user actually watched
            resolve({ success: true, rewarded: true });
          }, 5000);
        }, 500);

      } catch (err) {
        console.error(`Monetag Vignette error for zone ${zoneId}:`, err);
        setIsLoading(false);
        setIsShowing(false);
        resolve({ success: false, reason: 'show_failed' });
      }
    });
  }, [zoneId]);

  return {
    isLoading,
    isShowing,
    loadAndShow,
  };
}
