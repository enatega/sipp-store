import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { useTranslations } from "../../localization/LocalizationProvider";
import Text from "../Text";
import OrderCard from "./OrderCard/OrderCard";
import SegmentedTabs from "../SegmentedTabs";
import EmptyOrdersSection from "./EmptyOrdersSection";
import { Order, OrderStatus } from "../../api/orderServicesTypes";
import VerticalList from "../VerticalList";
import OrderFocusFilter from './OrderFocusFilter';

type OrderTypeFilter = "delivery" | "pickup";

type UseOrdersHook = (options?: {
  params?: { limit?: number; orderType?: OrderTypeFilter; search?: string };
}) => {
  data?: { pages: { items: Order[] }[] };
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  refetch: () => Promise<{ data?: { pages: { items: Order[] }[] }; isError: boolean }>;
  isError: boolean;
};

type RenderActionsReturn = {
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  onConfirmPickup?: (orderId: string) => void;
  onUpdatePreparingTime?: (orderId: string, minutes: number) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
  isMarkingReady?: boolean;
  isConfirmingPickup?: boolean;
  isUpdatingTime?: boolean;
};

type Props = {
  highlightOrderCode?: string | null;
  focusOrderId?: string;
  onClearOrderFocus?: () => void;
  useOrdersHook: UseOrdersHook;
  renderActions: (order: Order) => RenderActionsReturn;
  initialOrderType?: OrderTypeFilter;
  onOrderTypeChange?: (orderType: OrderTypeFilter) => void;
  onOrdersDataChange?: (orders: Order[]) => void;
  onNewOrdersFromManualRefresh?: (orders: Order[]) => void;
  autoScrollToTopOnNewItem?: boolean;
  orderTypeCounts?: Record<OrderTypeFilter, number>;
};

export default function GenericOrderList({
  highlightOrderCode,
  focusOrderId,
  onClearOrderFocus,
  useOrdersHook,
  renderActions,
  initialOrderType = 'delivery',
  onOrderTypeChange,
  onOrdersDataChange,
  onNewOrdersFromManualRefresh,
  autoScrollToTopOnNewItem = false,
  orderTypeCounts,
}: Props) {
  const filterType = initialOrderType;
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const listRef = useRef<any>(null);
  const scrollOffsetsRef = useRef<Record<OrderTypeFilter, number>>({ delivery: 0, pickup: 0 });
  const pendingScrollRestoreRef = useRef<number | null>(null);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const hasMountedRef = useRef(false);
  const isActiveRef = useRef(true);
  const { t } = useTranslations("app");
  const { theme } = useAppTheme();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isError,
  } = useOrdersHook({
    params: { limit: 10, orderType: filterType, search: focusOrderId },
  });

  const orders = data?.pages.flatMap((page) => page?.items) ?? [];
  useEffect(() => {
    isActiveRef.current = true;
    return () => { isActiveRef.current = false; };
  }, []);
  useEffect(() => {
    pendingScrollRestoreRef.current = scrollOffsetsRef.current[filterType];
    previousOrderIdsRef.current = new Set();
    hasMountedRef.current = false;
  }, [filterType]);
  useEffect(() => {
    onOrdersDataChange?.(orders);
  }, [onOrdersDataChange, orders]);

  useEffect(() => {
    const currentTopOrderId = orders[0]?.orderId ?? null;
    const previousOrderIds = previousOrderIdsRef.current;
    const nextOrderIds = new Set(orders.map((order) => order.orderId));

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      previousOrderIdsRef.current = nextOrderIds;
      return;
    }

    if (
      autoScrollToTopOnNewItem
      && currentTopOrderId
      && !previousOrderIds.has(currentTopOrderId)
    ) {
      // Defer until list commit completes so FlashList can scroll reliably.
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
        });
      });
    }

    previousOrderIdsRef.current = nextOrderIds;
  }, [autoScrollToTopOnNewItem, orders]);

  const tabs = [
    { key: "delivery", label: t("orders_tab_delivery"), badgeCount: orderTypeCounts?.delivery },
    { key: "pickup", label: t("orders_tab_pickup"), badgeCount: orderTypeCounts?.pickup },
  ];

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      );
    }
    if (!focusOrderId && !hasNextPage && orders.length > 0) {
      return (
        <View style={styles.footerMessage}>
          <Text style={{ color: theme.colors.gray500, textAlign: "center" }}>
            {t("orders_no_more")}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SegmentedTabs
        tabs={tabs}
        activeKey={filterType}
        onTabPress={(key) => {
          const next = key as OrderTypeFilter;
          onOrderTypeChange?.(next);
        }}
      />
      {focusOrderId && onClearOrderFocus ? (
        <OrderFocusFilter
          orderCode={orders.find((order) => order.orderId === focusOrderId)?.orderCode || `#${focusOrderId.split('-')[0].toUpperCase()}`}
          onClear={onClearOrderFocus}
        />
      ) : null}
      {isLoading && !data ? (
        <View style={styles.skeletonList} accessibilityLabel={t('orders_loading')}>
          {[0, 1].map((index) => (
            <View key={index} style={[styles.skeletonCard, { backgroundColor: theme.colors.gray50 }]}>
              <View style={[styles.skeletonTitle, { backgroundColor: theme.colors.gray200 }]} />
              <View style={[styles.skeletonLine, { backgroundColor: theme.colors.gray200 }]} />
              <View style={[styles.skeletonLineShort, { backgroundColor: theme.colors.gray200 }]} />
            </View>
          ))}
        </View>
      ) : isError && !data ? (
        <View style={styles.centered}>
          <Text color={theme.colors.gray600}>{t('orders_load_failed')}</Text>
          <Pressable accessibilityRole="button" onPress={() => void refetch()} style={[styles.retry, { backgroundColor: theme.colors.primary }]}>
            <Text weight="semiBold" color={theme.colors.buttonText}>{t('orders_retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <VerticalList
          ref={listRef}
          key={filterType}
          onScroll={(event) => { scrollOffsetsRef.current[filterType] = event.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={100}
          onContentSizeChange={() => {
            if (pendingScrollRestoreRef.current === null) return;
            const offset = pendingScrollRestoreRef.current;
            pendingScrollRestoreRef.current = null;
            requestAnimationFrame(() => listRef.current?.scrollToOffset?.({ offset, animated: false }));
          }}
          data={orders}
          extraData={orders}
          keyExtractor={(item) => item.orderId}
          renderItem={({ item }) => {
            const actions = renderActions(item);
            return (
              <OrderCard
                order={item}
                highlighted={Boolean(highlightOrderCode && item.orderCode?.replace(/^#/, '') === highlightOrderCode.replace(/^#/, ''))}
                onAccept={actions.onAccept}
                onReject={actions.onReject}
                onMarkReady={actions.onMarkReady}
                onConfirmPickup={actions.onConfirmPickup}
                onUpdatePreparingTime={actions.onUpdatePreparingTime}
                isAccepting={actions.isAccepting}
                isRejecting={actions.isRejecting}
                isMarkingReady={actions.isMarkingReady}
                isConfirmingPickup={actions.isConfirmingPickup}
                isUpdatingTime={actions.isUpdatingTime}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshing={isManualRefreshing}
          onRefresh={() => {
            if (isManualRefreshing) return;
            const canDetectNewOrders = Boolean(onNewOrdersFromManualRefresh && !focusOrderId && data && hasMountedRef.current);
            const previouslyVisible = new Set(previousOrderIdsRef.current);
            setIsManualRefreshing(true);
            void refetch().then((result) => {
              if (!isActiveRef.current || !canDetectNewOrders || result.isError || !result.data) return;
              const discovered: Order[] = [];
              for (const order of result.data.pages.flatMap((page) => page.items)) {
                if (previouslyVisible.has(order.orderId) || order.status !== OrderStatus.PENDING || !order.canAccept) continue;
                previouslyVisible.add(order.orderId);
                discovered.push(order);
              }
              if (discovered.length > 0) onNewOrdersFromManualRefresh?.(discovered);
            }).catch(() => undefined).finally(() => {
              if (isActiveRef.current) setIsManualRefreshing(false);
            });
          }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={{ marginTop: 100, paddingHorizontal: 20 }}>
              {focusOrderId ? (
                <Text style={{ color: theme.colors.mutedText, textAlign: 'center' }}>
                  {t('orders_focus_no_results')}
                </Text>
              ) : <EmptyOrdersSection />}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  footerLoader: { paddingVertical: 20, alignItems: "center" },
  footerMessage: { paddingVertical: 10, alignItems: "center" },
  skeletonList: { flex: 1, padding: 16, gap: 12 },
  skeletonCard: { borderRadius: 14, padding: 18, gap: 18, minHeight: 180 },
  skeletonTitle: { width: '42%', height: 22, borderRadius: 6 },
  skeletonLine: { width: '90%', height: 16, borderRadius: 6 },
  skeletonLineShort: { width: '62%', height: 16, borderRadius: 6 },
  retry: { minHeight: 44, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center', marginTop: 16 },
});
