// src/api/walletServicesTypes.ts

// ──────────────────────────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────────────────────────

export type TransactionType = "deposit" | "withdrawal";

export type WithdrawalRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

// ──────────────────────────────────────────────────────────────────
// Request Parameters
// ──────────────────────────────────────────────────────────────────

export type GetWalletHistoryParams = {
  page?: number;
  limit?: number;
  transactionType?: TransactionType;
};

// ──────────────────────────────────────────────────────────────────
// Balance Response
// ──────────────────────────────────────────────────────────────────

export interface PendingWithdrawalRequest {
  request_id: string;
  amount: number;
  status: WithdrawalRequestStatus;
  requested_at: string;
}

export interface WalletBalanceResponse {
  current_balance: number;
  available_amount: number;
  pending_request: PendingWithdrawalRequest | null;
}

// ──────────────────────────────────────────────────────────────────
// History Response
// ──────────────────────────────────────────────────────────────────

export interface WalletTransaction {
  transaction_id: string;
  type: "credit" | "debit";
  label: string;
  amount: number;
  created_at: string;
}

export interface WalletHistoryResponse {
  data: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ──────────────────────────────────────────────────────────────────
// Withdraw Request
// ──────────────────────────────────────────────────────────────────

export type WithdrawRequest = {
  amount: number;
  notes?: string;
};

export interface WithdrawSuccessResponse {
  success: boolean;
  message: string;
  eta_message: string;
  request: PendingWithdrawalRequest;
}

export interface WithdrawErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}
