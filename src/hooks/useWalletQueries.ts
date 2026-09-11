import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { walletServices } from "../api/walletServices";
import {
  WalletBalanceResponse,
  WalletHistoryResponse,
  GetWalletHistoryParams,
} from "../api/walletServicesTypes";
import { ApiError } from "../api/apiClient";
import { walletKeys } from "../api/queryKeys";

// ─── Balance Query ─────────────────────────────────────────────────

export function useWalletBalance(
  options?: Omit<
    UseQueryOptions<WalletBalanceResponse, ApiError>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<WalletBalanceResponse, ApiError>({
    queryKey: walletKeys.balance(),
    queryFn: () => walletServices.getBalance(),
    staleTime: 30 * 1000, // 30 seconds – balance can change
    ...options,
  });
}

// ─── History Query (with pagination) ──────────────────────────────

type UseWalletHistoryOptions = {
  params?: GetWalletHistoryParams;
} & Omit<
  UseQueryOptions<WalletHistoryResponse, ApiError>,
  "queryKey" | "queryFn"
>;

export function useWalletHistory({
  params = {},
  ...options
}: UseWalletHistoryOptions = {}) {
  return useQuery<WalletHistoryResponse, ApiError>({
    queryKey: walletKeys.historyList(params),
    queryFn: () => walletServices.getHistory(params),
    staleTime: 60 * 1000, // 1 minute – history doesn't change often
    ...options,
  });
}
