import React, { useState } from "react";
import GenericOrderList from "../../components/orders/GenericOrderList";
import { useInProgressOrders } from "../../hooks/useOrderQueries";
import {
  useRejectOrder,
  useUpdateOrderStatus,
  useUpdatePreparingTime,
} from "../../hooks/useOrderMutations";
import { OrderStatus } from "../../api/orderServicesTypes";
import { Order } from "../../api/orderServicesTypes";
import RejectOrderModal from "../../components/RejectOrderModal";
import type { OrderScreenProps } from './orderFlowTypes';

export default function InProgressScreen({ initialOrderType, onOrderTypeChange, onOrderFlow }: OrderScreenProps) {
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectingOrderCode, setRejectingOrderCode] = useState<string | null>(null);
  const [rejectingOrderType, setRejectingOrderType] = useState<Order['orderType']>('delivery');
  const updateStatus = useUpdateOrderStatus();
  const rejectMutation = useRejectOrder();
  const updateTime = useUpdatePreparingTime();

  const handleMarkReady = (orderId: string, orderType: Order['orderType'], orderCode: string) => {
    updateStatus.mutate({ orderId, data: { status: OrderStatus.READY } }, {
      onSuccess: () => onOrderFlow({ tab: 'ready', orderType, orderCode, notice: 'ready' }),
      onError: () => onOrderFlow({ tab: 'inProgress', orderType, orderCode, notice: 'failed' }),
    });
  };

  const handleUpdatePreparingTime = (orderId: string, minutes: number, orderType: Order['orderType'], orderCode: string) => {
    updateTime.mutate({ orderId, data: { preparingTimeInMinutes: minutes } }, {
      onSuccess: () => onOrderFlow({ tab: 'inProgress', orderType, orderCode, notice: 'timeUpdated' }),
      onError: () => onOrderFlow({ tab: 'inProgress', orderType, orderCode, notice: 'failed' }),
    });
  };
  const handleReject = (orderId: string, orderType: Order['orderType'], orderCode?: string) => {
    setRejectingOrderId(orderId);
    setRejectingOrderType(orderType);
    setRejectingOrderCode(orderCode ?? null);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectingOrderId) return;
    rejectMutation.mutate(
      { orderId: rejectingOrderId, data: { reason } },
      {
        onSuccess: () => {
          const orderCode = rejectingOrderCode ?? undefined;
          setRejectingOrderId(null);
          setRejectingOrderCode(null);
          onOrderFlow({ tab: 'completed', orderType: rejectingOrderType, orderCode, notice: 'rejected' });
        },
        onError: () => {
          setRejectingOrderId(null);
          setRejectingOrderCode(null);
          onOrderFlow({ tab: 'inProgress', orderType: rejectingOrderType, notice: 'failed' });
        },
      },
    );
  };

  const closeRejectModal = () => {
    if (rejectMutation.isPending) return;
    setRejectingOrderId(null);
    setRejectingOrderCode(null);
  };

  const renderActions = (order: Order) => ({
    onReject: () => handleReject(order.orderId, order.orderType, order.orderCode),
    onMarkReady: (orderId: string) => handleMarkReady(orderId, order.orderType, order.orderCode),
    onUpdatePreparingTime: (orderId: string, minutes: number) => handleUpdatePreparingTime(orderId, minutes, order.orderType, order.orderCode),
    isRejecting: rejectMutation.isPending,
    isMarkingReady: updateStatus.isPending,
    isUpdatingTime: updateTime.isPending,
  });

  return (
    <>
      <GenericOrderList
        useOrdersHook={useInProgressOrders}
        renderActions={renderActions}
        initialOrderType={initialOrderType}
        onOrderTypeChange={onOrderTypeChange}
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
