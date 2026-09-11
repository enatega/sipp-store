import { buildDarkColors, buildLightColors, ThemeColors } from './colors';
import { BrandColors, defaultBrandColors } from './brandColors';
import { typography } from './typography';

export type Theme = {
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof typography;
};

export const buildTheme = (
  scheme: 'light' | 'dark' | null,
  brandColors: BrandColors = defaultBrandColors
): Theme => {
  const isDark = scheme === 'dark';

  return {
    isDark,
    colors: isDark ? buildDarkColors(brandColors) : buildLightColors(brandColors),
    typography,
  };
};
