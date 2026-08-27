import React from "react";
import GenericOrderList from "../../components/orders/GenericOrderList";
import { usePickupOrders } from "../../hooks/useOrderQueries";
import { useUpdateOrderStatus } from "../../hooks/useOrderMutations";
import { Order, OrderStatus } from "../../api/orderServicesTypes";

export default function PickupScreen() {
  const updateStatus = useUpdateOrderStatus();

  const renderActions = (order: Order) =>
    order.orderType === "pickup" && order.status === OrderStatus.PICKED_UP
      ? {
          onConfirmPickup: (orderId: string) =>
            updateStatus.mutate({
              orderId,
              data: { status: OrderStatus.DELIVERED },
            }),
          isConfirmingPickup: updateStatus.isPending,
        }
      : {};

  return (
    <GenericOrderList
      useOrdersHook={usePickupOrders}
      renderActions={renderActions}
    />
  );
}
