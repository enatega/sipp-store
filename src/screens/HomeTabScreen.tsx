import React, { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
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

export default function HomeTabScreen() {
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>('new');
  const [orderType, setOrderType] = useState<OrderTypeFilter>('delivery');
  const [notice, setNotice] = useState<OrderFlowResult | null>(null);
  const { t } = useTranslations("app");
  const countParams = { offset: 0, limit: 1, orderType } as const;
  const ActiveOrderScreen = ORDER_TAB_SCREENS[activeOrderTab];
  const handleOrderFlow = (result: OrderFlowResult) => {
    setOrderType(result.orderType);
    setActiveOrderTab(result.tab);
    setNotice(result);
  };

  const countQueries = useQueries({
    queries: [
      {
        queryKey: newOrdersKeys.list(countParams),
        queryFn: () => orderServices.getNewOrders(countParams),
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
    { key: 'new', label: t('orders_tab_new_orders'), badgeCount: countQueries[0].data?.total ?? 0 },
    { key: 'inProgress', label: t('orders_tab_in_progress'), badgeCount: countQueries[1].data?.total ?? 0 },
    { key: 'ready', label: t('orders_tab_ready'), badgeCount: countQueries[2].data?.total ?? 0 },
    { key: 'pickup', label: t('orders_tab_pickup_short'), badgeCount: countQueries[3].data?.total ?? 0 },
    { key: 'completed', label: t('orders_tab_completed'), badgeCount: countQueries[4].data?.total ?? 0 },
  ];

  return (
    <TabShell titleKey="orders_title">
      <TabBar tabs={ORDER_TABS} activeTab={activeOrderTab} onTabPress={setActiveOrderTab} />
      <ActiveOrderScreen key={`${activeOrderTab}:${orderType}`} initialOrderType={orderType} onOrderTypeChange={setOrderType} onOrderFlow={handleOrderFlow} />
      <OrderActionNotice
        visible={Boolean(notice)}
        title={notice ? t(NOTICE_COPY[notice.notice].title) : ''}
        message={notice ? t(NOTICE_COPY[notice.notice].message) : ''}
        tone={notice ? NOTICE_COPY[notice.notice].tone : 'success'}
        orderCode={notice?.orderCode}
        buttonLabel={t(notice?.notice === 'failed' ? 'order_flow_try_again' : 'order_flow_continue')}
        onClose={() => setNotice(null)}
      />
    </TabShell>
  );
}
