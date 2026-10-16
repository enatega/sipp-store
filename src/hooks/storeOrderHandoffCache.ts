import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { Order, PaginatedOrdersResponse } from '../api/orderServicesTypes';
import { completedOrdersKeys, inProgressOrdersKeys, newOrdersKeys, pickupOrdersKeys, readyOrdersKeys } from '../api/queryKeys';

type StoreTab = 'new' | 'inProgress' | 'ready' | 'pickup' | 'completed';

const LIST_KEYS = {
  new: newOrdersKeys,
  inProgress: inProgressOrdersKeys,
  ready: readyOrdersKeys,
  pickup: pickupOrdersKeys,
  completed: completedOrdersKeys,
};

export function getCachedStoreOrder(queryClient: QueryClient, tabs: StoreTab[], orderId: string) {
  return tabs.flatMap((tab) =>
    queryClient.getQueriesData<InfiniteData<PaginatedOrdersResponse>>({ queryKey: LIST_KEYS[tab].lists() }),
  ).flatMap(([, data]) => data && Array.isArray(data.pages) ? data.pages.flatMap((page) => page.items) : [])
    .find((item) => item.orderId === orderId);
}

export function moveStoreOrderAfterConfirmation(
  queryClient: QueryClient,
  sourceTabs: StoreTab[],
  destinationTab: StoreTab,
  orderId: string,
  changes: Partial<Order>,
  fallbackOrder?: Order,
) {
  const sourceQueries = sourceTabs.flatMap((tab) =>
    queryClient.getQueriesData<InfiniteData<PaginatedOrdersResponse>>({ queryKey: LIST_KEYS[tab].lists() }),
  );
  const sourceOrder = getCachedStoreOrder(queryClient, sourceTabs, orderId) ?? fallbackOrder;
  if (!sourceOrder) return;

  sourceQueries.forEach(([key, data]) => {
    if (!data || !Array.isArray(data.pages)) return;
    let removed = 0;
    const pages = data.pages.map((page) => {
      const items = page.items.filter((item) => item.orderId !== orderId);
      removed += page.items.length - items.length;
      return items.length === page.items.length ? page : { ...page, items, total: Math.max(0, page.total - 1) };
    });
    if (removed) queryClient.setQueryData(key, { ...data, pages });
  });

  const order = { ...sourceOrder, ...changes };
  const destinationKey = LIST_KEYS[destinationTab].list({ limit: 10, orderType: order.orderType, search: undefined });
  queryClient.setQueryData<InfiniteData<PaginatedOrdersResponse>>(destinationKey, (current) => {
    if (!current) {
      return {
        pageParams: [0],
        pages: [{ items: [order], offset: 0, limit: 10, total: 1, isEnd: true, nextOffset: null }],
      };
    }
    const wasPresent = current.pages.some((page) => page.items.some((item) => item.orderId === orderId));
    const pages = current.pages.map((page) => ({ ...page, items: page.items.filter((item) => item.orderId !== orderId) }));
    pages[0] = { ...pages[0], items: [order, ...pages[0].items], total: pages[0].total + (wasPresent ? 0 : 1) };
    return { ...current, pages };
  });
}
