# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables (optional for web ads)

   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Then add your Google AdSense publisher ID (required for web rewarded ads):
   ```
   EXPO_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```

   To get your publisher ID:
   - Sign up at https://www.google.com/adsense/
   - Get approved for AdSense
   - Find your publisher ID in the AdSense dashboard

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Monetization with Ads

This app includes support for rewarded ads across platforms:

### Mobile (iOS/Android)
- Uses **Google Mobile Ads (AdMob)** via `react-native-google-mobile-ads`
- Configured in `app.json` with test ad unit IDs
- Replace test IDs with production IDs before releasing

### Web
- Uses **Google AdSense AdBreak API** for rewarded ads
- Requires `EXPO_PUBLIC_ADSENSE_PUBLISHER_ID` environment variable
- Includes fallback simulation for testing without AdSense setup

### Implementation
- Platform-specific hooks: `hooks/use-rewarded-ad.ts` (mobile) and `hooks/use-rewarded-ad.web.ts` (web)
- Rewarded ad modal: `components/ads/rewarded-ad-modal.tsx`
- Web banner ads: `components/ads/web-ad-banner.tsx`

### Testing Rewarded Ads
**Mobile**: Test ads work automatically in development
**Web**: Without AdSense setup, a 2-second simulation runs instead of real ads
