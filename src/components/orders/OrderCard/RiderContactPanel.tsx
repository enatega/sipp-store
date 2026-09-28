import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslations } from '../../../localization/LocalizationProvider';
import { useAppTheme } from '../../../theme/ThemeProvider';
import Text from '../../Text';

type Props = {
  name: string | null;
  vehicle: string | null;
  phone: string | null;
  status: string | null;
  unreadCount: number;
  onChat: () => void;
};

export default function RiderContactPanel({ name, vehicle, phone, status, unreadCount, onChat }: Props) {
  const { t } = useTranslations('app');
  const { theme } = useAppTheme();
  return (
    <View style={[styles.panel, { backgroundColor: theme.colors.green50 }]}>
      <View style={styles.heading}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
          <MaterialCommunityIcons name="bike" size={21} color={theme.colors.green600} />
        </View>
        <View style={styles.copy}>
          <Text variant="caption" weight="semiBold" color={theme.colors.gray600}>{t('order_card_rider_name')}</Text>
          <Text weight="semiBold" color={theme.colors.gray900} numberOfLines={1}>{name || t('order_card_rider_fallback')}</Text>
          {vehicle ? <Text variant="caption" color={theme.colors.gray600} numberOfLines={1}>{vehicle}</Text> : null}
          {status ? <Text variant="caption" color={theme.colors.green600} numberOfLines={1}>{status}</Text> : null}
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? t('order_card_chat_rider_unread', { count: unreadCount }) : t('order_card_chat_rider')}
          onPress={onChat}
          style={[styles.action, { backgroundColor: theme.colors.surface, borderColor: theme.colors.gray200 }]}
        >
          <Feather name="message-circle" size={18} color={theme.colors.gray900} />
          <Text variant="caption" weight="semiBold" color={theme.colors.gray900}>{t('order_card_chat_short')}</Text>
          {unreadCount > 0 ? <View style={[styles.badge, { backgroundColor: theme.colors.red500 }]}><Text variant="caption" weight="bold" color={theme.colors.white}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View> : null}
        </Pressable>
        {phone ? <Pressable accessibilityRole="button" accessibilityLabel={t('order_card_call_rider')} onPress={() => void Linking.openURL(`tel:${phone}`)} style={[styles.action, { backgroundColor: theme.colors.surface, borderColor: theme.colors.gray200 }]}>
          <Feather name="phone" size={18} color={theme.colors.gray900} />
          <Text variant="caption" weight="semiBold" color={theme.colors.gray900}>{t('order_card_call_short')}</Text>
        </Pressable> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 14, padding: 12, gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 9 },
  badge: { minWidth: 20, height: 20, paddingHorizontal: 4, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
