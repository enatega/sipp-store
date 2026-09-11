// src/hooks/useOrderQueries.ts

import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { orderServices } from "../api/orderServices";
import {
  GetOrdersParams,
  PaginatedOrdersResponse,
} from "../api/orderServicesTypes";
import { ApiError } from "../api/apiClient";
import {
  newOrdersKeys,
  inProgressOrdersKeys,
  readyOrdersKeys,
  pickupOrdersKeys,
  completedOrdersKeys,
  scheduledOrdersKeys,
} from "../api/queryKeys";

type UseOrdersOptions = {
  params?: GetOrdersParams;
} & Omit<
  UseInfiniteQueryOptions<PaginatedOrdersResponse, ApiError>,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam" | "select"
>;

// ─── New Orders ───────────────────────────────────────────────────
export function useNewOrders({
  params = {},
  ...options
}: UseOrdersOptions = {}) {
  return useInfiniteQuery({
    queryKey: newOrdersKeys.list(params),
    queryFn: ({ pageParam }) =>
      orderServices.getNewOrders({
        ...params,
        offset: (pageParam as number) ?? 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    ...options,
  });
}

// ─── In‑Progress Orders ───────────────────────────────────────────
export function useInProgressOrders({
  params = {},
  ...options
}: UseOrdersOptions = {}) {
  return useInfiniteQuery({
    queryKey: inProgressOrdersKeys.list(params),
    queryFn: ({ pageParam }) =>
      orderServices.getInProgressOrders({
        ...params,
        offset: (pageParam as number) ?? 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    ...options,
  });
}

// ─── Ready Orders ─────────────────────────────────────────────────
export function useReadyOrders({
  params = {},
  ...options
}: UseOrdersOptions = {}) {
  return useInfiniteQuery({
    queryKey: readyOrdersKeys.list(params),
    queryFn: ({ pageParam }) =>
      orderServices.getReadyOrders({
        ...params,
        offset: (pageParam as number) ?? 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    ...options,
  });
}

// ─── Pickup Orders ────────────────────────────────────────────────
export function usePickupOrders({
  params = {},
  ...options
}: UseOrdersOptions = {}) {
  return useInfiniteQuery({
    queryKey: pickupOrdersKeys.list(params),
    queryFn: ({ pageParam }) =>
      orderServices.getPickupOrders({
        ...params,
        offset: (pageParam as number) ?? 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    ...options,
  });
}

// ─── Completed Orders ─────────────────────────────────────────────
export function useCompletedOrders({
  params = {},
  ...options
}: UseOrdersOptions = {}) {
  return useInfiniteQuery({
    queryKey: completedOrdersKeys.list(params),
    queryFn: ({ pageParam }) =>
      orderServices.getCompletedOrders({
        ...params,
        offset: (pageParam as number) ?? 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    ...options,
  });
}

type UseScheduledOrdersOptions = {
  params?: Pick<GetOrdersParams, "limit">;
} & Omit<
  UseInfiniteQueryOptions<PaginatedOrdersResponse, ApiError>,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam" | "select"
>;

// ─── Scheduled Orders ────────────────────────────────────────────
export function useScheduledOrders({
  params = {},
  ...options
}: UseScheduledOrdersOptions = {}) {
  return useInfiniteQuery({
    queryKey: scheduledOrdersKeys.list(params),
    queryFn: ({ pageParam }) =>
      orderServices.getScheduledOrders({
        limit: params.limit,
        offset: (pageParam as number) ?? 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    ...options,
  });
}
