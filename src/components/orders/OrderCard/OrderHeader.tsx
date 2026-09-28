import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslations } from '../../../localization/LocalizationProvider';
import { useAppTheme } from '../../../theme/ThemeProvider';
import Text from '../../Text';
import { OrderStatus } from '../../../api/orderServicesTypes';

type Props = {
  orderCode: string;
  orderType: 'delivery' | 'pickup';
  status: OrderStatus;
  createdAt: string;
  headerStatusLabel?: string | null;
  headerStatusTone?: 'blue' | 'green' | 'amber';
};

export default function OrderHeader({ orderCode, orderType, status, createdAt, headerStatusLabel, headerStatusTone = 'blue' }: Props) {
  const { t } = useTranslations('app');
  const { theme } = useAppTheme();
  const date = new Date(createdAt);
  const placedAt = Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const tone = headerStatusTone === 'green'
    ? { background: theme.colors.green50, text: theme.colors.green600 }
    : headerStatusTone === 'amber'
      ? { background: theme.colors.amber100, text: theme.colors.amber800 }
      : { background: theme.colors.sky100, text: theme.colors.sky600 };
  const label = headerStatusLabel || status.replace(/_/g, ' ');

  return (
    <View style={styles.header}>
      <View style={styles.orderIdentity}>
        <Text variant="subtitle" weight="bold" color={theme.colors.gray900}>#{orderCode.replace(/^#/, '')}</Text>
        <Text variant="caption" color={theme.colors.gray600}>{t('order_card_placed_on')} {placedAt}</Text>
        <Text variant="caption" weight="semiBold" color={theme.colors.gray600}>{t(orderType === 'delivery' ? 'order_card_type_delivery' : 'order_card_type_pickup')}</Text>
      </View>
      <View style={[styles.status, { backgroundColor: tone.background }]}>
        <Text variant="caption" weight="semiBold" color={tone.text} numberOfLines={2}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  orderIdentity: { flex: 1, gap: 3 },
  status: { maxWidth: '48%', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
});
