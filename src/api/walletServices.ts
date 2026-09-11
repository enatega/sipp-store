// src/api/walletServices.ts

import apiClient from "./apiClient";
import {
  GetWalletHistoryParams,
  WalletBalanceResponse,
  WalletHistoryResponse,
  WithdrawRequest,
  WithdrawSuccessResponse,
} from "./walletServicesTypes";

const WALLET_BASE = "/apps/deliveries/store/wallet";

export const walletServices = {
  /**
   * GET /api/v1/apps/deliveries/store/wallet/balance
   * Returns current balance, available amount, and pending withdrawal request
   */
  getBalance: () =>
    apiClient.get<WalletBalanceResponse>(`${WALLET_BASE}/balance`),

  /**
   * GET /api/v1/apps/deliveries/store/wallet/history
   * Returns paginated transaction history
   * Query params: page, limit, transactionType (deposit | withdrawal)
   */
  getHistory: (params: GetWalletHistoryParams = {}) =>
    apiClient.get<WalletHistoryResponse>(
      `${WALLET_BASE}/history`,
      params as Record<string, unknown>,
    ),

  /**
   * POST /api/v1/apps/deliveries/store/wallet/withdraw
   * Request a withdrawal from wallet
   */
  withdraw: (data: WithdrawRequest) =>
    apiClient.post<WithdrawSuccessResponse>(`${WALLET_BASE}/withdraw`, data),
};
