import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAppSettingsQuery } from '../hooks/useAppSettings';
import {
  areBrandColorsEqual,
  brandColorsStorage,
  buildBrandColors,
  BrandColors,
  defaultBrandColors,
} from './brandColors';
import { buildTheme, Theme } from './theme';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
};

const THEME_STORAGE_KEY = 'deliveries_store_app_theme_mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [brandColors, setBrandColors] = useState<BrandColors>(defaultBrandColors);
  const [isLoaded, setIsLoaded] = useState(false);
  const { data: appSettings } = useAppSettingsQuery();

  useEffect(() => {
    Promise.all([SecureStore.getItemAsync(THEME_STORAGE_KEY), brandColorsStorage.get()])
      .then(([savedMode, cachedBrandColors]) => {
        if (savedMode && ['system', 'light', 'dark'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }

        setBrandColors(cachedBrandColors);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!appSettings) {
      return;
    }

    const nextBrandColors = buildBrandColors(appSettings);

    setBrandColors((currentBrandColors) => {
      if (areBrandColorsEqual(currentBrandColors, nextBrandColors)) {
        return currentBrandColors;
      }

      void brandColorsStorage.set(nextBrandColors);
      return nextBrandColors;
    });
  }, [appSettings]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
  };

  const activeScheme =
    themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;

  const theme = useMemo(() => buildTheme(activeScheme, brandColors), [activeScheme, brandColors]);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
    }),
    [theme, themeMode]
  );

  if (!isLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }

  return context;
}
