export type SupportChatMessage = {
  id: string;
  chatBoxId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
};

export type SendSupportChatMessageRequest = {
  senderId: string;
  receiverId: string;
  text: string;
};

export type SendSupportChatMessageResponse = {
  message?: string;
  chatBoxId?: string;
  data?: unknown;
};
