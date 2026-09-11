import apiClient from "./apiClient";
import {
  EarningsDailyResponse,
  EarningsGraphResponse,
  EarningsHistoryResponse,
  EarningsSummaryResponse,
  GetEarningsDailyParams,
  GetEarningsGraphParams,
  GetEarningsHistoryParams,
  GetEarningsSummaryParams,
} from "./earningsServiceTypes";

const BASE_PATH = "/apps/deliveries/store/wallet/earnings";

function withDateRangeParams(params: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) {
  return {
    page: params.page,
    limit: params.limit,
    ...(params.startDate
      ? { startDate: params.startDate, start_date: params.startDate }
      : {}),
    ...(params.endDate
      ? { endDate: params.endDate, end_date: params.endDate }
      : {}),
  };
}

export const earningsService = {
  getEarningsGraph: (params: GetEarningsGraphParams = {}) =>
    apiClient.get<EarningsGraphResponse>(
      `${BASE_PATH}/graph`,
      params as Record<string, unknown>,
    ),
  getEarningsDaily: (params: GetEarningsDailyParams = {}) =>
    apiClient.get<EarningsDailyResponse>(
      `${BASE_PATH}/daily`,
      withDateRangeParams(params),
    ),
  getEarningsSummary: (params: GetEarningsSummaryParams) =>
    apiClient.get<EarningsSummaryResponse>(
      `${BASE_PATH}/summary`,
      withDateRangeParams(params),
    ),
  getEarningsHistory: (params: GetEarningsHistoryParams) =>
    apiClient.get<EarningsHistoryResponse>(
      `${BASE_PATH}/history`,
      withDateRangeParams(params),
    ),
};
