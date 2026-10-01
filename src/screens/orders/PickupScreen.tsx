import React from "react";
import GenericOrderList from "../../components/orders/GenericOrderList";
import { usePickupOrders } from "../../hooks/useOrderQueries";
import { useUpdateOrderStatus } from "../../hooks/useOrderMutations";
import { Order, OrderStatus } from "../../api/orderServicesTypes";
import type { OrderScreenProps } from './orderFlowTypes';

export default function PickupScreen({ initialOrderType, onOrderTypeChange, onOrderFlow }: OrderScreenProps) {
  const updateStatus = useUpdateOrderStatus();

  const renderActions = (order: Order) =>
    order.orderType === "pickup" && order.status === OrderStatus.PICKED_UP
      ? {
          onConfirmPickup: (orderId: string) => {
            updateStatus.mutate({
              orderId,
              data: { status: OrderStatus.DELIVERED },
            }, {
              onSuccess: () => onOrderFlow({ tab: 'completed', orderType: 'pickup', orderCode: order.orderCode, notice: 'completed' }),
              onError: () => onOrderFlow({ tab: 'pickup', orderType: 'pickup', orderCode: order.orderCode, notice: 'failed' }),
            });
          },
          isConfirmingPickup: updateStatus.isPending,
        }
      : {};

  return (
    <GenericOrderList
      useOrdersHook={usePickupOrders}
      renderActions={renderActions}
      initialOrderType={initialOrderType}
      onOrderTypeChange={onOrderTypeChange}
    />
  );
}
