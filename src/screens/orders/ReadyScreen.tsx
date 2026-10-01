import React from "react";
import GenericOrderList from "../../components/orders/GenericOrderList";
import { useReadyOrders } from "../../hooks/useOrderQueries";
import { useUpdateOrderStatus } from "../../hooks/useOrderMutations";
import { Order, OrderStatus } from "../../api/orderServicesTypes";
import type { OrderScreenProps } from './orderFlowTypes';

export default function ReadyScreen({ initialOrderType, onOrderTypeChange, onOrderFlow }: OrderScreenProps) {
  const updateStatus = useUpdateOrderStatus();

  const handleConfirmPickup = (orderId: string, orderCode: string) => {
    updateStatus.mutate({ orderId, data: { status: OrderStatus.PICKED_UP } }, {
      onSuccess: () => onOrderFlow({ tab: 'pickup', orderType: 'pickup', orderCode, notice: 'collected' }),
      onError: () => onOrderFlow({ tab: 'ready', orderType: 'pickup', orderCode, notice: 'failed' }),
    });
  };

  const renderActions = (order: Order) =>
    order.orderType === "pickup"
      ? {
          onConfirmPickup: (orderId: string) => handleConfirmPickup(orderId, order.orderCode),
          isConfirmingPickup: updateStatus.isPending,
        }
      : {};

  return (
    <GenericOrderList
      useOrdersHook={useReadyOrders}
      renderActions={renderActions}
      initialOrderType={initialOrderType}
      onOrderTypeChange={onOrderTypeChange}
    />
  );
}
