type ResolveSupportChatBoxInput = {
  receiverId?: string | null;
  orderId?: string | null;
};

type CacheSupportChatBoxInput = ResolveSupportChatBoxInput & {
  chatBoxId?: string | null;
};

const chatBoxByReceiverId = new Map<string, string>();
const chatBoxByOrderId = new Map<string, string>();

export function cacheSupportChatBoxId({
  chatBoxId,
  receiverId,
  orderId,
}: CacheSupportChatBoxInput) {
  const normalizedChatBoxId = String(chatBoxId ?? "").trim();
  if (!normalizedChatBoxId) return;

  const normalizedReceiverId = String(receiverId ?? "").trim();
  const normalizedOrderId = String(orderId ?? "").trim();

  if (normalizedReceiverId) {
    chatBoxByReceiverId.set(normalizedReceiverId, normalizedChatBoxId);
  }

  if (normalizedOrderId) {
    chatBoxByOrderId.set(normalizedOrderId, normalizedChatBoxId);
  }
}

export function resolveSupportChatBoxId({
  receiverId,
  orderId,
}: ResolveSupportChatBoxInput): string | null {
  const normalizedOrderId = String(orderId ?? "").trim();
  const normalizedReceiverId = String(receiverId ?? "").trim();

  if (normalizedOrderId) {
    const byOrder = chatBoxByOrderId.get(normalizedOrderId);
    if (byOrder) return byOrder;
  }

  if (normalizedReceiverId) {
    const byReceiver = chatBoxByReceiverId.get(normalizedReceiverId);
    if (byReceiver) return byReceiver;
  }

  return null;
}
