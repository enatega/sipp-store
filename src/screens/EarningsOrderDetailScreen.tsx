import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../theme/ThemeProvider';
import { MainStackParamList } from '../navigation/types';
import ScreenHeader from '../components/ScreenHeader';
import EarningsOrderCard from '../components/EarningsOrderCard';
import Text from '../components/Text';
import VerticalList from '../components/VerticalList';
import { useEarningsHistoryQuery } from '../hooks/useEarningsQueries';
import { useCurrencyFormatter } from '../hooks/useCurrency';

type Props = NativeStackScreenProps<MainStackParamList, 'EarningsOrderDetail'>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EarningsOrderDetailScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme();
  const { formatAmount } = useCurrencyFormatter();
  const selectedDate = route.params.date;
  const { data: earningsHistoryData } = useEarningsHistoryQuery({
    params: {
      page: 1,
      limit: 10,
      startDate: selectedDate,
      endDate: selectedDate,
    },
  });

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Earnings" onBack={() => navigation.goBack()} />

      {/* Total earnings row */}
      <View style={[styles.totalRow, { borderBottomColor: theme.colors.gray200 }]}>
        <Text variant="body" color={theme.colors.text}>
          Total Earnings
        </Text>
        <Text variant="body" weight="bold" color={theme.colors.text}>
          {formatAmount(earningsHistoryData?.total_earnings ?? 0, 2)}
        </Text>
      </View>

      {/* Order cards */}
      <VerticalList
        data={earningsHistoryData?.data ?? []}
        keyExtractor={(item) => item.order_id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <EarningsOrderCard item={item} storeTimezone={earningsHistoryData?.storeTimezone} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  separator: {
    height: 12,
  },
});
