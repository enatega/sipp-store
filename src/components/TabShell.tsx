import React from 'react';
import { StyleSheet, View } from 'react-native';
import ScreenHeader from './ScreenHeader';
import { useTranslations } from '../localization/LocalizationProvider';

type Props = {
  titleKey: string;
  children: React.ReactNode;
};

export default function TabShell({ titleKey, children }: Props) {
  const { t } = useTranslations('app');

  return (
    <View style={styles.flex}>
      <ScreenHeader title={t(titleKey)} />
      <View style={styles.flex}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
