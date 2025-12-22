import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ColorScheme, ColorSchemeName, DEFAULT_SCHEME, colorSchemes, getColorScheme } from '@/constants/theme';

const THEME_STORAGE_KEY = 'activeThemeScheme';

type ThemeContextValue = {
  schemeName: ColorSchemeName;
  setSchemeName: (scheme: ColorSchemeName) => void;
  colorScheme: ColorScheme;
  schemeNames: ColorSchemeName[];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [schemeName, setSchemeNameState] = useState<ColorSchemeName>(DEFAULT_SCHEME);

  useEffect(() => {
    const loadStoredScheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && stored in colorSchemes) {
          setSchemeNameState(stored as ColorSchemeName);
        }
      } catch {
        // Ignore storage errors and fall back to default scheme.
      }
    };

    loadStoredScheme();
  }, []);

  const setSchemeName = useCallback((scheme: ColorSchemeName) => {
    setSchemeNameState(scheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, scheme).catch(() => {
      // Ignore persistence errors; the in-memory theme still updates.
    });
  }, []);

  const colorScheme = useMemo(() => getColorScheme(schemeName), [schemeName]);
  const schemeNames = useMemo(() => Object.keys(colorSchemes) as ColorSchemeName[], []);

  const value = useMemo(
    () => ({
      schemeName,
      setSchemeName,
      colorScheme,
      schemeNames,
    }),
    [schemeName, setSchemeName, colorScheme, schemeNames]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeScheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeScheme must be used within AppThemeProvider');
  }
  return context;
}
