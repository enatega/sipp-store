export type SupportChatMessage = {
  id: string;
  chatBoxId: string;
  senderId: string;
  receiverId: string;
  text: string;
  attachmentUrls: string[];
  createdAt: string;
};

export type OrderChatPhoto = {
  uri: string;
  fileName: string;
  mimeType: string;
};

export type SendSupportChatMessageRequest = {
  orderId?: string;
  senderId: string;
  receiverId: string;
  text?: string;
  attachmentUrls?: string[];
};

export type SendSupportChatMessageResponse = {
  message?: string;
  chatBoxId?: string;
  data?: unknown;
  detail?: SupportChatMessage;
};
