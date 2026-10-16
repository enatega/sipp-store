// src/hooks/useOrderMutations.ts

import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { InfiniteData } from "@tanstack/react-query";
import { orderServices } from "../api/orderServices";
import { ApiError } from "../api/apiClient";
import {
  AcceptOrderResponse,
  RejectOrderResponse,
  RejectOrderRequest,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  UpdatePreparingTimeRequest,
  UpdatePreparingTimeResponse,
  OrderStatus,
} from "../api/orderServicesTypes";
import {
  newOrdersKeys,
  inProgressOrdersKeys,
  readyOrdersKeys,
  pickupOrdersKeys,
  completedOrdersKeys,
} from "../api/queryKeys";
import { Order, PaginatedOrdersResponse } from "../api/orderServicesTypes";
import { getCachedStoreOrder, moveStoreOrderAfterConfirmation } from './storeOrderHandoffCache';

// ─── Accept Order ─────────────────────────────────────────────────
export function useAcceptOrder(
  options?: UseMutationOptions<AcceptOrderResponse, ApiError, { orderId: string; order: Order; preparingTimeInMinutes: number }>,
) {
  const queryClient = useQueryClient();
  return useMutation<AcceptOrderResponse, ApiError, { orderId: string; order: Order; preparingTimeInMinutes: number }>({
    mutationFn: ({ orderId, preparingTimeInMinutes }) => orderServices.acceptOrder(orderId, preparingTimeInMinutes),
    onSuccess: (data, variables, onMutateResult, context) => {
      moveStoreOrderAfterConfirmation(queryClient, ['new'], 'inProgress', variables.orderId, {
        status: data.status,
        canAccept: false,
        preparingTimeInMinutes: data.preparingTimeInMinutes,
        preparationStartedAt: data.preparationStartedAt,
        remainingSeconds: data.remainingSeconds,
      }, variables.order);
      void queryClient.invalidateQueries({ queryKey: newOrdersKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inProgressOrdersKeys.lists() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

// ─── Reject Order ─────────────────────────────────────────────────
export function useRejectOrder(
  options?: UseMutationOptions<
    RejectOrderResponse,
    ApiError,
    { orderId: string; data: RejectOrderRequest },
    Order | undefined
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<RejectOrderResponse, ApiError, { orderId: string; data: RejectOrderRequest }, Order | undefined>({
    mutationFn: ({ orderId, data }) => orderServices.rejectOrder(orderId, data),
    onMutate: ({ orderId }) => getCachedStoreOrder(queryClient, ['new', 'inProgress'], orderId),
    onSuccess: (data, variables, onMutateResult, context) => {
      moveStoreOrderAfterConfirmation(queryClient, ['new', 'inProgress'], 'completed', variables.orderId, {
        status: data.status,
        rejectionReason: variables.data.reason,
        canAccept: false,
        canReject: false,
      }, onMutateResult);
      void queryClient.invalidateQueries({ queryKey: newOrdersKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inProgressOrdersKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: completedOrdersKeys.lists() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

// ─── Update Order Status (e.g., set to "ready") ───────────────────
export function useUpdateOrderStatus(
  options?: UseMutationOptions<
    UpdateOrderStatusResponse,
    ApiError,
    { orderId: string; data: UpdateOrderStatusRequest },
    Order | undefined
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<UpdateOrderStatusResponse, ApiError, { orderId: string; data: UpdateOrderStatusRequest }, Order | undefined>({
    mutationFn: ({ orderId, data }) =>
      orderServices.updateOrderStatus(orderId, data),
    onMutate: ({ orderId }) => getCachedStoreOrder(queryClient, ['inProgress', 'ready', 'pickup'], orderId),
    onSuccess: (response, variables, onMutateResult, context) => {
      const destination = response.status === OrderStatus.READY ? 'ready'
        : response.status === OrderStatus.PICKED_UP ? 'pickup'
        : response.status === OrderStatus.DELIVERED ? 'completed' : null;
      if (destination) {
        moveStoreOrderAfterConfirmation(
          queryClient,
          destination === 'ready' ? ['inProgress'] : destination === 'pickup' ? ['ready'] : ['pickup'],
          destination,
          variables.orderId,
          { status: response.status },
          onMutateResult,
        );
      }
      if (destination === 'ready') {
        void queryClient.invalidateQueries({ queryKey: inProgressOrdersKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: readyOrdersKeys.lists() });
      } else if (destination === 'pickup') {
        void queryClient.invalidateQueries({ queryKey: readyOrdersKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: pickupOrdersKeys.lists() });
      } else if (destination === 'completed') {
        void queryClient.invalidateQueries({ queryKey: pickupOrdersKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: completedOrdersKeys.lists() });
      }
      options?.onSuccess?.(response, variables, onMutateResult, context);
    },
    ...options,
  });
}

// ─── Update Preparing Time ────────────────────────────────────────
export function useUpdatePreparingTime(
  options?: UseMutationOptions<
    UpdatePreparingTimeResponse,
    ApiError,
    { orderId: string; data: UpdatePreparingTimeRequest }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<UpdatePreparingTimeResponse, ApiError, { orderId: string; data: UpdatePreparingTimeRequest }>({
    ...options,
    mutationFn: ({ orderId, data }: { orderId: string; data: UpdatePreparingTimeRequest }) => orderServices.updatePreparingTime(orderId, data),
    onSuccess: (response, variables, onMutateResult, context) => {
      // Keep the visible card in place; update its confirmed duration, then fetch the
      // persisted start/deadline so the timer cannot drift after a background resume.
      queryClient.setQueriesData<InfiniteData<PaginatedOrdersResponse>>(
        { queryKey: inProgressOrdersKeys.lists() },
        (previous) => {
          if (!previous || !Array.isArray(previous.pages)) return previous;
          return {
            ...previous,
            pages: previous.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => {
                if (item.orderId !== variables.orderId) return item;
                const oldDuration = Math.max(0, item.preparingTimeInMinutes ?? 0);
                const newDuration = response.preparingTimeInMinutes;
                const remainingSeconds = item.preparationStartedAt
                  ? item.remainingSeconds
                  : oldDuration > 0
                    ? Math.max(0, (item.remainingSeconds ?? oldDuration * 60) + (newDuration - oldDuration) * 60)
                    : newDuration * 60;
                return {
                  ...item, status: response.status, preparingTimeInMinutes: newDuration,
                  preparationStartedAt: response.preparationStartedAt ?? item.preparationStartedAt,
                  remainingSeconds: response.remainingSeconds ?? remainingSeconds,
                };
              }),
            })),
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: inProgressOrdersKeys.lists() });
      options?.onSuccess?.(response, variables, onMutateResult, context);
    },
  });
}
