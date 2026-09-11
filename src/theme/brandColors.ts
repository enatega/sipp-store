import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../api/appSettingsTypes';

export type BrandColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  buttonText: string;
  updatedAt: string | null;
};

export const defaultBrandColors: BrandColors = {
  primary: '#90E36D',
  secondary: '#6B5BFF',
  tertiary: '#ECFDF5',
  buttonText: '#111827',
  updatedAt: null,
};

const BRAND_COLORS_STORAGE_KEY = 'deliveries_store_app_brand_colors';

const HEX_COLOR_REGEX = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;

function normalizeHexColor(value: string | null | undefined, fallback: string) {
  const normalizedValue = String(value ?? '').trim();
  return HEX_COLOR_REGEX.test(normalizedValue) ? normalizedValue.toUpperCase() : fallback;
}

export function buildBrandColors(settings?: AppSettings | null): BrandColors {
  return {
    primary: normalizeHexColor(settings?.primary_color, defaultBrandColors.primary),
    secondary: normalizeHexColor(settings?.secondary_color, defaultBrandColors.secondary),
    tertiary: normalizeHexColor(settings?.tertiary_color, defaultBrandColors.tertiary),
    buttonText: normalizeHexColor(settings?.button_text_color, defaultBrandColors.buttonText),
    updatedAt: settings?.updated_at ?? null,
  };
}

export function areBrandColorsEqual(left: BrandColors, right: BrandColors) {
  return (
    left.primary === right.primary &&
    left.secondary === right.secondary &&
    left.tertiary === right.tertiary &&
    left.buttonText === right.buttonText &&
    left.updatedAt === right.updatedAt
  );
}

export const brandColorsStorage = {
  async get(): Promise<BrandColors> {
    const rawValue = await AsyncStorage.getItem(BRAND_COLORS_STORAGE_KEY);

    if (!rawValue) {
      return defaultBrandColors;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as Partial<BrandColors>;

      return {
        primary: normalizeHexColor(parsedValue.primary, defaultBrandColors.primary),
        secondary: normalizeHexColor(parsedValue.secondary, defaultBrandColors.secondary),
        tertiary: normalizeHexColor(parsedValue.tertiary, defaultBrandColors.tertiary),
        buttonText: normalizeHexColor(parsedValue.buttonText, defaultBrandColors.buttonText),
        updatedAt: parsedValue.updatedAt ?? null,
      };
    } catch {
      return defaultBrandColors;
    }
  },

  async set(value: BrandColors) {
    await AsyncStorage.setItem(BRAND_COLORS_STORAGE_KEY, JSON.stringify(value));
  },
};
