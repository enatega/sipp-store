import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { ApiError } from "../api/apiClient";
import { supportChatKeys } from "../api/queryKeys";
import { supportChatService } from "../api/supportChatService";
import {
  SendSupportChatMessageRequest,
  SendSupportChatMessageResponse,
  SupportChatMessage,
} from "../api/supportChatServiceTypes";

type UseSupportChatMessagesOptions = {
  chatBoxId?: string | null;
} & Omit<UseQueryOptions<SupportChatMessage[], ApiError>, "queryKey" | "queryFn">;

export function useSupportChatMessagesQuery({
  chatBoxId,
  ...options
}: UseSupportChatMessagesOptions) {
  const normalizedChatBoxId = String(chatBoxId ?? "").trim();
  const hasValidChatBoxId =
    normalizedChatBoxId.length > 0
    && normalizedChatBoxId.toLowerCase() !== "null";

  return useQuery<SupportChatMessage[], ApiError>({
    queryKey: supportChatKeys.messagesByChatBox(hasValidChatBoxId ? normalizedChatBoxId : "unknown"),
    queryFn: () => {
      if (!hasValidChatBoxId) return Promise.resolve([]);
      return supportChatService.getMessages(normalizedChatBoxId);
    },
    enabled: hasValidChatBoxId,
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useStoreOrderChatQuery(orderId: string) {
  return useQuery({
    queryKey: supportChatKeys.order(orderId),
    queryFn: () => supportChatService.getOrderChat(orderId),
    enabled: Boolean(orderId),
    staleTime: 10_000,
  });
}

export function useStoreOrderChatUnreadQuery() {
  return useQuery({
    queryKey: supportChatKeys.unread(),
    queryFn: () => supportChatService.getOrderUnreadCounts(),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useMarkStoreOrderChatReadMutation() {
  return useMutation({ mutationFn: (orderId: string) => supportChatService.markOrderChatRead(orderId) });
}

export function useSendSupportChatMessageMutation(
  options?: UseMutationOptions<SendSupportChatMessageResponse, ApiError, SendSupportChatMessageRequest>,
) {
  return useMutation<SendSupportChatMessageResponse, ApiError, SendSupportChatMessageRequest>({
    mutationFn: (data) => supportChatService.sendMessage(data),
    ...options,
  });
}
