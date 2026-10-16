import React from "react";
import GenericOrderList from "../../components/orders/GenericOrderList";
import { useCompletedOrders } from "../../hooks/useOrderQueries";
import type { OrderScreenProps } from './orderFlowTypes';

export default function CompletedScreen({ initialOrderType, onOrderTypeChange, focusOrderId, onClearOrderFocus, highlightOrderCode }: OrderScreenProps) {
  const renderActions = () => ({});

  return (
    <GenericOrderList
      highlightOrderCode={highlightOrderCode}
      focusOrderId={focusOrderId}
      onClearOrderFocus={onClearOrderFocus}
      useOrdersHook={useCompletedOrders}
      renderActions={renderActions}
      initialOrderType={initialOrderType}
      onOrderTypeChange={onOrderTypeChange}
    />
  );
}
