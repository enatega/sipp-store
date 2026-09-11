import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './Text';
import { useAppTheme } from '../theme/ThemeProvider';
import VerticalList from './VerticalList';
import { useCurrencyFormatter } from '../hooks/useCurrency';

export type EarningsActivityItem = {
  date: string;
  total_amount: number;
};

type Props = {
  items: EarningsActivityItem[];
  onPressItem?: (item: EarningsActivityItem) => void;
  showNoMoreEarningFooter?: boolean;
};

function formatDisplayDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }

  return `${day}.${month}.${year}`;
}

function Row({
  item,
  onPress,
}: {
  item: EarningsActivityItem;
  onPress?: (item: EarningsActivityItem) => void;
}) {
  const { theme } = useAppTheme();
  const { formatAmount } = useCurrencyFormatter();

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.colors.gray200, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text variant="caption" color={theme.colors.gray500} style={styles.date}>
        {formatDisplayDate(item.date)}
      </Text>
      <Text variant="body" weight="semiBold" color={theme.colors.text} style={styles.label}>
        Total Earning
      </Text>

      <Text variant="body" weight="bold" color={theme.colors.text} style={styles.amount}>
        {formatAmount(item.total_amount, 2)}
      </Text>
      <View style={[styles.chevron, { borderColor: theme.colors.gray500 }]} />
    </Pressable>
  );
}

export default function EarningsActivityRow({
  items,
  onPressItem,
  showNoMoreEarningFooter = false,
}: Props) {
  const { theme } = useAppTheme();

  return (
    <VerticalList
      data={items}
      keyExtractor={(item) => item.date}
      renderItem={({ item }) => <Row item={item} onPress={onPressItem} />}
      scrollEnabled={false}
      ListFooterComponent={
        showNoMoreEarningFooter && items.length > 0 ? (
          <View style={styles.footerMessage}>
            <Text variant="caption" color={theme.colors.gray500}>
              There is no more earning
            </Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 8,
  },
  date: {
    fontSize: 12,
    marginRight: 6,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  amount: {
    fontSize: 14,
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderTopWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  footerMessage: {
    paddingVertical: 10,
    alignItems: 'center',
  },
});
