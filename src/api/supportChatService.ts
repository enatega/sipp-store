import apiClient from "./apiClient";
import {
  SendSupportChatMessageRequest,
  SendSupportChatMessageResponse,
  SupportChatMessage,
  OrderChatPhoto,
} from "./supportChatServiceTypes";

const BASE_PATH = "/apps/deliveries/chat";

function normalizeMessage(raw: Record<string, unknown>): SupportChatMessage | null {
  const id =
    String(raw.id ?? raw._id ?? raw.messageId ?? "").trim();
  const chatBoxId =
    String(raw.chatBoxId ?? raw.chat_box_id ?? "").trim();
  const senderId =
    String(raw.senderId ?? raw.sender_id ?? "").trim();
  const receiverId =
    String(raw.receiverId ?? raw.receiver_id ?? "").trim();
  const text = String(raw.text ?? raw.message ?? "").trim();
  const attachmentUrls = Array.isArray(raw.attachmentUrls)
    ? raw.attachmentUrls.filter((url): url is string => typeof url === 'string' && Boolean(url.trim()))
    : [];
  const createdAt =
    String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()).trim();

  if (!id || !senderId || !receiverId || (!text && attachmentUrls.length === 0)) {
    return null;
  }

  return {
    id,
    chatBoxId,
    senderId,
    receiverId,
    text,
    attachmentUrls,
    createdAt,
  };
}

function normalizeMessagesPayload(payload: unknown): SupportChatMessage[] {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown })?.data)
      ? ((payload as { data: unknown[] }).data ?? [])
      : Array.isArray((payload as { messages?: unknown })?.messages)
        ? ((payload as { messages: unknown[] }).messages ?? [])
        : [];

  return records
    .map((item) => (item && typeof item === "object" ? normalizeMessage(item as Record<string, unknown>) : null))
    .filter((item): item is SupportChatMessage => Boolean(item))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export const supportChatService = {
  uploadOrderPhoto(orderId: string, photo: OrderChatPhoto) {
    const form = new FormData();
    form.append('file', {
      uri: photo.uri,
      name: photo.fileName,
      type: photo.mimeType,
    } as unknown as Blob);
    return apiClient.post<{ url: string; mimeType: string }>(
      `${BASE_PATH}/order/${orderId}/store_rider/upload`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
  getOrderUnreadCounts() {
    return apiClient.get<{ total: number; byOrderId: Record<string, number> }>(`${BASE_PATH}/order-unread`);
  },
  async getOrderChat(orderId: string) {
    const response = await apiClient.get<{ chatBoxId: string | null; messages: unknown[] }>(`${BASE_PATH}/order/${orderId}/store_rider`);
    return { chatBoxId: response.chatBoxId, messages: normalizeMessagesPayload(response.messages) };
  },
  async markOrderChatRead(orderId: string) {
    return apiClient.patch(`${BASE_PATH}/order/${orderId}/store_rider/read`);
  },
  async getMessages(chatBoxId: string) {
    console.log("[SupportChat] getMessages:start", { chatBoxId });
    const response = await apiClient.get<unknown>(`${BASE_PATH}/messages/${chatBoxId}`);
    const normalized = normalizeMessagesPayload(response);
    console.log("[SupportChat] getMessages:success", { chatBoxId, count: normalized.length });
    return normalized;
  },

  async sendMessage(data: SendSupportChatMessageRequest) {
    if (data.orderId) {
      return apiClient.post<SendSupportChatMessageResponse>(`${BASE_PATH}/order/${data.orderId}/store_rider/send`, {
        text: data.text,
        attachmentUrls: data.attachmentUrls,
      });
    }
    const response = await apiClient.post<SendSupportChatMessageResponse>(`${BASE_PATH}/send`, data);
    return response;
  },
};
