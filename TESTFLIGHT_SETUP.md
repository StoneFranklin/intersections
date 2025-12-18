# iOS TestFlight Setup Guide

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com

2. **App Store Connect Setup**
   - Create your app at https://appstoreconnect.apple.com
   - Bundle ID: `com.stonefranklin.intersections`
   - App Name: Intersections

## EAS Credentials Setup (Recommended)

EAS will handle all iOS signing automatically:

```bash
# Configure iOS credentials
eas credentials

# Select iOS > production > Set up new credentials
# EAS will generate:
# - Distribution Certificate
# - Provisioning Profile
# - Push Notification Key (for notifications)
```

EAS stores these securely and applies them during builds.

## Build for TestFlight

```bash
# Build production iOS app
eas build --platform ios --profile production

# This creates an .ipa file ready for TestFlight
```

## Submit to TestFlight

After the build completes:

```bash
# Option 1: Auto-submit via EAS (Easiest)
eas submit --platform ios --profile production

# Option 2: Manual upload
# Download the .ipa file and upload via App Store Connect
# or use Xcode's Transporter app
```

## Important Configuration Notes

### Push Notifications (app.json:20)
- Changed `aps-environment` from "development" to "production"
- Required for production push notifications to work in TestFlight

### Build Number (app.json:14)
- Set initial build number to "1"
- EAS will auto-increment for each production build (eas.json:27)

### Version Management
- Version: "1.0.0" (app.json:5)
- Build number increments automatically with each build
- For App Store updates, increment version in app.json

## TestFlight Distribution

After submission:

1. Go to App Store Connect > TestFlight
2. Your build will appear after processing (10-30 minutes)
3. Add internal testers (up to 100, no review needed)
4. Add external testers (requires Apple review, ~24 hours)

## First-Time Submission Checklist

- [ ] Apple Developer account active
- [ ] App created in App Store Connect
- [ ] Privacy Policy URL ready (required for TestFlight)
- [ ] App icon and screenshots prepared
- [ ] Test the app thoroughly before submission

## Build Commands Reference

```bash
# iOS only
eas build --platform ios --profile production

# Both platforms
eas build --platform all --profile production

# Check build status
eas build:list

# Submit to stores
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

## Troubleshooting

### Missing Credentials
If build fails with credential errors:
```bash
eas credentials
# Re-setup credentials for iOS > production
```

### Build Number Conflicts
EAS auto-increment handles this, but if you manually set build numbers:
- Each TestFlight build must have a unique build number
- Build numbers must increase monotonically

### Apple Sign-In Setup
Your app uses Apple Authentication (app.json:39). Make sure to:
1. Enable "Sign in with Apple" capability in App Store Connect
2. Configure your App ID in Apple Developer portal
