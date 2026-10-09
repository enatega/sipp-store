import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "../../../theme/ThemeProvider";
import { useTranslations } from "../../../localization/LocalizationProvider";
import { Order, OrderStatus } from "../../../api/orderServicesTypes";
import { MainStackParamList } from "../../../navigation/types";
import { styles } from "./styles";
import OrderHeader from "./OrderHeader";
import CustomerInfo from "./CustomerInfo";
import OrderItems from "./OrderItems";
import CommentSection from "./CommentSection";
import InProgressSection from "./InProgressSection";
import ReadyPickupSection from "./ReadyPickupSection";
import AcceptRejectButtons from "./AcceptRejectButtons";
import RiderContactPanel from "./RiderContactPanel";
import { getReadableRiderStatus } from "./riderStatusLabel";
import { resolveSupportChatBoxId } from "../../../api/supportChatSession";
import { useStoreOrderChatUnreadQuery } from "../../../hooks/useSupportChat";

type Props = {
  order: Order;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  onConfirmPickup?: (orderId: string) => void;
  onUpdatePreparingTime?: (orderId: string, minutes: number) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
  isMarkingReady?: boolean;
  isConfirmingPickup?: boolean;
  isUpdatingTime?: boolean;
};

export default function OrderCard({
  order,
  onAccept,
  onReject,
  onMarkReady,
  onConfirmPickup,
  onUpdatePreparingTime,
  isAccepting,
  isRejecting,
  isMarkingReady,
  isConfirmingPickup,
  isUpdatingTime,
}: Props) {
  const { theme } = useAppTheme();
  const { t } = useTranslations("app");
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const chatUnreadQuery = useStoreOrderChatUnreadQuery();
  const orderWithMeta = order as Order & Record<string, unknown>;
  const unreadMessagesCountRaw =
    orderWithMeta.unreadMessages ??
    orderWithMeta.unread_messages ??
    orderWithMeta.chatUnreadCount ??
    orderWithMeta.chat_unread_count ??
    0;
  const unreadMessagesCount = chatUnreadQuery.data?.byOrderId?.[order.orderId] ?? (Number(unreadMessagesCountRaw) || 0);
  const chatBoxId = getFirstString(orderWithMeta, [
    "chatBoxId",
    "chat_box_id",
    "supportChatBoxId",
    "support_chat_box_id",
  ]);
  const receiverId = getFirstString(orderWithMeta, [
    "riderUserId",
    "rider_user_id",
    "riderId",
    "rider_id",
    "receiverId",
    "receiver_id",
    "chatReceiverId",
    "chat_receiver_id",
  ]);
  const riderVehicleDisplay = resolveRiderVehicle(orderWithMeta);
  const handleOpenChat = () => {
    const resolvedChatBoxId = order.orderId ? null : chatBoxId ?? resolveSupportChatBoxId({ receiverId });

    const params = {
      chatBoxId: resolvedChatBoxId ?? null,
      receiverId: receiverId ?? null,
      riderName: order.riderName ?? null,
      orderId: order.orderId,
    };
    navigation.navigate("StoreChat", params);
  };

  const displayAddress =
    order.orderType === "delivery" ? order.deliveryAddress : order.pickupAddress;

  const startTime = order.preparationStartedAt
    ? new Date(order.preparationStartedAt).getTime()
    : null;

  const isInProgress =
    order.status === OrderStatus.PREPARING ||
    order.status === OrderStatus.ACCEPTED ||
    order.status === OrderStatus.RIDER_ASSIGNED;

  const isReadyOrPickup =
    order.status === OrderStatus.READY ||
    order.status === OrderStatus.PICKED_UP ||
    order.status === OrderStatus.OUT_FOR_DELIVERY ||
    order.status === OrderStatus.ARRIVED;

  const isNewOrderActionable = order.status === OrderStatus.PENDING;
  const canAcceptOrder =
    Boolean(onAccept) && (order.canAccept || isNewOrderActionable);
  const canRejectOrder =
    Boolean(onReject) && !isInProgress && (order.canReject || isNewOrderActionable);
  const hasAssignedRider = Boolean(
    order.riderId
    || order.riderName
    || order.riderPhone
    || order.riderVehicle
    || order.status === OrderStatus.RIDER_ASSIGNED,
  );
  const canMarkReady = order.orderType === "pickup" || hasAssignedRider;
  const headerStatusLabel =
    (order.status === OrderStatus.DELIVERED
      ? t("order_card_delivered")
      : order.status === OrderStatus.READY
      ? t("order_card_ready_for_pickup")
      : getReadableRiderStatus(order.status, order.riderStatus, order.riderStatusLabel)) ||
    (order.riderArrived ? t("order_card_rider_arrived") : null) || order.statusLabel;
  const headerStatusTone =
    order.status === OrderStatus.READY || order.status === OrderStatus.DELIVERED || order.riderArrived
      ? "green"
      : order.status === OrderStatus.PICKED_UP
        || order.status === OrderStatus.OUT_FOR_DELIVERY
        || order.riderStatus === "out_for_delivery"
        ? "amber"
        : "blue";

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.gray200, shadowColor: theme.colors.shadow }]}>
      <OrderHeader
        orderCode={order.orderCode}
        orderType={order.orderType}
        status={order.status}
        createdAt={order.createdAt}
        headerStatusLabel={headerStatusLabel}
        headerStatusTone={headerStatusTone}
      />
      <CustomerInfo
        customerName={order.customerName}
        customerProfileImage={order.customerProfileImage}
        orderType={order.orderType}
        address={displayAddress}
        addressExtras={order.orderType === "delivery" ? order.deliveryAddressExtras : null}
        deliveryInstructions={order.orderType === "delivery" ? order.deliveryInstructions : null}
        theme={theme}
      />
      <OrderItems
        items={order.items}
        totalAmount={order.orderAmount}
        orderSummary={order.orderSummary}
        theme={theme}
      />
      <CommentSection comment={order.restaurantNote} theme={theme} />

      {hasAssignedRider && order.orderType === "delivery" ? (
        <RiderContactPanel
          name={order.riderName}
          vehicle={riderVehicleDisplay}
          phone={order.riderPhone}
          status={getReadableRiderStatus(null, order.riderStatus, order.riderStatusLabel)}
          unreadCount={unreadMessagesCount}
          onChat={handleOpenChat}
        />
      ) : null}

      {isInProgress && onMarkReady && onUpdatePreparingTime && (
        <InProgressSection
          orderId={order.orderId}
          preparingTimeInMinutes={order.preparingTimeInMinutes ?? 0}
          remainingSeconds={order.remainingSeconds ?? null}
          startTime={startTime}
          onMarkReady={onMarkReady}
          onUpdatePreparingTime={onUpdatePreparingTime}
          canMarkReady={canMarkReady}
          isMarkingReady={isMarkingReady}
          isUpdatingTime={isUpdatingTime}
          theme={theme}
        />
      )}

      {isReadyOrPickup && (
        <ReadyPickupSection
          status={order.status}
          orderId={order.orderId}
          onConfirmPickup={onConfirmPickup}
          showConfirmButton={
            (order.status === OrderStatus.READY ||
              (order.orderType === "pickup" &&
                order.status === OrderStatus.PICKED_UP)) &&
            !!onConfirmPickup
          }
          isConfirmingPickup={isConfirmingPickup}
          theme={theme}
        />
      )}

      <AcceptRejectButtons
        canAccept={canAcceptOrder}
        canReject={canRejectOrder}
        orderId={order.orderId}
        onAccept={onAccept || (() => { })}
        onReject={onReject || (() => { })}
        isAccepting={isAccepting}
        isRejecting={isRejecting}
        theme={theme}
      />
    </View>
  );
}

function getFirstString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function resolveRiderVehicle(order: Record<string, unknown>): string | null {
  const direct = getFirstString(order, ["riderVehicle", "rider_vehicle"]);
  if (direct) return direct;

  const details = order.riderVehicleDetails as Record<string, unknown> | undefined | null;
  if (!details || typeof details !== "object") return null;

  const vehicleName =
    getFirstString(details, ["name", "vehicle_name"]) ?? null;
  const vehicleColor =
    getFirstString(details, ["colour", "vehicle_colour"]) ?? null;
  const vehicleNo =
    getFirstString(details, ["vehicleNo", "vehicle_no"]) ?? null;

  const parts = [vehicleName, vehicleColor, vehicleNo].filter(
    (value): value is string => Boolean(value && value.trim().length > 0),
  );

  return parts.length > 0 ? parts.join(" • ") : null;
}
