import React, { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { TabItem } from '../components/TabBar';
import TabBar from '../components/TabBar';
import TabShell from '../components/TabShell';
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

const ORDER_TAB_SCREENS: Record<OrderTab, React.ComponentType> = {
  new: NewOrdersScreen,
  inProgress: InProgressScreen,
  ready: ReadyScreen,
  pickup: PickupScreen,
  completed: CompletedScreen,
};

export default function HomeTabScreen() {
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>('new');
  const { t } = useTranslations("app");
  const countParams = { offset: 0, limit: 1, orderType: "delivery" } as const;
  const ActiveOrderScreen = ORDER_TAB_SCREENS[activeOrderTab];

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
      <ActiveOrderScreen key={activeOrderTab} />
    </TabShell>
  );
}
