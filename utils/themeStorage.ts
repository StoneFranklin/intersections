import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'app-color-scheme';

export type ColorSchemeName =
  | 'default'
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'sunshine'
  | 'citrus'
  | 'violet'
  | 'cosmic'
  | 'bubblegum'
  | 'neon';

export const THEME_DISPLAY_NAMES: Record<ColorSchemeName, string> = {
  default: 'Purple Night',
  ocean: 'Ocean Blue',
  forest: 'Forest Green',
  sunset: 'Sunset Orange',
  sunshine: 'Sunshine Yellow',
  citrus: 'Citrus Blend',
  violet: 'Violet Dreams',
  cosmic: 'Cosmic Purple',
  bubblegum: 'Bubblegum Pink',
  neon: 'Neon Lights',
};

export async function getStoredTheme(): Promise<ColorSchemeName | null> {
  try {
    const theme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (theme && isValidTheme(theme)) {
      return theme as ColorSchemeName;
    }
    return null;
  } catch (error) {
    console.error('Error loading theme:', error);
    return null;
  }
}

export async function storeTheme(theme: ColorSchemeName): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
}

function isValidTheme(theme: string): theme is ColorSchemeName {
  return [
    'default',
    'ocean',
    'forest',
    'sunset',
    'sunshine',
    'citrus',
    'violet',
    'cosmic',
    'bubblegum',
    'neon',
  ].includes(theme);
}
