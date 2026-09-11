import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../localization/LocalizationProvider';
import { MainStackParamList } from '../navigation/types';
import ScreenHeader from '../components/ScreenHeader';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { useUpdateProfileInfo } from '../hooks/useProfileMutations';

type Props = NativeStackScreenProps<MainStackParamList, 'ProfileFieldEdit'>;

export default function ProfileFieldEditScreen({ route, navigation }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations('app');
  const { field, value: initialValue } = route.params;

  const [value, setValue] = useState(initialValue ?? '');
  const [error, setError] = useState('');

  const title = field === 'address' ? t('profile_edit_address') : t('profile_edit_phone');
  const label = field === 'address' ? t('profile_address') : t('profile_phone');

  const mutation = useUpdateProfileInfo({
    onSuccess: () => navigation.goBack(),
  });

  const keyboardType = useMemo(() => (field === 'phone' ? 'phone-pad' : 'default'), [field]);

  const handleUpdate = () => {
    const trimmed = value.trim();

    if (!trimmed) {
      setError(t('profile_field_required'));
      return;
    }

    mutation.mutate(field === 'address' ? { city: trimmed } : { phoneNumber: trimmed });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          label={label}
          value={value}
          onChangeText={(v) => {
            setValue(v);
            if (error) setError('');
          }}
          error={error}
          keyboardType={keyboardType}
          autoCapitalize={field === 'address' ? 'words' : 'none'}
          returnKeyType="done"
          onSubmitEditing={handleUpdate}
        />

        <View style={styles.actions}>
          <Button
            label={t('profile_update')}
            onPress={handleUpdate}
            loading={mutation.isPending}
            disabled={mutation.isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 16,
    gap: 20,
    flexGrow: 1,
  },
  actions: {
    marginTop: 8,
  },
});
