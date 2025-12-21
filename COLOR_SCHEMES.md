# Color Scheme System

This app uses a centralized color scheme system that makes it easy to swap between different color themes.

## How to Swap Color Schemes

All colors are defined in [`constants/theme.ts`](constants/theme.ts). To change the active color scheme:

1. Open `constants/theme.ts`
2. Find the `ACTIVE_SCHEME` variable (around line 267)
3. Change it to one of the available schemes:
   - `'default'` - Purple/warm theme (current)
   - `'ocean'` - Blue ocean theme
   - `'forest'` - Green forest theme
   - `'sunset'` - Orange/red sunset theme

```typescript
// Change this line to swap themes:
export const ACTIVE_SCHEME: ColorSchemeName = 'default';  // Change 'default' to 'ocean', 'forest', or 'sunset'
```

That's it! The entire app will automatically use the new color scheme.

## Available Color Schemes

### Default (Purple/Warm)
- Primary: Purple (#A855F7)
- Background: Dark navy (#0f0f1a)
- Success: Green (#4ade80)
- Warning: Amber (#f59e0b)

### Ocean (Blue)
- Primary: Blue (#3b82f6)
- Background: Deep ocean blue (#0a1628)
- Success: Emerald (#10b981)
- Warning: Amber (#f59e0b)

### Forest (Green)
- Primary: Green (#22c55e)
- Background: Forest dark (#0f1e0f)
- Success: Emerald (#10b981)
- Warning: Yellow (#fbbf24)

### Sunset (Orange/Red)
- Primary: Orange (#f97316)
- Background: Warm dark (#1a0f0a)
- Success: Emerald (#10b981)
- Warning: Yellow (#fbbf24)

## Using Colors in Your Code

Import the `colorScheme` object and use it in your styles:

```typescript
import { colorScheme } from '@/constants/theme';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorScheme.backgroundPrimary,
  },
  text: {
    color: colorScheme.textPrimary,
  },
  button: {
    backgroundColor: colorScheme.brandPrimary,
  },
});
```

## Available Color Variables

### Backgrounds
- `backgroundPrimary` - Main background color
- `backgroundSecondary` - Card/container backgrounds
- `backgroundTertiary` - Elevated elements

### Text Colors
- `textPrimary` - Main text (white)
- `textSecondary` - Secondary text (light gray)
- `textTertiary` - Tertiary text (medium gray)
- `textMuted` - Muted text (dark gray)
- `textDisabled` - Disabled text (very dark gray)

### Brand Colors
- `brandPrimary` - Primary brand color (purple/blue/green/orange depending on theme)
- `brandSecondary` - Darker variant of primary
- `brandLight` - Lighter variant of primary

### Status Colors
- `success` - Success state (green)
- `successDark` - Dark success variant
- `successBg` - Success background
- `successText` - Success text color
- `error` - Error state (red)
- `errorLight` - Light error variant
- `errorBg` - Error background
- `errorText` - Error text
- `warning` - Warning state (amber)
- `warningBg` - Warning background
- `info` - Info state

### UI Elements
- `gold` - Gold/yellow accent
- `yellow` - Yellow color
- `orange` - Orange color
- `borderPrimary` - Primary border color
- `borderSecondary` - Secondary border color
- `borderAccent` - Accent border color (matches brand)

### Game-Specific
- `cellEmpty` - Empty game cell
- `cellFilled` - Filled game cell
- `cellCorrect` - Correct answer cell
- `cellIncorrect` - Incorrect answer cell
- `cellSelected` - Selected cell

### Overlays
- `overlayDark` - Dark overlay (80% opacity)
- `overlayMedium` - Medium overlay (70% opacity)
- `overlayLight` - Light tinted overlay (15% opacity)

### Auth
- `googleButton` - Google button background
- `googleButtonText` - Google button text
- `appleButton` - Apple button background
- `appleButtonText` - Apple button text
- `authButton` - Generic auth button

## Creating a New Color Scheme

To add a new color scheme:

1. Open `constants/theme.ts`
2. Add a new object to the `colorSchemes` object following the existing pattern
3. Make sure to include all required color properties
4. Update the `ACTIVE_SCHEME` type and documentation

Example:

```typescript
const colorSchemes = {
  // ... existing schemes ...

  // My custom theme
  midnight: {
    backgroundPrimary: '#0a0a0f',
    backgroundSecondary: '#151520',
    backgroundTertiary: '#252530',
    // ... add all other required colors
  },
};
```

## Migration Status

The following files have been updated to use the centralized color scheme:
- ✅ `constants/theme.ts` - Main theme file
- ✅ `app/(tabs)/index.styles.ts` - Main game styles
- ✅ `components/game/game-cell.tsx` - Game cell component

To update additional files:
1. Import `colorScheme` from `@/constants/theme`
2. Replace hardcoded hex colors with `colorScheme` properties
3. Use batch find/replace for common colors (see examples in commit history)

## Best Practices

1. **Always use color scheme variables** - Never hardcode hex colors in new code
2. **Be semantic** - Use color names that describe their purpose (e.g., `successBg` not `greenLight`)
3. **Test all themes** - When changing colors, test with different themes active
4. **Maintain consistency** - Keep similar UI elements using the same color variables
