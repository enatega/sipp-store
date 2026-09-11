import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './Text';
import { useAppTheme } from '../theme/ThemeProvider';
import { EarningsHistoryItem } from '../api/earningsServiceTypes';
import { useCurrencyFormatter } from '../hooks/useCurrency';
import { useTranslations } from '../localization/LocalizationProvider';

type Props = {
  item: EarningsHistoryItem;
};

/**
 * Expandable order card used on the Earnings order detail screen.
 * Shows Order ID + status badge, Payment row, and collapsible Order Details.
 */
export default function EarningsOrderCard({ item }: Props) {
  const { theme } = useAppTheme();
  const { formatAmount } = useCurrencyFormatter();
  const { t } = useTranslations('app');
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.card, { borderColor: theme.colors.gray200, backgroundColor: theme.colors.surface }]}>
      {/* Row 1: Order ID + status badge */}
      <View style={styles.topRow}>
        <Text variant="body" color={theme.colors.text}>
          {t('earnings_order_id')}{' '}
          <Text variant="body" weight="semiBold" color={theme.colors.text}>
            #{item.order_id.split('-')[0].toUpperCase()}
          </Text>
        </Text> 
        <View style={[styles.badge, { backgroundColor: theme.colors.tertiary }]}>
          <Text variant="caption" color={theme.colors.primary} style={styles.badgeText}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.gray200 }]} />

      {/* Row 2: Payment */}
      <View style={styles.paymentRow}>
        <Text variant="body" color={theme.colors.text}>
          {t('earnings_customer_payment')}
        </Text>
        <Text variant="body" weight="bold" color={theme.colors.text}>
          {formatAmount(item.payment_amount, 2)}
        </Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.gray200 }]} />

      {/* Row 3: Order Details toggle */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={styles.detailsRow}
        accessibilityRole="button"
        accessibilityLabel="Toggle order details"
      >
        <Text variant="body" color={theme.colors.text}>
          {t('earnings_order_details')}
        </Text>
        <View
          style={[
            styles.chevron,
            { borderColor: theme.colors.gray500 },
            expanded && styles.chevronUp,
          ]}
        />
      </Pressable>

      {/* Expanded details placeholder */}
      {expanded && (
        <View style={[styles.expandedContent, { borderTopColor: theme.colors.gray200 }]}>
          <View style={styles.detailRow}>
            <Text variant="caption" color={theme.colors.mutedText}>
              {t('earnings_admin_commission')}
            </Text>
            <Text variant="caption" color={theme.colors.text}>
              -{formatAmount(item.commission_amount, 2)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="caption" color={theme.colors.mutedText}>
              {t('earnings_rider_earnings')}
            </Text>
            <Text variant="caption" color={theme.colors.text}>
              -{formatAmount(item.rider_earnings, 2)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" weight="bold" color={theme.colors.text}>
              {t('earnings_store_net')}
            </Text>
            <Text variant="body" weight="bold" color={theme.colors.text}>
              {formatAmount(item.net_earnings, 2)}
            </Text>
          </View>
          <Text variant="caption" color={theme.colors.mutedText}>
            {item.created_at}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  chevron: {
    width: 9,
    height: 9,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginTop: -4,
  },
  chevronUp: {
    transform: [{ rotate: '-135deg' }],
    marginTop: 4,
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
