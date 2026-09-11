import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ScreenHeader from "../components/ScreenHeader";
import Text from "../components/Text";
import VerticalList from "../components/VerticalList";
import EmptyOrdersSection from "../components/orders/EmptyOrdersSection";
import OrderCard from "../components/orders/OrderCard/OrderCard";
import { MainStackParamList } from "../navigation/types";
import { useScheduledOrders } from "../hooks/useOrderQueries";
import { useAppTheme } from "../theme/ThemeProvider";
import { useTranslations } from "../localization/LocalizationProvider";

const PAGE_LIMIT = 10;

export default function ScheduledOrdersScreen() {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useScheduledOrders({
    params: { limit: PAGE_LIMIT },
  });

  const orders = data?.pages.flatMap((page) => page?.items ?? []) ?? [];

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={t("profile_scheduled_orders")}
        onBack={() => navigation.goBack()}
      />

      {isLoading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <VerticalList
          data={orders}
          keyExtractor={(item) => item.orderId}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
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
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  separator: { height: 12 },
  emptyWrap: { marginTop: 100 },
  footerLoader: { paddingVertical: 20, alignItems: "center" },
  footerMessage: { paddingVertical: 10, alignItems: "center" },
});
