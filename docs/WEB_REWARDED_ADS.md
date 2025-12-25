# Web Rewarded Ads Implementation Guide

This document explains how rewarded ads work on the web platform using Google AdSense AdBreak API.

## Overview

The game offers players a rewarded ad when they run out of lives. If they watch the ad to completion, they receive an extra life to continue playing.

## Architecture

### Platform-Specific Implementation

The app uses React Native's platform extensions to provide different implementations:

- **Mobile** (`hooks/use-rewarded-ad.ts`): Uses Google Mobile Ads (AdMob)
- **Web** (`hooks/use-rewarded-ad.web.ts`): Uses Google AdSense AdBreak API

### How It Works

1. **Game Over Detection** (`app/(tabs)/_components/game-content.tsx:96-101`)
   - When lives reach 0, the game shows the rewarded ad modal

2. **User Action** (`app/(tabs)/_components/game-content.tsx:108-120`)
   - User clicks "Watch Ad" → `rewardedAd.show()` is called
   - User clicks "No Thanks" → Game over screen appears

3. **Ad Display** (`hooks/use-rewarded-ad.web.ts:26-74`)
   - Checks for `window.adsbygoogle` and `adBreak` availability
   - Calls `adBreak({ type: 'reward', ... })`
   - Tracks whether user watched full ad via `breakStatus === 'viewed'`

4. **Reward Grant** (`app/(tabs)/_components/game-content.tsx:113-116`)
   - If user watched full ad, they receive an extra life
   - Game continues from where they left off

## Setup Requirements

### 1. Google AdSense Account

1. Sign up at https://www.google.com/adsense/
2. Submit your site for approval
3. Once approved, enable **AdSense for Games**
4. Configure **Ad Placement API** in your AdSense dashboard

### 2. Environment Configuration

Create a `.env` file with your publisher ID:

```bash
EXPO_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
```

Find your publisher ID in the AdSense dashboard under "Account" → "Settings".

### 3. HTML Setup

The app automatically loads required scripts in `app/+html.tsx`:

```tsx
{/* Google AdSense */}
<script
  async
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.EXPO_PUBLIC_ADSENSE_PUBLISHER_ID}`}
  crossOrigin="anonymous"
/>

{/* Google AdSense AdBreak API for rewarded ads */}
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adbreak.js"
/>
```

## Testing

### Without AdSense Setup

The implementation includes a fallback simulation for development:

```typescript
// Simulates a 2-second ad view
setTimeout(() => {
  setIsShowing(false);
  resolve(true); // Always grants reward
}, 2000);
```

This allows you to test the full flow without a configured AdSense account.

### With AdSense Setup

1. Deploy your app to a public URL
2. Add the URL to your AdSense account
3. Wait for approval (can take 24-48 hours)
4. Test on the deployed site

**Note**: AdSense ads only show on approved, publicly accessible domains. They won't work on `localhost` or development builds.

## API Reference

### `useRewardedAd()` Hook

Returns an object with:

```typescript
{
  isLoading: boolean;    // Whether ad is loading (always false on web)
  isReady: boolean;      // Whether ad is ready to show (always true on web)
  isShowing: boolean;    // Whether ad is currently displaying
  show: () => Promise<boolean>;  // Show the ad, returns true if rewarded
  error: string | null;  // Error message if ad failed
}
```

### AdBreak API Configuration

```typescript
adBreak({
  type: 'reward',           // Ad type
  name: 'extra-life',       // Placement name
  beforeAd: () => {},       // Called before ad shows
  afterAd: () => {},        // Called after ad dismisses
  adBreakDone: (info) => {  // Called when ad completes
    // info.breakStatus === 'viewed' means user watched full ad
  },
});
```

## Best Practices

### 1. User Experience

- ✅ Only show rewarded ads when user has a clear incentive (extra life)
- ✅ Make it optional ("Watch Ad" vs "No Thanks")
- ✅ Show loading/showing state during ad playback
- ❌ Don't force ads on users
- ❌ Don't show ads too frequently

### 2. Error Handling

The implementation includes robust error handling:

```typescript
try {
  // Attempt to show ad
} catch (err) {
  console.error('Web ad error:', err);
  setError('Failed to show ad');
  resolve(false); // Don't grant reward on error
}
```

### 3. Fallback Strategy

Always provide a fallback for when ads aren't available:

```typescript
if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
  // Show real ad
} else {
  // Show simulation or skip
}
```

## Troubleshooting

### Ads Not Showing

1. **Check publisher ID**: Ensure `EXPO_PUBLIC_ADSENSE_PUBLISHER_ID` is set correctly
2. **Verify domain**: AdSense only works on approved public domains
3. **Check console**: Look for AdSense errors in browser console
4. **Ad blockers**: Ask testers to disable ad blockers
5. **AdSense status**: Verify your account is approved and in good standing

### Ads Showing but Not Rewarding

1. Check `breakStatus` in `adBreakDone` callback
2. Only grant reward when `breakStatus === 'viewed'`
3. Handle other statuses: `'dismissed'`, `'not_viewed'`, etc.

### Development Testing

Use the built-in simulation mode:
- Shows a 2-second delay instead of real ad
- Always grants reward
- Allows full feature testing without AdSense

## Monetization Notes

### Revenue Expectations

- **Fill Rate**: Not all ad requests will be filled by AdSense
- **eCPM**: Varies widely based on geography, content, audience
- **Rewarded Ads**: Typically have higher eCPM than banner ads

### Optimization Tips

1. **Limit frequency**: Don't show ads too often to the same user
2. **Placement timing**: Show ads at natural break points (game over)
3. **Clear value**: Make sure users understand what they'll get
4. **Track metrics**: Monitor fill rate, completion rate, revenue

## Related Files

- `hooks/use-rewarded-ad.web.ts` - Web implementation
- `hooks/use-rewarded-ad.ts` - Mobile implementation
- `components/ads/rewarded-ad-modal.tsx` - UI component
- `app/(tabs)/_components/game-content.tsx:96-120` - Integration example
- `app/+html.tsx:22-33` - Script loading

## Additional Resources

- [Google AdSense Documentation](https://support.google.com/adsense)
- [AdSense for Games Guide](https://support.google.com/adsense/answer/9989980)
- [Ad Placement API Reference](https://developers.google.com/ad-placement/apis/adbreak)
