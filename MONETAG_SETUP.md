# Monetag Ad Network Setup

This document explains the Monetag integration for web rewarded video ads.

## Overview

Monetag is the ad network being used for web-based rewarded video ads. The service worker file (`sw.js`) is required for Monetag verification and ad delivery.

## Service Worker Setup

### What is sw.js?

The `sw.js` file is a service worker script required by Monetag for:
1. **Site Verification**: Monetag checks for this file to verify you own the domain
2. **Ad Delivery**: The service worker helps deliver ads to your web app

### File Locations

The service worker exists in three locations:

1. **Root directory** (`sw.js`): Source file with your Monetag configuration
2. **Public directory** (`public/sw.js`): Available during development with `npm start --web`
3. **Dist directory** (`dist/sw.js`): Automatically copied during build for production deployment

### Configuration

Your current Monetag configuration in `sw.js`:

```javascript
self.options = {
    "domain": "3nbf4.com",
    "zoneId": 10422059
}
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')
```

- **domain**: Monetag's CDN domain
- **zoneId**: Your unique Monetag zone ID (10422059)

## Build Process

The build script (`scripts/fix-web-assets.js`) automatically handles copying the service worker:

1. When you run `npm run build` or `npm run predeploy`
2. The script exports your web app to the `dist` folder
3. It then copies `sw.js` from the root to `dist/sw.js`
4. The file is ready for deployment

### Build Commands

```bash
# Build for production
npm run build

# Build and deploy to GitHub Pages
npm run deploy

# Preview build locally
npx serve dist
```

## Verification for Monetag

When Monetag verifies your site, they will check for the service worker at:

```
https://yourdomain.com/sw.js
```

### Steps for Monetag Verification

1. **Deploy Your Site**: Run `npm run deploy` to push your built site
2. **Wait for Deployment**: Ensure your hosting provider (GitHub Pages) finishes deploying
3. **Verify in Browser**: Visit `https://yourdomain.com/sw.js` and confirm it loads
4. **Submit to Monetag**: In your Monetag dashboard, submit your domain for verification
5. **Wait for Approval**: Monetag will check for the service worker file (usually instant to 24 hours)

## Testing Locally

To test if the service worker is accessible locally:

### Development Server

```bash
npm start --web
```

Visit: `http://localhost:8081/sw.js` (or whatever port Expo uses)

### Production Build Preview

```bash
npm run build
npx serve dist
```

Visit: `http://localhost:3000/sw.js`

## Integration Status

- ✅ Service worker file created (`sw.js`)
- ✅ Copied to public directory for development
- ✅ Build script updated to copy to dist
- ✅ Ready for Monetag verification
- ⏳ Waiting for: Monetag account approval
- ⏳ Waiting for: Rewarded video ad integration code

## Next Steps

1. **Complete Monetag Registration**
   - Sign up at [Monetag](https://monetag.com)
   - Add your website/domain
   - Submit for verification

2. **Get Zone IDs**
   - Create ad zones in Monetag dashboard
   - Get zone IDs for rewarded video ads
   - Update environment variables

3. **Integrate Monetag SDK**
   - Add Monetag SDK script to `app/+html.tsx`
   - Create hooks for rewarded video ads
   - Update environment variables with credentials

4. **Test Integration**
   - Test locally with development server
   - Deploy to production
   - Verify ads load correctly

## Troubleshooting

### Service Worker Not Found (404)

**Problem**: When you visit `https://yourdomain.com/sw.js`, you get a 404 error.

**Solutions**:
1. Make sure you've run `npm run build` after creating the file
2. Make sure you've deployed the latest build
3. Check your hosting provider's cache - you may need to wait a few minutes or clear CDN cache
4. Verify the file exists in your `dist` directory before deploying

### Service Worker Blocked by CORS

**Problem**: Browser console shows CORS errors for the service worker.

**Solutions**:
1. Ensure your hosting provider serves `.js` files with correct MIME type
2. Service workers must be served from the same origin as your site
3. GitHub Pages handles this automatically

### Monetag Verification Failing

**Problem**: Monetag says they can't find the service worker.

**Solutions**:
1. Verify you can access the file in your browser
2. Make sure you're submitting the correct domain (with or without `www`)
3. Wait 24 hours - sometimes verification is not instant
4. Check that the file content matches what Monetag provided
5. Ensure your site is using HTTPS (required for service workers)

## Important Notes

- **HTTPS Required**: Service workers only work on HTTPS sites (or localhost for development)
- **Same Origin**: The service worker must be served from your domain, not a CDN
- **No Subfolders**: The service worker should be at the root (`/sw.js`), not in a subfolder
- **Cache Issues**: If you update the file, visitors may have the old version cached

## Support

- **Monetag Support**: Contact through your Monetag dashboard
- **Service Worker Issues**: Check browser console for error messages
- **Build Issues**: Check the output of `npm run build` for errors

## File Maintenance

If Monetag asks you to update the service worker content:

1. Edit the root `sw.js` file
2. Copy it to `public/sw.js`:
   ```bash
   cp sw.js public/sw.js
   ```
3. Rebuild and redeploy:
   ```bash
   npm run deploy
   ```
4. Wait for deployment to complete
5. Verify at `https://yourdomain.com/sw.js`

The build script will automatically handle copying it to the dist folder.
