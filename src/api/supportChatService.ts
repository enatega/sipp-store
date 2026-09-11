import apiClient from "./apiClient";
import {
  SendSupportChatMessageRequest,
  SendSupportChatMessageResponse,
  SupportChatMessage,
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
  const createdAt =
    String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()).trim();

  if (!id || !senderId || !receiverId || !text) {
    return null;
  }

  return {
    id,
    chatBoxId,
    senderId,
    receiverId,
    text,
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
  async getMessages(chatBoxId: string) {
    console.log("[SupportChat] getMessages:start", { chatBoxId });
    const response = await apiClient.get<unknown>(`${BASE_PATH}/messages/${chatBoxId}`);
    const normalized = normalizeMessagesPayload(response);
    console.log("[SupportChat] getMessages:success", { chatBoxId, count: normalized.length });
    return normalized;
  },

  async sendMessage(data: SendSupportChatMessageRequest) {
    console.log("[SupportChat] sendMessage:start", data);
    const response = await apiClient.post<SendSupportChatMessageResponse>(`${BASE_PATH}/send`, data);
    console.log("[SupportChat] sendMessage:success", response);
    return response;
  },
};
