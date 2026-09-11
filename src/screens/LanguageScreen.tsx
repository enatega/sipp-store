import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslations, useLocalization } from '../localization/LocalizationProvider';
import { MainStackParamList } from '../navigation/types';
import ScreenHeader from '../components/ScreenHeader';
import Text from '../components/Text';
import Button from '../components/Button';
import { useLanguageQuery } from '../hooks/useProfileQueries';
import { useUpdateLanguage } from '../hooks/useProfileMutations';

type Props = NativeStackScreenProps<MainStackParamList, 'Language'>;

type LanguageOption = {
  value: string;      // matches backend store_language (e.g., "en-US", "fr-FR")
  label: string;
  flag: string;
};

const LANGUAGES: LanguageOption[] = [
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
  { value: 'fr-FR', label: 'Français', flag: '🇫🇷' },
];

// Helper to convert backend language to i18n language code (only for setLanguage)
const toI18nCode = (backendLang: string): string => {
  if (backendLang.startsWith('en')) return 'en';
  if (backendLang.startsWith('fr')) return 'fr';
  return 'en';
};

export default function LanguageScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations('app');
  const { setLanguage } = useLocalization();

  // Fetch stored language from backend
  const { data: languageData, isLoading: isLoadingLanguage } = useLanguageQuery();
  const updateLanguageMutation = useUpdateLanguage();

  // Local selected language value (full backend string, e.g., "en-US")
  const [selected, setSelected] = useState<string>('en-US');

  // When backend data loads, sync selected state directly
  useEffect(() => {
    if (languageData?.store_language) {
      setSelected(languageData.store_language);
    }
  }, [languageData]);

  const handleUpdate = async () => {
    updateLanguageMutation.mutate(
      { storeLanguage: selected },
      {
        onSuccess: async () => {
          // Update local i18n (need to map to short code)
          const i18nCode = toI18nCode(selected);
          await setLanguage(i18nCode as 'en' | 'fr');
        },
        onError: (error) => {
          console.error('Failed to update language', error);
        },
      }
    );
  };

  if (isLoadingLanguage) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={t('language_title')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.value;
            return (
              <Pressable
                key={lang.value}
                onPress={() => setSelected(lang.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                style={[styles.row, { borderBottomColor: theme.colors.gray300 }]}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text
                  variant="caption"
                  weight="semiBold"
                  color={theme.colors.text}
                  style={styles.langLabel}
                >
                  {lang.label}
                </Text>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected ? theme.colors.primary : theme.colors.gray300,
                      backgroundColor: theme.colors.white,
                    },
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Button
            label={t('language_update')}
            onPress={handleUpdate}
            loading={updateLanguageMutation.isPending}
            disabled={updateLanguageMutation.isPending}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 24 },
  list: { gap: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  flag: { fontSize: 20, width: 30, textAlign: 'center' },
  langLabel: { flex: 1, fontSize: 14 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  actions: { marginTop: 8 },
});
