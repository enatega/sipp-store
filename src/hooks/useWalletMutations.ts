import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { walletServices } from "../api/walletServices";
import { ApiError } from "../api/apiClient";
import {
  WithdrawRequest,
  WithdrawSuccessResponse,
} from "../api/walletServicesTypes";
import { walletKeys } from "../api/queryKeys";

// ─── Withdraw Mutation ────────────────────────────────────────────

export function useWithdraw(
  options?: UseMutationOptions<
    WithdrawSuccessResponse,
    ApiError,
    WithdrawRequest
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<WithdrawSuccessResponse, ApiError, WithdrawRequest>({
    mutationFn: (data) => walletServices.withdraw(data),
    onSuccess: (data, variables, context) => {
      // Invalidate balance after successful withdrawal
      queryClient.invalidateQueries({ queryKey: walletKeys.balance() });
      // Also invalidate history to show the new withdrawal transaction
      queryClient.invalidateQueries({ queryKey: walletKeys.history() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
