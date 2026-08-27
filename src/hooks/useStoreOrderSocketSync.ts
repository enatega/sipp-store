import { useEffect, useRef } from "react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { AppState, type AppStateStatus } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useAuth } from "../auth/AuthProvider";
import {
  completedOrdersKeys,
  inProgressOrdersKeys,
  newOrdersKeys,
  pickupOrdersKeys,
  readyOrdersKeys,
} from "../api/queryKeys";
import type {
  GetOrdersParams,
  Order,
  PaginatedOrdersResponse,
} from "../api/orderServicesTypes";
import { OrderStatus as StoreOrderStatus } from "../api/orderServicesTypes";
import {
  storeOrdersSocketClient,
  type StoreHomeOrderCreatedPayload,
  type StoreOrderStatusUpdatedPayload,
  type StoreRiderStatusUpdatedPayload,
} from "../socket/storeOrdersSocket";
import { startOrderAlertLoop, stopOrderAlertLoop } from "./orderAlertSound";

function matchesOrderTypeFilter(params: GetOrdersParams | undefined, nextType: Order["orderType"]) {
  const filter = params?.orderType;
  if (!filter || filter === "all") return true;
  return filter === nextType;
}

function prependOrderToInfiniteData(
  previous: InfiniteData<PaginatedOrdersResponse> | undefined,
  incomingOrder: Order,
): InfiniteData<PaginatedOrdersResponse> | undefined {
  if (!previous?.pages?.length) return previous;

  const alreadyExists = previous.pages.some((page) =>
    (Array.isArray(page.items) ? page.items : []).some((item) => item.orderId === incomingOrder.orderId),
  );
  if (alreadyExists) return previous;

  const firstPage = previous.pages[0];
  const safeFirstPageItems = Array.isArray(firstPage.items) ? firstPage.items : [];
  const nextFirstItems = [incomingOrder, ...safeFirstPageItems];
  const cappedFirstItems = nextFirstItems.slice(0, firstPage.limit);

  return {
    ...previous,
    pages: [
      {
        ...firstPage,
        items: cappedFirstItems,
        total: firstPage.total + 1,
      },
      ...previous.pages.slice(1),
    ],
  };
}

function prependOrderToPaginatedData(
  previous: PaginatedOrdersResponse | undefined,
  incomingOrder: Order,
): PaginatedOrdersResponse | undefined {
  if (!previous) return previous;

  const safeItems = Array.isArray(previous.items) ? previous.items : [];
  const alreadyExists = safeItems.some((item) => item.orderId === incomingOrder.orderId);
  if (alreadyExists) return previous;

  const nextItems = [incomingOrder, ...safeItems].slice(0, previous.limit);

  return {
    ...previous,
    items: nextItems,
    total: previous.total + 1,
  };
}

export function useStoreOrderSocketSync() {
  const queryClient = useQueryClient();
  const { session, isAuthenticated } = useAuth();
  const pendingAlertOrderIdsRef = useRef<Set<string>>(new Set());

  const token = session.token ?? null;
  const userId = session.user?.id ?? null;
  const currentStoreId = session.profiles?.find((entry) => entry.key === "Store")?.data?.id ?? null;

  useEffect(() => {
    storeOrdersSocketClient.updateSession({ token, userId });

    if (!isAuthenticated || !token) {
      pendingAlertOrderIdsRef.current.clear();
      void stopOrderAlertLoop();
      storeOrdersSocketClient.disconnect();
      return;
    }

    storeOrdersSocketClient.connect();
    console.log("[store][socket] connect requested", {
      currentStoreId,
      ...storeOrdersSocketClient.getConnectionState(),
    });

    return () => {
      pendingAlertOrderIdsRef.current.clear();
      void stopOrderAlertLoop();
      storeOrdersSocketClient.disconnect();
    };
  }, [isAuthenticated, token, userId]);

  useEffect(() => {
    if (!isAuthenticated || !token || !currentStoreId) {
      return undefined;
    }

    const unsubscribeCreated = storeOrdersSocketClient.subscribeStoreHomeOrderCreated(
      (payload: StoreHomeOrderCreatedPayload) => {
        console.log("[store][socket] store-home-order-created received", {
          currentStoreId,
          payloadStoreId: payload?.storeId,
          orderId: payload?.order?.orderId,
        });
        if (String(payload.storeId) !== String(currentStoreId)) {
          console.log("[store][socket] store-home-order-created ignored: store mismatch", {
            currentStoreId,
            payloadStoreId: payload?.storeId,
          });
          return;
        }
        if (payload?.order?.orderId) {
          pendingAlertOrderIdsRef.current.add(payload.order.orderId);
          void startOrderAlertLoop();
        }

        const incomingOrder = payload.order as Order;

        const matchingQueries = queryClient.getQueriesData({
          queryKey: newOrdersKeys.lists(),
        });

        matchingQueries.forEach(([queryKey, previous]) => {
          const key = queryKey as readonly unknown[];
          const params = key[3] as GetOrdersParams | undefined;

          if (!matchesOrderTypeFilter(params, incomingOrder.orderType)) {
            return;
          }

          queryClient.setQueryData(queryKey, (current) => {
            const queryData = (current ?? previous) as
              | InfiniteData<PaginatedOrdersResponse>
              | PaginatedOrdersResponse
              | undefined;

            if (queryData && typeof queryData === "object" && "pages" in queryData) {
              return prependOrderToInfiniteData(queryData, incomingOrder);
            }

            return prependOrderToPaginatedData(
              queryData as PaginatedOrdersResponse | undefined,
              incomingOrder,
            );
          });
        });
      },
    );

    const unsubscribeOrderStatus = storeOrdersSocketClient.subscribeOrderStatusUpdated(
      (payload: StoreOrderStatusUpdatedPayload) => {
        console.log("[store][socket] order-status-updated received", payload);
        if (!payload?.orderId || !payload?.status) return;

        if (
          payload.status !== StoreOrderStatus.PENDING
          && payload.status !== StoreOrderStatus.SCHEDULED
        ) {
          pendingAlertOrderIdsRef.current.delete(payload.orderId);
          if (pendingAlertOrderIdsRef.current.size === 0) {
            void stopOrderAlertLoop();
          }
        }

        invalidateStoreTabsForOrderStatus(queryClient, payload.status);
      },
    );

    const unsubscribeRiderStatus = storeOrdersSocketClient.subscribeRiderStatusUpdated(
      (payload: StoreRiderStatusUpdatedPayload) => {
        console.log("[store][socket] rider-status-updated received", payload);
        if (!payload?.orderId) return;
        queryClient.invalidateQueries({ queryKey: inProgressOrdersKeys.lists() });
        queryClient.invalidateQueries({ queryKey: readyOrdersKeys.lists() });
        queryClient.invalidateQueries({ queryKey: pickupOrdersKeys.lists() });
      },
    );

    return () => {
      unsubscribeCreated();
      unsubscribeOrderStatus();
      unsubscribeRiderStatus();
      pendingAlertOrderIdsRef.current.clear();
      void stopOrderAlertLoop();
    };
  }, [currentStoreId, isAuthenticated, queryClient, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      pendingAlertOrderIdsRef.current.clear();
      void stopOrderAlertLoop();
      return undefined;
    }

    let appState = AppState.currentState;
    const appStateSubscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      const wasActive = appState === "active";
      appState = nextState;

      if (wasActive && nextState !== "active") {
        return;
      }

      if (nextState === "active") {
        storeOrdersSocketClient.connect();
      }
    });

    const netInfoSubscription = NetInfo.addEventListener((state) => {
      const isReachable = state.isConnected && state.isInternetReachable !== false;
      if (!isReachable || appState !== "active") return;
      storeOrdersSocketClient.connect();
    });

    return () => {
      appStateSubscription.remove();
      netInfoSubscription();
    };
  }, [isAuthenticated, token]);
}

function invalidateStoreTabsForOrderStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  status: string,
) {
  const invalidate = (key: readonly unknown[]) =>
    queryClient.invalidateQueries({ queryKey: key });

  const statusToKeys: Record<string, Array<readonly unknown[]>> = {
    [StoreOrderStatus.SCHEDULED]: [newOrdersKeys.lists()],
    [StoreOrderStatus.PENDING]: [newOrdersKeys.lists()],
    [StoreOrderStatus.ACCEPTED]: [
      newOrdersKeys.lists(),
      inProgressOrdersKeys.lists(),
    ],
    [StoreOrderStatus.PREPARING]: [inProgressOrdersKeys.lists()],
    [StoreOrderStatus.RIDER_ASSIGNED]: [inProgressOrdersKeys.lists()],
    [StoreOrderStatus.READY]: [
      inProgressOrdersKeys.lists(),
      readyOrdersKeys.lists(),
    ],
    [StoreOrderStatus.PICKED_UP]: [
      readyOrdersKeys.lists(),
      pickupOrdersKeys.lists(),
    ],
    [StoreOrderStatus.OUT_FOR_DELIVERY]: [pickupOrdersKeys.lists()],
    [StoreOrderStatus.ARRIVED]: [pickupOrdersKeys.lists()],
    [StoreOrderStatus.DELIVERED]: [
      pickupOrdersKeys.lists(),
      completedOrdersKeys.lists(),
    ],
    [StoreOrderStatus.CANCELLED]: [
      newOrdersKeys.lists(),
      inProgressOrdersKeys.lists(),
      readyOrdersKeys.lists(),
      pickupOrdersKeys.lists(),
      completedOrdersKeys.lists(),
    ],
    [StoreOrderStatus.REJECTED]: [
      newOrdersKeys.lists(),
      inProgressOrdersKeys.lists(),
      completedOrdersKeys.lists(),
    ],
    [StoreOrderStatus.FAILED]: [
      pickupOrdersKeys.lists(),
      completedOrdersKeys.lists(),
    ],
  };

  const impactedKeys = statusToKeys[status] ?? [
    newOrdersKeys.lists(),
    inProgressOrdersKeys.lists(),
    readyOrdersKeys.lists(),
    pickupOrdersKeys.lists(),
    completedOrdersKeys.lists(),
  ];

  impactedKeys.forEach(invalidate);
}
