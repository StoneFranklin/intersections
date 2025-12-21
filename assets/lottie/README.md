# Lottie Animations

This directory contains Lottie animation files for the app.

## Current Animations

- **logo-animation.json** - Main menu logo animation (placeholder)

## How to Replace with Your Own Animation

1. **Find a Lottie animation:**
   - Visit [LottieFiles.com](https://lottiefiles.com/)
   - Search for animations (e.g., "logo", "word game", "text animation")
   - Download the `.json` file

2. **Replace the placeholder:**
   - Delete or rename `logo-animation.json`
   - Place your new animation file here
   - Rename it to `logo-animation.json` OR update the import in `app/(tabs)/_components/home-menu.tsx` line 240

3. **Animation specifications:**
   - Recommended size: 150x150 (matches the current logo dimensions)
   - Format: Lottie JSON (.json file)
   - The animation will auto-play and loop continuously

## Tips for Choosing Animations

- Keep animations lightweight (< 100KB) for better performance
- Ensure the animation looks good on dark backgrounds (app background is `#0f0f1a`)
- Preview animations before downloading to ensure they fit your brand
- Consider animations that work well when looping

## Customization Options

In `home-menu.tsx`, you can customize the LottieView component:

```tsx
<LottieView
  source={require('@/assets/lottie/logo-animation.json')}
  style={styles.menuLogo}
  autoPlay={true}      // Auto-play on load
  loop={true}          // Loop continuously
  speed={1.0}          // Animation speed (1.0 = normal)
/>
```

Available props:
- `autoPlay`: Start animation automatically (true/false)
- `loop`: Loop the animation (true/false)
- `speed`: Animation speed multiplier (e.g., 0.5 = half speed, 2.0 = double speed)
- `onAnimationFinish`: Callback when animation completes (if not looping)
