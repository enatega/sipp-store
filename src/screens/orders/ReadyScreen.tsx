import React from "react";
import GenericOrderList from "../../components/orders/GenericOrderList";
import { useReadyOrders } from "../../hooks/useOrderQueries";
import { useUpdateOrderStatus } from "../../hooks/useOrderMutations";
import { Order, OrderStatus } from "../../api/orderServicesTypes";

export default function ReadyScreen() {
  const updateStatus = useUpdateOrderStatus();

  const handleConfirmPickup = (orderId: string) => {
    updateStatus.mutate({ orderId, data: { status: OrderStatus.PICKED_UP } });
  };

  const renderActions = (order: Order) =>
    order.orderType === "pickup"
      ? {
          onConfirmPickup: handleConfirmPickup,
          isConfirmingPickup: updateStatus.isPending,
        }
      : {};

  return (
    <GenericOrderList
      useOrdersHook={useReadyOrders}
      renderActions={renderActions}
    />
  );
}
