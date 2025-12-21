# Quick Start: Swapping Color Schemes

Want to change the app's color theme? Here's how in 3 simple steps:

## Step 1: Open the theme file
Open [`constants/theme.ts`](constants/theme.ts)

## Step 2: Change one line
Find line 267 that says:
```typescript
export const ACTIVE_SCHEME: ColorSchemeName = 'default';
```

Change `'default'` to one of these:
- **`'ocean'`** - Cool blue theme
- **`'forest'`** - Nature green theme
- **`'sunset'`** - Warm orange/red theme
- **`'default'`** - Original purple theme

## Step 3: Save and reload
That's it! The entire app now uses your chosen color scheme.

---

## Examples

### To use the Ocean theme:
```typescript
export const ACTIVE_SCHEME: ColorSchemeName = 'ocean';
```

### To use the Forest theme:
```typescript
export const ACTIVE_SCHEME: ColorSchemeName = 'forest';
```

### To use the Sunset theme:
```typescript
export const ACTIVE_SCHEME: ColorSchemeName = 'sunset';
```

---

For more details on creating custom themes and using colors in your code, see [COLOR_SCHEMES.md](COLOR_SCHEMES.md).
