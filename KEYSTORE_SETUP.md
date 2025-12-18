# Android Keystore Setup for Google Play

## Generate Production Keystore

Run this command to generate your production keystore:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore intersections-upload-key.keystore -alias intersections-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

You will be prompted for:
- Keystore password (choose a strong password)
- Key password (choose a strong password)
- Your name, organization, city, state, country

**IMPORTANT**: Save these passwords securely. You'll need them for every app update.

## Store Keystore Securely

1. Move the keystore to a secure location: `android/app/intersections-upload-key.keystore`
2. Add to `.gitignore` (if not already):
   ```
   *.keystore
   !debug.keystore
   ```

## Configure Gradle Properties

Create or edit `android/gradle.properties` and add:

```properties
INTERSECTIONS_UPLOAD_STORE_FILE=intersections-upload-key.keystore
INTERSECTIONS_UPLOAD_KEY_ALIAS=intersections-key-alias
INTERSECTIONS_UPLOAD_STORE_PASSWORD=your_keystore_password
INTERSECTIONS_UPLOAD_KEY_PASSWORD=your_key_password
```

**IMPORTANT**: Add `gradle.properties` to `.gitignore` to protect your passwords.

## For EAS Build (Recommended)

Instead of storing credentials locally, use EAS credentials management:

```bash
eas credentials
```

Select "Android" > "production" > "Set up a new keystore"

EAS will generate and securely store your keystore.

## Build AAB for Google Play Internal Testing

```bash
# Using EAS (Recommended)
eas build --platform android --profile production

# The AAB will be downloaded when complete
```

## Submit to Google Play

After building:

```bash
# Option 1: Manual upload to Google Play Console
# Download the .aab file and upload via console.play.google.com

# Option 2: Auto-submit via EAS
eas submit --platform android --profile production
```

## Version Management

Your `versionCode` is currently 1 in `android/app/build.gradle:95`.

For each new release to Google Play:
- Increment `versionCode` by 1 (e.g., 1, 2, 3...)
- Update `versionName` as needed (e.g., "1.0.0", "1.0.1", "1.1.0")

Note: EAS can auto-increment versions with `"autoIncrement": true` in eas.json (already configured).
