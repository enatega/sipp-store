import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../theme/ThemeProvider';
import { MainStackParamList } from '../navigation/types';
import EarningsActivityRow from '../components/EarningsActivityRow';
import EarningsEmptyState from '../components/EarningsEmptyState';
import CalendarRangePicker from '../components/CalendarRangePicker';
import Text from '../components/Text';
import { useTranslations } from '../localization/LocalizationProvider';
import {
  useEarningsDailyQuery,
  useEarningsSummaryQuery,
} from '../hooks/useEarningsQueries';
import { useCurrencyFormatter } from '../hooks/useCurrency';

type Props = NativeStackScreenProps<MainStackParamList, 'EarningsDetail'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d: Date) =>
  `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
const toApiDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EarningsDetailScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");
  const { formatAmount } = useCurrencyFormatter();

  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd);
  defaultStart.setDate(defaultEnd.getDate() - 27);

  const [range, setRange] = useState({ start: defaultStart, end: defaultEnd });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hasReachedListEnd, setHasReachedListEnd] = useState(false);

  const dateRangeLabel = `${formatDate(range.start)} - ${formatDate(range.end)}`;
  const dateRangeParams = useMemo(
    () => ({
      page: 1,
      limit: 10,
      startDate: toApiDate(range.start),
      endDate: toApiDate(range.end),
    }),
    [range.end, range.start],
  );
  const {
    data: earningsDailyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isDailyLoading,
  } = useEarningsDailyQuery({
    params: dateRangeParams,
    staleTime: Infinity,
  });
  const earningsItems = useMemo(
    () => earningsDailyData?.pages.flatMap((page) => page.earnings_by_date) ?? [],
    [earningsDailyData],
  );
  const { data: earningsSummaryData } = useEarningsSummaryQuery({
    params: dateRangeParams,
    staleTime: Infinity,
  });

  const applyRange = (nextRange: { start: Date; end: Date }) => {
    setRange(nextRange);
    setHasReachedListEnd(false);
  };

  useEffect(() => {
    if (hasNextPage) {
      setHasReachedListEnd(false);
    }
  }, [hasNextPage]);

  if (isDailyLoading && !earningsDailyData) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (earningsItems.length === 0) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} accessibilityLabel="Go back">
            <View style={[styles.backChevron, { borderColor: theme.colors.text }]} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text variant="body" weight="bold" color={theme.colors.text} style={styles.headerTitle}>
              {t("nav_earnings")}
            </Text>
            <Text variant="caption" color={theme.colors.gray500} style={styles.headerSubtitle}>
              {dateRangeLabel}
            </Text>
          </View>
          <Pressable onPress={() => setCalendarOpen(true)} hitSlop={8} accessibilityLabel="Filter by date">
            <FilterIcon color={theme.colors.text} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.emptyContent} showsVerticalScrollIndicator={false}>
          <EarningsEmptyState />
        </ScrollView>
        <CalendarRangePicker
          visible={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          onApply={applyRange}
          initialRange={range}
        />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      {/* Header: back + date range + filter icon */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} accessibilityLabel="Go back">
          <View style={[styles.backChevron, { borderColor: theme.colors.text }]} />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text variant="body" weight="bold" color={theme.colors.text} style={styles.headerTitle}>
            {t("nav_earnings")}
          </Text>
          <Text variant="caption" color={theme.colors.gray500} style={styles.headerSubtitle}>
            {dateRangeLabel}
          </Text>
        </View>

        <Pressable
          onPress={() => setCalendarOpen(true)}
          hitSlop={8}
          accessibilityLabel="Filter by date"
        >
          <FilterIcon color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView
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
        {/* Summary card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.gray200 }]}>
          <Text variant="body" weight="semiBold" color={theme.colors.text} style={styles.summaryTitle}>
            Summary
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="caption" color={theme.colors.gray500}>Orders</Text>
              <Text variant="subtitle" weight="bold" color={theme.colors.text}>
                {earningsSummaryData?.total_orders ?? 0}
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: theme.colors.gray300 }]} />
            <View style={styles.summaryItem}>
              <Text variant="caption" color={theme.colors.gray500}>Total Earnings</Text>
              <Text variant="subtitle" weight="bold" color={theme.colors.text}>
                {formatAmount(earningsSummaryData?.total_earnings ?? 0, 2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Activity list */}
        <View style={styles.activityList}>
          <EarningsActivityRow
            items={earningsItems}
            onPressItem={(item) =>
              navigation.navigate('EarningsOrderDetail', { date: item.date })
            }
            showNoMoreEarningFooter={hasReachedListEnd && !hasNextPage}
          />
        </View>
      </ScrollView>

      {/* Calendar range picker */}
      <CalendarRangePicker
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onApply={applyRange}
        initialRange={range}
      />
    </View>
  );
}

// ─── Filter icon ──────────────────────────────────────────────────────────────

function FilterIcon({ color }: { color: string }) {
  return (
    <View style={filterStyles.wrapper}>
      <View style={[filterStyles.line1, { backgroundColor: color }]} />
      <View style={[filterStyles.line2, { backgroundColor: color }]} />
      <View style={[filterStyles.line3, { backgroundColor: color }]} />
    </View>
  );
}

const filterStyles = StyleSheet.create({
  wrapper: { width: 20, height: 16, justifyContent: 'space-between' },
  line1: { height: 2, borderRadius: 1, width: '100%' },
  line2: { height: 2, borderRadius: 1, width: '70%', alignSelf: 'center' },
  line3: { height: 2, borderRadius: 1, width: '40%', alignSelf: 'center' },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  backChevron: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  headerTitle: {
    fontSize: 15,
  },
  headerSubtitle: {
    marginTop: 2,
  },
  summaryCard: {
    margin: 16,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  activityList: {
    paddingHorizontal: 16,
  },
  emptyContent: {
    minHeight: 700,
    paddingBottom: 32,
  },
});
