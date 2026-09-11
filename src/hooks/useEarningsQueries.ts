import {
  UseInfiniteQueryOptions,
  UseQueryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { ApiError } from "../api/apiClient";
import { earningsService } from "../api/earningsService";
import {
  EarningsDailyResponse,
  EarningsGraphResponse,
  EarningsHistoryResponse,
  EarningsSummaryResponse,
  GetEarningsGraphParams,
  GetEarningsDailyParams,
  GetEarningsHistoryParams,
  GetEarningsSummaryParams,
} from "../api/earningsServiceTypes";
import { earningsKeys } from "../api/queryKeys";

type UseEarningsGraphOptions = {
  params?: GetEarningsGraphParams;
} & Omit<
  UseQueryOptions<EarningsGraphResponse, ApiError>,
  "queryKey" | "queryFn"
>;

export function useEarningsGraphQuery({
  params = {},
  ...options
}: UseEarningsGraphOptions = {}) {
  return useQuery<EarningsGraphResponse, ApiError>({
    queryKey: earningsKeys.graphList(params),
    queryFn: () => earningsService.getEarningsGraph(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

type UseEarningsDailyOptions = {
  params?: GetEarningsDailyParams;
} & Omit<
  UseInfiniteQueryOptions<EarningsDailyResponse, ApiError>,
  "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam" | "select"
>;

export function useEarningsDailyQuery({
  params = {},
  ...options
}: UseEarningsDailyOptions = {}) {
  const limit = params.limit ?? 10;

  return useInfiniteQuery({
    queryKey: earningsKeys.dailyList(params),
    queryFn: ({ pageParam }) =>
      earningsService.getEarningsDaily({
        ...params,
        limit,
        page: pageParam as number,
      }),
    initialPageParam: params.page ?? 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (count, page) => count + page.earnings_by_date.length,
        0,
      );

      if (typeof lastPage.total_days === "number" && loadedCount >= lastPage.total_days) {
        return undefined;
      }

      if (lastPage.earnings_by_date.length < limit) {
        return undefined;
      }

      return (params.page ?? 1) + allPages.length;
    },
    staleTime: 60 * 1000,
    ...options,
  });
}

type UseEarningsSummaryOptions = {
  params: GetEarningsSummaryParams;
} & Omit<
  UseQueryOptions<EarningsSummaryResponse, ApiError>,
  "queryKey" | "queryFn"
>;

export function useEarningsSummaryQuery({
  params,
  ...options
}: UseEarningsSummaryOptions) {
  return useQuery<EarningsSummaryResponse, ApiError>({
    queryKey: earningsKeys.summaryDetail(params),
    queryFn: () => earningsService.getEarningsSummary(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

type UseEarningsHistoryOptions = {
  params: GetEarningsHistoryParams;
} & Omit<
  UseQueryOptions<EarningsHistoryResponse, ApiError>,
  "queryKey" | "queryFn"
>;

export function useEarningsHistoryQuery({
  params,
  ...options
}: UseEarningsHistoryOptions) {
  return useQuery<EarningsHistoryResponse, ApiError>({
    queryKey: earningsKeys.historyList(params),
    queryFn: () => earningsService.getEarningsHistory(params),
    staleTime: 60 * 1000,
    ...options,
  });
}
