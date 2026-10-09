import React, { useCallback, useRef, useState } from "react";
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
import type { OrderScreenProps } from './orderFlowTypes';

export default function NewOrdersScreen({ initialOrderType, onOrderTypeChange, onOrderFlow, newOrderCounts }: OrderScreenProps) {
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectingOrderCode, setRejectingOrderCode] = useState<string | null>(null);
  const [rejectingOrderType, setRejectingOrderType] = useState<Order['orderType']>('delivery');
  const [modalVisible, setModalVisible] = useState(false);
  const acceptingOrderIdsRef = useRef<Set<string>>(new Set());
  const [acceptingOrderIds, setAcceptingOrderIds] = useState<string[]>([]);

  const acceptMutation = useAcceptOrder();
  const rejectMutation = useRejectOrder();
  const updateStatusMutation = useUpdateOrderStatus();
  const updateTimeMutation = useUpdatePreparingTime();

  const handleAccept = (order: Order) => {
    setPendingOrder(order);
    setModalVisible(true);
  };

  const handleReject = (orderId: string, orderType: Order['orderType'], orderCode?: string) => {
    setRejectingOrderId(orderId);
    setRejectingOrderType(orderType);
    setRejectingOrderCode(orderCode ?? null);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectingOrderId) return;
    const orderCode = rejectingOrderCode ?? undefined;
    rejectMutation.mutate(
      { orderId: rejectingOrderId, data: { reason } },
      {
        onSuccess: () => {
          setRejectingOrderId(null);
          setRejectingOrderCode(null);
          onOrderFlow({ tab: 'completed', orderType: rejectingOrderType, orderCode, notice: 'rejected' });
        },
        onError: () => {
          setRejectingOrderId(null);
          setRejectingOrderCode(null);
          onOrderFlow({ tab: 'new', orderType: rejectingOrderType, orderCode, notice: 'failed' });
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
    if (!pendingOrder) return;

    const { orderId, orderCode, orderType } = pendingOrder;
    if (acceptingOrderIdsRef.current.has(orderId)) return;
    acceptingOrderIdsRef.current.add(orderId);
    setAcceptingOrderIds((ids) => [...ids, orderId]);
    setModalVisible(false);
    setPendingOrder(null);

    let accepted = false;
    let needsTime = false;
    try {
      await acceptMutation.mutateAsync(orderId);
      accepted = true;
      try {
        await updateStatusMutation.mutateAsync({
          orderId,
          data: { status: OrderStatus.PREPARING },
        });
        await updateTimeMutation.mutateAsync({
          orderId,
          data: { preparingTimeInMinutes: minutes },
        });
      } catch {
        needsTime = true;
      }
    } catch {
      accepted = false;
    } finally {
      acceptingOrderIdsRef.current.delete(orderId);
      setAcceptingOrderIds((ids) => ids.filter((id) => id !== orderId));
    }

    onOrderFlow(accepted
      ? { tab: 'inProgress', orderType, orderCode, notice: needsTime ? 'acceptedNeedsTime' : 'accepted' }
      : { tab: 'new', orderType, orderCode, notice: 'failed' });
  };

  const closeModal = () => {
    setModalVisible(false);
    setPendingOrder(null);
  };

  const renderActions = (order: Order) => ({
    onAccept: () => handleAccept(order),
    onReject: () => handleReject(order.orderId, order.orderType, order.orderCode),
    isAccepting: acceptingOrderIds.includes(order.orderId),
    isRejecting: rejectMutation.isPending && rejectingOrderId === order.orderId,
  });

  const handleOrdersDataChange = useCallback((orders: Order[]) => {
    const hasPendingActionableOrder = orders.some((order) =>
      order.status === OrderStatus.PENDING && order.canAccept,
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
        initialOrderType={initialOrderType}
        onOrderTypeChange={onOrderTypeChange}
        onOrdersDataChange={handleOrdersDataChange}
        orderTypeCounts={newOrderCounts}
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
