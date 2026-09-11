import React, { useCallback, useState } from "react";
import GenericOrderList from "../../components/orders/GenericOrderList";
import { useNewOrders } from "../../hooks/useOrderQueries";
import {
  useAcceptOrder,
  useRejectOrder,
  useUpdateOrderStatus,
  useUpdatePreparingTime,
} from "../../hooks/useOrderMutations";
import SetPreparingTimeModal from "../../components/SetPreparingTimeModal";
import RejectOrderModal from "../../components/RejectOrderModal";
import { Order, OrderStatus } from "../../api/orderServicesTypes";
import { startOrderAlertLoop, stopOrderAlertLoop } from "../../hooks/orderAlertSound";

export default function NewOrdersScreen() {
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectingOrderCode, setRejectingOrderCode] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const acceptMutation = useAcceptOrder();
  const rejectMutation = useRejectOrder();
  const updateStatusMutation = useUpdateOrderStatus();
  const updateTimeMutation = useUpdatePreparingTime();

  const handleAccept = (orderId: string) => {
    setPendingOrderId(orderId);
    setModalVisible(true);
  };

  const handleReject = (orderId: string, orderCode?: string) => {
    setRejectingOrderId(orderId);
    setRejectingOrderCode(orderCode ?? null);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectingOrderId) return;
    rejectMutation.mutate(
      { orderId: rejectingOrderId, data: { reason } },
      {
        onSettled: () => {
          setRejectingOrderId(null);
          setRejectingOrderCode(null);
        },
      },
    );
  };

  const closeRejectModal = () => {
    if (rejectMutation.isPending) return;
    setRejectingOrderId(null);
    setRejectingOrderCode(null);
  };

  const handleSetPreparingTime = async (minutes: number) => {
    if (!pendingOrderId) return;

    const orderId = pendingOrderId;
    console.log("[NewOrdersScreen] Preparing time confirmed", {
      orderId,
      preparingTimeInMinutes: minutes,
    });
    setModalVisible(false);
    setPendingOrderId(null);

    try {
      console.log("[NewOrdersScreen] Accepting order", { orderId });
      await acceptMutation.mutateAsync(orderId);
      console.log("[NewOrdersScreen] Accept order success", { orderId });

      await updateStatusMutation.mutateAsync({
        orderId,
        data: { status: OrderStatus.PREPARING },
      });

      console.log("[NewOrdersScreen] Setting preparing time", {
        orderId,
        preparingTimeInMinutes: minutes,
      });
      await updateTimeMutation.mutateAsync({
        orderId,
        data: { preparingTimeInMinutes: minutes },
      });
      console.log("[NewOrdersScreen] Preparing time success", {
        orderId,
        preparingTimeInMinutes: minutes,
      });
    } catch (error) {
      const runtimeError = error as { message?: string; stack?: string; name?: string };
      console.log("[NewOrdersScreen] failed to accept order / set preparing time", {
        orderId,
        error,
        errorName: runtimeError?.name,
        errorMessage: runtimeError?.message,
        errorStack: runtimeError?.stack,
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setPendingOrderId(null);
  };

  const renderActions = (order: Order) => ({
    onAccept: handleAccept,
    onReject: () => handleReject(order.orderId, order.orderCode),
    isAccepting:
      acceptMutation.isPending ||
      updateStatusMutation.isPending ||
      updateTimeMutation.isPending,
    isRejecting: rejectMutation.isPending,
  });

  const handleOrdersDataChange = useCallback((orders: Order[]) => {
    const hasPendingActionableOrder = orders.some((order) =>
      (order.status === OrderStatus.PENDING || order.status === OrderStatus.SCHEDULED)
      && order.canAccept,
    );

    if (hasPendingActionableOrder) {
      void startOrderAlertLoop();
      return;
    }

    void stopOrderAlertLoop();
  }, []);

  return (
    <>
      <GenericOrderList
        useOrdersHook={useNewOrders}
        renderActions={renderActions}
        onOrdersDataChange={handleOrdersDataChange}
        autoScrollToTopOnNewItem
      />
      <SetPreparingTimeModal
        visible={modalVisible}
        onClose={closeModal}
        onDone={handleSetPreparingTime}
      />
      <RejectOrderModal
        visible={Boolean(rejectingOrderId)}
        orderCode={rejectingOrderCode}
        isSubmitting={rejectMutation.isPending}
        onClose={closeRejectModal}
        onConfirm={handleRejectConfirm}
      />
    </>
  );
}
