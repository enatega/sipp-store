import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../theme/ThemeProvider';
import { MainStackParamList } from '../navigation/types';
import BarChart, { BarChartDataPoint } from '../components/BarChart';
import EarningsActivityRow from '../components/EarningsActivityRow';
import EarningsEmptyState from '../components/EarningsEmptyState';
import Text from '../components/Text';
import { useEarningsDailyQuery, useEarningsGraphQuery } from '../hooks/useEarningsQueries';
import { useCurrencyFormatter } from '../hooks/useCurrency';

type Props = NativeStackScreenProps<MainStackParamList, 'EarningsDetail'> | { navigation?: any };

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EarningsScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { formatAmount } = useCurrencyFormatter();
  const [hasReachedListEnd, setHasReachedListEnd] = useState(false);
  const { data: earningsGraphData } = useEarningsGraphQuery({
    params: { page: 1, limit: 10 },
  });

  const chartData = useMemo<BarChartDataPoint[]>(
    () =>
      earningsGraphData?.graph.map((item) => ({
        label: item.label.replace(' - ', '-\n'),
        value: item.total_amount,
        displayValue: formatAmount(item.total_amount, 2),
      })) ?? [],
    [earningsGraphData, formatAmount],
  );
  const {
    data: earningsDailyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isDailyLoading,
  } = useEarningsDailyQuery({
    params: { page: 1, limit: 10 },
  });

  const earningsItems = useMemo(
    () => earningsDailyData?.pages.flatMap((page) => page.earnings_by_date) ?? [],
    [earningsDailyData],
  );
  useEffect(() => {
    if (hasNextPage) {
      setHasReachedListEnd(false);
    }
  }, [hasNextPage]);

  const handleSeeMore = () => navigation?.navigate?.('EarningsDetail');
  const handleRowPress = (item: { date: string }) =>
    navigation?.navigate?.('EarningsOrderDetail', { date: item.date });

  if (isDailyLoading && !earningsDailyData) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (earningsItems.length === 0) {
    return (
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.emptyContent}
        showsVerticalScrollIndicator={false}
      >
        <EarningsEmptyState />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const paddingToBottom = 120;
        const isNearBottom =
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom;

        if (isNearBottom && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }

        if (isNearBottom && !hasNextPage && earningsItems.length > 0) {
          setHasReachedListEnd(true);
        }
      }}
    >
      {/* Bar chart */}
      <View style={styles.chartSection}>
        <BarChart data={chartData} height={200} />
      </View>

      {/* Recent Activity header */}
      <View style={styles.sectionHeader}>
        <Text variant="subtitle" weight="bold" color={theme.colors.text}>
          Recent Activity
        </Text>
        <Pressable onPress={handleSeeMore} accessibilityRole="button">
          <Text variant="body" color="#0EA5E9">
            See More
          </Text>
        </Pressable>
      </View>

      {/* Activity rows */}
      <View style={styles.activityList}>
        <EarningsActivityRow
          items={earningsItems}
          onPressItem={handleRowPress}
          showNoMoreEarningFooter={hasReachedListEnd && !hasNextPage}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 32,
  },
  emptyContent: {
    paddingBottom: 32,
    minHeight: 700,
  },
  chartSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  activityList: {
    paddingHorizontal: 16,
  },
});
