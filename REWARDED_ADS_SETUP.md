# Rewarded Ads Implementation

This document describes the rewarded ads implementation across web, Android, and iOS platforms.

## Overview

Users are offered the opportunity to watch a rewarded ad to get an extra life when they run out of lives during gameplay.

## Platform-Specific Implementation

### iOS & Android (Mobile)
- **SDK**: Google Mobile Ads (AdMob) via `react-native-google-mobile-ads`
- **Current Status**: Using **test ad unit IDs**
- **Ad Type**: Rewarded Video

### Web
- **SDK**: Google AdSense
- **Current Status**: Using **test/simulated ads**
- **Ad Type**: Rewarded interstitial

## How It Works

1. When a player runs out of lives (lives reach 0), a modal automatically appears
2. The modal offers the player a choice:
   - **Watch Ad**: Watch a short video ad to earn an extra life
   - **No Thanks**: Decline and end the game
3. If the player watches the ad to completion:
   - They receive +1 extra life
   - The game timer resumes
   - They can continue playing
4. If they decline or don't complete the ad:
   - The game ends normally
   - Their score is submitted

## Files Created/Modified

### New Files
- `hooks/use-rewarded-ad.ts` - Cross-platform rewarded ad hook
- `components/ads/rewarded-ad-modal.tsx` - Modal UI for ad offer
- `REWARDED_ADS_SETUP.md` - This documentation

### Modified Files
- `app.json` - Added Google Mobile Ads plugin configuration
- `app/(tabs)/index.tsx` - Integrated rewarded ad modal into game screen
- `hooks/use-game-state.ts` - Added `grantExtraLife()` function
- `package.json` - Added `react-native-google-mobile-ads` dependency

## Switching to Production Ad Units

### Step 1: Set Up AdMob (iOS & Android)

1. **Create AdMob Account**
   - Go to https://admob.google.com/
   - Sign in with your Google account
   - Accept terms and set up your account

2. **Create App Entries**
   - In AdMob dashboard, click "Apps" → "Add App"
   - Create one app entry for iOS: `com.stonefranklin.intersections`
   - Create one app entry for Android: `com.stonefranklin.intersections`

3. **Create Rewarded Ad Units**
   - For each app (iOS and Android):
     - Click "Ad units" → "Add Ad Unit"
     - Select "Rewarded"
     - Name it something like "Extra Life Reward"
     - Click "Create ad unit"
     - **Copy the Ad Unit ID** (format: `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`)

4. **Update app.json**
   - Replace the test App IDs with your production App IDs:
   ```json
   [
     "react-native-google-mobile-ads",
     {
       "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ",
       "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
     }
   ]
   ```

5. **Update use-rewarded-ad.ts**
   - Replace test ad unit IDs with your production ad unit IDs:
   ```typescript
   const REWARDED_AD_UNIT_IDS = {
     ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
     android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
     web: 'ca-pub-test-rewarded-ad', // Update after AdSense setup
   };
   ```

6. **Rebuild Native Apps**
   ```bash
   # For iOS
   npx expo prebuild --platform ios
   npx expo run:ios

   # For Android
   npx expo prebuild --platform android
   npx expo run:android
   ```

### Step 2: Set Up AdSense (Web)

1. **Create AdSense Account**
   - Go to https://www.google.com/adsense/
   - Sign up and get your site approved
   - This process can take several days

2. **Enable AdSense for Games**
   - In AdSense dashboard, look for "Games" or "AdSense for Games"
   - Follow the setup wizard

3. **Get Your Publisher ID**
   - In AdSense dashboard, you'll find your publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)

4. **Update Environment Variable**
   - Create/update `.env` file:
   ```
   EXPO_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```

5. **Set Up Rewarded Ads**
   - AdSense rewarded ads use the `adBreak` API
   - The current implementation in `use-rewarded-ad.ts` is already set up for this
   - Make sure your domain is added to AdSense approved sites

6. **Update app/+html.tsx** (if needed)
   - The AdSense script tag is already configured to use the environment variable
   - Verify it's loading correctly in production

## Testing

### Test Ad Units (Current Configuration)
The app is currently configured with test ad unit IDs:
- **iOS Test ID**: `TestIds.REWARDED` (from Google Mobile Ads SDK)
- **Android Test ID**: `TestIds.REWARDED` (from Google Mobile Ads SDK)
- **Web**: Simulated ad with 2-second delay

### Testing Checklist
- [ ] On iOS, verify test ads show when lives reach 0
- [ ] On Android, verify test ads show when lives reach 0
- [ ] On Web, verify simulated ad flow works
- [ ] Verify that watching ad to completion grants +1 life
- [ ] Verify that declining ad ends the game
- [ ] Verify that closing ad without completion ends the game
- [ ] Verify modal doesn't appear again after declining

## Important Notes

### Production Considerations
1. **Ad Fill Rate**: Production ads may not always be available. Handle this gracefully.
2. **GDPR/Privacy**:
   - Implement consent management for EU users
   - See: https://developers.google.com/admob/unity/privacy
3. **COPPA Compliance**: If targeting children, configure accordingly
4. **Testing vs Production**: Never use test ad IDs in production or real ad IDs during testing

### Revenue & Analytics
1. Monitor ad performance in AdMob dashboard
2. Track metrics:
   - Ad requests
   - Fill rate
   - Impressions
   - eCPM (earnings per 1000 impressions)
3. Consider implementing analytics to track:
   - How often users watch ads vs decline
   - Impact on user retention
   - Average extra lives granted per session

### Known Limitations
1. **Web Implementation**: The web implementation uses a simplified approach. For production, consider:
   - Implementing proper AdSense rewarded ads via H5 Games Ads
   - Or using a different ad network with better web support
2. **Ad Loading Time**: Ads take time to load. The current implementation shows a loading state.
3. **No Internet**: If user has no internet, ad loading will fail. Error handling is in place.

## Troubleshooting

### Ads not showing on mobile
1. Check that you've run `npx expo prebuild` after updating app.json
2. Verify ad unit IDs are correct (no typos)
3. Check that app IDs in app.json match your AdMob apps
4. Wait a few hours - new ad units can take time to activate
5. Check device logs for errors

### Ads not showing on web
1. Verify AdSense script is loading (check browser console)
2. Check that EXPO_PUBLIC_ADSENSE_PUBLISHER_ID is set
3. Verify your domain is approved in AdSense
4. AdSense can take 24-48 hours to start serving ads

### "Test ads still showing in production"
1. Verify you updated the ad unit IDs in `use-rewarded-ad.ts`
2. Rebuild the app (test IDs are hardcoded at build time)
3. Clear app cache/data

## Support Resources

- **AdMob Documentation**: https://developers.google.com/admob
- **react-native-google-mobile-ads**: https://docs.page/invertase/react-native-google-mobile-ads
- **AdSense Help**: https://support.google.com/adsense
- **Expo Docs**: https://docs.expo.dev/

## Questions?

If you encounter issues or have questions about the implementation, please:
1. Check the troubleshooting section above
2. Review the official documentation links
3. Check the code comments in the implementation files
