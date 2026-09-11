import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { MainStackParamList } from "../navigation/types";
import { useAppTheme } from "../theme/ThemeProvider";
import { useTranslations } from "../localization/LocalizationProvider";
import Text from "../components/Text";
import VerticalList from "../components/VerticalList";
import { useAuth } from "../auth/AuthProvider";
import { useSendSupportChatMessageMutation, useSupportChatMessagesQuery } from "../hooks/useSupportChat";
import { SupportChatMessage } from "../api/supportChatServiceTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SocketReceivedMessage, storeOrdersSocketClient } from "../socket/storeOrdersSocket";
import { cacheSupportChatBoxId, resolveSupportChatBoxId } from "../api/supportChatSession";
import { useQueryClient } from "@tanstack/react-query";
import { supportChatKeys } from "../api/queryKeys";

type Props = NativeStackScreenProps<MainStackParamList, "StoreChat">;

export default function StoreChatScreen({ navigation, route }: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const senderId = session.user?.id ?? "";
  const initialResolvedChatBoxId =
    route.params.chatBoxId
    ?? resolveSupportChatBoxId({
      receiverId: route.params.receiverId ?? null,
      orderId: route.params.orderId ?? null,
    });
  const [chatBoxId, setChatBoxId] = useState(initialResolvedChatBoxId ?? null);
  const [input, setInput] = useState("");
  const [socketMessages, setSocketMessages] = useState<SupportChatMessage[]>([]);
  const listRef = useRef<any>(null);

  const receiverId = route.params.receiverId ?? null;
  const riderName = route.params.riderName ?? t("chat_store");
  const orderId = route.params.orderId ?? "";
  const runtimeParams = route.params as MainStackParamList["StoreChat"] & Record<string, unknown>;
  const orderAmount =
    typeof runtimeParams.orderAmount === "number" ? runtimeParams.orderAmount : null;

  const {
    data: messages = [],
    isLoading,
    refetch,
    isRefetching,
  } = useSupportChatMessagesQuery({
    chatBoxId,
  });
  const sendMutation = useSendSupportChatMessageMutation();

  useEffect(() => {
    const resolved =
      route.params.chatBoxId
      ?? resolveSupportChatBoxId({
        receiverId,
        orderId: orderId || null,
      });

    if (!resolved || resolved === chatBoxId) return;
    setChatBoxId(resolved);
  }, [chatBoxId, orderId, receiverId, route.params.chatBoxId]);

  useEffect(() => {
    if (!chatBoxId) return;
    cacheSupportChatBoxId({
      chatBoxId,
      receiverId,
      orderId: orderId || null,
    });
  }, [chatBoxId, orderId, receiverId]);

  useEffect(() => {
    const unsubscribe = storeOrdersSocketClient.onReceiveMessage((message: SocketReceivedMessage) => {
      const normalizedSenderId = String(senderId ?? "").trim();
      const normalizedReceiverId = String(receiverId ?? "").trim();
      const messageSender = String(message.sender ?? "").trim();
      const messageReceiver = String(message.receiver ?? "").trim();
      const isBetweenStoreAndRider =
        (messageSender === normalizedSenderId && messageReceiver === normalizedReceiverId)
        || (messageSender === normalizedReceiverId && messageReceiver === normalizedSenderId);

      if (!isBetweenStoreAndRider) {
        console.log("[StoreChatScreen] receive-message ignored", {
          messageSender,
          messageReceiver,
          senderId: normalizedSenderId,
          receiverId: normalizedReceiverId,
        });
        return;
      }

      const nextMessage: SupportChatMessage = {
        id: `${messageSender}-${messageReceiver}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        chatBoxId: chatBoxId ?? "",
        senderId: messageSender,
        receiverId: messageReceiver,
        text: message.text,
        createdAt: new Date().toISOString(),
      };

      setSocketMessages((prev) => [...prev, nextMessage]);
      if (chatBoxId) {
        const queryKey = supportChatKeys.messagesByChatBox(chatBoxId);
        queryClient.setQueryData<SupportChatMessage[]>(queryKey, (prev = []) => {
          if (prev.some((item) => item.id === nextMessage.id)) return prev;
          return [...prev, nextMessage];
        });
      }
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);
    });

    return unsubscribe;
  }, [chatBoxId, queryClient, receiverId, senderId]);

  const mergedMessages = useMemo(() => {
    const byId = new Map<string, SupportChatMessage>();
    for (const item of messages) byId.set(item.id, item);
    for (const item of socketMessages) byId.set(item.id, item);

    return Array.from(byId.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [messages, socketMessages]);

  const handleCall = async () => {
    if (!receiverId) {
      Alert.alert(t("chat_receiver_missing"));
      return;
    }

    const fallbackNumber = String(runtimeParams.riderPhone ?? "").trim();
    if (!fallbackNumber) {
      Alert.alert(t("chat_receiver_missing"));
      return;
    }

    const url = `tel:${fallbackNumber}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t("chat_send_failed"));
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    if (!senderId) {
      Alert.alert(t("chat_sender_missing"));
      return;
    }
    if (!receiverId) {
      Alert.alert(t("chat_receiver_missing"));
      return;
    }

    try {
      storeOrdersSocketClient.sendMessage({
        sender: senderId,
        receiver: receiverId,
        text,
      });

      const response = await sendMutation.mutateAsync({
        senderId,
        receiverId,
        text,
      });

      const nextChatBoxId =
        String(response.chatBoxId ?? (response.data as { chatBoxId?: string } | undefined)?.chatBoxId ?? "").trim() || null;
      const effectiveChatBoxId = chatBoxId ?? nextChatBoxId;

      if (!chatBoxId && nextChatBoxId) {
        setChatBoxId(nextChatBoxId);
      }

      cacheSupportChatBoxId({
        chatBoxId: nextChatBoxId,
        receiverId,
        orderId: orderId || null,
      });

      setInput("");
      setSocketMessages([]);
      // Avoid refetching against a stale/null key. When a new chatBoxId is created,
      // setting state above triggers the correct query automatically.
      if (chatBoxId && effectiveChatBoxId) {
        await refetch();
      }
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);
    } catch (error) {
      console.log("[StoreChatScreen] send:error", error);
      Alert.alert(t("chat_send_failed"));
    }
  };

  const renderBubble = ({ item }: { item: SupportChatMessage }) => {
    const isMine = item.senderId === senderId;
    const time = formatTime(item.createdAt);

    return (
      <View style={[styles.messageGroup, isMine ? styles.messageGroupMine : styles.messageGroupOther]}>
        {!isMine ? (
          <Text style={styles.senderNameText} color={theme.colors.gray900}>
            {riderName}
          </Text>
        ) : null}

        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isMine ? "#F3F4F6" : "#E4FFD9",
            },
          ]}
        >
          <Text style={styles.bubbleText} color="#1F2937">
            {item.text}
          </Text>
        </View>

        <View style={[styles.metaRow, isMine ? styles.metaRowMine : styles.metaRowOther]}>
          <Text style={styles.timeText} color={theme.colors.gray900}>
            {time}
          </Text>
          {isMine ? <Feather name="check" size={14} color={theme.colors.gray900} /> : null}
        </View>
      </View>
    );
  };

  const formattedOrderId = orderId ? `#${orderId.slice(0, 6).toUpperCase()}` : "--";

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: "#F3F4F6" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 84 : 0}
    >
      <View style={[styles.headerWrap, { paddingTop: insets.top + 2, borderBottomColor: theme.colors.gray300 }]}> 
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
            <Feather name="x-circle" size={20} color={theme.colors.gray900} />
          </Pressable>
          <Text style={styles.headerTitle} weight="medium" color={theme.colors.gray900}>
            {riderName}
          </Text>
          <Pressable onPress={handleCall} style={styles.headerIconBtn}>
            <Feather name="phone" size={20} color={theme.colors.gray900} />
          </Pressable>
        </View>
      </View>

      <View style={styles.orderStripWrap}>
        <View style={[styles.orderStrip, { borderTopColor: theme.colors.gray300, borderBottomColor: theme.colors.gray300 }]}> 
          <View style={styles.orderLeftRow}>
            <Text style={styles.orderLabel} weight="medium" color={theme.colors.gray900}>
              {t("chat_order_number")}
            </Text>
            <View style={[styles.orderBadge, { backgroundColor: "#F3F4F6", borderColor: theme.colors.gray200 }]}> 
              <Text style={styles.orderBadgeText} weight="medium" color={theme.colors.gray500}>
                {formattedOrderId}
              </Text>
            </View>
          </View>
          <Text style={styles.orderAmountText} weight="medium" color={theme.colors.gray900}>
            {orderAmount != null ? `$${orderAmount}` : ""}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <VerticalList
          ref={listRef}
          data={mergedMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderBubble}
          contentContainerStyle={styles.messagesContent}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text color={theme.colors.gray500}>{t("chat_empty")}</Text>
            </View>
          }
        />
      )}

      <View
        style={[
          styles.composerDock,
          {
            backgroundColor: theme.colors.primary,
            paddingBottom: Math.max(insets.bottom + 10, 16),
          },
        ]}
      >
        <View style={[styles.composerInner, { backgroundColor: theme.colors.white }]}> 
          <Feather name="plus-circle" size={22} color={theme.colors.gray500} />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t("chat_reply_placeholder")}
            placeholderTextColor={theme.colors.gray500}
            style={[styles.input, { color: theme.colors.gray900 }]}
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={sendMutation.isPending || input.trim().length === 0}
            style={styles.sendIconBtn}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color={theme.colors.gray900} />
            ) : (
              <Feather
                name="send"
                size={20}
                color={input.trim().length === 0 ? theme.colors.gray500 : theme.colors.gray900}
              />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerWrap: {
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  headerRow: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  orderStripWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#F3F4F6",
  },
  orderStrip: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orderLabel: {
    fontSize: 16,
    lineHeight: 18,
  },
  orderBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  orderBadgeText: {
    fontSize: 12,
    lineHeight: 18,
  },
  orderAmountText: {
    fontSize: 16,
    lineHeight: 18,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
    gap: 10,
  },
  emptyWrap: {
    paddingTop: 80,
    alignItems: "center",
  },
  messageGroup: {
    maxWidth: "80%",
    gap: 4,
  },
  messageGroupOther: {
    alignSelf: "flex-start",
  },
  messageGroupMine: {
    alignSelf: "flex-end",
  },
  senderNameText: {
    fontSize: 12,
    lineHeight: 16,
  },
  bubble: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  metaRowOther: {
    justifyContent: "flex-start",
  },
  metaRowMine: {
    justifyContent: "flex-end",
  },
  timeText: {
    fontSize: 12,
    lineHeight: 16,
  },
  composerDock: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  composerInner: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 0,
  },
  sendIconBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
