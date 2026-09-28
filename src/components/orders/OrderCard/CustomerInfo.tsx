import React from 'react';
import { Alert, Image, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslations } from '../../../localization/LocalizationProvider';
import type { Theme } from '../../../theme/theme';
import Text from '../../Text';

type Props = {
  customerName: string;
  customerProfileImage: string | null;
  orderType: 'delivery' | 'pickup';
  address: string | null;
  theme: Theme;
};

export default function CustomerInfo({ customerName, customerProfileImage, orderType, address, theme }: Props) {
  const { t } = useTranslations('app');
  const image = customerProfileImage && !/placehold\.co|placeholder/i.test(customerProfileImage)
    ? customerProfileImage : null;
  const openMap = async () => {
    if (!address?.trim()) return;
    const query = encodeURIComponent(address.trim());
    const urls = Platform.OS === 'ios'
      ? [`maps://?q=${query}`, `https://maps.apple.com/?q=${query}`, `https://www.google.com/maps/search/?api=1&query=${query}`]
      : [`geo:0,0?q=${query}`, `https://www.google.com/maps/search/?api=1&query=${query}`];
    for (const url of urls) {
      try { await Linking.openURL(url); return; } catch { /* Try the next map app. */ }
    }
    Alert.alert(t('order_card_map_open_failed'));
  };

  return (
    <View style={[styles.panel, { backgroundColor: theme.colors.gray50 }]}>
      <View style={styles.main}>
        {image ? <Image source={{ uri: image }} style={styles.avatar} /> : (
          <View style={[styles.avatar, styles.placeholder, { backgroundColor: theme.colors.surface }]}>
            <Feather name="user" size={20} color={theme.colors.gray600} />
          </View>
        )}
        <View style={styles.copy}>
          <Text variant="caption" weight="semiBold" color={theme.colors.gray600}>{t('order_card_customer_name')}</Text>
          <Text weight="semiBold" color={theme.colors.gray900} numberOfLines={1}>{customerName || '—'}</Text>
          {address ? <Text variant="caption" color={theme.colors.gray600} numberOfLines={2}>{address}</Text> : null}
        </View>
      </View>
      {orderType === 'delivery' && address ? (
        <Pressable onPress={() => void openMap()} style={[styles.mapButton, { borderColor: theme.colors.gray200, backgroundColor: theme.colors.surface }]} accessibilityRole="button" accessibilityLabel={t('order_card_view_map')}>
          <Feather name="map-pin" size={16} color={theme.colors.gray900} />
          <Text variant="caption" weight="semiBold" color={theme.colors.gray900}>{t('order_card_view_map')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 14, padding: 12, gap: 10 },
  main: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 12 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 2 },
  mapButton: { minHeight: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
});
