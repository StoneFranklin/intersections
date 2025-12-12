import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

interface WebAdBannerProps {
  adSlot: string;
  style?: object;
}

/**
 * Google AdSense banner ad for web only
 * 
 * Before using:
 * 1. Sign up at https://www.google.com/adsense/
 * 2. Add your site and get approved
 * 3. Create an ad unit and get the slot ID
 * 4. Add your publisher ID to app/+html.tsx
 */
export function WebAdBanner({ adSlot, style }: WebAdBannerProps) {
  // Only render on web
  if (Platform.OS !== 'web') {
    return null;
  }

  useEffect(() => {
    // Push the ad to AdSense when component mounts
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <View style={[styles.container, style]}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: 90,
        }}
        data-ad-client={process.env.EXPO_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
});
