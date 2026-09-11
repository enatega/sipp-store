import { BrandColors, defaultBrandColors } from './brandColors';

export const buildLightColors = (brandColors: BrandColors = defaultBrandColors) => ({
  background: '#FFFFFF',
  surface: '#FFFFFF',
  primary: brandColors.primary,
  secondary: brandColors.secondary,
  tertiary: brandColors.tertiary,
  buttonText: brandColors.buttonText,
  text: '#111827',
  mutedText: '#6B7280',
  border: '#D1D5DB',
  white: '#FFFFFF',
  // Gray scale (Figma tokens)
  gray900: '#111827',
  gray600: '#4B5563',
  gray500: '#6B7280',
  gray400: '#9CA3AF',
  gray300: '#D1D5DB',
  gray200: '#E5E7EB',
  gray50: '#f5f5f5ff',
  green50: '#ECFDF5',
});

export const buildDarkColors = (brandColors: BrandColors = defaultBrandColors): ThemeColors => ({
  background: '#0F1117',
  surface: '#161A23',
  primary: brandColors.primary,
  secondary: brandColors.secondary,
  tertiary: brandColors.tertiary,
  buttonText: brandColors.buttonText,
  text: '#F9FAFB',
  mutedText: '#9CA3AF',
  border: '#374151',
  white: '#FFFFFF',
  gray900: '#F9FAFB',
  gray600: '#9CA3AF',
  gray500: '#9CA3AF',
  gray400: '#6B7280',
  gray300: '#374151',
  gray200: '#1F2937',
  gray50: '#090909ff',
  green50: '#ECFDF5',
});

export const lightColors = buildLightColors();
export const darkColors = buildDarkColors();

export type ThemeColors = typeof lightColors;
