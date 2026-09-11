import React from "react";
import GenericOrderList from "../../components/orders/GenericOrderList";
import { useCompletedOrders } from "../../hooks/useOrderQueries";

export default function CompletedScreen() {
  const renderActions = () => ({});

  return (
    <GenericOrderList
      useOrdersHook={useCompletedOrders}
      renderActions={renderActions}
    />
  );
}
