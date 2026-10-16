export type OrderTypeFilter = 'delivery' | 'pickup';
export type OrderTab = 'new' | 'inProgress' | 'ready' | 'pickup' | 'completed';

export type OrderFlowResult = {
  tab: OrderTab;
  orderType: OrderTypeFilter;
  orderCode?: string;
  notice: 'accepted' | 'acceptedNeedsTime' | 'ready' | 'collected' | 'completed' | 'rejected' | 'timeUpdated' | 'failed';
  navigate?: boolean;
};

export type OrderScreenProps = {
  highlightOrderCode?: string | null;
  focusOrderId?: string;
  onClearOrderFocus: () => void;
  initialOrderType: OrderTypeFilter;
  onOrderTypeChange: (orderType: OrderTypeFilter) => void;
  onOrderFlow: (result: OrderFlowResult) => void;
  newOrderCounts?: Record<OrderTypeFilter, number>;
};
