import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Text from './Text';
import { useTranslations } from '../localization/LocalizationProvider';

const noEarningImage = require('../assets/images/noEarning.png');

export default function EarningsEmptyState() {
  const { t } = useTranslations('app');

  return (
    <View style={styles.container}>
      <Image source={noEarningImage} style={styles.image} resizeMode="contain" />
      <Text weight="semiBold" style={styles.title}>
        {t('earnings_no_recent_activity')}
      </Text>
      <Text style={styles.subtitle}>
        {t('earnings_activity_will_appear')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 180,
    paddingHorizontal: 24,
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    lineHeight: 24,
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    width: 180,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
});
