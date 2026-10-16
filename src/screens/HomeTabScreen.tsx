import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/MainTabsNavigator';
import { TabItem } from '../components/TabBar';
import TabBar from '../components/TabBar';
import TabShell from '../components/TabShell';
import OrderActionNotice from '../components/orders/OrderActionNotice';
import { useTranslations } from '../localization/LocalizationProvider';
import { orderServices } from '../api/orderServices';
import {
  completedOrdersKeys,
  inProgressOrdersKeys,
  newOrdersKeys,
  ordersKeys,
  pickupOrdersKeys,
  readyOrdersKeys,
} from '../api/queryKeys';
import {
  OrderTab,
  NewOrdersScreen,
  InProgressScreen,
  ReadyScreen,
  PickupScreen,
  CompletedScreen,
} from './orders';
import type { OrderFlowResult, OrderScreenProps, OrderTypeFilter } from './orders/orderFlowTypes';

const ORDER_TAB_SCREENS: Record<OrderTab, React.ComponentType<OrderScreenProps>> = {
  new: NewOrdersScreen,
  inProgress: InProgressScreen,
  ready: ReadyScreen,
  pickup: PickupScreen,
  completed: CompletedScreen,
};

function orderTabForStatus(status: string): OrderTab {
  return status === 'pending' || status === 'scheduled' ? 'new'
    : status === 'accepted' || status === 'preparing' || status === 'rider_assigned' ? 'inProgress'
    : status === 'ready' ? 'ready'
    : status === 'picked_up' || status === 'out_for_delivery' || status === 'arrived' ? 'pickup'
    : 'completed';
}

const NOTICE_COPY: Record<OrderFlowResult['notice'], { title: string; message: string; tone: 'success' | 'warning' | 'error' }> = {
  accepted: { title: 'order_flow_accepted_title', message: 'order_flow_accepted_message', tone: 'success' },
  acceptedNeedsTime: { title: 'order_flow_accepted_title', message: 'order_flow_needs_time_message', tone: 'warning' },
  ready: { title: 'order_flow_ready_title', message: 'order_flow_ready_message', tone: 'success' },
  collected: { title: 'order_flow_collected_title', message: 'order_flow_collected_message', tone: 'success' },
  completed: { title: 'order_flow_completed_title', message: 'order_flow_completed_message', tone: 'success' },
  rejected: { title: 'order_flow_rejected_title', message: 'order_flow_rejected_message', tone: 'warning' },
  timeUpdated: { title: 'order_flow_time_title', message: 'order_flow_time_message', tone: 'success' },
  failed: { title: 'order_flow_failed_title', message: 'order_flow_failed_message', tone: 'error' },
};

type Props = BottomTabScreenProps<MainTabParamList, 'HomeTab'>;

export default function HomeTabScreen({ route, navigation }: Props) {
  const queryClient = useQueryClient();
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>('new');
  const [visitedTabs, setVisitedTabs] = useState<OrderTab[]>(['new']);
  const [orderType, setOrderType] = useState<OrderTypeFilter>('delivery');
  const [notice, setNotice] = useState<OrderFlowResult | null>(null);
  const [highlight, setHighlight] = useState<{ tab: OrderTab; code: string } | null>(null);
  const focusOrderId = route.params?.orderId;
  const focusedOrder = useQuery({
    queryKey: ['store-order-route', focusOrderId],
    queryFn: () => orderServices.getOrderRouteDetail(focusOrderId!),
    enabled: Boolean(focusOrderId),
    refetchOnMount: 'always',
  });
  useEffect(() => {
    if (!focusedOrder.data) return;
    const { status, orderType } = focusedOrder.data;
    setOrderType(orderType);
    setActiveOrderTab(orderTabForStatus(status));
  }, [focusedOrder.data]);
  useEffect(() => {
    setVisitedTabs((current) => current.includes(activeOrderTab) ? current : [...current, activeOrderTab]);
  }, [activeOrderTab]);
  useEffect(() => {
    if (!highlight) return;
    const timeout = setTimeout(() => setHighlight(null), 4500);
    return () => clearTimeout(timeout);
  }, [highlight]);
  const { t } = useTranslations("app");
  const clearOrderFocus = () => navigation.setParams({ orderId: undefined });
  const countParams = { offset: 0, limit: 1, orderType } as const;
  const newDeliveryParams = { offset: 0, limit: 1, orderType: 'delivery' } as const;
  const newPickupParams = { offset: 0, limit: 1, orderType: 'pickup' } as const;
  const mountedTabs = visitedTabs.includes(activeOrderTab) ? visitedTabs : [...visitedTabs, activeOrderTab];
  const handleOrderFlow = (result: OrderFlowResult) => {
    if (result.notice !== 'failed' && result.navigate !== false) {
      clearOrderFocus();
      setOrderType(result.orderType);
      setActiveOrderTab(result.tab);
      if (result.orderCode) setHighlight({ tab: result.tab, code: result.orderCode });
    } else if (result.notice === 'failed') {
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all });
      if (focusOrderId) void focusedOrder.refetch();
    }
    setNotice(result);
  };

  const countQueries = useQueries({
    queries: [
      {
        queryKey: newOrdersKeys.list(newDeliveryParams),
        queryFn: () => orderServices.getNewOrders(newDeliveryParams),
      },
      {
        queryKey: newOrdersKeys.list(newPickupParams),
        queryFn: () => orderServices.getNewOrders(newPickupParams),
      },
      {
        queryKey: inProgressOrdersKeys.list(countParams),
        queryFn: () => orderServices.getInProgressOrders(countParams),
      },
      {
        queryKey: readyOrdersKeys.list(countParams),
        queryFn: () => orderServices.getReadyOrders(countParams),
      },
      {
        queryKey: pickupOrdersKeys.list(countParams),
        queryFn: () => orderServices.getPickupOrders(countParams),
      },
      {
        queryKey: completedOrdersKeys.list(countParams),
        queryFn: () => orderServices.getCompletedOrders(countParams),
      },
    ],
  });

  const ORDER_TABS: TabItem<OrderTab>[] = [
    { key: 'new', label: t('orders_tab_new_orders'), badgeCount: (countQueries[0].data?.total ?? 0) + (countQueries[1].data?.total ?? 0) },
    { key: 'inProgress', label: t('orders_tab_in_progress'), badgeCount: countQueries[2].data?.total ?? 0 },
    { key: 'ready', label: t('orders_tab_ready'), badgeCount: countQueries[3].data?.total ?? 0 },
    { key: 'pickup', label: t('orders_tab_pickup_short'), badgeCount: countQueries[4].data?.total ?? 0 },
    { key: 'completed', label: t('orders_tab_completed'), badgeCount: countQueries[5].data?.total ?? 0 },
  ];

  return (
    <TabShell titleKey="orders_title">
      <TabBar tabs={ORDER_TABS} activeTab={activeOrderTab} onTabPress={(tab) => {
        clearOrderFocus();
        setActiveOrderTab(tab);
      }} />
      {mountedTabs.map((tab) => {
        const OrderScreen = ORDER_TAB_SCREENS[tab];
        return <View key={tab} style={{ flex: 1, display: tab === activeOrderTab ? 'flex' : 'none' }}>
          <OrderScreen
            initialOrderType={orderType}
            onOrderTypeChange={(nextType) => {
              if (focusOrderId) clearOrderFocus();
              setOrderType(nextType);
            }}
            onOrderFlow={handleOrderFlow}
            focusOrderId={tab === activeOrderTab ? focusOrderId : undefined}
            highlightOrderCode={highlight?.tab === tab ? highlight.code : null}
            onClearOrderFocus={clearOrderFocus}
            newOrderCounts={{ delivery: countQueries[0].data?.total ?? 0, pickup: countQueries[1].data?.total ?? 0 }}
          />
        </View>;
      })}
      <OrderActionNotice
        visible={Boolean(notice)}
        title={notice ? t(NOTICE_COPY[notice.notice].title) : ''}
        message={notice ? t(NOTICE_COPY[notice.notice].message) : ''}
        tone={notice ? NOTICE_COPY[notice.notice].tone : 'success'}
        orderCode={notice?.orderCode}
        onClose={() => setNotice(null)}
      />
    </TabShell>
  );
}
