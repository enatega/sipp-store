import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  StyleSheet,
  View,
} from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { useTranslations } from "../../localization/LocalizationProvider";
import Text from "../Text";
import OrderCard from "./OrderCard/OrderCard";
import SegmentedTabs from "../SegmentedTabs";
import EmptyOrdersSection from "./EmptyOrdersSection";
import { Order } from "../../api/orderServicesTypes";
import VerticalList from "../VerticalList";

type OrderTypeFilter = "delivery" | "pickup";

type UseOrdersHook = (options?: {
  params?: { limit?: number; orderType?: OrderTypeFilter };
}) => {
  data?: { pages: { items: Order[] }[] };
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  refetch: () => void;
  isRefetching: boolean;
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
  useOrdersHook: UseOrdersHook;
  renderActions: (order: Order) => RenderActionsReturn;
  onOrdersDataChange?: (orders: Order[]) => void;
  autoScrollToTopOnNewItem?: boolean;
};

export default function GenericOrderList({
  useOrdersHook,
  renderActions,
  onOrdersDataChange,
  autoScrollToTopOnNewItem = false,
}: Props) {
  const [filterType, setFilterType] = useState<OrderTypeFilter>("delivery");
  const listRef = useRef<any>(null);
  const previousTopOrderIdRef = useRef<string | null>(null);
  const hasMountedRef = useRef(false);
  const { t } = useTranslations("app");
  const { theme } = useAppTheme();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useOrdersHook({
    params: { limit: 10, orderType: filterType },
  });

  const orders = data?.pages.flatMap((page) => page?.items) ?? [];
  useEffect(() => {
    onOrdersDataChange?.(orders);
  }, [onOrdersDataChange, orders]);

  useEffect(() => {
    const currentTopOrderId = orders[0]?.orderId ?? null;
    const previousTopOrderId = previousTopOrderIdRef.current;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      previousTopOrderIdRef.current = currentTopOrderId;
      return;
    }

    if (
      autoScrollToTopOnNewItem
      && currentTopOrderId
      && previousTopOrderId !== currentTopOrderId
    ) {
      // Defer until list commit completes so FlashList can scroll reliably.
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
        });
      });
    }

    previousTopOrderIdRef.current = currentTopOrderId;
  }, [autoScrollToTopOnNewItem, orders]);

  const isLoadingAny = isLoading || isRefetching || isFetchingNextPage;

  const tabs = [
    { key: "delivery", label: t("orders_tab_delivery") },
    { key: "pickup", label: t("orders_tab_pickup") },
  ];

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      );
    }
    if (!hasNextPage && orders.length > 0) {
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
        onTabPress={(key) => setFilterType(key as OrderTypeFilter)}
        disabled={isLoadingAny}
      />
      {isLoading && !data ? (
        <View
          style={[
            styles.centered,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <VerticalList
          ref={listRef}
          key={filterType}
          data={orders}
          extraData={orders}
          keyExtractor={(item) => item.orderId}
          renderItem={({ item }) => {
            const actions = renderActions(item);
            return (
              <OrderCard
                order={item}
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
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={{ marginTop: 100 }}>
              <EmptyOrdersSection />
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
});
