export type OrderTypeFilter = 'delivery' | 'pickup';
export type OrderTab = 'new' | 'inProgress' | 'ready' | 'pickup' | 'completed';

export type OrderFlowResult = {
  tab: OrderTab;
  orderType: OrderTypeFilter;
  orderCode?: string;
  notice: 'accepted' | 'acceptedNeedsTime' | 'ready' | 'collected' | 'completed' | 'rejected' | 'timeUpdated' | 'failed';
};

export type OrderScreenProps = {
  initialOrderType: OrderTypeFilter;
  onOrderTypeChange: (orderType: OrderTypeFilter) => void;
  onOrderFlow: (result: OrderFlowResult) => void;
};
