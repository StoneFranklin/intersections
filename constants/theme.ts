/**
 * Centralized color scheme system for the app.
 * To swap color schemes, simply change the ACTIVE_SCHEME variable below.
 */

import { Platform } from 'react-native';

// Color scheme definitions
const colorSchemes = {
  // Default purple/warm theme
  default: {
    // Background colors
    backgroundPrimary: '#0f0f1a',
    backgroundSecondary: '#1a1a2e',
    backgroundTertiary: '#2a2a4e',

    // Text colors
    textPrimary: '#fff',
    textSecondary: '#ccc',
    textTertiary: '#888',
    textMuted: '#666',
    textDisabled: '#555',

    // Brand/accent colors
    brandPrimary: '#A855F7',       // Purple
    brandSecondary: '#7C3AED',     // Darker purple
    brandLight: '#C084FC',         // Lighter purple

    // Status colors
    success: '#4ade80',
    successDark: '#2a5a3d',
    successBg: '#1a3d2d',
    successText: '#a0d0b0',

    error: '#ef4444',
    errorLight: '#ff6b6b',
    errorBg: '#3d2d2d',
    errorText: '#f87171',

    warning: '#f59e0b',
    warningBg: '#2a1a0a',

    info: '#a0a0d0',

    // Game-specific colors
    gold: '#ffd700',
    yellow: '#FFD700',
    orange: '#FF9500',

    // UI element colors
    borderPrimary: '#2a2a4e',
    borderSecondary: '#3a3a6e',
    borderAccent: '#A855F7',

    // Game cell colors
    cellEmpty: '#1a1a2e',
    cellFilled: '#2a2a4e',
    cellCorrect: '#1a3d2d',
    cellIncorrect: '#3d2d2d',
    cellSelected: '#2a2a4e',

    // Overlay colors
    overlayDark: 'rgba(0, 0, 0, 0.8)',
    overlayMedium: 'rgba(26, 26, 46, 0.7)',
    overlayLight: 'rgba(168, 85, 247, 0.15)',

    // Auth colors
    googleButton: '#fff',
    googleButtonText: '#333',
    appleButton: '#000',
    appleButtonText: '#fff',
    authButton: '#4285f4',

    // Warm tones (legacy)
    warmWhite: '#FFF8E7',
    warmBlack: '#1a1000',
    warmGray: '#3d2a00',
    warmBorder: '#4d3a10',
  },

  // Ocean blue theme
  ocean: {
    backgroundPrimary: '#0a1628',
    backgroundSecondary: '#132a46',
    backgroundTertiary: '#1e3a5f',

    textPrimary: '#fff',
    textSecondary: '#cce7ff',
    textTertiary: '#7ea8d6',
    textMuted: '#5a7fa3',
    textDisabled: '#4a6a8a',

    brandPrimary: '#3b82f6',
    brandSecondary: '#2563eb',
    brandLight: '#60a5fa',

    success: '#10b981',
    successDark: '#065f46',
    successBg: '#064e3b',
    successText: '#6ee7b7',

    error: '#ef4444',
    errorLight: '#ff6b6b',
    errorBg: '#3d2d2d',
    errorText: '#f87171',

    warning: '#f59e0b',
    warningBg: '#2a1a0a',

    info: '#93c5fd',

    gold: '#fbbf24',
    yellow: '#fbbf24',
    orange: '#fb923c',

    borderPrimary: '#1e3a5f',
    borderSecondary: '#2e4a7f',
    borderAccent: '#3b82f6',

    cellEmpty: '#132a46',
    cellFilled: '#1e3a5f',
    cellCorrect: '#064e3b',
    cellIncorrect: '#3d2d2d',
    cellSelected: '#1e3a5f',

    overlayDark: 'rgba(10, 22, 40, 0.8)',
    overlayMedium: 'rgba(19, 42, 70, 0.7)',
    overlayLight: 'rgba(59, 130, 246, 0.15)',

    googleButton: '#fff',
    googleButtonText: '#333',
    appleButton: '#000',
    appleButtonText: '#fff',
    authButton: '#3b82f6',

    warmWhite: '#cce7ff',
    warmBlack: '#0a1628',
    warmGray: '#1e3a5f',
    warmBorder: '#2e4a7f',
  },

  // Forest green theme
  forest: {
    backgroundPrimary: '#0f1e0f',
    backgroundSecondary: '#1a2e1a',
    backgroundTertiary: '#2a4a2a',

    textPrimary: '#fff',
    textSecondary: '#d0f0d0',
    textTertiary: '#88b888',
    textMuted: '#668866',
    textDisabled: '#556655',

    brandPrimary: '#22c55e',
    brandSecondary: '#16a34a',
    brandLight: '#4ade80',

    success: '#10b981',
    successDark: '#065f46',
    successBg: '#064e3b',
    successText: '#6ee7b7',

    error: '#ef4444',
    errorLight: '#ff6b6b',
    errorBg: '#3d2d2d',
    errorText: '#f87171',

    warning: '#fbbf24',
    warningBg: '#2a1e0a',

    info: '#86efac',

    gold: '#fbbf24',
    yellow: '#fbbf24',
    orange: '#fb923c',

    borderPrimary: '#2a4a2a',
    borderSecondary: '#3a6a3a',
    borderAccent: '#22c55e',

    cellEmpty: '#1a2e1a',
    cellFilled: '#2a4a2a',
    cellCorrect: '#064e3b',
    cellIncorrect: '#3d2d2d',
    cellSelected: '#2a4a2a',

    overlayDark: 'rgba(15, 30, 15, 0.8)',
    overlayMedium: 'rgba(26, 46, 26, 0.7)',
    overlayLight: 'rgba(34, 197, 94, 0.15)',

    googleButton: '#fff',
    googleButtonText: '#333',
    appleButton: '#000',
    appleButtonText: '#fff',
    authButton: '#22c55e',

    warmWhite: '#d0f0d0',
    warmBlack: '#0f1e0f',
    warmGray: '#2a4a2a',
    warmBorder: '#3a6a3a',
  },

  // Sunset orange/red theme
  sunset: {
    backgroundPrimary: '#1a0f0a',
    backgroundSecondary: '#2e1a0f',
    backgroundTertiary: '#4a2a1a',

    textPrimary: '#fff',
    textSecondary: '#ffd0c0',
    textTertiary: '#d08870',
    textMuted: '#a06850',
    textDisabled: '#805540',

    brandPrimary: '#f97316',
    brandSecondary: '#ea580c',
    brandLight: '#fb923c',

    success: '#10b981',
    successDark: '#065f46',
    successBg: '#064e3b',
    successText: '#6ee7b7',

    error: '#ef4444',
    errorLight: '#ff6b6b',
    errorBg: '#3d2d2d',
    errorText: '#f87171',

    warning: '#fbbf24',
    warningBg: '#2a1e0a',

    info: '#fdba74',

    gold: '#fbbf24',
    yellow: '#fbbf24',
    orange: '#f97316',

    borderPrimary: '#4a2a1a',
    borderSecondary: '#6a3a2a',
    borderAccent: '#f97316',

    cellEmpty: '#2e1a0f',
    cellFilled: '#4a2a1a',
    cellCorrect: '#064e3b',
    cellIncorrect: '#3d2d2d',
    cellSelected: '#4a2a1a',

    overlayDark: 'rgba(26, 15, 10, 0.8)',
    overlayMedium: 'rgba(46, 26, 15, 0.7)',
    overlayLight: 'rgba(249, 115, 22, 0.15)',

    googleButton: '#fff',
    googleButtonText: '#333',
    appleButton: '#000',
    appleButtonText: '#fff',
    authButton: '#f97316',

    warmWhite: '#ffd0c0',
    warmBlack: '#1a0f0a',
    warmGray: '#4a2a1a',
    warmBorder: '#6a3a2a',
  },

  // Sunshine theme - inspired by logo's bright yellow gradient
  sunshine: {
    backgroundPrimary: '#1a1a0a',
    backgroundSecondary: '#2a2a10',
    backgroundTertiary: '#3a3a18',

    textPrimary: '#fff',
    textSecondary: '#fff8d0',
    textTertiary: '#d4c088',
    textMuted: '#a89860',
    textDisabled: '#807450',

    brandPrimary: '#FFE31A',        // Bright yellow from logo
    brandSecondary: '#FFC700',      // Golden yellow
    brandLight: '#FFF066',          // Lighter yellow

    success: '#4ade80',
    successDark: '#2a5a3d',
    successBg: '#1a3d2d',
    successText: '#a0d0b0',

    error: '#ef4444',
    errorLight: '#ff6b6b',
    errorBg: '#3d2d2d',
    errorText: '#f87171',

    warning: '#f59e0b',
    warningBg: '#2a1a0a',

    info: '#fef08a',

    gold: '#FFD700',
    yellow: '#FFE31A',
    orange: '#FFB800',

    borderPrimary: '#3a3a18',
    borderSecondary: '#4a4a28',
    borderAccent: '#FFE31A',

    cellEmpty: '#2a2a10',
    cellFilled: '#3a3a18',
    cellCorrect: '#1a3d2d',
    cellIncorrect: '#3d2d2d',
    cellSelected: '#3a3a18',

    overlayDark: 'rgba(26, 26, 10, 0.8)',
    overlayMedium: 'rgba(42, 42, 16, 0.7)',
    overlayLight: 'rgba(255, 227, 26, 0.15)',

    googleButton: '#fff',
    googleButtonText: '#333',
    appleButton: '#000',
    appleButtonText: '#fff',
    authButton: '#FFE31A',

    warmWhite: '#fff8d0',
    warmBlack: '#1a1a0a',
    warmGray: '#3a3a18',
    warmBorder: '#4a4a28',
  },

  // Citrus theme - yellow to orange gradient from logo
  citrus: {
    backgroundPrimary: '#1a120a',
    backgroundSecondary: '#2a1e0f',
    backgroundTertiary: '#3a2a15',

    textPrimary: '#fff',
    textSecondary: '#ffe8cc',
    textTertiary: '#d4b088',
    textMuted: '#a88860',
    textDisabled: '#806850',

    brandPrimary: '#FFB800',        // Orange-yellow from logo gradient
    brandSecondary: '#FF9500',      // Orange
    brandLight: '#FFD666',          // Light orange-yellow

    success: '#4ade80',
    successDark: '#2a5a3d',
    successBg: '#1a3d2d',
    successText: '#a0d0b0',

    error: '#ef4444',
    errorLight: '#ff6b6b',
    errorBg: '#3d2d2d',
    errorText: '#f87171',

    warning: '#f59e0b',
    warningBg: '#2a1a0a',

    info: '#fcd34d',

    gold: '#FFD700',
    yellow: '#FFE31A',
    orange: '#FFB800',

    borderPrimary: '#3a2a15',
    borderSecondary: '#4a3a25',
    borderAccent: '#FFB800',

    cellEmpty: '#2a1e0f',
    cellFilled: '#3a2a15',
    cellCorrect: '#1a3d2d',
    cellIncorrect: '#3d2d2d',
    cellSelected: '#3a2a15',

    overlayDark: 'rgba(26, 18, 10, 0.8)',
    overlayMedium: 'rgba(42, 30, 15, 0.7)',
    overlayLight: 'rgba(255, 184, 0, 0.15)',

    googleButton: '#fff',
    googleButtonText: '#333',
    appleButton: '#000',
    appleButtonText: '#fff',
    authButton: '#FFB800',

    warmWhite: '#ffe8cc',
    warmBlack: '#1a120a',
    warmGray: '#3a2a15',
    warmBorder: '#4a3a25',
  },

  // Violet theme - inspired by logo's purple plus signs
  violet: {
    backgroundPrimary: '#120a1a',
    backgroundSecondary: '#1e0f2a',
    backgroundTertiary: '#2a153a',

    textPrimary: '#fff',
    textSecondary: '#f0d0ff',
    textTertiary: '#c088d4',
    textMuted: '#9860b8',
    textDisabled: '#745088',

    brandPrimary: '#C84DFF',        // Vibrant purple from logo plus signs
    brandSecondary: '#A020F0',      // Deeper purple
    brandLight: '#E080FF',          // Lighter purple

    success: '#4ade80',
    successDark: '#2a5a3d',
    successBg: '#1a3d2d',
    successText: '#a0d0b0',

    error: '#ef4444',
    errorLight: '#ff6b6b',
    errorBg: '#3d2d2d',
    errorText: '#f87171',

    warning: '#f59e0b',
    warningBg: '#2a1a0a',

    info: '#d8b4fe',

    gold: '#FFD700',
    yellow: '#FFE31A',
    orange: '#FFB800',

    borderPrimary: '#2a153a',
    borderSecondary: '#3a254a',
    borderAccent: '#C84DFF',

    cellEmpty: '#1e0f2a',
    cellFilled: '#2a153a',
    cellCorrect: '#1a3d2d',
    cellIncorrect: '#3d2d2d',
    cellSelected: '#2a153a',

    overlayDark: 'rgba(18, 10, 26, 0.8)',
    overlayMedium: 'rgba(30, 15, 42, 0.7)',
    overlayLight: 'rgba(200, 77, 255, 0.15)',

    googleButton: '#fff',
    googleButtonText: '#333',
    appleButton: '#000',
    appleButtonText: '#fff',
    authButton: '#C84DFF',

    warmWhite: '#f0d0ff',
    warmBlack: '#120a1a',
    warmGray: '#2a153a',
    warmBorder: '#3a254a',
  },

  // Cosmic theme - combines logo's yellow and purple
  cosmic: {
    backgroundPrimary: '#0f0a1a',
    backgroundSecondary: '#1a0f2a',
    backgroundTertiary: '#25153a',

    textPrimary: '#fff',
    textSecondary: '#f0e0ff',
    textTertiary: '#c0a8d8',
    textMuted: '#9880b0',
    textDisabled: '#786090',

    brandPrimary: '#D946EF',        // Purple-pink blend
    brandSecondary: '#C84DFF',      // Logo purple
    brandLight: '#F0ABFC',          // Lighter purple-pink

    success: '#4ade80',
    successDark: '#2a5a3d',
    successBg: '#1a3d2d',
    successText: '#a0d0b0',

    error: '#ef4444',
    errorLight: '#ff6b6b',
    errorBg: '#3d2d2d',
    errorText: '#f87171',

    warning: '#FFD700',
    warningBg: '#2a1e0a',

    info: '#e9d5ff',

    gold: '#FFD700',
    yellow: '#FFE31A',
    orange: '#FFB800',

    borderPrimary: '#25153a',
    borderSecondary: '#35254a',
    borderAccent: '#D946EF',

    cellEmpty: '#1a0f2a',
    cellFilled: '#25153a',
    cellCorrect: '#1a3d2d',
    cellIncorrect: '#3d2d2d',
    cellSelected: '#25153a',

    overlayDark: 'rgba(15, 10, 26, 0.8)',
    overlayMedium: 'rgba(26, 15, 42, 0.7)',
    overlayLight: 'rgba(217, 70, 239, 0.15)',

    googleButton: '#fff',
    googleButtonText: '#333',
    appleButton: '#000',
    appleButtonText: '#fff',
    authButton: '#D946EF',

    warmWhite: '#f0e0ff',
    warmBlack: '#0f0a1a',
    warmGray: '#25153a',
    warmBorder: '#35254a',
  },

  // Bubble gum theme - playful pink-purple inspired by logo's fun aesthetic
  bubblegum: {
    backgroundPrimary: '#1a0a14',
    backgroundSecondary: '#2a0f1e',
    backgroundTertiary: '#3a152e',

    textPrimary: '#fff',
    textSecondary: '#ffd0f0',
    textTertiary: '#d488b8',
    textMuted: '#b86098',
    textDisabled: '#885078',

    brandPrimary: '#EC4899',        // Hot pink
    brandSecondary: '#C84DFF',      // Logo purple
    brandLight: '#F9A8D4',          // Light pink

    success: '#4ade80',
    successDark: '#2a5a3d',
    successBg: '#1a3d2d',
    successText: '#a0d0b0',

    error: '#ef4444',
    errorLight: '#ff6b6b',
    errorBg: '#3d2d2d',
    errorText: '#f87171',

    warning: '#f59e0b',
    warningBg: '#2a1a0a',

    info: '#f9a8d4',

    gold: '#FFD700',
    yellow: '#FFE31A',
    orange: '#FFB800',

    borderPrimary: '#3a152e',
    borderSecondary: '#4a253e',
    borderAccent: '#EC4899',

    cellEmpty: '#2a0f1e',
    cellFilled: '#3a152e',
    cellCorrect: '#1a3d2d',
    cellIncorrect: '#3d2d2d',
    cellSelected: '#3a152e',

    overlayDark: 'rgba(26, 10, 20, 0.8)',
    overlayMedium: 'rgba(42, 15, 30, 0.7)',
    overlayLight: 'rgba(236, 72, 153, 0.15)',

    googleButton: '#fff',
    googleButtonText: '#333',
    appleButton: '#000',
    appleButtonText: '#fff',
    authButton: '#EC4899',

    warmWhite: '#ffd0f0',
    warmBlack: '#1a0a14',
    warmGray: '#3a152e',
    warmBorder: '#4a253e',
  },

  // Neon lights theme - electric yellow and purple from logo
  neon: {
    backgroundPrimary: '#0a0a0f',
    backgroundSecondary: '#0f0f1a',
    backgroundTertiary: '#1a1a2a',

    textPrimary: '#fff',
    textSecondary: '#f8f8ff',
    textTertiary: '#d0d0e8',
    textMuted: '#a0a0c0',
    textDisabled: '#707090',

    brandPrimary: '#FFE31A',        // Electric yellow
    brandSecondary: '#C84DFF',      // Neon purple
    brandLight: '#FFF380',          // Bright yellow glow

    success: '#00ff88',
    successDark: '#00aa55',
    successBg: '#002211',
    successText: '#88ffbb',

    error: '#ff0055',
    errorLight: '#ff3377',
    errorBg: '#330011',
    errorText: '#ff88aa',

    warning: '#ffcc00',
    warningBg: '#332200',

    info: '#00ddff',

    gold: '#FFD700',
    yellow: '#FFE31A',
    orange: '#FFB800',

    borderPrimary: '#1a1a2a',
    borderSecondary: '#2a2a4a',
    borderAccent: '#FFE31A',

    cellEmpty: '#0f0f1a',
    cellFilled: '#1a1a2a',
    cellCorrect: '#002211',
    cellIncorrect: '#330011',
    cellSelected: '#1a1a2a',

    overlayDark: 'rgba(10, 10, 15, 0.8)',
    overlayMedium: 'rgba(15, 15, 26, 0.7)',
    overlayLight: 'rgba(255, 227, 26, 0.15)',

    googleButton: '#fff',
    googleButtonText: '#333',
    appleButton: '#000',
    appleButtonText: '#fff',
    authButton: '#FFE31A',

    warmWhite: '#f8f8ff',
    warmBlack: '#0a0a0f',
    warmGray: '#1a1a2a',
    warmBorder: '#2a2a4a',
  },
};

// Change this to swap the active color scheme
type ColorSchemeName = keyof typeof colorSchemes;
export const ACTIVE_SCHEME: ColorSchemeName = 'sunshine';

// Export the active color scheme
export const colorScheme = colorSchemes[ACTIVE_SCHEME];

// Legacy Colors object for backwards compatibility
const tintColorLight = colorScheme.brandPrimary;
const tintColorDark = colorScheme.brandPrimary;

export const Colors = {
  light: {
    text: colorScheme.warmBlack,
    background: colorScheme.warmWhite,
    tint: tintColorLight,
    icon: '#8B7355',
    tabIconDefault: '#8B7355',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: colorScheme.warmWhite,
    background: colorScheme.warmBlack,
    tint: tintColorDark,
    icon: '#B8956E',
    tabIconDefault: '#B8956E',
    tabIconSelected: tintColorDark,
  },
  // Brand colors for easy access (legacy - use colorScheme instead)
  brand: {
    yellow: colorScheme.yellow,
    orange: colorScheme.orange,
    purple: colorScheme.brandPrimary,
    purpleLight: colorScheme.brandLight,
    purpleDark: colorScheme.brandSecondary,
    gold: colorScheme.gold,
    warmWhite: colorScheme.warmWhite,
    warmBlack: colorScheme.warmBlack,
    warmGray: colorScheme.warmGray,
    warmBorder: colorScheme.warmBorder,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
